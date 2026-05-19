import { useEffect, useState } from "react";
import AuthService from "../services/auth.service";
import Swal from "sweetalert2";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Home.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Home(props) {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchDate();
  }, []);

  const fetchDate = async () => {
    try {
      const res = await AuthService.getUserInfo();
      setUserName(res.data.payload.user);
    } catch (e) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = (e) => {
    e.preventDefault();

    Swal.fire({
      title: "ออกจากระบบ?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบแผงแมวส้ม",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        navigate("/");
      }
    });
  };

  // 🌟 สไตล์พิเศษสำหรับ "Compact Mode" (บีบอัดเมนูให้ฟิตพอดีจอ)
  const compactMenuItem = {
    padding: "6px 15px", // ลดช่องไฟบนล่างให้บางลง
    marginBottom: "2px", // ลดระยะห่างระหว่างปุ่ม
    fontSize: "14px", // ขนาดฟอนต์กำลังดี อ่านง่าย ไม่ล้น
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap", // 🚨 บังคับให้อยู่บรรทัดเดียว ห้ามตกบรรทัด
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div className="layout-wrapper">
      {/* 🌟 Sidebar 🌟 */}
      <div
        className="sidebar"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh", // ล็อคความสูงเท่าหน้าจอ
          overflow: "hidden", // ปิด Scroll รวม
        }}
      >
        {/* --- ส่วนหัว (🌟 รีดไขมัน ลดขนาดลงให้กระชับที่สุด) --- */}
        <div style={{ flexShrink: 0, paddingBottom: "5px" }}>
          <div
            className="title"
            style={{
              marginBottom: "5px",
              lineHeight: "1.1",
              paddingTop: "5px",
            }}
          >
            {/* ย่อขนาดแมวส้มลงมานิดนึง */}
            <div
              className="title-emoji"
              style={{ fontSize: "2rem", marginBottom: "0" }}
            >
              🐈
            </div>
            <span style={{ fontSize: "1.1rem", fontWeight: "900" }}>
              แผงแมวส้ม
            </span>
            <br />
            <span
              className="title-sub"
              style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
            >
              ADMIN PANEL
            </span>
          </div>

          <div
            className="user-info"
            style={{ marginBottom: "5px", padding: "6px", borderRadius: "8px" }}
          >
            <small
              className="text-muted d-block fw-bold"
              style={{ fontSize: "0.7rem", marginBottom: "2px" }}
            >
              ยินดีต้อนรับเจ้านาย
            </small>
            <strong className="user-name-text" style={{ fontSize: "0.9rem" }}>
              🐾 {userName || "Admin"}
            </strong>
          </div>
        </div>

        {/* --- ส่วนเมนู (จัดระเบียบให้พอดีจอ) --- */}
        <div
          className="menu"
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            overflowY: "auto", // ถ้าจอเล็กมากจริงๆ ถึงจะยอมให้เลื่อน
            scrollbarWidth: "none", // ซ่อน Scrollbar
            msOverflowStyle: "none",
          }}
        >
          {/* ซ่อน Scrollbar ของ Chrome/Safari */}
          <style>{`.menu::-webkit-scrollbar { display: none; }`}</style>

          <Link
            to="/home"
            className={`menu-item ${isActive("/home")}`}
            style={compactMenuItem}
          >
            <i
              className="bi bi-house-door-fill me-2"
              style={{ color: "#ea580c" }}
            ></i>
            <span>หน้าแรก</span>
          </Link>

          <Link
            to="/banner"
            className={`menu-item ${isActive("/banner")}`}
            style={compactMenuItem}
          >
            <i className="bi bi-gem me-2" style={{ color: "#f59e0b" }}></i>
            <span>ป้ายโฆษณา</span>
          </Link>

          <Link
            to="/lotto"
            className={`menu-item ${isActive("/lotto")}`}
            style={compactMenuItem}
          >
            <i
              className="bi bi-ticket-detailed-fill me-2"
              style={{ color: "#3b82f6" }}
            ></i>{" "}
            <span>จัดการสลาก</span>
          </Link>

          <Link
            to="/changePrice"
            className={`menu-item ${isActive("/changePrice")}`}
            style={compactMenuItem}
          >
            <i
              className="bi bi-lightning-charge-fill me-2"
              style={{ color: "#ef4444" }}
            ></i>{" "}
            <span>ปรับราคา เร่งด่วน</span>
          </Link>

          <Link
            to="/billSale"
            className={`menu-item ${isActive("/billSale")}`}
            style={compactMenuItem}
          >
            <i
              className="bi bi-receipt-cutoff me-2"
              style={{ color: "#10b981" }}
            ></i>{" "}
            <span>รายการสั่งซื้อ</span>
          </Link>

          <Link
            to="/lottoInShop"
            className={`menu-item ${isActive("/lottoInShop")}`}
            style={compactMenuItem}
          >
            <i className="bi bi-inbox me-2" style={{ color: "#8b5cf6" }}></i>
            <span>รายการที่ฝากร้าน</span>
          </Link>

          <Link
            to="/lottoForSend"
            className={`menu-item ${isActive("/lottoForSend")}`}
            style={compactMenuItem}
          >
            <i className="bi bi-truck me-2" style={{ color: "#06b6d4" }}></i>
            <span>รายการที่จัดส่ง</span>
          </Link>

          <Link
            to="/Bonus"
            className={`menu-item ${isActive("/Bonus")}`}
            style={compactMenuItem}
          >
            <i className="bi bi-gift me-2" style={{ color: "#ec4899" }}></i>
            <span>ผลรางวัล</span>
          </Link>

          <Link
            to="/saleBonus"
            className={`menu-item ${isActive("/saleBonus")}`}
            style={compactMenuItem}
          >
            <i
              className="bi bi-trophy-fill me-2"
              style={{ color: "#eab308" }}
            ></i>{" "}
            <span>รายงานผู้ถูกรางวัล</span>
          </Link>

          <Link
            to="/lottoIsBonus"
            className={`menu-item ${isActive("/lottoIsBonus")}`}
            style={compactMenuItem}
          >
            <i
              className="bi bi-award-fill me-2"
              style={{ color: "#f97316" }}
            ></i>
            <span>รางวัลของร้าน</span>
          </Link>

          <Link
            to="/reportIncome"
            className={`menu-item ${isActive("/reportIncome")}`}
            style={compactMenuItem}
          >
            <i
              className="bi bi-cash-coin me-2"
              style={{ color: "#10b981" }}
            ></i>
            <span>รายงานรายได้</span>
          </Link>

          <Link
            to="/reportProfit"
            className={`menu-item ${isActive("/reportProfit")}`}
            style={compactMenuItem}
          >
            <i
              className="bi bi-piggy-bank me-2"
              style={{ color: "#059669" }}
            ></i>
            <span>รายงานผลกำไร</span>
          </Link>

          <Link
            to="/company"
            className={`menu-item ${isActive("/company")}`}
            style={compactMenuItem}
          >
            <i
              className="bi bi-shop-window me-2"
              style={{ color: "#64748b" }}
            ></i>
            <span>ข้อมูลร้าน</span>
          </Link>

          <Link
            to="/user"
            className={`menu-item ${isActive("/user")}`}
            style={compactMenuItem}
          >
            <i className="bi bi-person me-2" style={{ color: "#475569" }}></i>
            <span>ข้อมูลผู้ใช้</span>
          </Link>
        </div>

        {/* --- ส่วนออกจากระบบ (🌟 ล็อคติดขอบล่าง 100%) --- */}
        <div
          className="logout-section"
          style={{
            flexShrink: 0,
            marginTop: "auto", // ดันให้ติดขอบล่าง
            paddingBottom: "15px",
            borderTop: "1px dashed #fed7aa",
            paddingTop: "8px",
          }}
        >
          <a
            href="#"
            className="menu-item logout-link"
            onClick={handleLogout}
            style={compactMenuItem}
          >
            <i className="bi bi-power me-2"></i> <span>ออกจากระบบ</span>
          </a>
        </div>
      </div>

      {/* 🌟 Content Area 🌟 */}
      <div className="content">
        {props.children || (
          <div className="welcome-box">
            <div className="welcome-emoji">🐈🐾</div>
            <h2 className="mt-3 fw-bold welcome-title">
              ยินดีต้อนรับเข้าสู่ระบบจัดการ
            </h2>
            <p className="text-muted welcome-subtitle">
              กรุณาเลือกเมนูทางด้านซ้ายเพื่อจัดการแผงแมวส้มของคุณ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
