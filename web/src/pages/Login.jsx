import React, { useState } from "react";

function Login() {
  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>BACKOFFICE</h1>
          <p style={styles.subtitle}>โปรดเข้าสู่ระบบเพื่อจัดการระบบหวย</p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            style={styles.input}
            placeholder="กรอกชื่อผู้ใช้งาน..."
            onChange={(e) => setUsr(e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            style={styles.input}
            placeholder="กรอกรหัสผ่าน..."
            onChange={(e) => setPwd(e.target.value)}
          />
        </div>

        <button style={styles.button}>LOGIN</button>

        <div style={styles.footer}>© 2026 Lotto Management System</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)", // สีสดใสกว่าเดิม
    margin: 0,
    padding: 0,
    overflow: "hidden",
    fontFamily: "'Kanit', 'Segoe UI', sans-serif",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)", // ขาวแบบโปร่งแสงนิดๆ
    padding: "40px",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)", // เงาหนาๆ ให้ดูมีมิติ
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    margin: 0,
    color: "#333",
    fontSize: "2rem",
    fontWeight: "800",
    letterSpacing: "1px",
  },
  subtitle: {
    color: "#666",
    fontSize: "0.9rem",
    marginTop: "5px",
  },
  formGroup: {
    textAlign: "left",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#444",
    fontSize: "0.9rem",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    backgroundColor: "#f9f9f9",
    fontSize: "1rem",
    boxSizing: "border-box", // ป้องกัน input ทะลุการ์ด
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg, #4158D0, #C850C0)",
    color: "white",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 4px 15px rgba(200, 80, 192, 0.4)",
  },
  footer: {
    marginTop: "25px",
    fontSize: "0.8rem",
    color: "#999",
  },
};

export default Login;
