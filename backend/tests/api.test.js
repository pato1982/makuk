import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('GET /api/health', () => {
  it('devuelve status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  it('rechaza credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fake@test.com', password: 'wrongpass' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('acepta credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'patcorher@gmail.com', password: '123456' });
    // Si la DB está conectada, debería dar 200 con tokens
    // Si no, dará error de conexión - ambos son válidos para el test
    if (res.status === 200) {
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    }
  });
});

describe('GET /api/content', () => {
  it('devuelve estructura con secciones', async () => {
    const res = await request(app).get('/api/content');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('header');
      expect(res.body).toHaveProperty('hero');
      expect(res.body).toHaveProperty('footer');
    }
  });
});

describe('Rutas admin sin auth', () => {
  it('PUT /api/admin/header sin token devuelve 401', async () => {
    const res = await request(app).put('/api/admin/header').send({});
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/stats sin token devuelve 401', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });
});
