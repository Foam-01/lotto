import Swal from "sweetalert2";
import Home from "./Home";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BillSale() {
  const [billSales, setBillSales] = useState([]);
  const [billSale, setBillSale] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

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
        cancelButtonColor: "#94a3b8", // ปรับปุ่มยกเลิกให้เป็นสีเทาซอฟต์ๆ
        confirmButtonText: "ยืนยันการลบ",
        cancelButtonText: "ยกเลิก",
      });

      if (button.isConfirmed) {
        // 🌟 สร้าง Loading Toast ขณะกำลังรอ API
        const toastId = toast.loading("กำลังลบข้อมูล...");

        const res = await axios.delete(
          config.apiPath + "/api/lotto/removeBill/" + billSale.id,
        );

        if (res.data.message === "success") {
          // 🌟 อัปเดต Toast เป็นแบบสำเร็จ
          toast.update(toastId, {
            render: "ยกเลิกออเดอร์ของ " + billSale.customerName + " แล้ว 🗑️",
            type: "success",
            isLoading: false,
            autoClose: 2000, // ปิดอัตโนมัติใน 2 วินาที
          });

          await fetchData(); // โหลดข้อมูลมาแสดงใหม่
        } else {
          throw new Error("API return not success");
        }
      }
    } catch (e) {
      // 🌟 แจ้งเตือน Error ด้วย Toast
      toast.error("โง้ววว... ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่ 😿", {
        autoClose: 3000,
      });
      console.error("Remove Bill Error:", e);
    }
  };


  return (
    // 🌟 ใช้แท็ก <> ครอบทั้งหมด เพื่อให้ Modal อยู่ระดับเดียวกับ Home
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
                              <i className="bi bi-calendar-event text-muted"></i>{" "}
                              {formatDate(item.createdDate)}
                            </div>
                          </td>

                          <td style={styles.tdName}>
                            <i className="bi bi-person-circle text-muted"></i>{" "}
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
                                <i className="bi bi-check-circle-fill"></i>{" "}
                                {formatDate(item.payDate)}
                              </span>
                            ) : (
                              <span style={styles.statusPending}>
                                <i className="bi bi-clock-fill"></i> รอชำระเงิน
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
                                style={styles.btnSuccess}
                                title="ยืนยันการชำระเงิน"
                              >
                                <i className="bi bi-check-circle-fill"></i>{" "}
                                ยืนยันชำระ
                              </button>

                              <button
                               onClick={e => handleRemove(item)}
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

      {/* 🌟 ย้าย Modal ออกมาไว้นอก <Home> และแก้ class เป็น className ทั้งหมด 🌟 */}
      <div
        className="modal fade"
        id="modalBillSalaDetail"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content"
            style={{
              borderRadius: "20px",
              border: "none",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <div
              className="modal-header"
              style={{
                backgroundColor: "#f8fafc",
                borderBottom: "2px solid #fed7aa",
                padding: "20px 30px",
              }}
            >
              <h5
                className="modal-title fw-bold"
                id="exampleModalLabel"
                style={{ color: "#1e293b", margin: 0 }}
              >
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

            <div className="modal-body" style={{ padding: "20px 30px" }}>
              <div className="h5 fw-bold" style={{ color: "#ea580c" }}>
                Bill Sale ID : {billSale.id}
              </div>
              <div className="h6 text-muted mb-4">
                ลูกค้า:{" "}
                <span className="text-dark fw-bold">
                  {billSale.customerName}
                </span>{" "}
                | โทร:{" "}
                <span className="text-dark fw-bold">
                  {billSale.customerPhone || "-"}
                </span>
              </div>

              <table className="mt-3 table table-borderless table-striped">
                <thead style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <tr>
                    <th className="text-muted">ลำดับ</th>
                    <th className="text-muted">เลข</th>
                    <th className="text-muted">ราคา</th>
                    <th width="100%"></th>
                  </tr>
                </thead>
                <tbody>
                  {billSale.billSaleDetail !== undefined &&
                  billSale.billSaleDetail.length > 0 ? (
                    billSale.billSaleDetail.map((item, index) => (
                      <tr key={index}>
                        <td className="fw-bold">{index + 1}</td>
                        <td className="fw-bold text-primary">
                          {item.lotto.numbers || "-"}
                        </td>
                        <td className="fw-bold text-primary">
                          {item.price || "-"}
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            style={{ borderRadius: "8px" }}
                          >
                            <i className="bi bi-x-circle-fill me-2"></i>
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-4">
                        ไม่มีข้อมูลสลากในบิลนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="text-center h5">ยอดรวม {totalPrice || 0} บาท</div>

              <div className="mt-3 text-center">
                <button style={styles.btnSuccess} title="ยืนยันการชำระเงิน">
                  <i className="bi bi-check-circle-fill"></i> ยืนยันชำระ
                </button>

                <button 
                onClick={e => handleRemove(billSale)}
                style={styles.btnCancel} title="ยกเลิกออเดอร์">
                  <i className="bi bi-x-circle-fill"></i>
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
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "35px 40px",
    boxShadow: "0 20px 40px rgba(234, 88, 12, 0.08)",
    borderTop: "10px solid #ea580c",
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
    fontSize: "15px",
    fontWeight: "bold",
    padding: "4px 14px",
    borderRadius: "20px",
    marginLeft: "15px",
    border: "1px solid #fed7aa",
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
    whiteSpace: "nowrap",
  },
  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "16px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "500",
    verticalAlign: "middle",
  },
  tdName: {
    padding: "16px",
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: "700",
    verticalAlign: "middle",
  },
  dateBadge: {
    display: "inline-block",
    backgroundColor: "#f8fafc",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "13px",
    color: "#64748b",
  },
  addressText: {
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
    display: "inline-block",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
    display: "inline-block",
  },
  btnInfo: {
    background: "#f0f9ff",
    color: "#0284c7",
    border: "1px solid #bae6fd",
    padding: "8px 16px",
    borderRadius: "10px",
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
    padding: "8px 16px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s",
    boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)",
    whiteSpace: "nowrap",
  },
  btnCancel: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fee2e2",
    padding: "8px 12px",
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

export default BillSale;
