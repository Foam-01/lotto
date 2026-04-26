import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";
import Swal from "sweetalert2";
import { Link, useNavigate, useLocation } from "react-router-dom"; // นำเข้า useLocation เพิ่มเพื่อเช็คเมนูที่กำลังแอคทีฟ
import "./Home.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Home(props) {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // ไว้เช็คว่าตอนนี้อยู่ URL ไหน

  useEffect(() => {
    fetchDate();
  }, []);

  const fetchDate = async () => {
    try {
      const res = await axios.get(
        config.apiPath + "/api/user/info",
        config.headers(),
      );
      setUserName(res.data.payload.user);
    } catch (e) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  // ฟังก์ชันเช็คว่าเมนูไหนกำลังถูกเลือก
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = (e) => {
    e.preventDefault(); // ป้องกันไม่ให้ลิงก์เปลี่ยนหน้าทันที

    Swal.fire({
      title: "ออกจากระบบ?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบแผงแมวส้ม",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626", // ใช้สีแดงเพื่อเตือนว่าเป็นการออกจากระบบ
      cancelButtonColor: "#94a3b8", // สีเทาสำหรับปุ่มยกเลิก
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        // ถ้ายืนยัน ค่อยลบ Token และเปลี่ยนหน้า
        localStorage.removeItem("token");
        navigate("/");
      }
    });
  };

  return (
    <div className="layout-wrapper">
      {/* 🌟 Sidebar แผงแมวส้ม 🌟 */}
      <div className="sidebar">
        <div className="title">
          <div className="title-emoji">🐈</div>
          แผงแมวส้ม
          <br />
          <span className="title-sub">ADMIN PANEL</span>
        </div>

        <div className="user-info">
          <small className="text-muted d-block fw-bold mb-1">
            ยินดีต้อนรับเจ้านาย
          </small>
          <strong className="user-name-text">🐾 {userName || "Admin"}</strong>
        </div>

        <div className="menu">
          <Link to="/home" className={`menu-item ${isActive("/home")}`}>
            <i className="bi bi-house-door-fill"></i> <span>หน้าแรก</span>
          </Link>

          <Link to="/company" className={`menu-item ${isActive("/company")}`}>
            <i className="bi bi-shop-window"></i> <span>ข้อมูลร้าน</span>
          </Link>

          <Link to="/lotto" className={`menu-item ${isActive("/lotto")}`}>
            <i className="bi bi-ticket-detailed-fill"></i>{" "}
            <span>จัดการสลาก</span>
          </Link>

          <Link to="/billSale" className={`menu-item ${isActive("/billSale")}`}>
            <i className="bi bi-receipt-cutoff"></i> <span>รายการสั่งซื้อ</span>
          </Link>
        </div>

        <div className="logout-section">
          <a href="#" className="menu-item logout-link" onClick={handleLogout}>
            <i className="bi bi-power"></i> <span>ออกจากระบบ</span>
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
