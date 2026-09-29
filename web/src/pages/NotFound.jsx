import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={styles.container}>
      {/* 🌟 ลด padding การ์ดบนจอแคบมาก ๆ (media query เฉพาะจุด) 🌟 */}
      <style>{`
        @media (max-width: 400px) {
          .notfound-card { padding: 30px 20px !important; }
        }
      `}</style>
      <div className="notfound-card" style={styles.card}>
        <div style={styles.emoji}>🙀</div>
        <h1 style={styles.title}>404</h1>
        <p style={styles.text}>ไม่พบหน้าที่คุณกำลังหา</p>
        <p style={styles.subtext}>
          ลิงก์อาจพิมพ์ผิด หรือหน้านี้อาจถูกย้ายไปแล้ว
        </p>
        <Link to="/" style={styles.button}>
          <i className="bi bi-house-door-fill me-2"></i>
          กลับหน้าหลัก
        </Link>
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
    backgroundColor: "var(--amber-50)",
    fontFamily: "'Kanit', sans-serif",
    padding: "20px",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "var(--color-white)",
    padding: "50px 40px",
    borderRadius: "var(--radius-xl)",
    borderTop: "10px solid var(--brand-600)",
    boxShadow: "var(--shadow-card)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  emoji: { fontSize: "70px", marginBottom: "10px" },
  title: {
    color: "var(--brand-600)",
    fontSize: "48px",
    fontWeight: "900",
    margin: "0 0 10px",
  },
  text: {
    color: "var(--slate-900)",
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 6px",
  },
  subtext: {
    color: "var(--slate-400)",
    fontSize: "14px",
    margin: "0 0 25px",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 28px",
    background: "linear-gradient(135deg, var(--brand-600), var(--brand-700))",
    color: "var(--color-white)",
    borderRadius: "var(--radius-md)",
    fontWeight: "700",
    fontSize: "16px",
    textDecoration: "none",
    boxShadow: "var(--shadow-primary-strong)",
  },
};

export default NotFound;
