// pages/api/register.js
import { pool } from '../../lib/database';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    // Configurar encabezados de CORS
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Manejar la solicitud OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method === 'POST') {
        const { email, password } = req.body;

        // Verificar si el usuario ya existe
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario en la base de datos
        await pool.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, 'user']);
        return res.status(201).json({ message: 'Usuario registrado con éxito' });
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}