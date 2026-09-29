import Swal from "sweetalert2";
import Home from "./Home";
import MyModal from "../components/MyModal";
import { useEffect, useState } from "react";
import BillSaleService from "../services/bill-sale.service";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as dayjs from "dayjs";
import { formatDate, formatDateTime } from "../utils/format";

function BillSale() {
  const currentDate = dayjs(new Date()).format("YYYY-MM-DD");
  const currentDateTime = dayjs(new Date()).format("HH:mm:ss");

  const [billSales, setBillSales] = useState([]);
  const [billSale, setBillSale] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [payDate, setPayDate] = useState(currentDate);
  const [payTime, setPayTime] = useState(currentDateTime);
  const [payAlertDate, setPayAlertDate] = useState(currentDate);
  const [payRemark, setPayRemark] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await BillSaleService.getBillSales(); // 🌟 ใช้ Service

      if (res.data.result && res.data.result.length > 0) {
        setBillSales(res.data.result);
      } else {
        setBillSales([]);
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

  const handleSumTotalPrice = (item) => {
    setBillSale(item);

    let sum = 0;

    for (let i = 0; i < item.billSaleDetail.length; i++) {
      const billSaleDetail = item.billSaleDetail[i];
      sum += parseInt(billSaleDetail.price);
    }
    setTotalPrice(sum);
  };

  const handleRemove = async (billSale) => {
    try {
      const button = await Swal.fire({
        title: "ยืนยันการยกเลิกออเดอร์",
        text: "ต้องการยกเลิกบิลของ " + billSale.customerName + " ใช่หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "var(--brand-600)",
        cancelButtonColor: "var(--slate-400)",
        confirmButtonText: "ยืนยันการยกเลิก",
        cancelButtonText: "ยกเลิก",
      });

      if (button.isConfirmed) {
        const toastId = toast.loading("กำลังลบข้อมูล...");

        const res = await BillSaleService.removeBill(billSale.id); // 🌟 ใช้ Service

        if (res.data.message === "success") {
          toast.update(toastId, {
            render: "ยกเลิกออเดอร์ของ " + billSale.customerName + " แล้ว",
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });

          await fetchData();
        } else {
          throw new Error("API return not success");
        }
      }
    } catch (e) {
      toast.error("ยกเลิกออเดอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
        autoClose: 3000,
      });
      console.error("Remove Bill Error:", e);
    }
  };

  const handlePay = (item) => {
    handleSumTotalPrice(item);
    setPayRemark("");
    setPayAlertDate(currentDate);
    setPayDate(currentDate);
    setPayTime(currentDateTime);
  };

  const handleConfirmPay = async () => {
    if (isPaying) return; // 🛡️ กันกดซ้ำระหว่างรอบันทึกการชำระเงิน

    const button = await Swal.fire({
      title: "ยืนยันการชำระเงิน",
      text: "ต้องการชำระเงินใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--brand-600)",
      cancelButtonColor: "var(--slate-400)",
      confirmButtonText: "ยืนยันการชำระเงิน",
      cancelButtonText: "ยกเลิก",
    });

    if (button.isConfirmed) {
      setIsPaying(true);
      const toastId = toast.loading("กำลังบันทึกการชำระเงิน...");

      try {
        const payload = {
          billSaleId: billSale.id,
          payRemark: payRemark,
          payDate: payDate,
          payTime: payTime,
          payAlertDate: payAlertDate,
        };

        const res = await BillSaleService.confirmPay(payload);

        if (res.data.message === "success") {
          toast.update(toastId, {
            render: "บันทึกการชำระเงินสำเร็จ",
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });

          await fetchData();

          const closeModalBtn = document.querySelector("#modalPay .btn-close");
          if (closeModalBtn) {
            closeModalBtn.click();
          }
        } else {
          throw new Error("ไม่สามารถบันทึกได้");
        }
      } catch (e) {
        toast.update(toastId, {
          render: "เกิดข้อผิดพลาด ไม่สามารถชำระเงินได้",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        console.error("Pay Error:", e);
      } finally {
        setIsPaying(false);
      }
    }
  };

  return (
    <>
      <Home>
        <div style={styles.page}>
          <div className="sunburst-bg"></div>
          <div className="bg-pattern"></div>
          {[
            { emoji: "🧾", top: "15%", left: "5%", size: "70px", delay: "0s" },
            { emoji: "🐾", top: "45%", right: "6%", size: "90px", delay: "1s" },
            { emoji: "💰", top: "75%", left: "8%", size: "60px", delay: "2s" },
            {
              emoji: "🍀",
              top: "85%",
              right: "12%",
              size: "65px",
              delay: "0.5s",
            },
            {
              emoji: "🐈",
              top: "30%",
              left: "20%",
              size: "50px",
              delay: "1.5s",
            },
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

          <style>{`
            @media (max-width: 480px) {
              .billsale-header-emoji {
                font-size: 40px !important;
              }
            }
          `}</style>

          <div className="container" style={styles.container}>
            <div style={styles.header}>
              <div>
                <h2 style={{ ...styles.titleMain, flexWrap: "wrap" }}>
                  <span
                    className="me-3 billsale-header-emoji"
                    style={styles.headerEmoji}
                  >
                    🐈
                  </span>
                  รายการสั่งซื้อ
                </h2>
                <p style={styles.subtitleMain}>
                  ตรวจสอบรายการสั่งซื้อสลาก และอัปเดตสถานะการชำระเงินของลูกค้า
                </p>
              </div>
            </div>

            <div style={styles.tableCard}>
              <div style={styles.tableHeaderContainer}>
                <h4 style={styles.cardTitle}>
                  บิลรายการสั่งซื้อล่าสุด
                  <span style={styles.badgeCount}>
                    {billSales.length} รายการ
                  </span>
                </h4>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>วันที่ทำรายการ</th>
                      <th style={styles.th}>ลูกค้า</th>
                      <th style={{ ...styles.th, textAlign: "center" }}>
                        เบอร์โทร
                      </th>
                      <th style={styles.th}>ที่อยู่จัดส่ง</th>
                      <th style={{ ...styles.th, textAlign: "center" }}>
                        สถานะ / วันที่ชำระ
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
                    ) : billSales.length > 0 ? (
                      billSales.map((item, index) => (
                        <tr key={index} style={styles.tableRow}>
                          <td style={styles.td}>
                            <div style={styles.dateBadge}>
                              <i className="bi bi-calendar-event text-muted me-1"></i>
                              {formatDate(item.createdDate)}
                            </div>
                          </td>

                          <td style={styles.tdName}>
                            <i className="bi bi-person-circle text-muted me-1"></i>
                            {item.customerName}
                          </td>

                          <td style={{ ...styles.td, textAlign: "center" }}>
                            {item.customerPhone || "-"}
                          </td>

                          <td style={styles.td}>
                            <div
                              style={styles.addressText}
                              title={item.customerAddress || "ฝากสลากไว้ที่ร้าน"}
                            >
                              {item.customerAddress || (
                                <span className="text-muted fst-italic">
                                  ฝากสลากไว้ที่ร้าน
                                </span>
                              )}
                            </div>
                          </td>

                          <td style={{ ...styles.td, textAlign: "center" }}>
                            {item.payDate ? (
                              <span style={styles.statusPaid}>
                                <i className="bi bi-check-circle-fill me-1"></i>
                                {formatDateTime(item.payDate, item.payTime)}
                              </span>
                            ) : (
                              <span style={styles.statusPending}>
                                <i className="bi bi-clock-fill me-1"></i>{" "}
                                รอชำระเงิน
                              </span>
                            )}
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
                                style={styles.btnInfo}
                                title="ดูรายละเอียดบิล"
                                data-bs-toggle="modal"
                                data-bs-target="#modalBillSalaDetail"
                                onClick={(e) => handleSumTotalPrice(item)}
                              >
                                <i className="bi bi-search"></i> รายละเอียด
                              </button>

                              <button
                                onClick={(e) => handlePay(item)}
                                data-bs-toggle="modal"
                                data-bs-target="#modalPay"
                                style={styles.btnSuccess}
                                title="ยืนยันการชำระเงิน"
                              >
                                <i className="bi bi-check-circle-fill"></i>{" "}
                                ยืนยันชำระ
                              </button>

                              <div style={styles.btnCancelWrap}>
                                <button
                                  onClick={(e) => handleRemove(item)}
                                  style={styles.btnCancel}
                                  title="ยกเลิกออเดอร์"
                                  aria-label="ยกเลิกออเดอร์"
                                >
                                  <i className="bi bi-x-circle-fill"></i>
                                </button>
                              </div>
                            </div>
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
                          ยังไม่มีรายการสั่งซื้อเข้ามา
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

      {/* --- Modal รายละเอียดบิล --- */}
      <MyModal
        id="modalBillSalaDetail"
        title={
          <>
            <i className="bi bi-receipt-cutoff me-2"></i>
            รายละเอียดสั่งซื้อ {billSale.id ? `#${billSale.id}` : ""}
          </>
        }
      >
        <>
              <div
                className="d-flex justify-content-between align-items-center mb-4 pb-3"
                style={{ borderBottom: "1px dashed var(--slate-300)" }}
              >
                <div>
                  <small className="text-muted d-block mb-1">ลูกค้า</small>
                  <span className="fw-bold fs-6 text-dark">
                    {billSale.customerName}
                  </span>
                </div>
                <div className="text-end">
                  <small className="text-muted d-block mb-1">
                    เบอร์โทรติดต่อ
                  </small>
                  <span className="fw-bold text-dark">
                    {billSale.customerPhone || "-"}
                  </span>
                </div>
              </div>

              <table className="mt-2 table table-borderless">
                <thead style={{ borderBottom: "2px solid var(--slate-100)" }}>
                  <tr>
                    <th className="text-muted pb-2" style={{ width: "20%" }}>
                      ลำดับ
                    </th>
                    <th className="text-muted pb-2">เลขสลาก</th>
                    <th className="text-muted pb-2 text-end">ราคา</th>
                  </tr>
                </thead>
                <tbody>
                  {billSale.billSaleDetail !== undefined &&
                  billSale.billSaleDetail.length > 0 ? (
                    billSale.billSaleDetail.map((item, index) => (
                      <tr
                        key={index}
                        style={{ borderBottom: "1px solid var(--slate-50)" }}
                      >
                        <td className="fw-bold text-muted pt-3 pb-3">
                          {index + 1}
                        </td>
                        <td className="fw-bold text-primary pt-3 pb-3 fs-5">
                          {item.lotto?.numbers || "-"}
                        </td>
                        <td className="fw-bold text-success text-end pt-3 pb-3">
                          ฿{item.price || "0"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-5">
                        <i className="bi bi-inbox fs-1 d-block mb-2 text-light"></i>
                        ไม่มีข้อมูลสลากในบิลนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div
                className="mt-4 p-3 rounded-4 d-flex justify-content-between align-items-center"
                style={{
                  backgroundColor: "var(--brand-50)",
                  border: "2px dashed var(--brand-200)",
                }}
              >
                <span className="fw-bold text-muted">ยอดชำระรวม</span>
                <span className="fw-bold fs-4" style={{ color: "var(--brand-600)" }}>
                  ฿{totalPrice?.toLocaleString() || 0}
                </span>
              </div>
        </>
      </MyModal>

      {/* --- Modal ชำระเงิน --- */}
      <MyModal
        id="modalPay"
        title={
          <>
            <i className="bi bi-wallet2 me-2"></i>
            ยืนยันการชำระเงินบิล {billSale.id ? `#${billSale.id}` : ""}
          </>
        }
      >
        <>
              <div
                className="d-flex justify-content-between align-items-center mb-4 pb-3"
                style={{ borderBottom: "1px dashed var(--slate-300)" }}
              >
                <div>
                  <small className="text-muted d-block mb-1">สั่งซื้อโดย</small>
                  <span className="fw-bold text-dark fs-6">
                    {billSale.customerName}
                  </span>
                </div>
                <div className="text-end">
                  <small className="text-muted d-block mb-1">
                    ยอดที่ต้องชำระ
                  </small>
                  <span className="fw-bold fs-4 text-success">
                    ฿{totalPrice?.toLocaleString() || 0}
                  </span>
                </div>
              </div>

              <div
                className="p-4 rounded-4"
                style={{
                  backgroundColor: "var(--slate-50)",
                  border: "1px solid var(--slate-200)",
                }}
              >
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="billsale-pay-date" style={styles.modalLabel}>
                      วันที่ชำระเงิน
                    </label>
                    <input
                      id="billsale-pay-date"
                      onChange={(e) => setPayDate(e.target.value)}
                      value={payDate}
                      type="date"
                      className="form-control"
                      style={styles.modalInput}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="billsale-pay-time" style={styles.modalLabel}>
                      เวลาที่ชำระเงิน
                    </label>
                    <input
                      id="billsale-pay-time"
                      onChange={(e) => setPayTime(e.target.value)}
                      value={payTime}
                      type="time"
                      className="form-control"
                      style={styles.modalInput}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="billsale-pay-alert-date" style={styles.modalLabel}>
                    วันที่แจ้งโอน
                  </label>
                  <input
                    id="billsale-pay-alert-date"
                    onChange={(e) => setPayAlertDate(e.target.value)}
                    value={payAlertDate}
                    type="date"
                    className="form-control"
                    style={styles.modalInput}
                  />
                </div>

                <div>
                  <label htmlFor="billsale-pay-remark" style={styles.modalLabel}>
                    หมายเหตุ (ถ้ามี)
                  </label>
                  <textarea
                    id="billsale-pay-remark"
                    onChange={(e) => setPayRemark(e.target.value)}
                    value={payRemark}
                    className="form-control"
                    placeholder="เช่น โอนเข้าบัญชีกสิกรไทย..."
                    rows="2"
                    style={styles.modalInput}
                  ></textarea>
                </div>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={handleConfirmPay}
                  disabled={isPaying}
                  style={{
                    ...styles.btnConfirmModal,
                    ...(isPaying ? { opacity: 0.7, cursor: "not-allowed" } : {}),
                  }}
                >
                  {isPaying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill me-2"></i>
                      บันทึกการชำระเงิน
                    </>
                  )}
                </button>
              </div>
        </>
      </MyModal>
      <ToastContainer />
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
    maxWidth: "1250px",
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
  tableRow: { transition: "all 0.2s ease" },
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
    backgroundColor: "var(--slate-50)",
    padding: "6px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--slate-200)",
    fontSize: "13px",
    color: "var(--slate-500)",
    fontWeight: "600",
  },
  addressText: {
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  statusPaid: {
    backgroundColor: "var(--green-100)",
    color: "var(--green-700)",
    padding: "8px 16px",
    borderRadius: "50rem",
    fontSize: "13px",
    fontWeight: "700",
    display: "inline-block",
    boxShadow: "0 2px 5px rgba(22, 163, 74, 0.1)",
  },
  statusPending: {
    backgroundColor: "var(--amber-100)",
    color: "#b45309",
    padding: "8px 16px",
    borderRadius: "50rem",
    fontSize: "13px",
    fontWeight: "700",
    display: "inline-block",
  },
  btnInfo: {
    background: "var(--slate-50)",
    color: "var(--blue-500)",
    border: "1px solid #bfdbfe",
    padding: "10px 16px",
    minHeight: "40px",
    borderRadius: "50rem",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  btnSuccess: {
    background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))",
    color: "var(--color-white)",
    border: "none",
    padding: "10px 18px",
    minHeight: "40px",
    borderRadius: "50rem",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s",
    boxShadow: "0 4px 10px rgba(16, 185, 129, 0.25)",
    whiteSpace: "nowrap",
  },
  btnCancelWrap: {
    marginLeft: "6px",
    paddingLeft: "10px",
    borderLeft: "1px dashed var(--slate-200)",
  },
  btnCancel: {
    background: "var(--red-50)",
    color: "var(--red-500)",
    border: "1px solid var(--red-200)",
    padding: "10px 14px",
    minHeight: "40px",
    borderRadius: "50rem",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s",
  },
  emptyState: {
    textAlign: "center",
    color: "var(--slate-400)",
    padding: "80px 20px",
    fontWeight: "600",
    fontSize: "18px",
  },

  // --- Modal Styles 🌟 ---
  modalLabel: {
    fontSize: "14px",
    color: "var(--slate-500)",
    fontWeight: "700",
    marginBottom: "8px",
    display: "block",
  },
  modalInput: {
    border: "2px solid var(--slate-200)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    fontSize: "15px",
    backgroundColor: "var(--color-white)",
    color: "var(--slate-900)",
    fontFamily: "'Kanit', sans-serif",
  },
  btnConfirmModal: {
    width: "100%",
    padding: "16px",
    borderRadius: "var(--radius-lg)",
    border: "none",
    background: "linear-gradient(135deg, var(--brand-600), var(--brand-700))",
    color: "var(--color-white)",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "var(--shadow-primary-strong)",
    transition: "all 0.2s",
    fontFamily: "'Kanit', sans-serif",
  },
};

export default BillSale;
