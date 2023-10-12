import { NextRequest } from "next/server"
import { db } from "@/db"

export const GET = async (req: NextRequest) => {
    const body = await req.json()
    const fileId = body.fileId

    return db.file.findFirst({
        where: {
            id: fileId,
        },
    }).messages.length
 }