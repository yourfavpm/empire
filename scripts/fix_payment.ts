
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
    console.log('Connecting to database...');
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sqlPath = path.join(process.cwd(), 'fix_payment_rpc.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing fix_payment_rpc.sql...');
        await client.query(sql);
        console.log('Fixed handle_crypto_approval RPC successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
