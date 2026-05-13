const fs = require('fs');

let authTs = fs.readFileSync('src/lib/auth.ts', 'utf8');

const searchRegex = /\/\/ Fallback to x-forwarded-for if req\.ip is not available\.[\s\S]*?const ip = extractedIp;/;

const replacement = `// Strictly rely on req.ip to prevent IP spoofing vulnerabilities.
    // Headers like x-forwarded-for or x-real-ip can be manipulated by clients.
    const ip = reqIp || "unknown_ip";`;

authTs = authTs.replace(searchRegex, replacement);

fs.writeFileSync('src/lib/auth.ts', authTs);
