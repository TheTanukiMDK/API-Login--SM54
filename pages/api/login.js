// pages/api/login.js
import { pool } from '../../lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

        // Buscar el usuario en la base de datos
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const user = rows[0];

        // Comparar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }

        // Crear un token JWT
        const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

        return res.status(200).json({ token });
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}