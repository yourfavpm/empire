
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // Generate Signed Token
        // Format: userId.timestamp.signature
        const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
        const timestamp = Date.now();
        const payload = `${userId}.${timestamp}`;
        const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
        const token = `${payload}.${signature}`;

        return NextResponse.json({ token });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
