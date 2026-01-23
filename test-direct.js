const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL;

async function main() {
    const client = new Client({ connectionString });
    try {
        console.log('Testing direct connection to Supabase...');
        await client.connect();
        const res = await client.query('SELECT 1 as connected');
        console.log('Success:', res.rows[0]);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
