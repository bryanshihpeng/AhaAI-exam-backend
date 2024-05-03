import { User } from './user.entity';

describe('User Entity', () => {
  describe('createWithEmailAndPassword', () => {
    it('should create a user with email and password', () => {
      const email = 'test@example.com';
      const password = 'Password@123';
      const user = User.createWithEmailAndPassword(email, password);
      expect(user.email).toBe(email);
      expect(user.emailVerified).toBe(false);
      expect(user.verifyPassword(password)).toBe(true);
    });

    it('should throw error if email or password is missing', () => {
      expect(() => User.createWithEmailAndPassword('', 'Password@123')).toThrow(
        Error,
      );
      expect(() =>
        User.createWithEmailAndPassword('test@example.com', ''),
      ).toThrow(Error);
    });
  });

  describe('resetPassword', () => {
    it('should reset the password if the old password is correct', () => {
      const user = new User();
      const oldPassword = 'OldPassword@123';
      const newPassword = 'NewPassword@123';
      user.setPassword(oldPassword);
      expect(user.verifyPassword(oldPassword)).toBe(true);
      user.resetPassword(oldPassword, newPassword);
      expect(user.verifyPassword(newPassword)).toBe(true);
    });

    it('should throw error if the old password is incorrect', () => {
      const user = new User();
      user.setPassword('OldPassword@123');
      expect(() =>
        user.resetPassword('WrongPassword@123', 'NewPassword@123'),
      ).toThrowError('Invalid password');
    });

    it('should throw error if new password does not meet complexity requirements', () => {
      const user = new User();
      const oldPassword = 'OldPassword@123';
      const invalidNewPassword = 'simple';
      user.setPassword(oldPassword);
      expect(() =>
        user.resetPassword(oldPassword, invalidNewPassword),
      ).toThrowError('New password does not meet complexity requirements');
    });
  });

  describe('validatePassword', () => {
    it('should return true for a valid password', () => {
      expect(User.prototype.validatePassword('ValidPassword@123')).toBe(true);
    });
    it('should return false for a password without special characters', () => {
      expect(User.prototype.validatePassword('Password123')).toBe(false);
    });
    it('should return false for a password without digits', () => {
      expect(User.prototype.validatePassword('Password@ABC')).toBe(false);
    });
    it('should return false for a password without uppercase letters', () => {
      expect(User.prototype.validatePassword('password@123')).toBe(false);
    });
    it('should return false for a password without lowercase letters', () => {
      expect(User.prototype.validatePassword('PASSWORD@123')).toBe(false);
    });

    it('should return false for an invalid password', () => {
      expect(User.prototype.validatePassword('invalid')).toBe(false);
    });

    it('should return false for a password that is too short', () => {
      expect(User.prototype.validatePassword('Sh0rt!')).toBe(false);
    });

    describe('Edge Case Password Validation', () => {
      it('should accept a password that just meets the complexity requirements', () => {
        const minimalComplexPassword = 'Ab1@aaaa';
        expect(User.prototype.validatePassword(minimalComplexPassword)).toBe(
          true,
        );
      });

      it('should handle very long passwords', () => {
        const longPassword = 'Aa1@'.repeat(20); // 80 characters long
        expect(User.prototype.validatePassword(longPassword)).toBe(true);
      });
    });

    describe('Handling Null or Undefined Values', () => {
      it('should handle undefined password when verifying password', () => {
        const user = new User();
        expect(() => user.verifyPassword('anyPassword')).toThrowError(
          'Account does not have a password',
        );
      });
    });
  });

  describe('setPassword', () => {
    it('should set a hashed password', () => {
      const user = new User();
      const password = 'Password@123';
      user.setPassword(password);
      expect(user.verifyPassword(password)).toBe(true);
    });

    describe('Error Handling in Password Methods', () => {
      it('should throw an error if setting a password that does not meet complexity requirements', () => {
        const user = new User();
        const simplePassword = 'simple';
        expect(() => user.setPassword(simplePassword)).toThrowError(
          'Password does not meet complexity requirements',
        );
      });
    });
    it('should set a password that meets all complexity requirements', () => {
      const user = new User();
      const complexPassword = 'Complex@1234';
      user.setPassword(complexPassword);
      expect(user.verifyPassword(complexPassword)).toBe(true);
    });

    it('should throw error when setting a password that does not meet complexity requirements', () => {
      const user = new User();
      const simplePassword = 'simple';
      expect(() => user.setPassword(simplePassword)).toThrowError(
        'Password does not meet complexity requirements',
      );
    });
  });
});
