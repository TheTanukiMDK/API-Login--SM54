// pages/api/updateUser.js
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

    if (req.method === 'PATCH') {
        const { userId, email, username, profilePicture, currentPassword, newPassword } = req.body;

        // Validar que el ID del usuario esté presente
        if (!userId) {
            return res.status(400).json({ message: 'El ID del usuario es obligatorio' });
        }

        // Verificar si el usuario existe
        const [rows] = await pool.query('SELECT * FROM users WHERE id_user = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = rows[0];

        // Actualizar contraseña si se proporciona
        if (currentPassword && newPassword) {
            // Validar la contraseña actual
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
            }

            // Hashear la nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Actualizar la contraseña en la base de datos
            await pool.query('UPDATE users SET password = ? WHERE id_user = ?', [hashedPassword, userId]);
        }

        // Construir la consulta de actualización dinámica
        const updates = [];
        const values = [];

        if (email) {
            updates.push('email = ?');
            values.push(email);
        }

        if (username) {
            updates.push('username = ?');
            values.push(username);
        }

        if (profilePicture) {
            updates.push('profile_picture = ?');
            values.push(profilePicture);
        }

        // Si hay campos para actualizar, ejecutar la consulta
        if (updates.length > 0) {
            const query = `UPDATE users SET ${updates.join(', ')} WHERE id_user = ?`;
            values.push(userId);
            await pool.query(query, values);
        }

        return res.status(200).json({ message: 'Usuario actualizado con éxito' });
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}