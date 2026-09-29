import axios from "axios";

// 🌟 อ่านจาก environment variable ก่อน (ตั้งค่าตอน build ผ่าน REACT_APP_API_URL)
// ถ้าไม่ได้ตั้งไว้ ใช้ localhost:3000 เป็นค่าเริ่มต้นสำหรับ dev เหมือนเดิม
const apiPath = process.env.REACT_APP_API_URL || "http://localhost:3000";

// 🌟 axios instance กลางตัวเดียวที่ทุก service เรียกใช้ร่วมกัน
// แนบ Authorization header ให้อัตโนมัติถ้ามี token อยู่ (เดิมแต่ละ service.js
// ต้องเขียนฟังก์ชัน getHeaders() เองซ้ำๆ กันหลายไฟล์)
const apiClient = axios.create({ baseURL: apiPath });

apiClient.interceptors.request.use((requestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

// 🌟 เมื่อ Token หมดอายุ (401) ให้เคลียร์ session แล้วพากลับไปหน้า Login
// ทำงานเฉพาะตอนที่เคย "ล็อกอินอยู่" จริง (มี token ค้างอยู่) และไม่ใช่ตอนที่กรอกรหัสผ่าน Login ผิด
// (ย้ายมาจาก index.js เพราะทุก service ตอนนี้เรียกผ่าน apiClient ตัวนี้ ไม่ใช่ axios เปล่าๆ
// อีกแล้ว — interceptor ที่ผูกไว้กับ axios เปล่าจะไม่มีทางถูกเรียกเลย)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/user/login");
    const hadToken = !!localStorage.getItem("token");

    if (error.response?.status === 401 && hadToken && !isLoginRequest) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

const config = {
  apiPath,
  apiClient,
};

export default config;
