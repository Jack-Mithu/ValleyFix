import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

// Needs a running database and backend/.env (DATABASE_URL, JWT_SECRET).
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('valleyFix backend is running!');
  });

  it('/auth/me (GET) without a token is rejected', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
