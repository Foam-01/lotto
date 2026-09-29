import { useEffect, useState } from "react";
import Home from "./Home";
import Swal from "sweetalert2";
import BillSaleService from "../services/bill-sale.service";
import MyModal from "../components/MyModal";
import { formatDate,  } from "../utils/format";
import { PageHeader } from "../components/shared/PageHeader";
import {
  FilterBar,
  FilterBarSearch,
  FilterBarClear,
} from "../components/shared/FilterBar";

function LottoForSend() {
  // 🌟 ฟังก์ชันจัดการวันที่และเวลาเริ่มต้นให้ถูกฟอร์แมตของ HTML input
  const getInitialDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getInitialTime = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [billSales, setBillSales] = useState([]);
  const [billSale, setBillSale] = useState({});
  const [sendName, setSendName] = useState("");
  const [sendDate, setSendDate] = useState(getInitialDate());
  const [sendTime, setSendTime] = useState(getInitialTime());
  const [traceCode, setTraceCode] = useState("");
  const [sendPlatform, setSendPlatform] = useState("");
  const [remark, setRemark] = useState("");
  const [price, setPrice] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await BillSaleService.getLottoForSend(); // 🌟 ใช้ Service
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

  const handleSave = async () => {
    if (
      !sendName.trim() ||
      !traceCode.trim() ||
      !sendPlatform.trim() ||
      !(Number(price) > 0)
    ) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        text: "ชื่อผู้จัดส่ง, เลขพัสดุ, ช่องทางการจัดส่ง และค่าจัดส่งต้องไม่ว่าง",
      });
      return;
    }

    if (isSaving) return; // 🛡️ กันกดซ้ำระหว่างรอผลบันทึก (กันบันทึกจัดส่งซ้ำ)

    // 🌟 1. สร้างตัวตั้งค่า Notification (Toast) แจ้งเตือนมุมขวาบน
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

    const button = await Swal.fire({
      title: "ยืนยันการจัดส่ง",
      text: `กำลังบันทึกการจัดส่งบิล #${billSale.id || "-"}`,
      icon: "info",
      showDenyButton: true,
      confirmButtonText: "ยืนยันการจัดส่ง",
      confirmButtonColor: "var(--emerald-500)",
      denyButtonText: `ยกเลิก`,
    });

    if (button.isConfirmed) {
      setIsSaving(true);
      try {
        const payload = {
          data: {
            billSaleId: billSale.id,
            sendName: sendName,
            sendDate: new Date(sendDate), // 🌟 แปลงกลับเป็น Date object ส่งให้ Backend
            sendTime: sendTime,
            traceCode: traceCode,
            sendPlatform: sendPlatform,
            remark: remark,
            price: Number(price), // 🌟 แปลงเป็นตัวเลข
          },
        };

        const res = await BillSaleService.sendSave(payload); // 🌟 ใช้ Service

        if (res.data.message === "success") {
          // 🌟 2. เรียกใช้ Notification ตอนบันทึกสำเร็จ
          Toast.fire({
            icon: "success",
            title: "บันทึกจัดส่งสลากเรียบร้อย",
          });

          // 🌟 สั่งปิด Modal อัตโนมัติ
          const closeModalBtn = document.querySelector("#modalSend .btn-close");
          if (closeModalBtn) {
            closeModalBtn.click();
          }

          // โหลดข้อมูลใหม่
          setTimeout(() => {
            fetchData();
          }, 300);
        }
      } catch (e) {
        // 🌟 3. เรียกใช้ Notification ตอนเกิด Error
        Toast.fire({
          icon: "error",
          title:
            e.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  // 🌟 ค้นหาฝั่ง client จากรายการที่โหลดมาแล้ว (ไม่ยิง API เพิ่ม)
  const filteredBillSales = (billSales || []).filter((item) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const haystack = [item.customerName, item.customerPhone, item.customerAddress]
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
              title="รายการที่ต้องจัดส่ง"
              description="จัดการคิวส่งสลากตัวจริงให้ลูกค้าทางไปรษณีย์"
              count={`${filteredBillSales.length} รายการ`}
            />

            <FilterBar>
              <FilterBarSearch
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, ที่อยู่..."
              />
              <FilterBarClear
                show={!!searchTerm}
                onClick={() => setSearchTerm("")}
              />
            </FilterBar>

            <div style={styles.tableCard}>
              <div style={styles.tableHeaderContainer}>
                <h4 style={styles.cardTitle}>รอจัดส่ง</h4>
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
                      <th style={styles.th}>ที่อยู่จัดส่ง</th>
                      <th style={{ ...styles.th, textAlign: "center" }}>
                        วันที่จัดส่ง
                      </th>
                      <th style={{ ...styles.th, textAlign: "center" }}>
                        ค่าจัดส่ง
                      </th>
                      <th style={{ ...styles.th, textAlign: "center" }}>
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" style={styles.emptyState}>
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
                          <td style={{ ...styles.td, maxWidth: "250px" }}>
                            <div
                              className="text-truncate"
                              title={item.customerAddress}
                              aria-label={item.customerAddress}
                            >
                              {item.customerAddress}
                            </div>
                          </td>

                          <td style={{ ...styles.td, textAlign: "center" }}>
                            {item.billSaleForSends?.length > 0 &&
                            item.billSaleForSends[0].sendDate ? (
                              <span style={styles.statusPaid}>
                                {formatDate(item.billSaleForSends[0].sendDate)}
                              </span>
                            ) : (
                              <span style={styles.statusPending}>
                                รอดำเนินการ
                              </span>
                            )}
                          </td>

                          <td style={{ ...styles.td, textAlign: "center" }}>
                            {item.billSaleForSends?.length > 0 &&
                            item.billSaleForSends[0].price !== null ? (
                              <span style={{ fontWeight: 700, color: "var(--slate-700)" }}>
                                ฿
                                {item.billSaleForSends[0].price.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>

                          <td style={{ ...styles.td, textAlign: "center" }}>
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                onClick={() => handleInfo(item)}
                                data-bs-toggle="modal"
                                data-bs-target="#modalDetail"
                                style={styles.btnInfo}
                              >
                                ดูเลข
                              </button>

                              {item.billSaleForSends.length > 0 ? (
                                <button
                                  disabled
                                  title="รายการนี้จัดส่งเรียบร้อยแล้ว"
                                  style={styles.btnDisabled}
                                >
                                  จัดส่งแล้ว
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleInfo(item)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#modalSend"
                                  style={styles.btnSuccess}
                                >
                                  จัดส่ง
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        {/* 🌟 เปลี่ยน colSpan จาก 5 เป็น 7 ให้ครอบคลุมคอลัมน์ใหม่ที่เพิ่มมา 🌟 */}
                        <td colSpan="7" style={styles.emptyState}>
                          <div
                            style={{ fontSize: "50px", marginBottom: "15px" }}
                          >
                            📭
                          </div>
                          {searchTerm
                            ? `ไม่พบรายการที่ตรงกับ "${searchTerm}"`
                            : "ไม่มีสลากค้างจัดส่ง"}
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

      {/* 🌟 Modal ฟอร์มจัดส่งสลาก 🌟 */}
      <MyModal
        title="บันทึกการจัดส่งพัสดุ"
        id="modalSend"
        btnCloseId="btnClose"
      >
        <div className="p-3" style={{ fontFamily: "'Kanit', sans-serif" }}>
          <div
            className="alert alert-warning border-0"
            style={{ backgroundColor: "var(--brand-50)", color: "var(--brand-700)" }}
          >
            <i className="bi bi-info-circle-fill me-2"></i>
            กำลังบันทึกข้อมูลจัดส่งของบิล{" "}
            <strong>#{billSale?.id || "-"}</strong>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label
                htmlFor="lottoforsend-send-name"
                className="form-label fw-bold text-muted small"
              >
                ชื่อผู้จัดส่ง (แอดมิน)
              </label>
              <input
                id="lottoforsend-send-name"
                onChange={(e) => setSendName(e.target.value)} // 🌟 แก้เป็น setSendName
                type="text"
                className="form-control bg-light"
                placeholder="เช่น สมชาย ใจดี"
              />
            </div>
            <div className="col-md-6">
              <label
                htmlFor="lottoforsend-send-platform"
                className="form-label fw-bold text-muted small"
              >
                ช่องทางการจัดส่ง
              </label>
              <input
                id="lottoforsend-send-platform"
                onChange={(e) => setSendPlatform(e.target.value)}
                type="text"
                className="form-control bg-light"
                placeholder="เช่น EMS, Flash, J&T"
              />
            </div>
            <div className="col-md-6">
              <label
                htmlFor="lottoforsend-send-date"
                className="form-label fw-bold text-muted small"
              >
                วันที่ส่ง
              </label>
              <input
                id="lottoforsend-send-date"
                onChange={(e) => setSendDate(e.target.value)}
                type="date"
                value={sendDate}
                className="form-control bg-light"
              />
            </div>
            <div className="col-md-6">
              <label
                htmlFor="lottoforsend-send-time"
                className="form-label fw-bold text-muted small"
              >
                เวลาที่ส่ง
              </label>
              <input
                id="lottoforsend-send-time"
                onChange={(e) => setSendTime(e.target.value)}
                type="time"
                value={sendTime}
                className="form-control bg-light"
              />
            </div>
            <div className="col-md-12">
              <label
                htmlFor="lottoforsend-trace-code"
                className="form-label fw-bold text-muted small"
              >
                เลขพัสดุ (Tracking Code)
              </label>
              <input
                id="lottoforsend-trace-code"
                onChange={(e) => setTraceCode(e.target.value)}
                type="text"
                className="form-control bg-light border-primary"
                placeholder="ระบุเลขพัสดุ"
                style={{ letterSpacing: "1px" }}
              />
            </div>
            <div className="col-md-6">
              <label
                htmlFor="lottoforsend-price"
                className="form-label fw-bold text-muted small"
              >
                ค่าจัดส่ง (บาท)
              </label>
              <input
                id="lottoforsend-price"
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                className="form-control bg-light"
                placeholder="0"
              />
            </div>
            <div className="col-md-6">
              <label
                htmlFor="lottoforsend-remark"
                className="form-label fw-bold text-muted small"
              >
                หมายเหตุ
              </label>
              <input
                id="lottoforsend-remark"
                onChange={(e) => setRemark(e.target.value)}
                type="text"
                className="form-control bg-light"
                placeholder="พิมพ์หมายเหตุเพิ่มเติม..."
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-top text-end">
            <button
              onClick={handleSave}
              className="btn px-4 py-2 fw-bold"
              disabled={isSaving}
              style={{
                backgroundColor: "var(--emerald-500)",
                color: "white",
                borderRadius: "var(--radius-md)",
              }}
            >
              <i
                className={`bi ${isSaving ? "bi-hourglass-split" : "bi-save"} me-2`}
              ></i>
              {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูลจัดส่ง"}
            </button>
          </div>
        </div>
      </MyModal>

      {/* 🌟 Modal ดูรายละเอียดสลาก 🌟 */}
      <MyModal
        title="รายการสลากที่ต้องจัดส่ง"
        id="modalDetail"
        btnCloseId="btnClose"
      >
        <div className="p-1" style={{ fontFamily: "'Kanit', sans-serif" }}>
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: "var(--slate-50)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--slate-200)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-warning border-opacity-25">
              <span
                className="text-secondary fw-bold"
                style={{ fontSize: "14px" }}
              >
                <i className="bi bi-receipt me-2"></i>เลขที่บิล
              </span>
              <span
                className="text-dark badge bg-white text-orange fs-6 px-3 py-2 border border-warning border-opacity-50 shadow-sm"
                style={{ borderRadius: "var(--radius-md)" }}
              >
                #{billSale?.id || "-"}
              </span>
            </div>

            <div className="row g-3">
              <div className="col-7">
                <small
                  className="text-muted d-block mb-1"
                  style={{ fontSize: "13px" }}
                >
                  ชื่อลูกค้า
                </small>
                <div className="fw-bold text-dark fs-5 text-truncate">
                  {billSale?.customerName || "-"}
                </div>
              </div>
              <div className="col-5 text-end">
                <small
                  className="text-muted d-block mb-1"
                  style={{ fontSize: "13px" }}
                >
                  เบอร์โทรติดต่อ
                </small>
                <div className="fw-bold text-dark fs-6">
                  {billSale?.customerPhone || "-"}
                </div>
              </div>
              <div className="col-12 mt-3 pt-2 border-top border-warning border-opacity-25">
                <small
                  className="text-muted d-block mb-1"
                  style={{ fontSize: "13px" }}
                >
                  <i className="bi bi-geo-alt me-1"></i>ที่อยู่จัดส่ง
                </small>
                <div className="fw-bold text-dark" style={{ fontSize: "15px" }}>
                  {billSale?.customerAddress || "ไม่ได้ระบุที่อยู่"}
                </div>
              </div>
            </div>
          </div>

          <div className="px-2 mb-4">
            <div className="d-flex justify-content-between align-items-end mb-3">
              <h6 className="fw-bold text-dark m-0 d-flex align-items-center">
                <i className="bi bi-ticket-perforated fs-5 text-orange me-2"></i>
                รายการสลาก
              </h6>
              <small className="text-muted fw-bold bg-light px-2 py-1 rounded">
                รวม {billSale?.billSaleDetail?.length || 0} ใบ
              </small>
            </div>

            <div className="d-flex flex-column gap-2">
              {billSale?.billSaleDetail?.length > 0 ? (
                billSale.billSaleDetail.map((item, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center p-3"
                    style={{
                      backgroundColor: "var(--slate-50)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--slate-200)",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <span
                        className="text-slate-400 fw-bold me-3"
                        style={{ fontSize: "12px", width: "20px" }}
                      >
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span
                        className="fw-bold text-primary fs-5"
                        style={{
                          letterSpacing: "2px",
                          fontFamily: "monospace",
                        }}
                      >
                        {item.lotto?.numbers || item.lotto?.number || "-"}
                      </span>
                    </div>
                    <span className="text-success fw-bold fs-6">
                      ฿{item.price?.toLocaleString() || 0}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  className="text-center text-muted py-5 bg-light rounded-3"
                  style={{ border: "1px dashed var(--slate-300)" }}
                >
                  <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary opacity-50"></i>
                  ไม่พบรายการสลาก
                </div>
              )}
            </div>
          </div>
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
  statusPaid: {
    backgroundColor: "var(--green-100)",
    color: "var(--green-700)",
    padding: "3px 12px",
    borderRadius: "var(--radius-pill)",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-block",
  },
  statusPending: {
    backgroundColor: "var(--slate-100)",
    color: "var(--slate-500)",
    padding: "3px 12px",
    borderRadius: "var(--radius-pill)",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-block",
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
  btnSuccess: {
    background: "var(--emerald-50, #ecfdf5)",
    color: "var(--emerald-700)",
    border: "1px solid var(--emerald-200, #a7f3d0)",
    padding: "6px 12px",
    minHeight: "34px",
    borderRadius: "var(--radius-sm)",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  btnDisabled: {
    background: "var(--slate-100)",
    color: "var(--slate-400)",
    border: "1px solid var(--slate-200)",
    padding: "6px 12px",
    minHeight: "34px",
    borderRadius: "var(--radius-sm)",
    fontWeight: "600",
    cursor: "not-allowed",
    fontSize: "13px",
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

export default LottoForSend;
