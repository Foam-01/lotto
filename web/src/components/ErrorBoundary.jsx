import React from "react";

// 🌟 ตาข่ายนิรภัยสุดท้ายฝั่ง frontend: ถ้าหน้าไหน render แล้ว throw error
// (เช่น field เป็น null/undefined ที่ไม่คาดคิด) จะไม่ทำให้ทั้งแอปเป็นจอขาวเปล่าๆ
// โดยไม่มีทางกลับ — ต้องเป็น class component เพราะ React ยังไม่มี error boundary hook
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("💥 Unhandled render error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ minHeight: "100vh", padding: "20px" }}
        >
          <div style={{ fontSize: "60px" }}>🙀</div>
          <h2 className="fw-bold mt-2">เกิดข้อผิดพลาดที่ไม่คาดคิด</h2>
          <p className="text-muted">
            หน้านี้แสดงผลไม่ได้ กรุณาลองโหลดใหม่อีกครั้ง
          </p>
          <button
            type="button"
            className="btn btn-warning fw-bold mt-2"
            onClick={this.handleReload}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            กลับหน้าแรก
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
