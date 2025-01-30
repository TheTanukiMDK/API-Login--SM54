import { OAuth2Client } from 'google-auth-library';
import { pool } from '../../lib/database';
import jwt from 'jsonwebtoken';
import Cors from 'cors';

// Configurar CORS
const cors = Cors({
    origin: 'http://localhost:3000',
    origin: 'http://localhost:3001',
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

// Middleware para ejecutar CORS
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

const client = new OAuth2Client('628372787749-0g10ignu8s0fkq1715side4fetaosno0.apps.googleusercontent.com');

export default async function handler(req, res) {
    // Configurar encabezados de CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permite cualquier origen (mejor restringirlo)
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { token } = req.body;

        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: '628372787749-0g10ignu8s0fkq1715side4fetaosno0.apps.googleusercontent.com',
            });

            const payload = ticket.getPayload();
            const email = payload['email'];
            const name = payload['name'];

            // Verificar si el usuario ya existe en la base de datos
            const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            let user = rows[0];

            if (!user) {
                // Si el usuario no existe, lo creamos
                const [result] = await pool.query('INSERT INTO users (email, name, role) VALUES (?, ?, ?)', [email, name, 'user']);
                user = { id: result.insertId, email, name, role: 'user' };
            }

            // Crear un token JWT
            const jwtToken = jwt.sign({ id: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

            return res.status(200).json({ token: jwtToken, role: user.role });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error en la autenticación' });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}
