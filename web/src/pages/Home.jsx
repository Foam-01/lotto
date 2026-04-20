import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Home(props) {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

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

  return (
    <div className="layout-wrapper">
      <div className="sidebar">
        <div className="title">LOTTO ADMIN</div>

        <div className="user-info">
          <small className="text-muted d-block">ยินดีต้อนรับ</small>
          <strong style={{ color: "#FFD700", fontSize: "1.1rem" }}>
            {userName}
          </strong>
        </div>

        <div className="menu">
          {/* ใช้ bi-house-door-fill ให้ดูเป็น "หน้าแรก" ที่ชัดเจนขึ้น */}
          <Link to="/home" className="menu-item">
            <i className="bi bi-house-door-fill"></i> <span>หน้าแรก</span>
          </Link>

          {/* ใช้ bi-shop-window ให้ดูเป็นหน้าร้าน */}
          <Link to="/company" className="menu-item">
            <i className="bi bi-shop-window"></i> <span>ข้อมูลร้าน</span>
          </Link>

          {/* ใช้ bi-ticket-detailed-fill ให้ดูเหมือนสลากที่มีรายละเอียด */}
          <Link to="/lotto" className="menu-item">
            <i className="bi bi-ticket-detailed-fill"></i>{" "}
            <span>ล็อตเตอรี่</span>
          </Link>
        </div>

        <div className="logout-section">
          <Link
            to="/"
            className="menu-item logout-link"
            onClick={() => localStorage.removeItem("token")}
          >
            <i className="bi bi-power"></i> <span>ออกจากระบบ</span>
          </Link>
        </div>
      </div>

      <div className="content">
        {props.children || (
          <div className="welcome-box text-center py-5">
            <i
              className="bi bi-house-door text-primary"
              style={{ fontSize: "3rem" }}
            ></i>
            <h2 className="mt-3 fw-bold">ยินดีต้อนรับเข้าสู่ระบบจัดการ</h2>
            <p className="text-muted">
              กรุณาเลือกเมนูทางด้านซ้ายเพื่อจัดการข้อมูลของคุณ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
