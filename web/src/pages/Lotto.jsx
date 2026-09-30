import Home from "./Home";
import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import LottoService from "../services/lotto.service";
import { PageHeader } from "../components/shared/PageHeader";
import { FilterBar, FilterBarSearch } from "../components/shared/FilterBar";

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
    myRef.current?.focus();
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

        myRef.current?.focus();
        myRef.current?.select();
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
        {/* 🌟 Narrow-screen responsive overrides (accessibility/responsive pass) */}
        <style>{`
          @media (max-width: 576px) {
            .lotto-split-table {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 480px) {
            .lotto-big-input {
              font-size: 26px !important;
              letter-spacing: 6px !important;
              padding: 14px !important;
            }
          }
        `}</style>

        <div className="container" style={styles.container}>
          {/* --- Header Section (มาตรฐาน PageHeader) --- */}
          <PageHeader
            icon="bi-ticket-detailed-fill"
            eyebrow="จัดการสลาก"
            title="จัดการสต๊อกสลาก"
            description="เพิ่ม ลบ แก้ไข และจัดการสต๊อกสลากกินแบ่งบนแผงแมวส้มของคุณ"
          />

          {/* --- Form Section --- */}
          <div style={styles.premiumCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                {id === 0 ? "เพิ่มสลากใบใหม่" : "แก้ไขข้อมูลสลาก"}
              </h3>
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

          {/* --- แถบค้นหา (มาตรฐาน FilterBar) --- */}
          <FilterBar>
            <FilterBarSearch
              value={searchTerm}
              onChange={(v) => setSearchTerm(v.replace(/\D/g, ""))}
              placeholder="ค้นหาด้วยเลขสลาก..."
              ariaLabel="ค้นหาด้วยเลขสลาก"
            />
          </FilterBar>

          {/* --- Table Section --- */}
          <div style={styles.tableCard}>
            {/* 🌟 ยอดรวมทั้งหมด */}
            <div style={{ ...styles.tableHeaderContainer, justifyContent: "flex-start" }}>
              <h3 style={styles.cardTitle}>
                สลากทั้งหมดบนแผง
                <span style={styles.countPill}>{lottos.length} ใบ</span>
              </h3>
            </div>

            {/* 🌟 Split Table Section 🌟 */}
            <div className="lotto-split-table" style={styles.splitTableLayout}>
              {/* 🟢 ฝั่งซ้าย: ตาราง "พร้อมขาย" */}
              <div style={styles.halfTableCard}>
                <div style={{ marginBottom: "15px" }}>
                  <h4 style={{ ...styles.cardTitle, fontSize: "16px" }}>
                    พร้อมขาย
                    <span
                      style={{
                        ...styles.statusPill,
                        backgroundColor: "var(--green-100)",
                        color: "var(--green-700)",
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
                  <h4 style={{ ...styles.cardTitle, fontSize: "16px" }}>
                    ขายแล้ว
                    <span
                      style={{
                        ...styles.statusPill,
                        backgroundColor: "var(--slate-100)",
                        color: "var(--slate-600)",
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
    backgroundColor: "var(--slate-50)",
    minHeight: "100vh",
    paddingTop: "40px",
    paddingBottom: "80px",
    fontFamily: "'Kanit', sans-serif",
    position: "relative",
  },
  container: {
    maxWidth: "1200px", // 🌟 ขยายเพื่อให้แสดง 2 ตารางได้ไม่อึดอัด
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  premiumCard: {
    backgroundColor: "var(--color-white)",
    borderRadius: "var(--radius-lg)",
    padding: "28px 32px",
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
    fontSize: "22px",
    fontWeight: "800",
    color: "var(--slate-900)",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "var(--blue-50)",
    color: "var(--blue-700)",
    padding: "6px 16px",
    borderRadius: "var(--radius-pill)",
    fontSize: "13px",
    fontWeight: "700",
    border: "1px solid var(--blue-100, var(--blue-50))",
  },
  countPill: {
    backgroundColor: "var(--blue-50)",
    color: "var(--blue-700)",
    fontSize: "13px",
    fontWeight: "700",
    padding: "3px 12px",
    borderRadius: "var(--radius-pill)",
    marginLeft: "10px",
    display: "inline-block",
  },
  statusPill: {
    fontSize: "12px",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "var(--radius-pill)",
    display: "inline-block",
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
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "1px solid var(--slate-100)",
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
    borderRadius: "var(--radius-lg)",
    padding: "28px 32px",
    boxShadow: "var(--shadow-card)",
    border: "1px solid var(--slate-200)",
  },
  tableHeaderContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "14px",
    borderBottom: "1px solid var(--slate-100)",
  },
  splitTableLayout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px", // 🌟 ช่องไฟระหว่างตารางซ้ายขวา
  },
  halfTableCard: {
    backgroundColor: "var(--color-white)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--slate-200)",
    padding: "18px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    backgroundColor: "var(--slate-50)",
    padding: "12px 14px",
    textAlign: "left",
    fontWeight: "600",
    color: "var(--slate-500)",
    borderBottom: "1px solid var(--slate-200)",
    fontSize: "13px",
  },
  tableRow: {
    borderBottom: "1px solid var(--slate-100)",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "14px",
    color: "var(--slate-600)",
    fontSize: "14px",
    fontWeight: "500",
  },
  tdLottoNo: {
    padding: "14px",
    fontWeight: "700",
    fontSize: "15px",
    letterSpacing: "1px",
    color: "var(--blue-700)",
  },
  tdHighlight: {
    padding: "14px",
    fontWeight: "700",
    color: "var(--slate-700)",
    fontSize: "14px",
  },
  btnEdit: {
    background: "var(--color-white)",
    color: "var(--slate-600)",
    border: "1px solid var(--slate-200)",
    width: "32px",
    height: "32px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    fontSize: "14px",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  btnDelete: {
    background: "var(--red-50)",
    color: "var(--red-600)",
    border: "1px solid var(--red-100)",
    width: "32px",
    height: "32px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    fontSize: "14px",
    flexShrink: 0,
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
