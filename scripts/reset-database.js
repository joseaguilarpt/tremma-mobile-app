const fs = require('fs');
const path = require('path');

// Función para eliminar la base de datos SQLite
function resetDatabase() {
  try {
    // Rutas posibles donde puede estar la base de datos
    const possiblePaths = [
      path.join(__dirname, 'tremma_offline.db'),
      path.join(process.cwd(), 'tremma_offline.db'),
      path.join(process.cwd(), '..', 'tremma_offline.db'),
    ];

    let deleted = false;
    
    for (const dbPath of possiblePaths) {
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log(`✅ Base de datos eliminada: ${dbPath}`);
        deleted = true;
      }
    }

    if (!deleted) {
      console.log('ℹ️ No se encontró la base de datos para eliminar');
    }

    console.log('🔄 La base de datos se recreará automáticamente en el próximo inicio');
    
  } catch (error) {
    console.error('❌ Error eliminando la base de datos:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };