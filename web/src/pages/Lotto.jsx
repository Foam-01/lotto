import Home from "./Home";
import { useEffect, useState, useRef } from "react";
import config from "../config";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Lotto() {
  // 👇 โลจิกของคุณล้วนๆ (ปรับแค่สีปุ่ม Swal ให้เป็นสีส้ม)
  const [number, setNumber] = useState("");
  const [roundNumber, setRoundNumber] = useState("");
  const [bookNumber, setBookNumber] = useState("");
  const [cost, setCost] = useState("");
  const [sale, setSale] = useState("");
  const [lottos, setLottos] = useState([]);
  const [id, setId] = useState(0);

  const myRef = useRef();

  useEffect(() => {
    myRef.current.focus();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(config.apiPath + "/api/lotto/list");
      if (res.data.result !== undefined) {
        setLottos(res.data.result);
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลสลากได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#ea580c",
      });
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        numbers: number,
        roundNumber: parseInt(roundNumber),
        bookNumber: parseInt(bookNumber),
        cost: parseInt(cost),
        sale: parseInt(sale),
      };
      let res;

      if (id === 0) {
        res = await axios.post(config.apiPath + "/api/lotto/create", payload);
      } else {
        res = await axios.put(
          config.apiPath + "/api/lotto/edit/" + id,
          payload,
        );
      }

      if (res.data.result.id !== undefined) {
        Swal.fire({
          icon: "success",
          title: "บันทึกข้อมูลสลากเรียบร้อย",
          text: `เลขสลาก ${number} ได้ถูกเพิ่มเข้าสู่แผงแล้ว!`,
          timer: 1500,
          showConfirmButton: false,
        });

        myRef.current.focus();
        myRef.current.select();
        setNumber("");
        setRoundNumber("");
        setBookNumber("");
        setCost("");
        setSale("");
        fetchData();
        setId(0); // เคลียร์ ID กลับเป็นสถานะเพิ่มใหม่
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลสลากได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#ea580c",
      });
    }
  };

  const handleDelete = async (item) => {
    Swal.fire({
      icon: "warning",
      title: "คุณต้องการลบสลากนี้หรือไม่?",
      text: `เลขสลาก: ${item.numbers}`,
      showCancelButton: true,
      confirmButtonColor: "#dc2626", // แดง
      cancelButtonColor: "#94a3b8", // เทา
      confirmButtonText: "ยืนยันการลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const toastId = toast.loading("กำลังลบข้อมูล...");

        try {
          const resFromApi = await axios.delete(
            config.apiPath + "/api/lotto/remove/" + item.id,
          );

          if (resFromApi.data.result.id !== undefined) {
            toast.update(toastId, {
              render: `ดึงเลขสลาก ${item.numbers} ออกจากแผงแล้ว`,
              type: "success",
              isLoading: false,
              autoClose: 2000,
            });
            fetchData();
            setId(0);
          }
        } catch (e) {
          toast.update(toastId, {
            render: "ไม่สามารถลบข้อมูลสลากได้ กรุณาลองใหม่อีกครั้ง",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      }
    });
  };

  const handleEdit = (item) => {
    setNumber(item.numbers);
    setRoundNumber(item.roundNumber);
    setBookNumber(item.bookNumber);
    setCost(item.cost);
    setSale(item.sale);
    setId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" }); // เลื่อนจอขึ้นไปหาฟอร์มให้ด้วย
  };

  // 👇 ส่วน UI ที่ปรับความสวยงามแบบ แผงแมวส้ม 🐈 👇
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

        <div className="container" style={styles.container}>
          {/* --- Header Section --- */}
          <div style={styles.header}>
            <div>
              <h2 style={styles.titleMain}>
                <span className="me-3" style={styles.headerEmoji}>
                  🐈
                </span>
                จัดการสต๊อกสลาก
              </h2>
              <p style={styles.subtitleMain}>
                เพิ่ม ลบ แก้ไข และจัดการสต๊อกสลากกินแบ่งบนแผงแมวส้มของคุณ
              </p>
            </div>
          </div>

          {/* --- Form Section --- */}
          <div style={styles.premiumCard}>
            <div style={styles.cardHeader}>
              <h4 style={styles.cardTitle}>
                <span className="icon-paw me-2">🐾</span>{" "}
                {id === 0 ? "เพิ่มสลากใบใหม่" : "แก้ไขข้อมูลสลาก"}
              </h4>
              <span style={styles.badge}>🐾 LOTTO STOCK</span>
            </div>

            <div style={{ marginTop: "25px" }}>
              {/* เลขสลาก 6 หลัก */}
              <div style={{ marginBottom: "25px" }}>
                <label style={styles.label}>เลขสลาก (6 หลัก)</label>
                <input
                  ref={myRef}
                  type="text"
                  className="cat-input"
                  style={styles.bigInput}
                  placeholder="0 0 0 0 0 0"
                  maxLength="6"
                  value={number}
                  onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))} // กันพิมพ์ตัวอักษร
                />
              </div>

              {/* ข้อมูลรอง 4 ช่อง */}
              <div style={styles.inputGrid}>
                <div>
                  <label style={styles.label}>เล่มที่</label>
                  <input
                    type="number"
                    className="cat-input"
                    style={styles.standardInput}
                    placeholder="เช่น 15"
                    value={bookNumber}
                    onChange={(e) => setBookNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label style={styles.label}>งวดที่</label>
                  <input
                    type="number"
                    className="cat-input"
                    style={styles.standardInput}
                    placeholder="เช่น 30"
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label style={styles.label}>ราคาทุน (฿)</label>
                  <input
                    type="number"
                    className="cat-input"
                    style={styles.standardInput}
                    placeholder="70.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  />
                </div>

                <div>
                  <label style={styles.label}>ราคาขาย (฿)</label>
                  <input
                    type="number"
                    className="cat-input"
                    style={styles.orangeInput}
                    placeholder="80.00"
                    value={sale}
                    onChange={(e) => setSale(e.target.value)}
                  />
                </div>
              </div>

              {/* ปุ่มบันทึก */}
              <div style={styles.footerAction}>
                <button style={styles.btnSave} onClick={handleSave}>
                  <i
                    className={`bi ${id === 0 ? "bi-plus-circle-fill" : "bi-check-circle-fill"}`}
                    style={{
                      marginRight: "10px",
                    }} /* 👈 เพิ่มตรงนี้เพื่อดันข้อความออกไป */
                  ></i>
                  {id === 0 ? "นำสลากขึ้นแผง" : "บันทึกการแก้ไข"}
                </button>
                {id !== 0 && (
                  <button
                    style={{ ...styles.btnCancel, marginTop: "10px" }}
                    onClick={() => {
                      setId(0);
                      setNumber("");
                      setRoundNumber("");
                      setBookNumber("");
                      setCost("");
                      setSale("");
                    }}
                  >
                    ยกเลิกการแก้ไข
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* --- Table Section --- */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeaderContainer}>
              <h4 style={styles.cardTitle}>
                📋 สลากทั้งหมดบนแผง
                {/* 🌟 เพิ่มป้ายบอกจำนวนใบตรงนี้ 🌟 */}
                <span
                  style={{
                    backgroundColor: "#fff7ed",
                    color: "#ea580c",
                    fontSize: "15px",
                    fontWeight: "bold",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    marginLeft: "12px",
                    border: "1px solid #fed7aa",
                  }}
                >
                  {lottos.length} ใบ
                </span>
              </h4>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>เลขสลาก</th>
                    <th style={{ ...styles.th, textAlign: "center" }}>
                      งวดที่ / เล่มที่
                    </th>
                    <th style={{ ...styles.th, textAlign: "right" }}>
                      ราคาทุน
                    </th>
                    <th style={{ ...styles.th, textAlign: "right" }}>
                      ราคาขาย
                    </th>
                    <th style={{ ...styles.th, textAlign: "center" }}>
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lottos.length > 0 ? (
                    lottos.map((item, index) => (
                      <tr key={item.id || index} style={styles.tableRow}>
                        <td style={styles.tdLottoNo}>{item.numbers}</td>
                        <td style={{ ...styles.td, textAlign: "center" }}>
                          {item.roundNumber} / {item.bookNumber}
                        </td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          ฿{item.cost.toLocaleString("th-TH")}
                        </td>
                        <td
                          style={{ ...styles.tdHighlight, textAlign: "right" }}
                        >
                          ฿{item.sale.toLocaleString("th-TH")}
                        </td>

                        <td style={{ ...styles.td, textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: "8px",
                            }}
                          >
                            <button
                              style={styles.btnEdit}
                              onClick={(e) => handleEdit(item)}
                              title="แก้ไข"
                            >
                              <i className="bi bi-pencil-square"></i> แก้ไข
                            </button>
                            <button
                              style={styles.btnDelete}
                              onClick={(e) => handleDelete(item)}
                              title="ลบ"
                            >
                              <i className="bi bi-trash3-fill"></i> ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={styles.emptyState}>
                        <div style={{ fontSize: "50px", marginBottom: "15px" }}>
                          😿
                        </div>
                        แผงโล่งมากเลยเจ้านาย ยังไม่มีสลากในระบบ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" theme="colored" />
    </Home>
  );
}

// 🟠 CSS ความสวยงามธีม แผงแมวส้ม
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
  container: {
    maxWidth: "1000px",
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
    fontSize: "70px",
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
    padding: "35px 40px",
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
  label: {
    display: "block",
    marginBottom: "10px",
    fontWeight: "700",
    color: "#475569",
    fontSize: "15px",
  },
  bigInput: {
    width: "100%",
    padding: "20px",
    borderRadius: "16px",
    border: "2px solid #e2e8f0",
    fontSize: "42px",
    fontWeight: "900",
    color: "#ea580c", // ตัวเลขสีส้ม
    textAlign: "center",
    letterSpacing: "15px",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  standardInput: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "16px",
    color: "#212529",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
  },
  orangeInput: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "2px solid #fdba74", // ขอบส้ม
    fontSize: "18px",
    fontWeight: "bold",
    color: "#dc2626", // ตัวเลขสีแดง
    backgroundColor: "#fff7ed",
    boxSizing: "border-box",
  },
  footerAction: {
    marginTop: "35px",
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
  },
  btnCancel: {
    width: "100%",
    padding: "14px",
    background: "#f1f5f9",
    color: "#64748b",
    border: "none",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "35px 40px",
    boxShadow: "0 20px 40px rgba(234, 88, 12, 0.08)",
  },
  tableHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "15px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    color: "#94a3b8",
  },
  searchInput: {
    padding: "12px 16px 12px 45px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    width: "280px",
    fontSize: "15px",
    backgroundColor: "#f8fafc",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#fff7ed",
    padding: "16px",
    textAlign: "left",
    fontWeight: "800",
    color: "#9a3412",
    borderBottom: "2px solid #fed7aa",
    fontSize: "15px",
  },
  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "18px 16px",
    color: "#475569",
    fontSize: "15px",
    fontWeight: "500",
  },
  tdLottoNo: {
    padding: "18px 16px",
    fontWeight: "900",
    fontSize: "20px",
    letterSpacing: "3px",
    color: "#ea580c",
  },
  tdHighlight: {
    padding: "18px 16px",
    fontWeight: "800",
    color: "#dc2626",
    fontSize: "16px",
  },
  btnEdit: {
    background: "#f8fafc",
    color: "#0284c7", // ฟ้า
    border: "1px solid #e0f2fe",
    padding: "8px 16px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s",
  },
  btnDelete: {
    background: "#fef2f2",
    color: "#dc2626", // แดง
    border: "1px solid #fee2e2",
    padding: "8px 16px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s",
  },
  emptyState: {
    textAlign: "center",
    color: "#94a3b8",
    padding: "80px 20px",
    fontWeight: "600",
    fontSize: "18px",
  },
};

export default Lotto;
