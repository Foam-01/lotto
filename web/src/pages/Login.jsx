import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import AuthService from "../services/auth.service";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUsrFocused, setIsUsrFocused] = useState(false);
  const [isPwdFocused, setIsPwdFocused] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleSingIn = async () => {
    if (isLoggingIn) return; // 🛡️ กันกดซ้ำระหว่างรอผลล็อกอิน

    if (!username || !password) {
      Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: "กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน",
        confirmButtonColor: "var(--brand-600)",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      const payload = {
        usr: username,
        pwd: password,
      };

      // 🌟 เปลี่ยนมาเรียกใช้ AuthService
      const res = await AuthService.login(payload);

      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);

        await Swal.fire({
          icon: "success",
          title: "เข้าสู่ระบบสำเร็จ",
          text: "ยินดีต้อนรับกลับเข้าสู่ระบบ",
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
        confirmButtonColor: "var(--brand-600)",
        text:
          error.response?.data?.message ||
          "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsLoggingIn(false);
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
      {/* 🌟 ปรับ padding การ์ดให้เล็กลงบนจอแคบมาก ๆ (media query เฉพาะจุด) 🌟 */}
      <style>{`
        @media (max-width: 480px) {
          .login-card { padding: 30px 20px !important; }
        }
      `}</style>

      {/* 🌟 ไอคอนลอยๆ เป็นแบคกราว (ตกแต่งอย่างเดียว ไม่มีความหมายเชิงข้อมูล) 🌟 */}
      {floatingIcons.map((item) => (
        <div
          key={item.id}
          aria-hidden="true"
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

      <main className="login-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle} aria-hidden="true">🐈</div>
          <h1 style={styles.title}>แผงแมวส้ม</h1>
          <p style={styles.subtitle}>ระบบจัดการหลังบ้าน</p>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="login-username" style={styles.label}>ชื่อผู้ใช้งาน</label>
          <input
            id="login-username"
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
          <label htmlFor="login-password" style={styles.label}>รหัสผ่าน</label>
          <input
            id="login-password"
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
          disabled={isLoggingIn}
          style={{
            ...styles.button,
            ...(isLoggingIn ? styles.buttonDisabled : {}),
          }}
          onMouseOver={(e) =>
            !isLoggingIn &&
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          {isLoggingIn ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            "เข้าสู่ระบบ"
          )}
        </button>

        <p style={styles.forgotPassword}>
          ลืมรหัสผ่าน? กรุณาติดต่อผู้ดูแลระบบ
        </p>

        <div style={styles.footer}>ระบบจัดการสลากออนไลน์</div>
      </main>
    </div>
  );
}

// 🟠 CSS ธีมแผงแมวส้มที่แท้ทรู (ปรับให้กรอบใหญ่ขึ้น)
const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--amber-50)",
    margin: 0,
    padding: 0,
    overflow: "auto",
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
    backgroundColor: "var(--color-white)",
    padding: "60px 50px", // 👈 ขยาย Padding ด้านใน (เดิม 50px 40px)
    borderRadius: "var(--radius-xl)",
    borderTop: "10px solid var(--brand-600)",
    boxShadow: "var(--shadow-card)",
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
    backgroundColor: "var(--brand-50)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    fontSize: "45px", // 👈 ขยายอิโมจิแมว (เดิม 40px)
    border: "2px solid var(--brand-200)",
    boxShadow: "0 4px 10px rgba(234, 88, 12, 0.1)",
  },
  title: {
    margin: 0,
    color: "var(--brand-600)",
    fontSize: "32px", // 👈 ขยายฟอนต์หัวข้อ (เดิม 28px)
    fontWeight: "900",
  },
  subtitle: {
    color: "var(--slate-500)",
    fontSize: "16px", // 👈 ขยายฟอนต์ย่อย (เดิม 15px)
    marginTop: "5px",
    fontWeight: "500",
  },
  formGroup: { textAlign: "left", marginBottom: "20px" },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "700",
    color: "var(--slate-600)",
    fontSize: "15px", // 👈 ขยายฟอนต์ Label (เดิม 14px)
  },
  input: {
    width: "100%",
    padding: "16px 20px", // 👈 ทำให้ช่องกรอกอ้วนขึ้นนิดนึง (เดิม 14px 16px)
    borderRadius: "var(--radius-md)",
    border: "2px solid var(--slate-200)",
    backgroundColor: "var(--slate-50)",
    color: "var(--slate-900)",
    fontSize: "16px", // 👈 ขยายฟอนต์ในช่องกรอก
    boxSizing: "border-box",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "'Kanit', sans-serif",
  },
  inputFocus: {
    border: "2px solid var(--brand-600)",
    backgroundColor: "var(--color-white)",
    boxShadow: "0 0 0 4px rgba(234, 88, 12, 0.1)",
  },
  button: {
    width: "100%",
    padding: "16px", // 👈 ขยายปุ่มให้หนาขึ้น (เดิม 14px)
    borderRadius: "var(--radius-md)",
    border: "none",
    background: "linear-gradient(135deg, var(--brand-600), var(--brand-700))",
    color: "var(--color-white)",
    fontSize: "18px", // 👈 ขยายตัวหนังสือในปุ่ม (เดิม 16px)
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "15px",
    boxShadow: "0 4px 15px rgba(234, 88, 12, 0.3)",
    transition: "all 0.2s ease",
    fontFamily: "'Kanit', sans-serif",
  },
  buttonDisabled: {
    background: "var(--slate-300)",
    boxShadow: "none",
    cursor: "not-allowed",
  },
  forgotPassword: {
    marginTop: "18px",
    fontSize: "13px",
    color: "var(--slate-600)",
    fontWeight: "500",
  },
  footer: {
    marginTop: "30px",
    fontSize: "15px",
    color: "var(--slate-500)",
    fontWeight: "500",
  },
};

export default Login;
