// lib/database.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'mysql-tanukistyles.alwaysdata.net',
    user: '368585',
    password: '46154774', 
    database: 'tanukistyles_proyectos'
});

export { pool };


//ricardo4@gmail.com
//Nuevo usuario
//steven@gmail.com
//Steven123