// 🔐 ดึง JWT secret จาก environment variable เป็นหลัก
// ค่า fallback ด้านล่างคือค่าเดิมที่เคย hardcode ไว้ในโค้ด — คงไว้เพื่อไม่ให้ token
// ที่ผู้ใช้ล็อกอินค้างอยู่ตอนนี้ (ที่เซ็นด้วยค่านี้) หลุดพร้อมกันทันทีที่ deploy โค้ดนี้
// ต้องตั้งค่า JWT_SECRET ใน environment จริงโดยเร็วที่สุด เพราะค่า fallback นี้อยู่ใน
// source code แบบเปิดเผย ไม่ปลอดภัยสำหรับ production
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    '⚠️  JWT_SECRET ไม่ได้ตั้งค่าใน environment — กำลังใช้ค่า fallback ที่ไม่ปลอดภัย ' +
      'กรุณาตั้งค่า JWT_SECRET ใน .env ก่อนใช้งานจริง',
  );
}
