import { useCallback, useEffect, useRef, useState } from "react";
import AuthService from "../services/auth.service";
import Swal from "sweetalert2";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Home.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// 🌟 รายการเมนูทั้งหมด กำหนดเป็น data เดียว ใช้ทั้งสร้าง sidebar และหา breadcrumb/title ของหน้าปัจจุบัน
const MENU_GROUPS = [
  {
    label: "ภาพรวม",
    items: [{ to: "/home", icon: "bi-house-door-fill", label: "หน้าแรก" }],
  },
  {
    label: "ขายและสต๊อก",
    items: [
      { to: "/banner", icon: "bi-gem", label: "ป้ายโฆษณา" },
      { to: "/lotto", icon: "bi-ticket-detailed-fill", label: "จัดการสลาก" },
      {
        to: "/changePrice",
        icon: "bi-lightning-charge-fill",
        label: "ปรับราคาแบบเร่งด่วน",
      },
      { to: "/billSale", icon: "bi-receipt-cutoff", label: "รายการสั่งซื้อ" },
      { to: "/lottoInShop", icon: "bi-inbox", label: "รายการที่ฝากร้าน" },
      { to: "/lottoForSend", icon: "bi-truck", label: "รายการที่จัดส่ง" },
    ],
  },
  {
    label: "รางวัลและรายงาน",
    items: [
      { to: "/Bonus", icon: "bi-gift", label: "ผลรางวัล" },
      { to: "/saleBonus", icon: "bi-trophy-fill", label: "รายงานผู้ถูกรางวัล" },
      { to: "/lottoIsBonus", icon: "bi-award-fill", label: "รางวัลของร้าน" },
      { to: "/reportIncome", icon: "bi-cash-coin", label: "รายงานรายได้" },
      { to: "/reportProfit", icon: "bi-piggy-bank", label: "รายงานผลกำไร" },
    ],
  },
  {
    label: "ตั้งค่า",
    items: [
      { to: "/company", icon: "bi-shop-window", label: "ข้อมูลร้าน" },
      { to: "/user", icon: "bi-person", label: "ข้อมูลผู้ใช้" },
    ],
  },
];

const ALL_MENU_ITEMS = MENU_GROUPS.flatMap((g) => g.items);

