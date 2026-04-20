import Home from "./Home";
import { useState } from "react";
import config from "../config";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Company() {

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const handleSave = async () => {
      // แนะนำให้ใส่ Loading Toast ไว้ด้วย เพื่อให้รู้ว่ากำลังโหลด
      const toastId = toast.loading("กำลังบันทึกข้อมูล...");

      try {
        const payload = {
          name: name,
          phone: phone,
          address: address,
        };

        const res = await axios.post(
          config.apiPath + "/api/company/create",
          payload,
        );

        if (res.data.id !== undefined) {
          // 2. ถ้าสำเร็จ ให้เปลี่ยน Loading เป็น Success
          toast.update(toastId, {
            render: "บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว",
            type: "success",
            isLoading: false,
            autoClose: 2000, // ปิดเองใน 2 วินาที
          });
        }
      } catch (e) {
        // 3. ถ้าพัง ให้เปลี่ยน Loading เป็น Error
        toast.update(toastId, {
          render: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    };

  return (
    <Home>
      <div style={styles.container}>
        {/* ส่วนหัวข้อ */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            <i className="bi bi-shop-window" style={styles.iconHeader}></i>
            จัดการข้อมูลร้านค้า
          </h2>
          <p style={styles.subtitle}>
            ตั้งค่าโปรไฟล์ร้านค้าเพื่อใช้ในการออกใบเสร็จและหน้าเว็บหลัก
          </p>
        </div>

        {/* ตัว Card ฟอร์ม */}
        <div style={styles.card}>
          <div style={styles.formGroup}>
            <label style={styles.label}>ชื่อร้านล็อตเตอรี่</label>
            <div style={styles.inputWrapper}>
              <i className="bi bi-tag" style={styles.inputIcon}></i>
              <input
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
                style={{ ...styles.inputIcon, top: "15px" }}
              ></i>
              <textarea
                onChange={(e) => setAddress(e.target.value)}
                style={{ ...styles.input, height: "100px", paddingTop: "12px" }}
                placeholder="ระบุที่อยู่โดยละเอียด"
              ></textarea>
            </div>
          </div>

          <button style={styles.btnSave} onClick={handleSave}>
            <i
              className="bi bi-cloud-check-fill"
              style={{ marginRight: "8px" }}
            ></i>
            บันทึกข้อมูลร้านค้า
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" theme="colored" />
    </Home>
  );
}


const styles = {
  container: {
    animation: "fadeIn 0.5s ease-in-out",
    maxWidth: "800px",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1a1a2e",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    margin: 0,
  },
  iconHeader: {
    color: "#FFD700",
    backgroundColor: "#1a1a2e",
    padding: "10px",
    borderRadius: "12px",
    fontSize: "24px",
  },
  subtitle: {
    color: "#6c757d",
    marginTop: "10px",
    fontSize: "15px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    border: "1px solid #f1f3f5",
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
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "15px",
    color: "#adb5bd",
    fontSize: "18px",
  },
  input: {
    width: "100%",
    padding: "15px 15px 15px 45px",
    borderRadius: "12px",
    border: "2px solid #e9ecef",
    fontSize: "16px",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "#f8f9fa",
  },
  btnSave: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#1a1a2e",
    color: "#FFD700",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
    transition: "transform 0.2s ease, boxShadow 0.2s ease",
    boxShadow: "0 4px 15px rgba(26, 26, 46, 0.2)",
  },
};

export default Company;
