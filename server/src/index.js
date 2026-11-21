import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';

const { MONGODB_URI, JWT_SECRET } = process.env;
if (!MONGODB_URI || !JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('Configura MONGODB_URI y JWT_SECRET (mínimo 32 caracteres) en server/.env');
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const port = Number(process.env.PORT) || 4000;
  createApp().listen(port, () => console.log(`API disponible en http://localhost:${port}`));
} catch (error) {
  console.error('No se pudo conectar con MongoDB:', error.message);
  process.exit(1);
}
