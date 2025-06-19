const bcryptjs = require('bcryptjs');

async function generateHash() {
    const hash = await bcryptjs.hash('admin123', 10);
    console.log('Hash generado para admin123:', hash);
}

generateHash();
