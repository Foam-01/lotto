import Swal from "sweetalert2";
import Home from "./Home";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as dayjs from "dayjs";

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(config.apiPath + "/api/lotto/billSale");

      if (res.data.result && res.data.result.length > 0) {
        setBillSales(res.data.result);
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        confirmButtonColor: "#ea580c",
        cancelButtonColor: "#94a3b8",
        confirmButtonText: "ยืนยันการลบ",
        cancelButtonText: "ยกเลิก",
      });

      if (button.isConfirmed) {
        const toastId = toast.loading("กำลังลบข้อมูล...");

        const res = await axios.delete(
          config.apiPath + "/api/lotto/removeBill/" + billSale.id,
        );

        if (res.data.message === "success") {
          toast.update(toastId, {
            render: "ยกเลิกออเดอร์ของ " + billSale.customerName + " แล้ว 🗑️",
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
      toast.error("โง้ววว... ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่ 😿", {
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

  const formatPayDateTime = (dateString, timeString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);

    const datePart = date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const timePart = timeString ? timeString.substring(0, 5) : "";

    return `${datePart} ${timePart} น.`;
  };

  const handleConfirmPay = async () => {
    const button = await Swal.fire({
      title: "ยืนยันการชําระเงิน",
      text: "ต้องการชําระเงินใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ea580c",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "ยืนยันการชําระเงิน",
      cancelButtonText: "ยกเลิก",
    });

    if (button.isConfirmed) {
      const toastId = toast.loading("กำลังบันทึกการชำระเงิน...");

      try {
        const payload = {
          billSaleId: billSale.id,
          payRemark: payRemark,
          payDate: payDate,
          payTime: payTime,
          payAlertDate: payAlertDate,
        };

        const res = await axios.post(
          config.apiPath + "/api/lotto/ConfirmPay",
          payload,
        );

        if (res.data.message === "success") {
          toast.update(toastId, {
            render: "บันทึกการชำระเงินสำเร็จ 💰",
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
          render: "เกิดข้อผิดพลาด ไม่สามารถชำระเงินได้ 😿",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        console.error("Pay Error:", e);
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
            <div style={styles.header}>
              <div>
                <h2 style={styles.titleMain}>
                  <span className="me-3" style={styles.headerEmoji}>
                    🐈
                  </span>
                  แผงแมวส้ม: รายการสั่งซื้อ
                </h2>
                <p style={styles.subtitleMain}>
                  ตรวจสอบรายการสั่งซื้อสลาก และอัปเดตสถานะการชำระเงินของลูกค้า
                </p>
              </div>
            </div>

            <div style={styles.tableCard}>
              <div style={styles.tableHeaderContainer}>
                <h4 style={styles.cardTitle}>
                  <span className="icon-paw me-2">🐾</span>
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
                    {billSales.length > 0 ? (
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
                            <div style={styles.addressText}>
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
                                {formatPayDateTime(item.payDate, item.payTime)}
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

                              <button
                                onClick={(e) => handleRemove(item)}
                                style={styles.btnCancel}
                                title="ยกเลิกออเดอร์"
                              >
                                <i className="bi bi-x-circle-fill"></i>
                              </button>
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
                            😿
                          </div>
                          ยังไม่มีรายการสั่งซื้อเข้ามาเลยเจ้านาย...
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
      <div
        className="modal fade"
        id="modalBillSalaDetail"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={styles.modalContent}>
            <div className="modal-header" style={styles.modalHeader}>
              <h5 className="modal-title fw-bold" style={styles.modalTitle}>
                <i className="bi bi-receipt-cutoff me-2"></i>
                รายละเอียดสั่งซื้อ {billSale.id ? `#${billSale.id}` : ""}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body" style={{ padding: "25px 30px" }}>
              <div
                className="d-flex justify-content-between align-items-center mb-4 pb-3"
                style={{ borderBottom: "1px dashed #cbd5e1" }}
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
                <thead style={{ borderBottom: "2px solid #f1f5f9" }}>
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
                        style={{ borderBottom: "1px solid #f8fafc" }}
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
                  backgroundColor: "#fff7ed",
                  border: "2px dashed #fed7aa",
                }}
              >
                <span className="fw-bold text-muted">ยอดชำระรวม</span>
                <span className="fw-bold fs-4" style={{ color: "#ea580c" }}>
                  ฿{totalPrice?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modal ชำระเงิน --- */}
      <div
        className="modal fade"
        id="modalPay"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={styles.modalContent}>
            <div className="modal-header" style={styles.modalHeader}>
              <h5 className="modal-title fw-bold" style={styles.modalTitle}>
                <i className="bi bi-wallet2 me-2"></i>
                ยืนยันการชำระเงินบิล {billSale.id ? `#${billSale.id}` : ""}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body" style={{ padding: "25px 30px" }}>
              <div
                className="d-flex justify-content-between align-items-center mb-4 pb-3"
                style={{ borderBottom: "1px dashed #cbd5e1" }}
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
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label style={styles.modalLabel}>วันที่ชำระเงิน</label>
                    <input
                      onChange={(e) => setPayDate(e.target.value)}
                      value={payDate}
                      type="date"
                      className="form-control"
                      style={styles.modalInput}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label style={styles.modalLabel}>เวลาที่ชำระเงิน</label>
                    <input
                      onChange={(e) => setPayTime(e.target.value)}
                      value={payTime}
                      type="time"
                      className="form-control"
                      style={styles.modalInput}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label style={styles.modalLabel}>วันที่แจ้งโอน</label>
                  <input
                    onChange={(e) => setPayAlertDate(e.target.value)}
                    value={payAlertDate}
                    type="date"
                    className="form-control"
                    style={styles.modalInput}
                  />
                </div>

                <div>
                  <label style={styles.modalLabel}>หมายเหตุ (ถ้ามี)</label>
                  <textarea
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
                  style={styles.btnConfirmModal}
                >
                  <i className="bi bi-check-circle-fill me-2"></i>{" "}
                  บันทึกการชำระเงิน
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
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
    maxWidth: "1250px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  header: { marginBottom: "40px" },
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
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "35px 40px",
    boxShadow: "0 20px 50px rgba(234, 88, 12, 0.08)",
    borderTop: "8px solid #ea580c",
    animation: "slideUp 0.3s ease-out forwards",
  },
  tableHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
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
  badgeCount: {
    backgroundColor: "#fff7ed",
    color: "#ea580c",
    fontSize: "14px",
    fontWeight: "700",
    padding: "6px 16px",
    borderRadius: "50rem",
    marginLeft: "15px",
    border: "1px solid #fed7aa",
  },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" },
  th: {
    backgroundColor: "#fff7ed",
    padding: "16px",
    textAlign: "left",
    fontWeight: "700",
    color: "#c2410c",
    fontSize: "15px",
    whiteSpace: "nowrap",
    borderTop: "none",
    borderBottom: "none",
  },
  tableRow: { transition: "all 0.2s ease" },
  td: {
    padding: "18px 16px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "500",
    verticalAlign: "middle",
    borderBottom: "1px solid #f1f5f9",
  },
  tdName: {
    padding: "18px 16px",
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: "700",
    verticalAlign: "middle",
    borderBottom: "1px solid #f1f5f9",
  },
  dateBadge: {
    display: "inline-block",
    backgroundColor: "#f8fafc",
    padding: "6px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
  },
  addressText: {
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "8px 16px",
    borderRadius: "50rem",
    fontSize: "13px",
    fontWeight: "700",
    display: "inline-block",
    boxShadow: "0 2px 5px rgba(22, 163, 74, 0.1)",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
    padding: "8px 16px",
    borderRadius: "50rem",
    fontSize: "13px",
    fontWeight: "700",
    display: "inline-block",
  },
  btnInfo: {
    background: "#f8fafc",
    color: "#3b82f6",
    border: "1px solid #bfdbfe",
    padding: "8px 16px",
    borderRadius: "50rem",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  btnSuccess: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    border: "none",
    padding: "8px 18px",
    borderRadius: "50rem",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s",
    boxShadow: "0 4px 10px rgba(16, 185, 129, 0.25)",
    whiteSpace: "nowrap",
  },
  btnCancel: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    padding: "8px 14px",
    borderRadius: "50rem",
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

  // --- Modal Styles 🌟 ---
  modalContent: {
    borderRadius: "24px",
    border: "none",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(234, 88, 12, 0.25)",
  },
  modalHeader: {
    backgroundColor: "#fff7ed",
    borderBottom: "2px solid #fed7aa",
    padding: "20px 30px",
  },
  modalTitle: { color: "#ea580c", margin: 0, fontSize: "20px" },
  modalLabel: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "700",
    marginBottom: "8px",
    display: "block",
  },
  modalInput: {
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "15px",
    backgroundColor: "#ffffff",
    color: "#1e293b",
    fontFamily: "'Kanit', sans-serif",
  },
  btnConfirmModal: {
    width: "100%",
    padding: "16px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #ea580c, #c2410c)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(234, 88, 12, 0.25)",
    transition: "all 0.2s",
    fontFamily: "'Kanit', sans-serif",
  },
};

export default BillSale;
