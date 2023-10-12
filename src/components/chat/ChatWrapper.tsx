'use client'

import { trpc } from '@/app/_trpc/client'
import ChatInput from './ChatInput'
import Messages from './Messages'
import { ArrowLeft, ArrowRight, ChevronLeft, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import { ChatContextProvider } from './ChatContext'

interface ChatWrapperProps {
  fileId: string
}

const ChatWrapper = ({
  fileId,
}: ChatWrapperProps) => {
  const { data, isLoading } =
    trpc.getFileUploadStatus.useQuery(
      {
        fileId,
      },
      {
        refetchInterval: (data) =>
          data?.status === 'SUCCESS' ||
          data?.status === 'FAILED'
            ? false
            : 500,
      }
    )

      console.log(fileId)

  if (isLoading)
    return (
      <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 flex justify-center items-center flex-col mb-28'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
            <h3 className='font-semibold text-xl heading'>
              Loading...
            </h3>
            <p className='text-zinc-500 text-sm'>˙
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  if (data?.status === 'PROCESSING')
    return (
      <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 flex justify-center items-center flex-col mb-28'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
            <h3 className='font-semibold text-xl heading'>
              Processing PDF...
            </h3>
            <p className='text-zinc-500 text-sm'>
              This won&apos;t take long.
            </p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  if (data?.status === 'FAILED')
    return (
        <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 flex justify-center items-center flex-col mb-28'>
          <div className='flex flex-col items-center gap-2'>
            <XCircle className='h-8 w-8 text-red-500' />
            <h3 className='font-semibold text-xl heading'>
              Too many pages in your PDF!
            </h3>
            <p className='text-zinc-500 text-sm'>
                <span className='font-medium'>
                    The free plan only supports upto 5 pages per PDF.
                </span>
            </p>
            <Link href='/dashboard' className={buttonVariants({
                variant: 'default',
                className: 'mt-2 gap-1.5'
            })}>Upgrade now <ArrowRight className='w-4 h-4' /></Link>
            <Link href='/dashboard' className={buttonVariants({
                variant: 'ghost',
                className: 'mt-2 gap-1.5'
            })}><ChevronLeft className='w-4 h-4' /> Back</Link>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  return (
        <ChatContextProvider fileId={fileId}>
          <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 justify-between flex flex-col mb-28'>
          <Messages fileId={fileId} />
        </div>

        <ChatInput />
      </div>
        </ChatContextProvider>
  )
}

export default ChatWrapper