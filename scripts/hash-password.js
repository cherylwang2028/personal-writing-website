#!/usr/bin/env node
const bcrypt = require("bcryptjs");
const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.js YOUR_PASSWORD");
  process.exit(1);
}
const hash = bcrypt.hashSync(password, 12);
const b64 = Buffer.from(hash).toString("base64");
console.log(hash);
console.error("\nAdd to .env (base64 avoids `$` interpolation issues in Next.js):");
console.error(`ADMIN_PASSWORD_HASH_B64="${b64}"`);
