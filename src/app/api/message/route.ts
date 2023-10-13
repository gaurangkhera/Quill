import { db } from '@/db';
import { openai } from '@/lib/openai';
import { getPineconeClient } from '@/lib/pinecone';
import { sendMessageValidator } from '@/lib/sendMessageValidator';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { NextRequest } from 'next/server';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { getEncoding } from 'js-tiktoken';

const encoding = getEncoding("cl100k_base");
const interval = 400

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { getUser } = getKindeServerSession();
  const user = getUser();
  const { id: userId } = user;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { fileId, message } = sendMessageValidator.parse(body);
  const file = await db.file.findFirst({ where: { id: fileId, userId } });

  if (!file) {
    return new Response('Not found', { status: 404 });
  }

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  })

  // 1: Vectorize message
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });

  // Initialize the Pinecone vector store
  const pinecone = await getPineconeClient();
  const pineconeIndex = pinecone.Index('quill'); // Use a single index name

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex }); 

  try {
    // Search for similar messages using the file ID as context
    const results = await vectorStore.similaritySearch(message, 4);
    const prevMessages = await db.message.findMany({
      where: { fileId },
      orderBy: { createdAt: 'asc' },
      take: 6,
    });
    const formattedPrevMessages = prevMessages.map((msg) => ({
      role: msg.isUserMessage
        ? ('user' as const)
        : ('assistant' as const),
      content: msg.text,
    }))
    
    // Construct a context string with previous conversation, results, and user input
    const context = `PREVIOUS CONVERSATION:${formattedPrevMessages.map((msg) => {
      if (msg.role === 'user') return `User:${msg.content}\n`;
      return `Assistant:${msg.content}\n`;
    })}CONTEXT:${results.map((r) => r.pageContent).join('\n\n')}USER INPUT:${message}`;

    const conversationTokens = countTokensInConversation(
      formattedPrevMessages,
      results,
      message
    );

    const modelToUse = conversationTokens < 4096 - interval ? 'gpt-3.5-turbo' : 'gpt-3.5-turbo-16k';


    // Use a system message to instruct the model
    const response = await openai.chat.completions.create({
      model: modelToUse,
      temperature: 0,
      stream: true, 
      messages: [
        {
          role: 'system',
          content: 'You have access to a PDF document. Please use the information from the document to answer the user\'s question.',
        },
        {
          role: 'user',
          content: context, // Provide the context here
        },
      ],
    });

    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        await db.message.create({
          data: {
            text: completion,
            isUserMessage: false,
            fileId,
            userId,
          },
        });
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error searching for similar messages:', error);
    return new Response('InternalServerError', { status: 500 });
  }
};

function countTokensInConversation(prevMessages: Message[], results: any[], message: string) {
  const conversationText = `
    Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
    
    \n----------------\n
    
    PREVIOUS CONVERSATION:
    ${prevMessages.map((message) => {
      if (message.role === 'user')
        return `User: ${message.content}\n`;
      return `Assistant: ${message.content}\n`;
    })}
    
    \n----------------\n
    
    CONTEXT:
    ${results.map((r) => r.pageContent).join('\n\n')}
    
    USER INPUT: ${message}
  `;

  const tokens = encoding.encode(conversationText);
  const tokenCount = tokens.length;
  return tokenCount
}
