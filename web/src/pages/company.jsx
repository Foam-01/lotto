import Home from "./Home";
import { useEffect, useState } from "react";
import config from "../config";
import axios from "axios";
import Swal from "sweetalert2";
// 🌟 เปลี่ยนมาใช้ SweetAlert2 สำหรับแจ้งเตือนทั้งหมดแทน react-toastify
import "sweetalert2/dist/sweetalert2.min.css";

function Company() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [id, setId] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(config.apiPath + "/api/company/info");
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
        confirmButtonColor: "#ea580c",
      });
    }
  };

  const handleSave = async () => {
    // 🌟 สร้าง Notification (Toast) ของ SweetAlert2 เตรียมไว้
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

    try {
      // โชว์ Loading เล็กๆ ที่มุมขวาบน
      Toast.fire({
        title: "กำลังบันทึกข้อมูลแผงแมวส้ม...",
        icon: "info",
        timer: null, // ให้หมุนไปเรื่อยๆ จนกว่าจะโหลดเสร็จ
        showConfirmButton: false,
      });

      const payload = {
        name: name,
        phone: phone,
        address: address,
      };

      let res;
      if (id === 0) {
        res = await axios.post(config.apiPath + "/api/company/create", payload);
        setId(0); // หรือดึง ID ใหม่กลับมาเซ็ตก็ได้
      } else {
        res = await axios.put(
          config.apiPath + "/api/company/edit/" + id,
          payload,
        );
      }

      if (res.data.id !== undefined || res.data.message === "success") {
        // เมื่อบันทึกสำเร็จ เปลี่ยน Toast เป็นหน้าตาสำเร็จ
        Toast.fire({
          icon: "success",
          title: "บันทึกข้อมูลแผงแมวส้มเรียบร้อย! 🐈",
          timer: 2500,
        });
        fetchData(); // ดึงข้อมูลใหม่มาแสดง
      } else {
        throw new Error("Insert or Update failed");
      }
    } catch (e) {
      console.error(e);
      // เมื่อเกิด Error แจ้งเตือนสีแดง
      Toast.fire({
        icon: "error",
        title: "โง้ววว... บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่ 😿",
        timer: 3500,
      });
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

        <div className="container" style={styles.contentContainer}>
          <div style={styles.header}>
            <div>
              <h2 style={styles.titleMain}>
                <span className="me-3" style={styles.headerEmoji}>
                  🐈
                </span>
                แผงแมวส้ม: จัดการข้อมูลร้าน
              </h2>
              <p style={styles.subtitleMain}>
                ตั้งค่าโปรไฟล์แผงแมวส้มของคุณ
                เพื่อใช้ในการออกใบเสร็จและหน้าเว็บหลัก
              </p>
            </div>
          </div>

          <div style={styles.premiumCard}>
            <div style={styles.cardHeader}>
              <h4 style={styles.cardTitle}>
                <span className="icon-paw me-2">🐾</span>{" "}
                โปรไฟล์แผงล็อตเตอรี่ของคุณ
              </h4>
              <span style={styles.badge}>🐾 SYSTEM CONFIG</span>
            </div>

            <div style={{ marginTop: "30px" }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>ชื่อแผงล็อตเตอรี่</label>
                <div style={styles.inputWrapper}>
                  <i className="bi bi-tag-fill" style={styles.inputIcon}></i>
                  <input
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
                <label style={styles.label}>เบอร์โทรศัพท์ติดต่อ</label>
                <div style={styles.inputWrapper}>
                  <i
                    className="bi bi-telephone-fill"
                    style={styles.inputIcon}
                  ></i>
                  <input
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
                <label style={styles.label}>ที่อยู่ของแผงล็อตเตอรี่</label>
                <div style={styles.inputWrapper}>
                  <i
                    className="bi bi-geo-alt-fill"
                    style={{ ...styles.inputIcon, top: "20px" }}
                  ></i>
                  <textarea
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
                <button style={styles.btnSave} onClick={handleSave}>
                  <i
                    className="bi bi-cloud-check-fill"
                    style={{ marginRight: "12px" }}
                  ></i>
                  บันทึกข้อมูลแผงแมวส้ม
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
    backgroundColor: "#fffbeb",
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
    color: "#ea580c",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: "90px",
    filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.1))",
  },
  subtitleMain: {
    color: "#94a3b8",
    marginTop: "10px",
    fontSize: "16px",
    fontWeight: "500",
  },
  premiumCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 20px 40px rgba(234, 88, 12, 0.08)",
    borderTop: "10px solid #ea580c",
    marginBottom: "35px",
    animation: "slideUp 0.3s ease-out forwards",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #fed7aa",
    paddingBottom: "20px",
  },
  cardTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#fff7ed",
    color: "#9a3412",
    padding: "8px 18px",
    borderRadius: "50px",
    fontSize: "13px",
    fontWeight: "bold",
    letterSpacing: "1px",
    border: "1px solid #ffedd5",
  },
  formGroup: {
    marginBottom: "30px",
  },
  label: {
    display: "block",
    marginBottom: "12px",
    fontWeight: "700",
    color: "#475569",
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
    color: "#94a3b8",
    fontSize: "20px",
  },
  input: {
    width: "100%",
    padding: "18px 16px 18px 55px",
    borderRadius: "16px",
    border: "2px solid #e2e8f0",
    fontSize: "17px",
    color: "#212529",
    outline: "none",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  footerAction: {
    marginTop: "40px",
    paddingTop: "25px",
    borderTop: "2px dashed #e2e8f0",
  },
  btnSave: {
    width: "100%",
    padding: "18px",
    background: "linear-gradient(135deg, #ea580c, #c2410c)",
    color: "#ffffff",
    border: "none",
    borderRadius: "16px",
    fontSize: "20px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(234, 88, 12, 0.25)",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default Company;
