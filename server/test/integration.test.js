import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';

let mongo;
let server;
let base;
const request = async (path, options = {}) => {
  const response = await fetch(`${base}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  return { status: response.status, data: response.status === 204 ? null : await response.json() };
};
const auth = token => ({ Authorization: `Bearer ${token}` });

before(async () => {
  process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
  process.env.CLIENT_ORIGIN = 'http://localhost:5173';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  server = createApp().listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test('registro, inicio de sesión, JWT y aislamiento de tareas', async () => {
  const anonymous = await request('/tasks');
  assert.equal(anonymous.status, 401);

  const invalid = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Ana', email: 'ana@test.com', password: '123' }) });
  assert.equal(invalid.status, 400);

  const first = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Ana Pérez', email: ' ANA@TEST.COM ', password: 'password123' }) });
  assert.equal(first.status, 201);
  assert.equal(first.data.user.email, 'ana@test.com');
  assert.ok(first.data.token);
  assert.equal('passwordHash' in first.data.user, false);

  const duplicate = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Otra', email: 'ana@test.com', password: 'password123' }) });
  assert.equal(duplicate.status, 409);

  const wrong = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'ana@test.com', password: 'incorrecta' }) });
  assert.equal(wrong.status, 401);

  const login = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'ana@test.com', password: 'password123' }) });
  assert.equal(login.status, 200);
  const token = login.data.token;
  const me = await request('/auth/me', { headers: auth(token) });
  assert.equal(me.data.user.name, 'Ana Pérez');
  const badToken = await request('/auth/me', { headers: auth('not-a-token') });
  assert.equal(badToken.status, 401);

  const created = await request('/tasks', { method: 'POST', headers: auth(token), body: JSON.stringify({ title: '  Estudiar JWT  ', description: 'Leer documentación' }) });
  assert.equal(created.status, 201);
  assert.equal(created.data.task.title, 'Estudiar JWT');
  const taskId = created.data.task.id;

  const second = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Luis', email: 'luis@test.com', password: 'password456' }) });
  assert.equal(second.status, 201);
  const otherToken = second.data.token;
  const otherList = await request('/tasks', { headers: auth(otherToken) });
  assert.deepEqual(otherList.data.tasks, []);
  const otherUpdate = await request(`/tasks/${taskId}`, { method: 'PATCH', headers: auth(otherToken), body: JSON.stringify({ completed: true }) });
  assert.equal(otherUpdate.status, 404);
  const otherDelete = await request(`/tasks/${taskId}`, { method: 'DELETE', headers: auth(otherToken) });
  assert.equal(otherDelete.status, 404);

  const updated = await request(`/tasks/${taskId}`, { method: 'PATCH', headers: auth(token), body: JSON.stringify({ completed: true }) });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.task.completed, true);
  const list = await request('/tasks', { headers: auth(token) });
  assert.equal(list.data.tasks.length, 1);
  const deleted = await request(`/tasks/${taskId}`, { method: 'DELETE', headers: auth(token) });
  assert.equal(deleted.status, 204);
  const empty = await request('/tasks', { headers: auth(token) });
  assert.deepEqual(empty.data.tasks, []);
});
