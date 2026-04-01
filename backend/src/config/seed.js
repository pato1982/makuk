import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'makuk_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'makuk_db',
    multipleStatements: true
  });

  try {
    console.log('Conectado a MySQL');

    // 1. Ejecutar schema (crear tablas)
    console.log('Creando tablas...');
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await connection.query(schema);
    console.log('Tablas creadas');

    // 2. Limpiar datos existentes (en orden inverso por FKs)
    console.log('Limpiando datos anteriores...');
    const tables = [
      'products_page', 'footer',
      'testimonials', 'testimonials_section',
      'process_steps', 'process_section',
      'about_features', 'about',
      'unique_pieces_section',
      'products', 'categories', 'categories_section',
      'intro', 'hero',
      'nav_items', 'header',
      'password_recovery', 'refresh_tokens', 'users'
    ];
    for (const table of tables) {
      await connection.query(`DELETE FROM ${table}`);
      await connection.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
    }
    console.log('Datos limpiados');

    // 3. Insertar datos seed
    console.log('Insertando datos iniciales...');
    const seedData = readFileSync(join(__dirname, 'seed.sql'), 'utf-8');
    await connection.query(seedData);
    console.log('Datos insertados');

    // 4. Crear usuario admin
    console.log('Creando usuario admin...');
    const passwordHash = await bcrypt.hash('makuk2024', 10);
    await connection.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      ['admin@makuk.cl', passwordHash, 'admin']
    );
    console.log('Usuario admin creado: admin@makuk.cl / makuk2024');

    console.log('\n=== Seed completado exitosamente ===');
    console.log('Tablas creadas y pobladas con datos de content.json');

  } catch (error) {
    console.error('Error en seed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
