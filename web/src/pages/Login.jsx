import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUsrFocused, setIsUsrFocused] = useState(false);
  const [isPwdFocused, setIsPwdFocused] = useState(false);
  const navigate = useNavigate();

  const handleSingIn = async () => {
    if (!username || !password) {
      Swal.fire({
        icon: "warning",
        title: "เมี๊ยวว!",
        text: "เจ้านายลืมกรอกชื่อผู้ใช้หรือรหัสผ่านนะ",
        confirmButtonColor: "#ea580c",
      });
      return;
    }

    try {
      const payload = {
        usr: username,
        pwd: password,
      };

      const res = await axios.post(config.apiPath + "/api/user/login", payload);

      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);

        await Swal.fire({
          icon: "success",
          title: "เข้าสู่ระบบสำเร็จ",
          text: "ยินดีต้อนรับกลับแผงแมวส้มครับเจ้านาย! 🐈",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/home");
      } else {
        throw new Error("ไม่ได้รับข้อมูล Token จากระบบ");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        confirmButtonColor: "#ea580c",
        text:
          error.response?.data?.message ||
          "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  // 🌟 เปลี่ยนจากตัวเลข เป็นไอคอนลอยๆ ธีมแมวส้ม 🌟
  const floatingIcons = useMemo(() => {
    const emojis = ["🐈", "🐾", "🧶", "🐟", "🍀", "💰"];
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1.5}rem`,
      opacity: Math.random() * 0.15 + 0.05,
      rotate: `${Math.random() * 60 - 30}deg`,
    }));
  }, []);

  return (
    <div style={styles.container}>
      {/* 🌟 ไอคอนลอยๆ เป็นแบคกราว 🌟 */}
      {floatingIcons.map((item) => (
        <div
          key={item.id}
          style={{
            ...styles.floatingIcon,
            top: item.top,
            left: item.left,
            fontSize: item.size,
            opacity: item.opacity,
            transform: `rotate(${item.rotate})`,
          }}
        >
          {item.emoji}
        </div>
      ))}

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>🐈</div>
          <h1 style={styles.title}>แผงแมวส้ม</h1>
          <p style={styles.subtitle}>ระบบจัดการหลังบ้าน (Admin Panel)</p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>ชื่อผู้ใช้งาน</label>
          <input
            type="text"
            style={{
              ...styles.input,
              ...(isUsrFocused ? styles.inputFocus : {}),
            }}
            placeholder="กรอกชื่อผู้ใช้งาน..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setIsUsrFocused(true)}
            onBlur={() => setIsUsrFocused(false)}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>รหัสผ่าน</label>
          <input
            type="password"
            style={{
              ...styles.input,
              ...(isPwdFocused ? styles.inputFocus : {}),
            }}
            placeholder="กรอกรหัสผ่าน..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsPwdFocused(true)}
            onBlur={() => setIsPwdFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && handleSingIn()}
          />
        </div>

        <button
          onClick={handleSingIn}
          style={styles.button}
          onMouseOver={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          เข้าสู่ระบบ
        </button>

        <div style={styles.footer}>ระบบจัดการสลากออนไลน์ 🐾</div>
      </div>
    </div>
  );
}

// 🟠 CSS ธีมแผงแมวส้มที่แท้ทรู (ปรับให้กรอบใหญ่ขึ้น)
const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffbeb",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    fontFamily: "'Kanit', sans-serif",
    position: "relative",
  },
  floatingIcon: {
    position: "absolute",
    zIndex: 0,
    userSelect: "none",
    filter: "grayscale(20%) opacity(0.8)",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "60px 50px", // 👈 ขยาย Padding ด้านใน (เดิม 50px 40px)
    borderRadius: "24px",
    borderTop: "10px solid #ea580c",
    boxShadow: "0 20px 40px rgba(234, 88, 12, 0.08)",
    width: "90%",
    maxWidth: "480px", // 👈 ขยายกรอบให้กว้างขึ้น (เดิม 400px)
    textAlign: "center",
    zIndex: 1,
    position: "relative",
    animation: "slideUp 0.4s ease-out forwards",
  },
  header: { marginBottom: "35px" }, // 👈 ขยับให้ห่างขึ้นนิดนึง
  logoCircle: {
    width: "80px", // 👈 ขยายโลโก้ (เดิม 70px)
    height: "80px", // 👈 ขยายโลโก้
    backgroundColor: "#fff7ed",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    fontSize: "45px", // 👈 ขยายอิโมจิแมว (เดิม 40px)
    border: "2px solid #fed7aa",
    boxShadow: "0 4px 10px rgba(234, 88, 12, 0.1)",
  },
  title: {
    margin: 0,
    color: "#ea580c",
    fontSize: "32px", // 👈 ขยายฟอนต์หัวข้อ (เดิม 28px)
    fontWeight: "900",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "16px", // 👈 ขยายฟอนต์ย่อย (เดิม 15px)
    marginTop: "5px",
    fontWeight: "500",
  },
  formGroup: { textAlign: "left", marginBottom: "20px" },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "700",
    color: "#475569",
    fontSize: "15px", // 👈 ขยายฟอนต์ Label (เดิม 14px)
  },
  input: {
    width: "100%",
    padding: "16px 20px", // 👈 ทำให้ช่องกรอกอ้วนขึ้นนิดนึง (เดิม 14px 16px)
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    color: "#1e293b",
    fontSize: "16px", // 👈 ขยายฟอนต์ในช่องกรอก
    boxSizing: "border-box",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "'Kanit', sans-serif",
  },
  inputFocus: {
    border: "2px solid #ea580c",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 0 4px rgba(234, 88, 12, 0.1)",
  },
  button: {
    width: "100%",
    padding: "16px", // 👈 ขยายปุ่มให้หนาขึ้น (เดิม 14px)
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #ea580c, #c2410c)",
    color: "#ffffff",
    fontSize: "18px", // 👈 ขยายตัวหนังสือในปุ่ม (เดิม 16px)
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "15px",
    boxShadow: "0 4px 15px rgba(234, 88, 12, 0.3)",
    transition: "all 0.2s ease",
    fontFamily: "'Kanit', sans-serif",
  },
  footer: {
    marginTop: "30px",
    fontSize: "15px",
    color: "#94a3b8",
    fontWeight: "500",
  },
};

export default Login;
