// testClassifications.js

const db = require("./database/") // Ajusta la ruta según tu estructura
const invModel = require("./models/inventory-model") // Ajusta si está en otra carpeta

async function testGetClassifications() {
  try {
    const result = await invModel.getClassifications()

    if (result && result.rows && result.rows.length > 0) {
      console.log("✅ Clasificaciones obtenidas correctamente:")
      console.table(result.rows)
    } else {
      console.log("⚠️ No se encontraron clasificaciones o result.rows está vacío.")
    }

  } catch (err) {
    console.error("❌ Error al obtener clasificaciones:", err.message)
  } finally {
    db.end() // cerrar conexión
  }
}

testGetClassifications()
