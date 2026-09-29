import Home from "./Home";
import { useEffect, useState } from "react";
import CompanyService from "../services/company.service";
import Swal from "sweetalert2";
// 🌟 เปลี่ยนมาใช้ SweetAlert2 สำหรับแจ้งเตือนทั้งหมดแทน react-toastify
import "sweetalert2/dist/sweetalert2.min.css";
import { PageHeader } from "../components/shared/PageHeader";

function Company() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [id, setId] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError(false);
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
      setLoadError(true);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลแผงได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "var(--brand-600)",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return; // 🛡️ กันกดซ้ำระหว่างรอบันทึก

    if (!name?.trim() || !phone?.trim() || !address?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
      return;
    }

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
        <div className="container" style={styles.contentContainer}>
          <PageHeader
            eyebrow="ตั้งค่าระบบ"
            title="จัดการข้อมูลร้าน"
            description="ตั้งค่าโปรไฟล์แผงแมวส้มของคุณ เพื่อใช้ในการออกใบเสร็จและหน้าเว็บหลัก"
          />

          <div style={styles.premiumCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                โปรไฟล์แผงล็อตเตอรี่ของคุณ
              </h3>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div
                  className="spinner-border text-warning"
                  role="status"
                >
                  <span className="visually-hidden">กำลังโหลด...</span>
                </div>
              </div>
            ) : loadError ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <p
                  style={{
                    color: "var(--red-600)",
                    fontWeight: 700,
                    fontSize: "17px",
                    marginBottom: "16px",
                  }}
                >
                  โหลดข้อมูลร้านไม่สำเร็จ
                </p>
                <button
                  onClick={fetchData}
                  style={{
                    backgroundColor: "var(--brand-600)",
                    color: "var(--color-white)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 28px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>ลองใหม่
                </button>
              </div>
            ) : (
            <div style={{ marginTop: "30px" }}>
              <div style={styles.formGroup}>
                <label htmlFor="company-name" style={styles.label}>ชื่อแผงล็อตเตอรี่</label>
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

              <div style={styles.formGroup}>
                <label htmlFor="company-phone" style={styles.label}>เบอร์โทรศัพท์ติดต่อ</label>
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

              <div style={styles.formGroup}>
                <label htmlFor="company-address" style={styles.label}>ที่อยู่ของแผงล็อตเตอรี่</label>
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
            )}
          </div>
        </div>
      </div>
    </Home>
  );
}

// 🟠 CSS Styles
const styles = {
  page: {
    backgroundColor: "var(--slate-50)",
    minHeight: "100vh",
    paddingTop: "40px",
    paddingBottom: "80px",
    fontFamily: "'Kanit', sans-serif",
    position: "relative",
  },
  contentContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  premiumCard: {
    backgroundColor: "var(--color-white)",
    borderRadius: "var(--radius-lg)",
    padding: "32px",
    boxShadow: "var(--shadow-card)",
    border: "1px solid var(--slate-200)",
    marginBottom: "24px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--slate-100)",
    paddingBottom: "16px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--slate-900)",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  formGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    fontWeight: "600",
    color: "var(--slate-600)",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--slate-200)",
    fontSize: "15px",
    color: "#212529",
    outline: "none",
    backgroundColor: "var(--slate-50)",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  footerAction: {
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "1px solid var(--slate-100)",
  },
  btnSave: {
    width: "100%",
    padding: "14px",
    backgroundColor: "var(--blue-50)",
    color: "var(--blue-700)",
    border: "1px solid var(--blue-100, var(--blue-50))",
    borderRadius: "var(--radius-md)",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSaveDisabled: {
    background: "var(--slate-100)",
    color: "var(--slate-400)",
    border: "1px solid var(--slate-200)",
    cursor: "not-allowed",
  },
};

export default Company;
