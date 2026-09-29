import { useEffect, useState } from "react";
import Home from "./Home";
import Swal from "sweetalert2";
import BillSaleService from "../services/bill-sale.service";
import MyModal from "../components/MyModal";
import { formatDate, formatTime } from "../utils/format";

function LottoInShop() {
  const [billSales, setBillSales] = useState([]);
  const [billSale, setBillSale] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await BillSaleService.getLottoInShop(); // 🌟 ใช้ Service
      if (res.data.results !== undefined) {
        setBillSales(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลสลากได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "var(--brand-600)",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfo = (item) => {
    setBillSale(item);
  };

  return (
    <>
      <Home>
        <div style={styles.page}>
          {/* 🌟 พื้นหลังแฉกและลายจุด 🌟 */}
          <div className="sunburst-bg"></div>
          <div className="bg-pattern"></div>

          {/* 🌟 ไอคอนลอยตกแต่ง 🌟 */}
          {[
            { emoji: "🏠", top: "15%", left: "5%", size: "60px", delay: "0s" },
            { emoji: "🐾", top: "45%", right: "6%", size: "80px", delay: "1s" },
            { emoji: "📦", top: "75%", left: "8%", size: "55px", delay: "2s" },
            {
              emoji: "🐈",
              top: "25%",
              right: "15%",
              size: "50px",
              delay: "1.5s",
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
                position: "absolute",
                zIndex: 0,
                opacity: 0.15,
              }}
            >
              {icon.emoji}
            </div>
          ))}

          <style>{`
            @media (max-width: 480px) {
              .lottoinshop-header-emoji {
                font-size: 38px !important;
              }
            }
          `}</style>

          <div className="container" style={styles.container}>
            {/* 🌟 ส่วนหัว 🌟 */}
            <div style={styles.header}>
              <div>
                <h2 style={{ ...styles.titleMain, flexWrap: "wrap" }}>
                  <span
                    className="me-3 lottoinshop-header-emoji"
                    style={styles.headerEmoji}
                  >
                    🏪
                  </span>
                  รายการที่ฝากร้าน
                </h2>
                <p style={styles.subtitleMain}>
                  ตรวจสอบรายการสลากที่ลูกค้าชำระเงินแล้วและต้องการฝากไว้ที่แผง
                </p>
              </div>
            </div>

            {/* 🌟 การ์ดตาราง 🌟 */}
            <div style={styles.tableCard}>
              <div style={styles.tableHeaderContainer}>
                <h4 style={styles.cardTitle}>
                  บิลฝากร้านทั้งหมด
                  <span style={styles.badgeCount}>
                    {billSales?.length || 0} รายการ
                  </span>
                </h4>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>เลขบิล</th>
                      <th style={styles.th}>ลูกค้า</th>
                      <th style={{ ...styles.th, textAlign: "center" }}>
                        เบอร์โทร
                      </th>
                      <th style={{ ...styles.th, textAlign: "center" }}>
                        วันที่ชำระ
                      </th>
                      <th style={{ ...styles.th, textAlign: "center" }}>
                        เวลาที่ชำระ
                      </th>
                      <th style={{ ...styles.th, textAlign: "center" }}>
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" style={styles.emptyState}>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            style={{ color: "var(--brand-600)" }}
                          ></span>
                          กำลังโหลดข้อมูล...
                        </td>
                      </tr>
                    ) : billSales?.length > 0 ? (
                      billSales.map((item) => (
                        <tr key={item.id} style={styles.tableRow}>
                          <td style={styles.td}>
                            <span className="fw-bold text-orange">
                              #{item.id}
                            </span>
                          </td>
                          <td style={styles.tdName}>
                            <i className="bi bi-person-circle text-muted me-2"></i>
                            {item.customerName}
                          </td>
                          <td style={{ ...styles.td, textAlign: "center" }}>
                            {item.customerPhone || "-"}
                          </td>
                          <td style={{ ...styles.td, textAlign: "center" }}>
                            <div style={styles.dateBadge}>
                              <i className="bi bi-calendar-check text-success me-1"></i>
                              {formatDate(item.payDate)}
                            </div>
                          </td>
                          <td style={{ ...styles.td, textAlign: "center" }}>
                            <div style={styles.timeBadge}>
                              <i className="bi bi-clock text-primary me-1"></i>
                              {formatTime(item.payTime)}
                            </div>
                          </td>
                          <td style={{ ...styles.td, textAlign: "center" }}>
                            <button
                              data-bs-toggle="modal"
                              data-bs-target="#modalDetail"
                              style={styles.btnInfo}
                              onClick={(e) => handleInfo(item)}
                            >
                              <i className="bi bi-search me-1"></i> ดูเลขสลาก
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={styles.emptyState}>
                          <div
                            style={{ fontSize: "50px", marginBottom: "15px" }}
                          >
                            📭
                          </div>
                          ยังไม่มีรายการสลากฝากร้านในตอนนี้...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Home>

      {/* 🌟 Modal ดูรายละเอียดสลากโฉมใหม่ 🌟 */}
      <MyModal
        title="รายการสลากที่ลูกค้าจอง (ฝากร้าน)"
        id="modalDetail"
        btnCloseId="btnClose"
      >
        <div className="p-2" style={{ fontFamily: "'Kanit', sans-serif" }}>
          {/* ส่วนหัวใบเสร็จ (Header Ticket) */}
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: "#fffcf0", // สีครีมละมุน
              borderRadius: "var(--radius-lg)",
              border: "2px dashed var(--brand-200)", // เส้นประสีส้มอ่อน
              position: "relative",
            }}
          >
            {/* รอยเจาะตั๋วเก๋ๆ */}
            <div
              style={{
                position: "absolute",
                width: "20px",
                height: "20px",
                backgroundColor: "white",
                borderRadius: "50%",
                left: "-11px",
                top: "calc(50% - 10px)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                width: "20px",
                height: "20px",
                backgroundColor: "white",
                borderRadius: "50%",
                right: "-11px",
                top: "calc(50% - 10px)",
              }}
            ></div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="fs-6 fw-bold text-muted">
                <i className="bi bi-receipt me-2"></i>เลขที่บิล
              </div>
              <div className="fs-5 fw-bold" style={{ color: "var(--brand-600)" }}>
                #{billSale?.id || "-"}
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--slate-200)", paddingTop: "15px" }}>
              <div className="row">
                <div className="col-6">
                  <small className="text-muted d-block mb-1">ชื่อลูกค้า</small>
                  <span className="fw-bold text-dark fs-6">
                    <i className="bi bi-person-circle me-1"></i>
                    {billSale?.customerName || "-"}
                  </span>
                </div>
                <div className="col-6 text-end">
                  <small className="text-muted d-block mb-1">เบอร์โทร</small>
                  <span className="fw-bold text-dark">
                    {billSale?.customerPhone || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* หัวข้อรายการ */}
          <div className="h6 fw-bold mt-3 mb-3 text-dark d-flex align-items-center">
            <span
              style={{
                width: "4px",
                height: "20px",
                backgroundColor: "var(--brand-600)",
                display: "inline-block",
                marginRight: "10px",
                borderRadius: "2px",
              }}
            ></span>
            รายการสลากทั้งหมด ({billSale?.billSaleDetail?.length || 0} ใบ)
          </div>

          {/* ตารางรายการสลาก (Lottery List Table) */}
          <table className="table table-borderless table-striped align-middle">
            <thead
              style={{
                backgroundColor: "var(--brand-50)", // สีส้มอ่อนจัดๆ
                borderBottom: "2px solid var(--brand-200)",
                borderTop: "1px solid var(--slate-100)",
              }}
            >
              <tr>
                <th
                  className="text-muted ps-3 py-3"
                  style={{ fontSize: "14px", fontWeight: "600" }}
                >
                  เลขสลาก
                </th>
                <th
                  className="text-end text-muted pe-3 py-3"
                  style={{ fontSize: "14px", fontWeight: "600" }}
                >
                  ราคา
                </th>
              </tr>
            </thead>
            <tbody>
              {billSale?.billSaleDetail?.length > 0 ? (
                billSale.billSaleDetail.map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid var(--slate-50)" }}>
                    <td className="ps-3 py-3">
                      <div className="d-flex align-items-center">
                        <span
                          className="text-muted me-3 fw-bold"
                          style={{ fontSize: "13px" }}
                        >
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                        <span
                          className="fw-bold fs-5"
                          style={{
                            color: "var(--blue-700)", // สีน้ำเงินเข้มดูเป็นตัวเลขทางการ
                            letterSpacing: "1px",
                            fontFamily: "monospace", // ใช้ Font ตัวเลขตรงๆ
                          }}
                        >
                          {item.lotto?.numbers || item.lotto?.number || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="text-end pe-3 py-3">
                      <span className="text-success fw-bold fs-6">
                        ฿{item.price?.toLocaleString() || 0}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center text-muted py-5">
                    <i className="bi bi-inbox fs-1 d-block mb-2 text-light"></i>
                    ไม่พบรายการสลากในบิลนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ส่วนสรุปยอดรวม (Total Section) */}
          {billSale?.billSaleDetail?.length > 0 && (
            <div
              className="mt-4 p-3 d-flex justify-content-between align-items-center"
              style={{
                backgroundColor: "var(--brand-600)", // สีส้มเข้ม brand
                color: "white",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 4px 6px rgba(234, 88, 12, 0.2)",
              }}
            >
              <span className="fw-bold fs-6">ยอดชำระรวมทั้งสิ้น</span>
              <span className="fw-bold fs-4">
                ฿
                {billSale.billSaleDetail
                  .reduce((sum, item) => sum + (parseInt(item.price) || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </MyModal>
    </>
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
    maxWidth: "1200px",
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
    fontSize: "65px",
    filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.15))",
  },
  subtitleMain: {
    color: "var(--slate-400)",
    marginTop: "10px",
    fontSize: "16px",
    fontWeight: "500",
  },
  tableCard: {
    backgroundColor: "var(--color-white)",
    borderRadius: "var(--radius-xl)",
    padding: "35px 40px",
    boxShadow: "var(--shadow-card)",
    borderTop: "8px solid var(--brand-600)",
    animation: "slideUp 0.3s ease-out forwards",
  },
  tableHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
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
  badgeCount: {
    backgroundColor: "var(--brand-50)",
    color: "var(--brand-600)",
    fontSize: "14px",
    fontWeight: "700",
    padding: "6px 16px",
    borderRadius: "50rem",
    marginLeft: "15px",
    border: "1px solid var(--brand-200)",
  },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" },
  th: {
    backgroundColor: "var(--brand-50)",
    padding: "16px",
    textAlign: "left",
    fontWeight: "700",
    color: "var(--brand-700)",
    fontSize: "15px",
    whiteSpace: "nowrap",
    borderTop: "none",
    borderBottom: "none",
  },
  tableRow: { transition: "all 0.2s ease", backgroundColor: "var(--color-white)" },
  td: {
    padding: "18px 16px",
    color: "var(--slate-600)",
    fontSize: "14px",
    fontWeight: "500",
    verticalAlign: "middle",
    borderBottom: "1px solid var(--slate-100)",
  },
  tdName: {
    padding: "18px 16px",
    color: "var(--slate-900)",
    fontSize: "15px",
    fontWeight: "700",
    verticalAlign: "middle",
    borderBottom: "1px solid var(--slate-100)",
  },
  dateBadge: {
    display: "inline-block",
    backgroundColor: "var(--green-100)",
    padding: "6px 12px",
    borderRadius: "var(--radius-md)",
    fontSize: "13px",
    color: "var(--green-700)",
    fontWeight: "700",
  },
  timeBadge: {
    display: "inline-block",
    backgroundColor: "var(--blue-50)",
    padding: "6px 12px",
    borderRadius: "var(--radius-md)",
    fontSize: "13px",
    color: "var(--blue-700)",
    fontWeight: "700",
  },
  btnInfo: {
    background: "var(--slate-50)",
    color: "var(--brand-600)",
    border: "1px solid var(--brand-200)",
    padding: "8px 16px",
    borderRadius: "50rem",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  emptyState: {
    textAlign: "center",
    color: "var(--slate-400)",
    padding: "80px 20px",
    fontWeight: "600",
    fontSize: "18px",
  },
};

export default LottoInShop;
