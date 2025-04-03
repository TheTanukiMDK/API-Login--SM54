// pages/api/register.js
import { pool } from '../../lib/database';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    // Configurar encabezados de CORS
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Manejar la solicitud OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method === 'POST') {
        const { email, password, username, profilePicture } = req.body;

        // Validar que los campos obligatorios estén presentes
        if (!email || !password || !username) {
            return res.status(400).json({ message: 'Email, contraseña y username son obligatorios' });
        }

        // Verificar si el usuario o el username ya existen
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'El email o el username ya están en uso' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario en la base de datos
        await pool.query(
            'INSERT INTO users (email, password, username, profile_picture) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, username, profilePicture || null]
        );

        return res.status(201).json({ message: 'Usuario registrado con éxito' });
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}