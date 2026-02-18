/* eslint-disable @typescript-eslint/no-require-imports */
const dns = require('dns');

const domains = [
    'db.wvdvjgsocnleyyogzqyb.supabase.co',
    'db.wvdvjgsocnleyyogzqyb.supabase.com',
    'wvdvjgsocnleyyogzqyb.supabase.co',
    'wvdvjgsocnleyyogzqyb.supabase.com'
];

domains.forEach(domain => {
    dns.lookup(domain, (err, address) => {
        if (err) {
            console.log(`${domain}: FAILED (${err.code})`);
        } else {
            console.log(`${domain}: SUCCESS (${address})`);
        }
    });
});
