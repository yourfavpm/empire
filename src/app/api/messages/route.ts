import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/messages - Get messages for current user
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isAdmin = session.user.role === 'ADMIN';

        // For admins: get all messages grouped by user
        // For buyers: get their own messages
        let messages;

        if (isAdmin) {
            // Get distinct conversation threads with latest message
            messages = await prisma.message.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    sender: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                    receiver: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                },
            });

            // Group by conversation (unique sender-receiver pairs excluding admin)
            const conversations = new Map<string, typeof messages>();

            for (const msg of messages) {
                const buyerId = msg.sender.role === 'BUYER' ? msg.senderId : msg.receiverId;
                if (!conversations.has(buyerId)) {
                    conversations.set(buyerId, []);
                }
                conversations.get(buyerId)!.push(msg);
            }

            return NextResponse.json({
                conversations: Array.from(conversations.entries()).map(([buyerId, msgs]) => ({
                    buyerId,
                    buyer: msgs[0].sender.role === 'BUYER' ? msgs[0].sender : msgs[0].receiver,
                    messages: msgs,
                    unreadCount: msgs.filter((m) => !m.isRead && m.receiverId === session.user.id).length,
                    lastMessage: msgs[0],
                })),
            });
        } else {
            // Buyer: get their messages with admin
            messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: session.user.id },
                        { receiverId: session.user.id },
                    ],
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    sender: {
                        select: { id: true, name: true, role: true },
                    },
                    receiver: {
                        select: { id: true, name: true, role: true },
                    },
                },
            });

            // Mark received messages as read
            await prisma.message.updateMany({
                where: {
                    receiverId: session.user.id,
                    isRead: false,
                },
                data: { isRead: true },
            });

            return NextResponse.json({ messages });
        }
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST /api/messages - Send a message
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { receiverId, subject, content } = body;

        if (!subject || !content) {
            return NextResponse.json(
                { error: 'Subject and content are required' },
                { status: 400 }
            );
        }

        const isAdmin = session.user.role === 'ADMIN';

        // Determine receiver
        let finalReceiverId = receiverId;

        if (!isAdmin) {
            // Buyers can only message admins
            const admin = await prisma.user.findFirst({
                where: { role: 'ADMIN' },
                select: { id: true },
            });

            if (!admin) {
                return NextResponse.json(
                    { error: 'No admin available' },
                    { status: 400 }
                );
            }
            finalReceiverId = admin.id;
        } else {
            // Admin must specify receiver (buyer)
            if (!receiverId) {
                return NextResponse.json(
                    { error: 'Receiver ID is required' },
                    { status: 400 }
                );
            }

            const receiver = await prisma.user.findUnique({
                where: { id: receiverId },
            });

            if (!receiver || receiver.role !== 'BUYER') {
                return NextResponse.json(
                    { error: 'Invalid receiver' },
                    { status: 400 }
                );
            }
        }

        const message = await prisma.message.create({
            data: {
                senderId: session.user.id,
                receiverId: finalReceiverId,
                subject,
                content,
            },
            include: {
                sender: {
                    select: { id: true, name: true, role: true },
                },
                receiver: {
                    select: { id: true, name: true, role: true },
                },
            },
        });

        return NextResponse.json({
            message: 'Message sent successfully',
            data: message,
        }, { status: 201 });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
