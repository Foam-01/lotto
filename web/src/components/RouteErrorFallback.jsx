import { useRouteError, useNavigate } from "react-router-dom";

// 🌟 หน้าจอสำรองเวลาโค้ดในหน้านั้นๆ พังระหว่าง render (เช่น API ตอบข้อมูลผิดรูป/undefined)
// กันไม่ให้ผู้ใช้เจอจอขาวหรือ error message ภาษาอังกฤษเต็มจอแบบ default ของ react-router
function RouteErrorFallback() {
  const error = useRouteError();
  const navigate = useNavigate();

  if (process.env.NODE_ENV !== "production") {
    console.error("Route error:", error);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "24px",
        textAlign: "center",
        fontFamily: "'Kanit', sans-serif",
        backgroundColor: "var(--slate-50, #f8fafc)",
      }}
    >
      <div style={{ fontSize: "64px" }}>😿</div>
      <h2 style={{ margin: 0, color: "var(--brand-700, #1d4ed8)" }}>
        เกิดข้อผิดพลาดบางอย่าง
      </h2>
      <p style={{ color: "var(--slate-500, #64748b)", maxWidth: "420px" }}>
        หน้านี้โหลดข้อมูลไม่สำเร็จ อาจเป็นเพราะเซิร์ฟเวอร์ไม่ตอบสนองชั่วคราว
        กรุณาลองใหม่อีกครั้ง
      </p>
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn fw-bold rounded-pill px-4"
          style={{ backgroundColor: "var(--brand-600, #2563eb)", color: "#fff" }}
        >
          ลองใหม่อีกครั้ง
        </button>
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="btn fw-bold rounded-pill px-4"
          style={{ backgroundColor: "var(--slate-200, #e2e8f0)", color: "#1e293b" }}
        >
          กลับหน้าแรก
        </button>
      </div>
    </div>
  );
}

export default RouteErrorFallback;
