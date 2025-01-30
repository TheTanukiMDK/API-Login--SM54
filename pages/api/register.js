import { pool } from '../../lib/database';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    // Verificar que la solicitud sea de tipo POST
    console.log('Request method:', req.method);  // Esto te dirá el método HTTP que está recibiendo el servidor

    // Configurar encabezados de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Manejar la solicitud OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        console.log('Solicitud OPTIONS recibida');
        return res.status(200).end();
    }

    // Si el método es POST, procesar el registro
    if (req.method === 'POST') {
        const { email, password } = req.body;

        // Verificar si el usuario ya existe
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            console.log('El usuario ya existe');
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario en la base de datos
        try {
            await pool.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, 'user']);
            console.log('Usuario registrado con éxito');
            return res.status(201).json({ message: 'Usuario registrado con éxito' });
        } catch (error) {
            console.error('Error al insertar en la base de datos:', error);
            return res.status(500).json({ message: 'Error al registrar el usuario' });
        }
    } else {
        console.log('Método no permitido');
        return res.status(405).json({ message: 'Método no permitido' });
    }
}
