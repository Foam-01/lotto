import { useEffect, useState } from "react";
import Home from "./Home";
import Swal from "sweetalert2";
import BillSaleService from "../services/bill-sale.service";
import MyModal from "../components/MyModal";
import { formatDate, formatTime } from "../utils/format";
import { PageHeader } from "../components/shared/PageHeader";
import {
  FilterBar,
  FilterBarSearch,
  FilterBarClear,
} from "../components/shared/FilterBar";

function LottoInShop() {
  const [billSales, setBillSales] = useState([]);
  const [billSale, setBillSale] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const res = await BillSaleService.getLottoInShop(); // 🌟 ใช้ Service
      if (res.data.results !== undefined) {
        setBillSales(res.data.results);
      }
    } catch (e) {
      setLoadError(true);
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

  // 🌟 ค้นหาฝั่ง client จากรายการที่โหลดมาแล้ว (ไม่ยิง API เพิ่ม)
  const filteredBillSales = (billSales || []).filter((item) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const haystack = [item.customerName, item.customerPhone]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return (
    <>
      <Home>
        <div style={styles.page}>
          <div className="container" style={styles.container}>
            <PageHeader
              eyebrow="งานขาย"
              title="รายการที่ฝากร้าน"
              description="ตรวจสอบรายการสลากที่ลูกค้าชำระเงินแล้วและต้องการฝากไว้ที่แผง"
              count={`${filteredBillSales.length} รายการ`}
            />

            <FilterBar>
              <FilterBarSearch
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร..."
              />
              <FilterBarClear
                show={!!searchTerm}
                onClick={() => setSearchTerm("")}
              />
            </FilterBar>

            <div style={styles.tableCard}>
              <div style={styles.tableHeaderContainer}>
                <h4 style={styles.cardTitle}>บิลฝากร้านทั้งหมด</h4>
              </div>

              {loadError && !isLoading && (
                <div
                  className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-4 py-3 mb-3"
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "var(--radius-md)",
                    color: "var(--red-600)",
                  }}
                >
                  <span className="fw-bold">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    โหลดรายการฝากร้านไม่สำเร็จ
                  </span>
                  <button
                    type="button"
                    onClick={fetchData}
                    style={{
                      background: "var(--color-white)",
                      color: "var(--red-600)",
                      border: "1px solid var(--red-200, #fecaca)",
                      padding: "8px 16px",
                      borderRadius: "50rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i> ลองใหม่
                  </button>
                </div>
              )}
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
                    ) : filteredBillSales.length > 0 ? (
                      filteredBillSales.map((item) => (
                        <tr key={item.id} style={styles.tableRow}>
                          <td style={styles.tdName}>#{item.id}</td>
                          <td style={styles.td}>{item.customerName}</td>
                          <td style={{ ...styles.td, textAlign: "center" }}>
                            {item.customerPhone || "-"}
                          </td>
                          <td style={{ ...styles.td, textAlign: "center" }}>
                            {formatDate(item.payDate)}
                          </td>
                          <td style={{ ...styles.td, textAlign: "center" }}>
                            {formatTime(item.payTime)}
                          </td>
                          <td style={{ ...styles.td, textAlign: "center" }}>
                            <button
                              data-bs-toggle="modal"
                              data-bs-target="#modalDetail"
                              style={styles.btnInfo}
                              onClick={(e) => handleInfo(item)}
                            >
                              ดูเลขสลาก
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
                          {searchTerm
                            ? `ไม่พบรายการที่ตรงกับ "${searchTerm}"`
                            : "ยังไม่มีรายการสลากฝากร้านในตอนนี้..."}
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
              backgroundColor: "var(--slate-50)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--slate-200)",
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
                boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)",
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
    backgroundColor: "var(--slate-50)",
    minHeight: "100vh",
    paddingTop: "40px",
    paddingBottom: "80px",
    fontFamily: "'Kanit', sans-serif",
    position: "relative",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    borderBottom: "1px solid var(--slate-100)",
    paddingBottom: "14px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--slate-900)",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    backgroundColor: "var(--slate-50)",
    padding: "12px 14px",
    textAlign: "left",
    fontWeight: "600",
    color: "var(--slate-500)",
    fontSize: "13px",
    whiteSpace: "nowrap",
    borderBottom: "1px solid var(--slate-200)",
  },
  tableRow: { transition: "background-color 0.2s ease" },
  td: {
    padding: "14px",
    color: "var(--slate-600)",
    fontSize: "14px",
    fontWeight: "500",
    verticalAlign: "middle",
    borderBottom: "1px solid var(--slate-100)",
  },
  tdName: {
    padding: "14px",
    color: "var(--blue-700)",
    fontSize: "14px",
    fontWeight: "700",
    verticalAlign: "middle",
    borderBottom: "1px solid var(--slate-100)",
  },
  btnInfo: {
    background: "var(--color-white)",
    color: "var(--slate-600)",
    border: "1px solid var(--slate-200)",
    padding: "6px 12px",
    minHeight: "34px",
    borderRadius: "var(--radius-sm)",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  emptyState: {
    textAlign: "center",
    color: "var(--slate-400)",
    padding: "60px 20px",
    fontWeight: "600",
    fontSize: "16px",
  },
};

export default LottoInShop;
