import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || '';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminEmail = 'admin@dyempire.com';
    const adminPassword = 'Admin123!@#';
    const adminName = 'Admin User';

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log('✅ Admin user already exists:', adminEmail);
    } else {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: adminName,
                role: 'ADMIN',
            },
        });

        // Create wallet for admin
        await prisma.wallet.create({
            data: {
                userId: admin.id,
                balance: 0,
            },
        });

        console.log('✅ Admin user created:', admin.email);
    }

    // Create test user
    const testEmail = 'test@user.com';
    const testPassword = 'Test123!@#';
    const testName = 'Test User';

    const existingTest = await prisma.user.findUnique({
        where: { email: testEmail },
    });

    if (existingTest) {
        console.log('✅ Test user already exists:', testEmail);
    } else {
        const hashedPassword = await bcrypt.hash(testPassword, 12);

        const testUser = await prisma.user.create({
            data: {
                email: testEmail,
                password: hashedPassword,
                name: testName,
                role: 'BUYER',
            },
        });

        // Create wallet for test user
        await prisma.wallet.create({
            data: {
                userId: testUser.id,
                balance: 0,
            },
        });

        console.log('✅ Test user created:', testUser.email);
    }

    // Create site settings
    await prisma.siteSettings.upsert({
        where: { id: 'settings' },
        update: {},
        create: {
            id: 'settings',
            siteName: 'DY Empire Digital Marketplace',
            cryptoAddresses: {
                BTC: process.env.CRYPTO_BTC_ADDRESS || '',
                ETH: process.env.CRYPTO_ETH_ADDRESS || '',
                'USDT-TRC20': process.env.CRYPTO_USDT_TRC20_ADDRESS || '',
            },
        },
    });

    console.log('✅ Site settings initialized');

    // Create sample assets for demo
    const sampleAssets = [
        {
            title: 'Premium E-commerce Website Template',
            category: 'Web Templates',
            platformType: 'Next.js',
            price: 25000,
            shortDescription: 'Modern, responsive e-commerce template with cart functionality and payment integration.',
            fullDescription: 'Complete e-commerce solution built with Next.js 14, featuring:\\n- Product catalog with categories\\n- Shopping cart\\n- Paystack payment integration\\n- Admin dashboard\\n- Order management\\n- Customer accounts\\n- Responsive design\\n\\nIncludes full source code, documentation, and 30 days support.',
            images: [] as string[],
            documents: [] as string[],
            status: 'ACTIVE' as const,
            country: 'Nigeria',
            stock: 10,
        },
        {
            title: 'Social Media Marketing Toolkit',
            category: 'Marketing',
            platformType: 'Canva/Figma',
            price: 15000,
            shortDescription: 'Complete social media marketing package with 100+ templates.',
            fullDescription: 'Comprehensive social media toolkit including:\\n- 50 Instagram post templates\\n- 25 Story templates\\n- 15 Facebook cover designs\\n- 10 Twitter/X header designs\\n- Brand guidelines template\\n- Content calendar\\n- Hashtag research guide\\n\\nAll files in editable Canva and Figma formats.',
            images: [] as string[],
            documents: [] as string[],
            status: 'ACTIVE' as const,
            country: 'Nigeria',
            stock: 50,
        },
        {
            title: 'Nigerian Business Registration Guide',
            category: 'Business Guides',
            platformType: 'PDF/Document',
            price: 5000,
            shortDescription: 'Step-by-step guide to registering your business in Nigeria.',
            fullDescription: 'Complete business registration guide covering:\\n- CAC registration process\\n- Required documents checklist\\n- LLC vs Business Name comparison\\n- Tax registration (FIRS, State)\\n- Sample incorporation documents\\n- Timeline and cost breakdown\\n- Common mistakes to avoid\\n\\nUpdated for 2024 regulations.',
            images: [] as string[],
            documents: [] as string[],
            status: 'ACTIVE' as const,
            country: 'Nigeria',
            stock: 100,
        },
        {
            title: 'WhatsApp Business Automation Script',
            category: 'Software',
            platformType: 'Node.js',
            price: 35000,
            shortDescription: 'Automate your WhatsApp Business messages and responses.',
            fullDescription: 'Full automation script for WhatsApp Business including auto-replies, message scheduling, and customer management.',
            images: [] as string[],
            documents: [] as string[],
            status: 'ACTIVE' as const,
            country: 'Nigeria',
            stock: 25,
        },
        {
            title: 'Forex Trading Course for Beginners',
            category: 'Courses',
            platformType: 'Video/PDF',
            price: 20000,
            shortDescription: 'Learn forex trading from scratch with practical examples.',
            fullDescription: 'Comprehensive forex trading course with video tutorials, PDF guides, and practical trading strategies.',
            images: [] as string[],
            documents: [] as string[],
            status: 'ACTIVE' as const,
            country: 'Nigeria',
            stock: 200,
        },
    ];

    for (const asset of sampleAssets) {
        const existing = await prisma.asset.findFirst({
            where: { title: asset.title },
        });

        if (!existing) {
            await prisma.asset.create({ data: asset });
            console.log('✅ Sample asset created:', asset.title);
        }
    }

    console.log('');
    console.log('🎉 Seed completed successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('   Admin: admin@dyempire.com / Admin123!@#');
    console.log('   Test:  test@user.com / Test123!@#');
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
