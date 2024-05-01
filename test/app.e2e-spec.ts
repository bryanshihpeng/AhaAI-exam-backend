import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as SuperTest from 'supertest';
import { AppModule } from '../src/app.module';
import { SignupWithEmailRequest } from '../src/application/interfaces/dto/signup-with-email.request';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const email = `test${Math.random().toString()}@example.com`;
  let password = 'Password@123';
  let jwt = '';
  let session;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    // session = supertestSession(app.getHttpServer());
    session = SuperTest.agent(app.getHttpServer());
  });
  it('/auth/signup (POST)', () => {
    const signupRequest: SignupWithEmailRequest = {
      email,
      password,
    };
    return session
      .post('/auth/signup')
      .send(signupRequest)
      .expect(201)
      .expect((res) => {
        expect(res.headers['set-cookie']).toBeDefined();
      });
  });

  it('/auth/signin (POST)', () => {
    const signinRequest: SignupWithEmailRequest = {
      email,
      password,
    };
    return session
      .post('/auth/signin')
      .send(signinRequest)
      .expect(200)
      .expect((res) => {
        expect(res.headers['set-cookie']).toBeDefined();
        jwt = res.headers['set-cookie'][0].split('=')[1].split(';')[0];
      });
  });
  it('/auth/verify-email (POST)', async () => {
    const verifyEmailRequest = {
      token: jwt,
    };
    await session
      .post('/auth/verify-email')
      .send(verifyEmailRequest)
      .expect(200)
      .expect((res) => {
        expect(res.headers['set-cookie']).toBeDefined();
      });
  });

  it('/auth/verify-email (POST) with invalid token', () => {
    const verifyEmailRequest = {
      token: 'invalidToken123',
    };
    return session
      .post('/auth/verify-email')
      .send(verifyEmailRequest)
      .expect(400);
  });
  //
  // Skipping Firebase authentication tests as per user request.

  it('/auth/firebase (POST) with invalid token', () => {
    const firebaseSignInRequest = {
      token: 'invalidFirebaseToken123',
    };
    return session
      .post('/auth/firebase')
      .send(firebaseSignInRequest)
      .expect(400);
  });

  it('/user/profile (GET)', () => {
    return session
      .get('/user/profile')
      .set('Authorization', `Bearer ${jwt}`) // Add JWT token to the request
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('name');
      });
  });

  it('/user/reset-password (PATCH)', () => {
    const resetPasswordRequest = {
      oldPassword: password,
      newPassword: 'NewPassword@123',
    };
    password = 'NewPassword';
    return session
      .patch('/user/reset-password')
      .send(resetPasswordRequest)
      .set('Authorization', `Bearer ${jwt}`) // Add JWT token to the request
      .expect(200);
  });

  it('/user/dashboard (GET)', () => {
    return session
      .get('/user/dashboard')
      .set('Authorization', `Bearer ${jwt}`) // Add JWT token to the request
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach((user) => {
          expect(user).toHaveProperty('id');
          expect(user).toHaveProperty('signUpAt');
          expect(user).toHaveProperty('loginCount');
          expect(user).toHaveProperty('lastSessionAt');
        });
      });
  });

  it('/user/statistics (GET)', () => {
    return session
      .get('/user/statistics')
      .set('Authorization', `Bearer ${jwt}`) // Add JWT token to the request
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('totalUsers');
        expect(res.body).toHaveProperty('activeToday');
        expect(res.body).toHaveProperty('averageActive');
      });
  });

  it('/auth/logout (POST)', () => {
    return session
      .post('/auth/logout')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200)
      .expect((res) => {
        expect(res.headers['set-cookie'][0]).toMatch(/jwt=;/);
        expect(res.headers['set-cookie'][0]).toMatch(
          /Expires=Thu, 01 Jan 1970 00:00:00 GMT/,
        );
      });
  });

  it('/user/profile (GET) without JWT', () => {
    return session.get('/user/profile').expect(401);
  });

  it('/user/reset-password (PATCH) with incorrect old password', () => {
    const resetPasswordRequest = {
      oldPassword: 'IncorrectOldPassword@123',
      newPassword: 'NewPassword@123',
    };
    return session
      .patch('/user/reset-password')
      .send(resetPasswordRequest)
      .set('Authorization', `Bearer ${jwt}`)
      .expect(400);
  });

  it('/user/dashboard (GET) with invalid JWT', () => {
    return session
      .get('/user/dashboard')
      .set('Authorization', `Bearer invalid.jwt.token`)
      .expect(401);
  });

  it('/user/statistics (GET) with invalid JWT', () => {
    return session
      .get('/user/statistics')
      .set('Authorization', `Bearer invalid.jwt.token`)
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
