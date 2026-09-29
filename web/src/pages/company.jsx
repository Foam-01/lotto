import Home from "./Home";
import { useEffect, useState } from "react";
import CompanyService from "../services/company.service";
import Swal from "sweetalert2";
// 🌟 เปลี่ยนมาใช้ SweetAlert2 สำหรับแจ้งเตือนทั้งหมดแทน react-toastify
import "sweetalert2/dist/sweetalert2.min.css";

function Company() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [id, setId] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 🌟 ใช้ Service ดึงข้อมูล
      const res = await CompanyService.getInfo();
      if (res.data.id !== undefined) {
        setName(res.data.name);
        setPhone(res.data.phone);
        setAddress(res.data.address);
        setId(res.data.id);
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลแผงได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "var(--brand-600)",
      });
    }
  };

  const handleSave = async () => {
    if (isSaving) return; // 🛡️ กันกดซ้ำระหว่างรอบันทึก

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });

    setIsSaving(true);
    try {
      Toast.fire({
        title: "กำลังบันทึกข้อมูลแผงแมวส้ม...",
        icon: "info",
        timer: null,
        showConfirmButton: false,
      });

      const payload = {
        name: name,
        phone: phone,
        address: address,
      };

      let res;
      if (id === 0) {
        // 🌟 ใช้ Service สร้างข้อมูลใหม่
        res = await CompanyService.create(payload);
        setId(0);
      } else {
        // 🌟 ใช้ Service แก้ไขข้อมูล
        res = await CompanyService.edit(id, payload);
      }

      if (res.data.id !== undefined || res.data.message === "success") {
        Toast.fire({
          icon: "success",
          title: "บันทึกข้อมูลแผงแมวส้มเรียบร้อย!",
          timer: 2500,
        });
        fetchData();
      } else {
        throw new Error("Insert or Update failed");
      }
    } catch (e) {
      console.error(e);
      Toast.fire({
        icon: "error",
        title: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        timer: 3500,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Home>
      <div style={styles.page}>
        <div className="sunburst-bg"></div>
        <div className="bg-pattern"></div>

        {/* 🌟 Animated Floating Icons 🌟 */}
        {[
          { emoji: "💰", top: "15%", left: "5%", size: "80px", delay: "0s" },
          { emoji: "🐾", top: "45%", right: "6%", size: "100px", delay: "1s" },
          { emoji: "✨", top: "75%", left: "8%", size: "60px", delay: "2s" },
          {
            emoji: "🍀",
            top: "85%",
            right: "12%",
            size: "70px",
            delay: "0.5s",
          },
          { emoji: "🐈", top: "30%", left: "20%", size: "50px", delay: "1.5s" },
          {
            emoji: "🐾",
            top: "60%",
            right: "25%",
            size: "40px",
            delay: "2.5s",
          },
        ].map((icon, index) => (
          <div
            key={index}
            className="floating-icon"
            style={{
              top: icon.top,
              left: icon.left,
              right: icon.right,
              fontSize: icon.size,
              animationDelay: icon.delay,
            }}
          >
            {icon.emoji}
          </div>
        ))}

        {/* 🌟 ย่ออิโมจิหัวข้อ + อนุญาตให้ตัดบรรทัดบนจอแคบมาก ๆ (media query เฉพาะจุด) 🌟 */}
        <style>{`
          @media (max-width: 480px) {
            .company-header-emoji { font-size: 48px !important; }
            .company-title-main { flex-wrap: wrap; }
          }
        `}</style>

        <div className="container" style={styles.contentContainer}>
          <div style={styles.header}>
            <div>
              <h2 className="company-title-main" style={styles.titleMain}>
                <span className="me-3 company-header-emoji" style={styles.headerEmoji}>
                  🐈
                </span>
                 จัดการข้อมูลร้าน
              </h2>
              <p style={styles.subtitleMain}>
                ตั้งค่าโปรไฟล์แผงแมวส้มของคุณ
                เพื่อใช้ในการออกใบเสร็จและหน้าเว็บหลัก
              </p>
            </div>
          </div>

          <div style={styles.premiumCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                โปรไฟล์แผงล็อตเตอรี่ของคุณ
              </h3>
              <span style={styles.badge}>SYSTEM CONFIG</span>
            </div>

            <div style={{ marginTop: "30px" }}>
              <div style={styles.formGroup}>
                <label htmlFor="company-name" style={styles.label}>ชื่อแผงล็อตเตอรี่</label>
                <div style={styles.inputWrapper}>
                  <i className="bi bi-tag-fill" style={styles.inputIcon}></i>
                  <input
                    id="company-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    className="cat-input"
                    style={styles.input}
                    placeholder="ระบุชื่อแผงของคุณ (เช่น แผงแมวส้มให้โชค)"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="company-phone" style={styles.label}>เบอร์โทรศัพท์ติดต่อ</label>
                <div style={styles.inputWrapper}>
                  <i
                    className="bi bi-telephone-fill"
                    style={styles.inputIcon}
                  ></i>
                  <input
                    id="company-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="text"
                    className="cat-input"
                    style={styles.input}
                    placeholder="08x-xxx-xxxx"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="company-address" style={styles.label}>ที่อยู่ของแผงล็อตเตอรี่</label>
                <div style={styles.inputWrapper}>
                  <i
                    className="bi bi-geo-alt-fill"
                    style={{ ...styles.inputIcon, top: "20px" }}
                  ></i>
                  <textarea
                    id="company-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="cat-input"
                    style={{
                      ...styles.input,
                      height: "140px",
                      paddingTop: "15px",
                      resize: "none",
                    }}
                    placeholder="ระบุที่อยู่แผงโดยละเอียด เพื่อใช้ในการจัดส่งสลากใบจริง..."
                  ></textarea>
                </div>
              </div>

              <div style={styles.footerAction}>
                <button
                  style={{
                    ...styles.btnSave,
                    ...(isSaving ? styles.btnSaveDisabled : {}),
                  }}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        style={{ marginRight: "12px" }}
                      ></span>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <i
                        className="bi bi-cloud-check-fill"
                        style={{ marginRight: "12px" }}
                      ></i>
                      บันทึกข้อมูลแผงแมวส้ม
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Home>
  );
}

// 🟠 CSS Styles
const styles = {
  page: {
    backgroundColor: "var(--amber-50)",
    minHeight: "100vh",
    paddingTop: "40px",
    paddingBottom: "80px",
    fontFamily: "'Kanit', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  contentContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  header: {
    marginBottom: "40px",
  },
  titleMain: {
    fontSize: "32px",
    fontWeight: "900",
    color: "var(--brand-600)",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: "90px",
    filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.1))",
  },
  subtitleMain: {
    color: "var(--slate-600)",
    marginTop: "10px",
    fontSize: "16px",
    fontWeight: "500",
  },
  premiumCard: {
    backgroundColor: "var(--color-white)",
    borderRadius: "var(--radius-xl)",
    padding: "40px",
    boxShadow: "var(--shadow-card)",
    borderTop: "10px solid var(--brand-600)",
    marginBottom: "35px",
    animation: "slideUp 0.3s ease-out forwards",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid var(--brand-200)",
    paddingBottom: "20px",
  },
  cardTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "var(--slate-900)",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "var(--brand-50)",
    color: "var(--brand-800)",
    padding: "8px 18px",
    borderRadius: "var(--radius-pill)",
    fontSize: "13px",
    fontWeight: "bold",
    letterSpacing: "1px",
    border: "1px solid var(--brand-100)",
  },
  formGroup: {
    marginBottom: "30px",
  },
  label: {
    display: "block",
    marginBottom: "12px",
    fontWeight: "700",
    color: "var(--slate-600)",
    fontSize: "15px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "20px",
    color: "var(--slate-400)",
    fontSize: "20px",
  },
  input: {
    width: "100%",
    padding: "18px 16px 18px 55px",
    borderRadius: "var(--radius-lg)",
    border: "2px solid var(--slate-200)",
    fontSize: "17px",
    color: "#212529",
    outline: "none",
    backgroundColor: "var(--slate-50)",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  footerAction: {
    marginTop: "40px",
    paddingTop: "25px",
    borderTop: "2px dashed var(--slate-200)",
  },
  btnSave: {
    width: "100%",
    padding: "18px",
    background: "linear-gradient(135deg, var(--brand-600), var(--brand-700))",
    color: "var(--color-white)",
    border: "none",
    borderRadius: "var(--radius-lg)",
    fontSize: "20px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "var(--shadow-primary-strong)",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSaveDisabled: {
    background: "var(--slate-300)",
    boxShadow: "none",
    cursor: "not-allowed",
  },
};

export default Company;
