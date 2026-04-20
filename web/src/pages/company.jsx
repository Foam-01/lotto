import Home from "./Home";
import { useEffect, useState } from "react";
import config from "../config";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Company() {
  // 👇👇👇 โลจิกทั้งหมดของคุณอยู่ครบเหมือนเดิม 100% 👇👇👇
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
        text: "ไม่สามารถโหลดข้อมูลร้านค้าได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  const handleSave = async () => {
    const toastId = toast.loading("กำลังบันทึกข้อมูล...");

    try {
      const payload = {
        name: name,
        phone: phone,
        address: address,
      };

      let res;

      if (id == 0) {
        res = await axios.post(config.apiPath + "/api/company/create", payload);
        setId(0);
      } else {
        res = await axios.put(
          config.apiPath + "/api/company/edit/" + id,
          payload,
        );
      }

      if (res.data.id !== undefined) {
        toast.update(toastId, {
          render: "บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      }

      fetchData();
    } catch (e) {
      toast.update(toastId, {
        render: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };
  // 👆👆👆 จบส่วนโลจิก 👆👆👆

  // 👇👇👇 ส่วน UI ที่ปรับความสวยงามแบบ VIP 👇👇👇
  return (
    <Home>
      <div style={styles.container}>
        {/* --- Header Section --- */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.titleMain}>
              <span style={{ color: "#FFD700", marginRight: "10px" }}>🏪</span>
              จัดการข้อมูลร้านค้า
            </h2>
            <p style={styles.subtitleMain}>
              ตั้งค่าโปรไฟล์ร้านค้าเพื่อใช้ในการออกใบเสร็จและหน้าเว็บหลัก
            </p>
          </div>
        </div>

        {/* --- Form Section (Premium Card) --- */}
        <div style={styles.premiumCard}>
          <div style={styles.cardHeader}>
            <h4 style={styles.cardTitle}>โปรไฟล์ร้านค้า</h4>
            <span style={styles.badge}>SYSTEM CONFIG</span>
          </div>

          <div style={{ marginTop: "25px" }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>ชื่อร้านล็อตเตอรี่</label>
              <div style={styles.inputWrapper}>
                <i className="bi bi-tag" style={styles.inputIcon}></i>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  style={styles.input}
                  placeholder="ระบุชื่อร้านของคุณ"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>เบอร์โทรศัพท์ติดต่อ</label>
              <div style={styles.inputWrapper}>
                <i className="bi bi-telephone" style={styles.inputIcon}></i>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="text"
                  style={styles.input}
                  placeholder="08x-xxx-xxxx"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>ที่อยู่ร้าน</label>
              <div style={styles.inputWrapper}>
                <i
                  className="bi bi-geo-alt"
                  style={{ ...styles.inputIcon, top: "18px" }}
                ></i>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    ...styles.input,
                    height: "120px",
                    paddingTop: "15px",
                    resize: "none",
                  }}
                  placeholder="ระบุที่อยู่โดยละเอียด"
                ></textarea>
              </div>
            </div>

            <div
              style={{
                marginTop: "30px",
                paddingTop: "20px",
                borderTop: "1px solid #f1f3f5",
              }}
            >
              <button style={styles.btnSave} onClick={handleSave}>
                <i
                  className="bi bi-cloud-check-fill"
                  style={{ marginRight: "10px" }}
                ></i>
                บันทึกข้อมูลร้านค้า
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" theme="colored" />
    </Home>
  );
}

// 🟢 CSS ที่อัปเกรดความสวย (เข้าชุดกับหน้า Lotto VIP)
const styles = {
  container: {
    maxWidth: "850px",
    margin: "0 auto",
    fontFamily: "'Kanit', sans-serif",
    animation: "fadeIn 0.4s ease-in-out",
  },
  header: {
    marginBottom: "30px",
  },
  titleMain: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1a1a2e",
    margin: 0,
  },
  subtitleMain: {
    color: "#6c757d",
    marginTop: "5px",
    fontSize: "15px",
  },
  premiumCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "35px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
    borderTop: "6px solid #1a1a2e", // ขอบบนสไตล์ VIP
    marginBottom: "35px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #f8f9fa",
    paddingBottom: "15px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: 0,
  },
  badge: {
    backgroundColor: "#f8f9fa",
    color: "#495057",
    padding: "6px 15px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "1px",
    border: "1px solid #dee2e6",
  },
  formGroup: {
    marginBottom: "25px",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    fontWeight: "600",
    color: "#495057",
    fontSize: "14px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "18px",
    color: "#adb5bd",
    fontSize: "18px",
  },
  input: {
    width: "100%",
    padding: "16px 16px 16px 50px", // เว้นซ้ายให้ไอคอน
    borderRadius: "12px",
    border: "2px solid #e9ecef",
    fontSize: "16px",
    color: "#212529",
    outline: "none",
    backgroundColor: "#f8f9fa",
    boxSizing: "border-box", // ล็อกไม่ให้กล่องล้นขอบจอเด็ดขาด
  },
  btnSave: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#1a1a2e",
    color: "#FFD700",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default Company;
