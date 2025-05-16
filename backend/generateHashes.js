const bcrypt = require('bcryptjs');

async function generateHashes() {
  const passwords = ['password123', 'admin123'];

  for (const pw of passwords) {
    const hash = await bcrypt.hash(pw, 10);
    console.log(`Hashed for "${pw}": ${hash}`);
  }
}

generateHashes();
