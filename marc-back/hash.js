const crypto = require('crypto');

const texto = '123456';
const hash = crypto.createHash('sha256')
                  .update(texto)
                  .digest('hex');

console.log('Hash SHA-256:', hash);   