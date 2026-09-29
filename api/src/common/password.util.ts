import * as bcrypt from 'bcrypt';

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$/;
const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function isLegacyPlainPassword(stored: string): boolean {
  return !BCRYPT_HASH_PATTERN.test(stored);
}

// รองรับทั้งรหัสผ่านแบบ bcrypt hash (ของใหม่) และ plain text (บัญชีเก่าที่ยังไม่ถูก
// migrate) เพื่อไม่ให้ผู้ใช้เดิมล็อกอินไม่ได้ทันทีที่เปลี่ยนมาใช้ bcrypt
export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  if (isLegacyPlainPassword(stored)) {
    return plain === stored;
  }
  return bcrypt.compare(plain, stored);
}
