import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as SuperTest from 'supertest';
import { AppModule } from '../src/app.module';
import { SignupWithEmailRequest } from '../src/interface/dto/signup-with-email.request';

describe('Authentication Endpoints (e2e)', () => {
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
    session = SuperTest(app.getHttpServer());
  });

  describe('/auth', () => {
    describe('/signup (POST)', () => {
      it('should sign up with valid credentials', () => {
        const signupRequest: SignupWithEmailRequest = {
          email,
          password,
        };
        return session
          .post('/auth/signup')
          .send(signupRequest)
          .expect(201)
          .expect((res) => {
            expect(res.body.jwt).toBeDefined();
            jwt = res.body.jwt;
          });
      });
      it('should return 400 for already used email', () => {
        const signupRequest: SignupWithEmailRequest = {
          email,
          password,
        };
        return session.post('/auth/signup').send(signupRequest).expect(400);
      });
      it('should return 400 for empty email', () => {
        const signupRequest: SignupWithEmailRequest = {
          email: '',
          password,
        };
        return session.post('/auth/signup').send(signupRequest).expect(400);
      });
    });

    describe('/signin (POST)', () => {
      it('should return 400 for incorrect email format', () => {
        const signinRequest: SignupWithEmailRequest = {
          email: 'wrongemailformat',
          password,
        };
        return session.post('/auth/signin').send(signinRequest).expect(400);
      });
      it('should return 400 for empty password', () => {
        const signinRequest: SignupWithEmailRequest = {
          email,
          password: '',
        };
        return session.post('/auth/signin').send(signinRequest).expect(400);
      });
      it('should sign in with valid credentials', () => {
        const signinRequest: SignupWithEmailRequest = {
          email,
          password,
        };
        return session
          .post('/auth/signin')
          .send(signinRequest)
          .expect(201)
          .expect((res) => {
            expect(res.body.jwt).toBeDefined();
          });
      });

      it('should return 400 for invalid password', () => {
        const signinRequest: SignupWithEmailRequest = {
          email,
          password: 'wrongPassword123',
        };
        return session.post('/auth/signin').send(signinRequest).expect(400);
      });

      it('should return 400 for non-existent user email', () => {
        const signinRequest: SignupWithEmailRequest = {
          email: 'nonexistent@example.com',
          password,
        };
        return session.post('/auth/signin').send(signinRequest).expect(400);
      });
    });

    describe('/verify-email (POST)', () => {
      it('should verify email with valid token', async () => {
        const verifyEmailRequest = {
          token: jwt,
        };
        await session
          .post('/auth/verify-email')
          .send(verifyEmailRequest)
          .expect(201)
          .expect((res: { body: { jwt: any } }) => {
            expect(res.body.jwt).toBeDefined();
          });
      });

      it('should return 400 for invalid verification token', () => {
        const verifyEmailRequest = {
          token: 'invalidToken123',
        };
        return session
          .post('/auth/verify-email')
          .send(verifyEmailRequest)
          .expect(400);
      });
    });

    describe('/firebase (POST)', () => {
      it('should return 400 for invalid firebase token', () => {
        const firebaseSignInRequest = {
          token: 'invalidFirebaseToken123',
        };
        return session
          .post('/auth/firebase')
          .send(firebaseSignInRequest)
          .expect(400);
      });
    });
  });

  describe('/user', () => {
    describe('/profile (GET)', () => {
      it('should return 401 with invalid JWT', () => {
        return session
          .get('/user/profile')
          .set('Authorization', `Bearer invalidToken123`)
          .expect(401);
      });
      it('should return 403 with valid but unauthorized JWT', () => {
        const unauthorizedJwt = 'valid.jwt.but.unauthorized';
        return session
          .get('/user/profile')
          .set('Authorization', `Bearer ${unauthorizedJwt}`)
          .expect(401);
      });
      it('should get user profile with valid JWT', () => {
        return session
          .get('/user/profile')
          .set('Authorization', `Bearer ${jwt}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('email');
            expect(res.body).toHaveProperty('name');
          });
      });

      it('should return 401 without JWT', () => {
        return session.get('/user/profile').expect(401);
      });
    });

    describe('/reset-password (PATCH)', () => {
      it('should return 400 when resetting password with the same old and new password', () => {
        const resetPasswordRequest = {
          oldPassword: password,
          newPassword: password,
        };
        return session
          .patch('/user/reset-password')
          .send(resetPasswordRequest)
          .set('Authorization', `Bearer ${jwt}`)
          .expect(400);
      });
      it('should return 400 when new password does not meet complexity requirements', () => {
        const resetPasswordRequest = {
          oldPassword: password,
          newPassword: 'simple',
        };
        return session
          .patch('/user/reset-password')
          .send(resetPasswordRequest)
          .set('Authorization', `Bearer ${jwt}`)
          .expect(400);
      });
      it('should reset password with valid credentials', () => {
        const resetPasswordRequest = {
          oldPassword: password,
          newPassword: 'NewPassword@123',
        };
        password = 'NewPassword';
        return session
          .patch('/user/reset-password')
          .send(resetPasswordRequest)
          .set('Authorization', `Bearer ${jwt}`)
          .expect(200);
      });

      it('should return 400 with incorrect old password', () => {
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
    });

    describe('/dashboard (GET)', () => {
      it('should get user dashboard with valid JWT', () => {
        return session
          .get('/user/dashboard')
          .set('Authorization', `Bearer ${jwt}`)
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

      it('should return 401 with invalid JWT', () => {
        return session
          .get('/user/dashboard')
          .set('Authorization', `Bearer invalid.jwt.token`)
          .expect(401);
      });
    });

    describe('/statistics (GET)', () => {
      it('should get user statistics with valid JWT', () => {
        return session
          .get('/user/statistics')
          .set('Authorization', `Bearer ${jwt}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('totalUsers');
            expect(res.body).toHaveProperty('activeToday');
            expect(res.body).toHaveProperty('averageActive');
          });
      });

      it('should return 401 with invalid JWT', () => {
        return session
          .get('/user/statistics')
          .set('Authorization', `Bearer invalid.jwt.token`)
          .expect(401);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
