require('dotenv').config();
// ... después sigue el resto de tus constantes como express, cors, etc.
const express = require('express');
const cors = require('cors');
const { conectarDB, getDB } = require('./database');
const { ObjectId } = require('mongodb');

const app = express();
const path = require('path');

// Servir archivos estáticos (Frontend)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/images', express.static(path.join(__dirname, '../images')));
const PORT = 3000;

app.use(express.json());
app.use(cors());

let db;

// ===== RUTAS PARA CONSOLAS =====
app.get('/api/consolas', async (req, res) => {
    try {
        const consolas = await db.collection('consolas').find({}).toArray();
        res.json({ success: true, consolas });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/consolas', async (req, res) => {
    try {
        const { modelo, version, precio, stock } = req.body;
        const resultado = await db.collection('consolas').insertOne({ modelo, version, precio: parseFloat(precio), stock: parseInt(stock) });
        res.status(201).json({ success: true, id: resultado.insertedId });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.delete('/api/consolas/:id', async (req, res) => {
    try {
        await db.collection('consolas').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== RUTAS PARA JUEGOS =====
app.get('/api/juegos', async (req, res) => {
    try {
        const juegos = await db.collection('juegos').find({}).toArray();
        res.json({ success: true, juegos });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/juegos', async (req, res) => {
    try {
        const { titulo, genero, plataforma } = req.body;
        const resultado = await db.collection('juegos').insertOne({ titulo, genero, plataforma });
        res.status(201).json({ success: true, id: resultado.insertedId });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.delete('/api/juegos/:id', async (req, res) => {
    try {
        await db.collection('juegos').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== NUEVAS RUTAS: USUARIOS Y LOGIN =====
app.post('/api/usuarios', async (req, res) => {
    try {
        const { psnId, correo, password, consola, juego } = req.body;
        
        // 1. Verificamos si el usuario ya existe en la Base de Datos
        const existe = await db.collection('usuarios').findOne({ psnId });
        if (existe) {
            // Si ya existe, enviamos un error 400
            return res.status(400).json({ success: false, message: 'El PSN ID ya está registrado. Por favor, elige otro.' });
        }

        // 2. Si no existe, lo guardamos
        const resultado = await db.collection('usuarios').insertOne({ psnId, correo, password, consola, juego, fechaRegistro: new Date() });
        res.status(201).json({ success: true, psnId });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { psnId, password } = req.body;
        const usuario = await db.collection('usuarios').findOne({ psnId, password });
        
        if (usuario) {
            res.json({ success: true, psnId: usuario.psnId });
        } else {
            res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
        }
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== NUEVAS RUTAS: COMENTARIOS DEL MURO =====
app.get('/api/comentarios', async (req, res) => {
    try {
        // Traemos los últimos 20 comentarios, ordenados por fecha
        const comentarios = await db.collection('comentarios').find({}).sort({ fecha: -1 }).limit(20).toArray();
        res.json({ success: true, comentarios });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/comentarios', async (req, res) => {
    try {
        const { usuario, texto } = req.body;
        const resultado = await db.collection('comentarios').insertOne({ usuario, texto, fecha: new Date() });
        res.status(201).json({ success: true, id: resultado.insertedId });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== NUEVAS RUTAS: PUNTUACIONES DEL QUIZ =====
app.post('/api/puntuaciones', async (req, res) => {
    try {
        const { usuario, puntaje } = req.body;
        const resultado = await db.collection('puntuaciones').insertOne({ usuario, puntaje, fecha: new Date() });
        res.status(201).json({ success: true, id: resultado.insertedId });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// PARA EDITAR JUEGOS
app.put('/api/juegos/:id', async (req, res) => {
    try {
        const { titulo, genero, plataforma } = req.body;
        await db.collection('juegos').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { titulo, genero, plataforma } }
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// PARA VER LA LISTA DE USUARIOS
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await db.collection('usuarios').find({}, { projection: { password: 0 } }).toArray(); // No mandamos las contraseñas por seguridad
        res.json({ success: true, usuarios });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// PARA ELIMINAR USUARIOS
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        await db.collection('usuarios').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

async function iniciarServidor() {
    db = await conectarDB();
    
    // Crear colecciones si no existen
    const colecciones = await db.listCollections().toArray();
    const nombres = colecciones.map(c => c.name);
    if(!nombres.includes('usuarios')) await db.createCollection('usuarios');
    if(!nombres.includes('comentarios')) await db.createCollection('comentarios');
    if(!nombres.includes('puntuaciones')) await db.createCollection('puntuaciones');

    app.listen(PORT, () => {
        console.log(`🚀 Servidor PS en http://localhost:${PORT}`);
    });
    
}
iniciarServidor();