function Home(props) {
  const [userName, setUserName] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  // 🌟 เลื่อนเมนูด้านซ้ายให้เห็นรายการที่กำลังเลือกอยู่เสมอ ทันทีที่รายการนั้น mount ขึ้นมาจริงๆ
  // (ใช้ callback ref แทน useEffect + useRef เพราะตอนโหลดหน้าแรก sidebar ยังไม่ mount
  // ระหว่างที่รอเช็คสิทธิ์ผู้ใช้อยู่ — ผูกกับ location.pathname เฉยๆ จะยิงเร็วเกินไปจนไม่มีผล)
  const setActiveMenuItemRef = useCallback((el) => {
    el?.scrollIntoView({ block: "nearest" });
  }, []);

  useEffect(() => {
    // 🛡️ เช็คว่ามี token อยู่ในเครื่องหรือไม่ก่อนเลย ถ้าไม่มีเด้งกลับหน้า Login ทันที
    // ป้องกันไม่ให้เมนู/เนื้อหาหลังบ้านแวบขึ้นมาให้เห็นก่อนที่จะรู้ว่ายังไม่ได้ล็อกอิน
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDate();
  }, []);

  // 🌟 ปิด Sidebar อัตโนมัติทุกครั้งที่เปลี่ยนหน้า (สำหรับมือถือ)
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // 🌟 ปิด Sidebar ด้วยปุ่ม Escape (คีย์บอร์ด) เมื่อเปิดอยู่บนมือถือ
  useEffect(() => {
    if (!isSidebarOpen) return;
    const handleEscKey = (e) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isSidebarOpen]);

  // 🌟 ปิดเมนูผู้ใช้ (มุมขวาบน) เมื่อคลิกข้างนอก
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const fetchDate = async () => {
    try {
      const res = await AuthService.getUserInfo();
      setUserName(res.data.payload.user);
    } catch (e) {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    } finally {
      setIsAuthChecked(true);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const currentMenuItem = ALL_MENU_ITEMS.find(
    (item) => item.to.toLowerCase() === location.pathname.toLowerCase(),
  );

  const handleLogout = (e) => {
    e.preventDefault();

    Swal.fire({
      title: "ออกจากระบบ?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบแผงแมวส้ม",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--red-600)",
      cancelButtonColor: "var(--slate-400)",
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    });
  };

  // 🛡️ ระหว่างรอเช็คสิทธิ์ (เรียก /user/info) ยังไม่โชว์เมนู/เนื้อหาหลังบ้าน
  // กันไม่ให้แวบเห็น UI ก่อนรู้ว่า login อยู่จริงไหม
  if (!isAuthChecked) {
    return (
      <div className="auth-check-screen">
        <div className="spinner-border text-warning" role="status"></div>
        <p>กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
      </div>
    );
  }

  return (
    <div className="layout-wrapper">
      {/* 🌟 แถบบนสำหรับมือถือ: ปุ่มเปิดเมนู 🌟 */}
      <div className="mobile-topbar">
        <button
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="เปิดเมนู"
        >
          <i className="bi bi-list"></i>
        </button>
        <span className="mobile-topbar-title">🐈 แผงแมวส้ม</span>
      </div>

      {/* 🌟 ฉากหลังมืดตอนเปิดเมนูบนมือถือ กดเพื่อปิดเมนูได้ (รองรับคีย์บอร์ดด้วย) 🌟 */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="ปิดเมนู"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              setIsSidebarOpen(false);
            }
          }}
        ></div>
      )}

      {/* 🌟 Sidebar 🌟 */}
      <div className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <button
          className="sidebar-close-btn"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="ปิดเมนู"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        {/* --- ส่วนหัว --- */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo" aria-hidden="true">
            🐈
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">แผงแมวส้ม</span>
            <span className="sidebar-brand-sub">ADMIN PANEL</span>
          </div>
        </div>

        {/* --- ส่วนเมนู --- */}
        <nav className="menu">
          {MENU_GROUPS.map((group) => (
            <div className="menu-group" key={group.label}>
              <div className="menu-group-label">{group.label}</div>
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  ref={isActive(item.to) ? setActiveMenuItemRef : undefined}
                  className={`menu-item ${isActive(item.to)}`}
                  title={item.label}
                  aria-current={isActive(item.to) ? "page" : undefined}
                >
                  <span className="menu-item-icon">
                    <i className={`bi ${item.icon}`}></i>
                  </span>
                  <span className="menu-item-label">{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* --- ส่วนผู้ใช้ + ออกจากระบบ --- */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar" aria-hidden="true">
              🐈
            </div>
            <div className="sidebar-user-info">
              <small className="sidebar-user-hello">ยินดีต้อนรับ</small>
              <strong className="sidebar-user-name">
                {userName || "Admin"}
              </strong>
            </div>
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="ออกจากระบบ"
              aria-label="ออกจากระบบ"
            >
              <i className="bi bi-power"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 Content Area 🌟 */}
      <div className="content-wrapper">
        {/* 🌟 Topbar เดสก์ท็อป: breadcrumb + search + ผู้ใช้ 🌟 */}
        <header className="app-topbar">
          <div className="app-topbar-breadcrumb">
            <i className="bi bi-house-door me-2"></i>
            <span>หน้าแรก</span>
            {currentMenuItem && currentMenuItem.to !== "/home" && (
              <>
                <i className="bi bi-chevron-right app-breadcrumb-sep"></i>
                <span className="app-breadcrumb-current">
                  {currentMenuItem.label}
                </span>
              </>
            )}
          </div>

          <div className="app-topbar-actions">
            <div className="app-topbar-user" ref={userMenuRef}>
              <button
                type="button"
                className="app-topbar-user-btn"
                onClick={() => setIsUserMenuOpen((v) => !v)}
                aria-expanded={isUserMenuOpen}
                aria-label="เมนูผู้ใช้"
              >
                <span className="app-topbar-avatar">🐈</span>
                <span className="app-topbar-username d-none d-lg-inline">
                  {userName || "Admin"}
                </span>
                <i className="bi bi-chevron-down d-none d-lg-inline"></i>
              </button>

              {isUserMenuOpen && (
                <div className="app-topbar-dropdown">
                  <Link
                    to="/user"
                    className="app-topbar-dropdown-item"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <i className="bi bi-person me-2"></i> ข้อมูลผู้ใช้
                  </Link>
                  <button
                    type="button"
                    className="app-topbar-dropdown-item app-topbar-dropdown-danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-power me-2"></i> ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">
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
        </main>
      </div>
    </div>
  );
}

export default Home;
