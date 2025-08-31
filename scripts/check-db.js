const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const dbPath = path.resolve(process.cwd(), 'dev.db');
  console.log('Checking SQLite file:', dbPath, 'exists=', fs.existsSync(dbPath));
  try {
    // quick query
    const count = await prisma.user.count();
    const sample = await prisma.user.findMany({ take: 5, select: { id: true, username: true, email: true } });
    console.log({ ok: true, userCount: count, sample });
  } catch (err) {
    console.error({ ok: false, error: err && err.message ? err.message : String(err) });
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
