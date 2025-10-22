// backend/generateHash.js
const bcrypt = require('bcryptjs');

const password = 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('\n✅ Hash generado para la contraseña: "admin123"\n');
  console.log('Hash:', hash);
  console.log('\n📋 Ejecuta esta consulta SQL en pgAdmin:\n');
  console.log(`UPDATE usuarios SET password_hash = '${hash}' WHERE username = 'admin';\n`);
});