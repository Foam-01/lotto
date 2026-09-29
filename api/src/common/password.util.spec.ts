import {
  hashPassword,
  isLegacyPlainPassword,
  verifyPassword,
} from './password.util';

describe('password.util', () => {
  describe('hashPassword / isLegacyPlainPassword', () => {
    it('produces a bcrypt hash that is recognised as non-legacy', async () => {
      const hashed = await hashPassword('my-password');

      expect(hashed).not.toBe('my-password');
      expect(hashed).toMatch(/^\$2[aby]\$/);
      expect(isLegacyPlainPassword(hashed)).toBe(false);
    });

    it('treats a plain-text stored value as legacy', () => {
      expect(isLegacyPlainPassword('some-plain-password')).toBe(true);
    });
  });

  describe('verifyPassword', () => {
    it('accepts the correct password against a bcrypt hash', async () => {
      const hashed = await hashPassword('correct-horse');
      await expect(verifyPassword('correct-horse', hashed)).resolves.toBe(
        true,
      );
    });

    it('rejects the wrong password against a bcrypt hash', async () => {
      const hashed = await hashPassword('correct-horse');
      await expect(verifyPassword('wrong-guess', hashed)).resolves.toBe(
        false,
      );
    });

    it('falls back to a plain-text comparison for legacy (un-migrated) rows', async () => {
      await expect(
        verifyPassword('old-plain-password', 'old-plain-password'),
      ).resolves.toBe(true);
      await expect(
        verifyPassword('wrong', 'old-plain-password'),
      ).resolves.toBe(false);
    });
  });
});
