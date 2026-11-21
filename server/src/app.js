import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Task } from './models/Task.js';
import { requireAuth, signToken } from './auth.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicUser = user => ({ id: String(user._id), name: user.name, email: user.email });
const publicTask = task => ({
  id: String(task._id), title: task.title, description: task.description,
  completed: task.completed, createdAt: task.createdAt, updatedAt: task.updatedAt
});

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body || {};
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!cleanName || cleanName.length > 60 || !emailPattern.test(cleanEmail) || cleanEmail.length > 254 || typeof password !== 'string' || password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: 'Escribe un nombre, correo válido y contraseña de 8 a 72 caracteres.' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    try {
      const user = await User.create({ name: cleanName, email: cleanEmail, passwordHash });
      res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ message: 'Ese correo ya está registrado.' });
      throw error;
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Credenciales incorrectas.' });
    res.json({ token: signToken(user._id), user: publicUser(user) });
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'La cuenta ya no existe.' });
    res.json({ user: publicUser(user) });
  });

  app.get('/api/tasks', requireAuth, async (req, res) => {
    const tasks = await Task.find({ owner: req.userId }).sort({ createdAt: -1 });
    res.json({ tasks: tasks.map(publicTask) });
  });

  app.post('/api/tasks', requireAuth, async (req, res) => {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
    if (!title || title.length > 120 || description.length > 500) return res.status(400).json({ message: 'El título es obligatorio (máximo 120 caracteres) y la descripción admite 500.' });
    const task = await Task.create({ owner: req.userId, title, description });
    res.status(201).json({ task: publicTask(task) });
  });

  app.patch('/api/tasks/:id', requireAuth, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Tarea no encontrada.' });
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ message: 'Envía los cambios en formato JSON.' });
    const update = {};
    if ('title' in req.body) {
      if (typeof req.body.title !== 'string' || !req.body.title.trim() || req.body.title.trim().length > 120) return res.status(400).json({ message: 'Título inválido.' });
      update.title = req.body.title.trim();
    }
    if ('description' in req.body) {
      if (typeof req.body.description !== 'string' || req.body.description.trim().length > 500) return res.status(400).json({ message: 'Descripción inválida.' });
      update.description = req.body.description.trim();
    }
    if ('completed' in req.body) {
      if (typeof req.body.completed !== 'boolean') return res.status(400).json({ message: 'Estado inválido.' });
      update.completed = req.body.completed;
    }
    if (!Object.keys(update).length) return res.status(400).json({ message: 'No hay cambios válidos.' });
    const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, update, { returnDocument: 'after', runValidators: true });
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
    res.json({ task: publicTask(task) });
  });

  app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Tarea no encontrada.' });
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
    res.status(204).end();
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ message: 'JSON inválido.' });
    console.error(error);
    res.status(500).json({ message: 'Ocurrió un error interno.' });
  });
  return app;
}
