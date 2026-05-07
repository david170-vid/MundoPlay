const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);
let db;

async function conectarDB() {
    try {
        await client.connect();
        console.log('✅ Conectado a MongoDB Atlas (PlayStation)');
        db = client.db('playstation_crud');
        
        const colecciones = await db.listCollections().toArray();
        const nombresColecciones = colecciones.map(c => c.name);
        
        if (!nombresColecciones.includes('juegos')) {
            await db.createCollection('juegos');
            const juegosIniciales = [
                { titulo: "God of War Ragnarök", genero: "Acción/Aventura", plataforma: "PS4/PS5" },
                { titulo: "Far Cry 6", genero: "Shooter", plataforma: "PS4/PS5" },
                { titulo: "Borderlands 3", genero: "Shooter", plataforma: "PS4/PS5" }
            ];
            await db.collection('juegos').insertMany(juegosIniciales);
        }
        
        return db;
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
}

function getDB() { return db; }
module.exports = { conectarDB, getDB };