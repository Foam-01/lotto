import Home from "./Home";
import { useEffect, useState, useRef } from "react";
import config from "../config";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Lotto() {
  // 👇 โลจิกของคุณล้วนๆ
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

      
      res = await axios.post(
        config.apiPath + "/api/lotto/create",
        payload,
      )
    } else {
        res = await axios.put(config.apiPath + '/api/lotto/edit/' + id, payload);
    }

      if (res.data.result.id !== undefined) {
        Swal.fire({
          icon: "success",
          title: "บันทึกข้อมูลสลากเรียบร้อย",
          text: `เลขสลาก ${number} ได้ถูกเพิ่มเข้าสู่ระบบแล้ว!`,
          timer: 1000,
        });

        myRef.current.focus();
        myRef.current.select();
        setNumber("");
        setRoundNumber("");
        setBookNumber("");
        setCost("");
        setSale("");
        fetchData();
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลสลากได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  const handleDelete = async (item) => {
    Swal.fire({
      icon: "warning",
      title: "คุณต้องการลบสลากนี้หรือไม่?",
      text: `เลขสลาก: ${item.numbers}`,
      showCancelButton: true,
      confirmButtonColor: "#d63031",
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
              render: `ลบเลขสลาก ${item.numbers} ออกจากระบบแล้ว`,
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
  }


  return (
    <Home>
      <div style={styles.container}>
        {/* --- Header Section --- */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.titleMain}>
              <span style={{ color: "#FFD700", marginRight: "10px" }}>🎟️</span>
              จัดการสลากกินแบ่งรัฐบาล
            </h2>
            <p style={styles.subtitleMain}>
              เพิ่ม ลบ และจัดการสต๊อกสลากในระบบของคุณแบบ VIP
            </p>
          </div>
        </div>

        {/* --- Form Section --- */}
        <div style={styles.premiumCard}>
          <div style={styles.cardHeader}>
            <h4 style={styles.cardTitle}>ลงทะเบียนสลากใหม่</h4>
            <span style={styles.badge}>VIP SYSTEM</span>
          </div>

          <div style={{ marginTop: "20px" }}>
            {/* เลขสลาก 6 หลัก */}
            <div style={{ marginBottom: "25px" }}>
              <label style={styles.label}>เลขสลาก (6 หลัก)</label>
              <input
              value={number}
                ref={myRef}
                type="text"
                style={styles.bigInput}
                placeholder="0 0 0 0 0 0"
                maxLength="6"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>

            {/* ข้อมูลรอง 4 ช่อง */}
            <div style={styles.inputGrid}>
              <div>
                <label style={styles.label}>เล่มที่</label>
                <input
                value={bookNumber}
                  type="text"
                  style={styles.standardInput}
                  placeholder="เช่น 15"
                  value={bookNumber}
                  onChange={(e) => setBookNumber(e.target.value)}
                />
              </div>

              <div>
                <label style={styles.label}>งวดที่</label>
                <input
                value={roundNumber}
                  type="text"
                  style={styles.standardInput}
                  placeholder="เช่น 30"
                  value={roundNumber}
                  onChange={(e) => setRoundNumber(e.target.value)}
                />
              </div>

              <div>
                <label style={styles.label}>ราคาทุน (฿)</label>
                <input
                value={cost}
                  type="number"
                  style={styles.standardInput}
                  placeholder="70.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>

              <div>
                <label style={styles.label}>ราคาขาย (฿)</label>
                <input
                value={sale}
                  type="number"
                  style={styles.goldInput}
                  placeholder="80.00"
                  value={sale}
                  onChange={(e) => setSale(e.target.value)}
                />
              </div>
            </div>

            {/* ปุ่มบันทึก */}
            <div
              style={{
                marginTop: "30px",
                paddingTop: "20px",
                borderTop: "1px solid #f1f3f5",
              }}
            >
              <button style={styles.btnSave} onClick={handleSave}>
                บันทึกข้อมูลสลาก
              </button>
            </div>
          </div>
        </div>

        {/* --- Table Section --- */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeaderContainer}>
            <h4 style={styles.cardTitle}>รายการสลากในระบบ</h4>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="🔍 ค้นหาเลขสลาก..."
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>เลขสลาก</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>
                    งวดที่ / เล่มที่
                  </th>
                  <th style={{ ...styles.th, textAlign: "right" }}>ราคาทุน</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>ราคาขาย</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>จัดการ</th>
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
                      <td style={{ ...styles.tdGold, textAlign: "right" }}>
                        ฿{item.sale.toLocaleString("th-TH")}
                      </td>

                      {/* จัดเรียงปุ่มให้สวยงาม */}
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
                            onClick={e => handleEdit(item)}
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            style={styles.btnDelete}
                            onClick={(e) => handleDelete(item)}
                          >
                            🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={styles.emptyState}>
                      <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                        📭
                      </div>
                      ยังไม่มีข้อมูลสลากในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" theme="colored" />
    </Home>
  );
}

// 🟢 CSS ความสวยงาม
const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "'Kanit', sans-serif",
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
    borderTop: "6px solid #1a1a2e",
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
    backgroundColor: "#FFD700",
    color: "#1a1a2e",
    padding: "6px 15px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#495057",
    fontSize: "14px",
  },
  bigInput: {
    width: "100%",
    padding: "18px",
    borderRadius: "12px",
    border: "2px solid #e9ecef",
    fontSize: "36px",
    fontWeight: "900",
    color: "#1a1a2e",
    textAlign: "center",
    letterSpacing: "15px",
    backgroundColor: "#f8f9fa",
    outline: "none",
    boxSizing: "border-box",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  standardInput: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: "10px",
    border: "2px solid #e9ecef",
    fontSize: "16px",
    color: "#212529",
    outline: "none",
    boxSizing: "border-box",
  },
  goldInput: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: "10px",
    border: "2px solid #FFD700",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#b8860b",
    backgroundColor: "#fffdf0",
    outline: "none",
    boxSizing: "border-box",
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
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "35px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  tableHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px",
  },
  searchInput: {
    padding: "12px 15px",
    borderRadius: "10px",
    border: "2px solid #e9ecef",
    width: "250px",
    fontSize: "14px",
    outline: "none",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  th: {
    backgroundColor: "#f8f9fa",
    padding: "15px",
    textAlign: "left",
    fontWeight: "700",
    color: "#495057",
    borderBottom: "2px solid #dee2e6",
    fontSize: "15px",
  },
  tableRow: {
    borderBottom: "1px solid #f1f3f5",
  },
  td: {
    padding: "15px",
    color: "#495057",
    fontSize: "15px",
  },
  tdLottoNo: {
    padding: "15px",
    fontWeight: "bold",
    fontSize: "18px",
    letterSpacing: "2px",
    color: "#1a1a2e",
  },
  tdGold: {
    padding: "15px",
    fontWeight: "bold",
    color: "#b8860b",
  },
  btnDelete: {
    background: "#ffeaa7",
    color: "#d63031",
    border: "none",
    padding: "8px 15px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
  },
  btnEdit: {
    background: "#e0f7fa",
    color: "#00acc1",
    border: "none",
    padding: "8px 15px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
  },
  emptyState: {
    textAlign: "center",
    color: "#adb5bd",
    padding: "60px 20px",
    borderBottom: "1px solid #e9ecef",
  },
};

export default Lotto;
