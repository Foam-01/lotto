import Home from "./Home";
import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import LottoService from "../services/lotto.service";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

function Lotto() {
  const [number, setNumber] = useState("");
  const [roundNumber, setRoundNumber] = useState("");
  const [bookNumber, setBookNumber] = useState("");
  const [cost, setCost] = useState("");
  const [sale, setSale] = useState("");
  const [lottos, setLottos] = useState([]);
  const [id, setId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const myRef = useRef();

  useEffect(() => {
    myRef.current.focus();
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await LottoService.getList();
      if (res.data.result !== undefined) {
        setLottos(res.data.result);
      }
    } catch (e) {
      if (e.response && e.response.status === 401) {
        Swal.fire({
          icon: "warning",
          title: "เซสชันหมดอายุ",
          text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
          confirmButtonColor: "var(--brand-600)",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถโหลดข้อมูลสลากได้ กรุณาลองใหม่อีกครั้ง",
          confirmButtonColor: "var(--brand-600)",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return; // 🛡️ กันกดซ้ำระหว่างรอบันทึก

    if (number.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "เลขสลากไม่ครบ 6 หลัก",
        text: "กรุณากรอกเลขสลากให้ครบ 6 หลักก่อนบันทึก",
        confirmButtonColor: "var(--brand-600)",
      });
      return;
    }

    setIsSaving(true);
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
        res = await LottoService.create(payload);
      } else {
        res = await LottoService.edit(id, payload);
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
        setId(0);
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลสลากได้ (คุณอาจไม่มีสิทธิ์ หรือ เซสชันหมดอายุ)",
        confirmButtonColor: "var(--brand-600)",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    Swal.fire({
      icon: "warning",
      title: "คุณต้องการลบสลากนี้หรือไม่?",
      text: `เลขสลาก: ${item.numbers} (ข้อมูลจะไม่สามารถกู้คืนได้)`,
      showCancelButton: true,
      confirmButtonColor: "var(--red-600)",
      cancelButtonColor: "var(--slate-400)",
      confirmButtonText: "ยืนยันการลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const resFromApi = await LottoService.remove(item.id);

          if (resFromApi.data.result.id !== undefined) {
            Toast.fire({
              icon: "success",
              title: `ดึงเลขสลาก ${item.numbers} ออกจากแผงแล้ว`,
            });
            fetchData();
            setId(0);
          }
        } catch (e) {
          Toast.fire({
            icon: "error",
            title: "ไม่สามารถลบข้อมูลสลากได้ (อาจไม่มีสิทธิ์)",
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

    setTimeout(() => {
      if (myRef.current) {
        // เลื่อนจอแบบนุ่มนวล
        myRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        // โฟกัสช่องโดยไม่ให้จอกระตุก
        myRef.current.focus({ preventScroll: true });
      }
    }, 100);
  };

  // 🌟 แยกข้อมูลสลากออกเป็น 2 กอง + กรองด้วยคำค้นหา
  const filteredLottos = lottos.filter((item) =>
    item.numbers?.toString().includes(searchTerm.trim()),
  );
  const availableLottos = filteredLottos.filter((item) => !item.inSale);
  const soldLottos = filteredLottos.filter((item) => item.inSale);

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
            aria-hidden="true"
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

        {/* 🌟 Narrow-screen responsive overrides (accessibility/responsive pass) */}
        <style>{`
          @media (max-width: 576px) {
            .lotto-split-table {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 480px) {
            .lotto-header-emoji {
              font-size: 40px !important;
            }
            .lotto-big-input {
              font-size: 26px !important;
              letter-spacing: 6px !important;
              padding: 14px !important;
            }
          }
        `}</style>

        <div className="container" style={styles.container}>
          {/* --- Header Section --- */}
          <div style={styles.header}>
            <div>
              <h2 style={{ ...styles.titleMain, flexWrap: "wrap" }}>
                <span
                  className="me-3 lotto-header-emoji"
                  style={styles.headerEmoji}
                >
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
              <h3 style={styles.cardTitle}>
                <span className="icon-paw me-2">🐾</span>{" "}
                {id === 0 ? "เพิ่มสลากใบใหม่" : "แก้ไขข้อมูลสลาก"}
              </h3>
              <span style={styles.badge}>LOTTO STOCK</span>
            </div>

            <div style={{ marginTop: "25px" }}>
              <div style={{ marginBottom: "25px" }}>
                <label htmlFor="lotto-number" style={styles.label}>
                  เลขสลาก (6 หลัก)
                </label>
                <input
                  id="lotto-number"
                  ref={myRef}
                  type="text"
                  className="cat-input lotto-big-input"
                  style={styles.bigInput}
                  placeholder="0 0 0 0 0 0"
                  maxLength="6"
                  value={number}
                  onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div style={styles.inputGrid}>
                <div>
                  <label htmlFor="lotto-book-number" style={styles.label}>
                    เล่มที่
                  </label>
                  <input
                    id="lotto-book-number"
                    type="number"
                    className="cat-input"
                    style={styles.standardInput}
                    placeholder="เช่น 15"
                    value={bookNumber}
                    onChange={(e) => setBookNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="lotto-round-number" style={styles.label}>
                    งวดที่
                  </label>
                  <input
                    id="lotto-round-number"
                    type="number"
                    className="cat-input"
                    style={styles.standardInput}
                    placeholder="เช่น 30"
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="lotto-cost" style={styles.label}>
                    ราคาทุน (฿)
                  </label>
                  <input
                    id="lotto-cost"
                    type="number"
                    className="cat-input"
                    style={styles.standardInput}
                    placeholder="70.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="lotto-sale" style={styles.label}>
                    ราคาขาย (฿)
                  </label>
                  <input
                    id="lotto-sale"
                    type="number"
                    className="cat-input"
                    style={styles.orangeInput}
                    placeholder="80.00"
                    value={sale}
                    onChange={(e) => setSale(e.target.value)}
                  />
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
                        style={{ marginRight: "10px" }}
                      ></span>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <i
                        className={`bi ${id === 0 ? "bi-plus-circle-fill" : "bi-check-circle-fill"}`}
                        style={{ marginRight: "10px" }}
                      ></i>
                      {id === 0 ? "นำสลากขึ้นแผง" : "บันทึกการแก้ไข"}
                    </>
                  )}
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
            {/* 🌟 ยอดรวมทั้งหมด */}
            <div style={styles.tableHeaderContainer}>
              <h3 style={styles.cardTitle}>
                📋 สลากทั้งหมดบนแผง
                <span
                  style={{
                    backgroundColor: "var(--brand-50)",
                    color: "var(--brand-600)",
                    fontSize: "15px",
                    fontWeight: "bold",
                    padding: "4px 12px",
                    borderRadius: "var(--radius-xl)",
                    marginLeft: "12px",
                    border: "1px solid var(--brand-200)",
                  }}
                >
                  {lottos.length} ใบ
                </span>
              </h3>

              {/* 🌟 ช่องค้นหาเลขสลาก */}
              <div style={styles.searchBox}>
                <i className="bi bi-search" style={styles.searchIcon}></i>
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="ค้นหาด้วยเลขสลาก"
                  placeholder="ค้นหาด้วยเลขสลาก..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value.replace(/\D/g, ""))
                  }
                  style={styles.searchInput}
                />
                {searchTerm && (
                  <button
                    style={styles.searchClearBtn}
                    onClick={() => setSearchTerm("")}
                    title="ล้างการค้นหา"
                    aria-label="ล้างคำค้นหา"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>
            </div>

            {/* 🌟 Split Table Section 🌟 */}
            <div className="lotto-split-table" style={styles.splitTableLayout}>
              {/* 🟢 ฝั่งซ้าย: ตาราง "พร้อมขาย" */}
              <div style={styles.halfTableCard}>
                <div style={{ marginBottom: "15px" }}>
                  <h4
                    style={{
                      ...styles.cardTitle,
                      color: "var(--green-600)",
                      fontSize: "18px",
                    }}
                  >
                    <i className="bi bi-stars me-2"></i> พร้อมขาย
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: "var(--green-100)",
                        color: "var(--green-600)",
                        borderColor: "var(--green-200)",
                        marginLeft: "10px",
                      }}
                    >
                      {availableLottos.length} ใบ
                    </span>
                  </h4>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>เลขสลาก</th>
                        <th style={{ ...styles.th, textAlign: "center" }}>
                          งวด / เล่ม
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
                      {isLoading ? (
                        <tr>
                          <td colSpan="4" style={styles.emptyState}>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              style={{ color: "var(--brand-600)" }}
                            ></span>
                            กำลังโหลดข้อมูล...
                          </td>
                        </tr>
                      ) : availableLottos.length > 0 ? (
                        availableLottos.map((item, index) => (
                          <tr key={item.id || index} style={styles.tableRow}>
                            <td style={styles.tdLottoNo}>{item.numbers}</td>
                            <td style={{ ...styles.td, textAlign: "center" }}>
                              {item.roundNumber} / {item.bookNumber}
                            </td>
                            <td
                              style={{
                                ...styles.tdHighlight,
                                textAlign: "right",
                              }}
                            >
                              ฿{item.sale?.toLocaleString() ?? "-"}
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
                                  onClick={() => handleEdit(item)}
                                  title="แก้ไข"
                                  aria-label="แก้ไข"
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                                <button
                                  style={styles.btnDelete}
                                  onClick={() => handleDelete(item)}
                                  title="ลบ"
                                  aria-label="ลบ"
                                >
                                  <i className="bi bi-trash3-fill"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={styles.emptyState}>
                            {searchTerm
                              ? `ไม่พบเลขสลากที่ตรงกับ "${searchTerm}"`
                              : "ยังไม่มีสลากพร้อมขาย"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 🔴 ฝั่งขวา: ตาราง "ขายแล้ว" */}
              <div style={styles.halfTableCard}>
                <div style={{ marginBottom: "15px" }}>
                  <h4
                    style={{
                      ...styles.cardTitle,
                      color: "var(--red-500)",
                      fontSize: "18px",
                    }}
                  >
                    <i className="bi bi-check-circle-fill me-2"></i> ขายแล้ว
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: "var(--red-100)",
                        color: "var(--red-500)",
                        borderColor: "var(--red-200)",
                        marginLeft: "10px",
                      }}
                    >
                      {soldLottos.length} ใบ
                    </span>
                  </h4>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>เลขสลาก</th>
                        <th style={{ ...styles.th, textAlign: "center" }}>
                          งวด / เล่ม
                        </th>
                        <th style={{ ...styles.th, textAlign: "right" }}>
                          ราคาขาย
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan="3" style={styles.emptyState}>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              style={{ color: "var(--brand-600)" }}
                            ></span>
                            กำลังโหลดข้อมูล...
                          </td>
                        </tr>
                      ) : soldLottos.length > 0 ? (
                        soldLottos.map((item, index) => (
                          <tr
                            key={item.id || index}
                            style={{
                              ...styles.tableRow,
                              backgroundColor: "var(--stone-50)",
                            }}
                          >
                            <td
                              style={{
                                ...styles.tdLottoNo,
                                color: "var(--slate-500)",
                                textDecoration: "line-through",
                              }}
                            >
                              {item.numbers}
                            </td>
                            <td
                              style={{
                                ...styles.td,
                                textAlign: "center",
                                color: "var(--slate-500)",
                              }}
                            >
                              {item.roundNumber} / {item.bookNumber}
                            </td>
                            <td
                              style={{
                                ...styles.tdHighlight,
                                textAlign: "right",
                                color: "var(--slate-500)",
                              }}
                            >
                              ฿{item.sale?.toLocaleString() ?? "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={styles.emptyState}>
                            {searchTerm
                              ? `ไม่พบเลขสลากที่ตรงกับ "${searchTerm}"`
                              : "ยังไม่มีสลากที่ขายออก"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Home>
  );
}

// 🟠 CSS ความสวยงามธีม แผงแมวส้ม
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
  container: {
    maxWidth: "1200px", // 🌟 ขยายเพื่อให้แสดง 2 ตารางได้ไม่อึดอัด
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  header: { marginBottom: "40px" },
  titleMain: {
    fontSize: "32px",
    fontWeight: "900",
    color: "var(--brand-600)",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: "70px",
    filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.1))",
  },
  subtitleMain: {
    color: "var(--slate-400)",
    marginTop: "10px",
    fontSize: "16px",
    fontWeight: "500",
  },
  premiumCard: {
    backgroundColor: "var(--color-white)",
    borderRadius: "var(--radius-xl)",
    padding: "35px 40px",
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
  label: {
    display: "block",
    marginBottom: "10px",
    fontWeight: "700",
    color: "var(--slate-600)",
    fontSize: "15px",
  },
  bigInput: {
    width: "100%",
    padding: "20px",
    borderRadius: "var(--radius-lg)",
    border: "2px solid var(--slate-200)",
    fontSize: "42px",
    fontWeight: "900",
    color: "var(--brand-600)",
    textAlign: "center",
    letterSpacing: "15px",
    backgroundColor: "var(--slate-50)",
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
    borderRadius: "var(--radius-md)",
    border: "2px solid var(--slate-200)",
    fontSize: "16px",
    color: "#212529",
    backgroundColor: "var(--slate-50)",
    boxSizing: "border-box",
  },
  orangeInput: {
    width: "100%",
    padding: "16px",
    borderRadius: "var(--radius-md)",
    border: "2px solid var(--brand-300)",
    fontSize: "18px",
    fontWeight: "bold",
    color: "var(--red-600)",
    backgroundColor: "var(--brand-50)",
    boxSizing: "border-box",
  },
  footerAction: {
    marginTop: "35px",
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
  btnCancel: {
    width: "100%",
    padding: "14px",
    background: "var(--slate-100)",
    color: "var(--slate-500)",
    border: "none",
    borderRadius: "var(--radius-lg)",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tableCard: {
    backgroundColor: "var(--color-white)",
    borderRadius: "var(--radius-xl)",
    padding: "35px 40px",
    boxShadow: "var(--shadow-card)",
  },
  tableHeaderContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "2px solid var(--brand-200)", // 🌟 เส้นคั่นหัวข้อหลัก
  },
  searchBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    minWidth: "220px",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    color: "var(--slate-400)",
    fontSize: "14px",
  },
  searchInput: {
    width: "100%",
    padding: "10px 40px 10px 36px",
    borderRadius: "var(--radius-pill)",
    border: "1.5px solid var(--brand-200)",
    backgroundColor: "var(--brand-50)",
    fontSize: "14px",
    outline: "none",
    fontFamily: "'Kanit', sans-serif",
  },
  searchClearBtn: {
    position: "absolute",
    right: "4px",
    background: "none",
    border: "none",
    color: "var(--slate-400)",
    cursor: "pointer",
    fontSize: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "36px",
    minHeight: "36px",
  },
  splitTableLayout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "30px", // 🌟 ช่องไฟระหว่างตารางซ้ายขวา
  },
  halfTableCard: {
    backgroundColor: "var(--color-white)",
    borderRadius: "var(--radius-lg)",
    border: "2px dashed var(--brand-200)", // 🌟 กรอบไข่ปลาสีส้ม
    padding: "20px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    backgroundColor: "var(--brand-50)", // 🌟 คืนชีพสีครีมส้ม
    padding: "16px",
    textAlign: "left",
    fontWeight: "800",
    color: "var(--brand-800)", // 🌟 คืนชีพตัวหนังสือสีส้มเข้ม
    borderBottom: "2px solid var(--brand-200)",
    fontSize: "15px",
  },
  tableRow: {
    borderBottom: "1px solid var(--slate-100)",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "16px 14px",
    color: "var(--slate-600)",
    fontSize: "15px",
    fontWeight: "500",
  },
  tdLottoNo: {
    padding: "16px 14px",
    fontWeight: "900",
    fontSize: "18px",
    letterSpacing: "2px",
    color: "var(--brand-600)",
  },
  tdHighlight: {
    padding: "16px 14px",
    fontWeight: "800",
    color: "var(--red-600)",
    fontSize: "16px",
  },
  btnEdit: {
    background: "var(--slate-50)",
    color: "#0284c7",
    border: "1px solid #e0f2fe",
    padding: "10px 14px",
    minWidth: "40px",
    minHeight: "40px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnDelete: {
    background: "var(--red-50)",
    color: "var(--red-600)",
    border: "1px solid var(--red-100)",
    padding: "10px 14px",
    minWidth: "40px",
    minHeight: "40px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  emptyState: {
    textAlign: "center",
    color: "var(--slate-400)",
    padding: "60px 20px",
    fontWeight: "600",
    fontSize: "16px",
  },
};

export default Lotto;
