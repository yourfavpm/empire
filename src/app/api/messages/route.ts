import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

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
        let messagesData;

        if (isAdmin) {
            // Get all messages with sender and receiver info
            const { data: messages, error } = await supabaseAdmin
                .from('Message')
                .select(`
                    *,
                    sender:User!Message_senderId_fkey(id, name, email, role),
                    receiver:User!Message_receiverId_fkey(id, name, email, role)
                `)
                .order('createdAt', { ascending: false });

            if (error) {
                console.error('Get admin messages error:', error);
                throw error;
            }

            // Group by conversation (unique sender-receiver pairs excluding admin)
            const conversations = new Map<string, any[]>();

            for (const msg of (messages || [])) {
                const buyerId = (msg.sender as any).role === 'BUYER' ? msg.senderId : msg.receiverId;
                if (!conversations.has(buyerId)) {
                    conversations.set(buyerId, []);
                }
                conversations.get(buyerId)!.push(msg);
            }

            return NextResponse.json({
                conversations: Array.from(conversations.entries()).map(([buyerId, msgs]) => ({
                    buyerId,
                    buyer: (msgs[0].sender as any).role === 'BUYER' ? msgs[0].sender : msgs[0].receiver,
                    messages: msgs,
                    unreadCount: msgs.filter((m) => !m.isRead && m.receiverId === session.user.id).length,
                    lastMessage: msgs[0],
                })),
            });
        } else {
            // Buyer: get their messages with admin
            const { data: messages, error } = await supabaseAdmin
                .from('Message')
                .select(`
                    *,
                    sender:User!Message_senderId_fkey(id, name, role),
                    receiver:User!Message_receiverId_fkey(id, name, role)
                `)
                .or(`senderId.eq.${session.user.id},receiverId.eq.${session.user.id}`)
                .order('createdAt', { ascending: false });

            if (error) {
                console.error('Get buyer messages error:', error);
                throw error;
            }

            // Mark received messages as read
            await supabaseAdmin
                .from('Message')
                .update({ isRead: true })
                .eq('receiverId', session.user.id)
                .eq('isRead', false);

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
            const { data: admin, error: fetchError } = await supabaseAdmin
                .from('User')
                .select('id')
                .eq('role', 'ADMIN')
                .limit(1)
                .single();

            if (fetchError || !admin) {
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

            const { data: receiver, error: fetchError } = await supabaseAdmin
                .from('User')
                .select('role')
                .eq('id', receiverId)
                .single();

            if (fetchError || !receiver || receiver.role !== 'BUYER') {
                return NextResponse.json(
                    { error: 'Invalid receiver' },
                    { status: 400 }
                );
            }
        }

        const { data: message, error: createError } = await supabaseAdmin
            .from('Message')
            .insert({
                senderId: session.user.id,
                receiverId: finalReceiverId,
                subject,
                content,
            })
            .select(`
                *,
                sender:User!Message_senderId_fkey(id, name, role),
                receiver:User!Message_receiverId_fkey(id, name, role)
            `)
            .single();

        if (createError) {
            console.error('Send message error:', createError);
            throw createError;
        }

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
