import React, { useState, useMemo } from "react"; // 1. เพิ่ม useMemo
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import { useNavigate } from "react-router-dom"; // แนะนำให้เพิ่มเพื่อเปลี่ยนหน้า

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // สำหรับเปลี่ยนหน้าหลังจาก Login สำเร็จ

  const handleSingIn = async () => {
    try {
      const payload = {
        usr: username,
        pwd: password,
      };

      const res = await axios.post(config.apiPath + "/api/user/login", payload);

      // เช็คว่ามี res.data.token ส่งมาจาก NestJS ไหม
      if (res.data && res.data.token) {
        // บันทึกด้วย Key ชื่อ 'token'
        localStorage.setItem("token", res.data.token);

        await Swal.fire({
          icon: "success",
          title: "เข้าสู่ระบบสำเร็จ",
          timer: 1000,
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
        text:
          error.response?.data?.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      });
    }
  };

  // 2. ใช้ useMemo ล้อมรอบไว้ เพื่อไม่ให้สุ่มใหม่เวลาพิมพ์ (แก้ปัญหาเลขวิ่งรำคาญตา)
  const backgroundNumbers = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      number: Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0"),
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}rem`,
      opacity: Math.random() * 0.1 + 0.02,
      rotate: `${Math.random() * 60 - 30}deg`,
    }));
  }, []); // [] ว่างๆ คือรันแค่ครั้งแรกที่เปิดหน้าเว็บ

  return (
    <div style={styles.container}>
      {backgroundNumbers.map((item) => (
        <div
          key={item.id}
          style={{
            ...styles.lottoBallBase,
            top: item.top,
            left: item.left,
            fontSize: item.size,
            opacity: item.opacity,
            transform: `rotate(${item.rotate})`,
          }}
        >
          {item.number}
        </div>
      ))}

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>฿</div>
          <h1 style={styles.title}>LOTTO VIP</h1>
          <p style={styles.subtitle}>ระบบจัดการหลังบ้านมหาโชค</p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>ชื่อผู้ใช้งาน (Username)</label>
          <input
            type="text"
            style={styles.input}
            placeholder="Username..."
            value={username} // ผูกค่า
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>รหัสผ่าน (Password)</label>
          <input
            type="password"
            style={styles.input}
            placeholder="Password..."
            value={password} // ผูกค่า
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSingIn()} // กด Enter เพื่อ Login ได้เลย
          />
        </div>

        <button onClick={handleSingIn} style={styles.button}>
          เข้าสู่ระบบรับทรัพย์
        </button>

        <div style={styles.footer}>
          <span style={{ color: "#FFD700" }}>●</span> มั่งคั่ง มั่นคง ปลอดภัย{" "}
          <span style={{ color: "#FFD700" }}>●</span>
        </div>
      </div>
    </div>
  );
}

// ... styles เหมือนเดิมของคุณ ...
const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle, #2D0B5A 0%, #1A0533 100%)",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    fontFamily: "'Kanit', sans-serif",
    position: "relative",
  },
  lottoBallBase: {
    position: "absolute",
    fontWeight: "bold",
    color: "#FFD700",
    zIndex: 0,
    userSelect: "none",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(10px)",
    padding: "40px",
    borderRadius: "30px",
    border: "1px solid rgba(255, 215, 0, 0.3)",
    boxShadow: "0 0 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,215,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    zIndex: 1,
  },
  header: { marginBottom: "30px" },
  logoCircle: {
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#1A0533",
    boxShadow: "0 0 20px rgba(255,215,0,0.5)",
  },
  title: {
    margin: 0,
    color: "#FFD700",
    fontSize: "2.2rem",
    fontWeight: "900",
    letterSpacing: "2px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
  },
  subtitle: {
    color: "#E0E0E0",
    fontSize: "0.95rem",
    marginTop: "5px",
  },
  formGroup: { textAlign: "left", marginBottom: "20px" },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
    color: "#FFD700",
    fontSize: "0.9rem",
  },
  input: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: "15px",
    border: "1px solid rgba(255,215,0,0.2)",
    backgroundColor: "rgba(255,255,255,0.9)",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
    transition: "0.3s",
  },
  button: {
    width: "100%",
    padding: "16px",
    borderRadius: "15px",
    border: "none",
    background: "linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #B8860B 100%)",
    color: "#1A0533",
    fontSize: "1.2rem",
    fontWeight: "800",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
    transition: "transform 0.2s",
  },
  footer: {
    marginTop: "30px",
    fontSize: "0.85rem",
    color: "#BBB",
    letterSpacing: "1px",
  },
};

export default Login;
