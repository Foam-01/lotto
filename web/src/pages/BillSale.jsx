import Swal from "sweetalert2";
import Home from "./Home";
import MyModal from "../components/MyModal";
import { useEffect, useState } from "react";
import BillSaleService from "../services/bill-sale.service";
import * as dayjs from "dayjs";
import { formatDate, formatDateTime } from "../utils/format";
import { PageHeader } from "../components/shared/PageHeader";
import {
  FilterBar,
  FilterBarSearch,
  FilterBarClear,
} from "../components/shared/FilterBar";

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

function BillSale() {
  const currentDate = dayjs(new Date()).format("YYYY-MM-DD");
  const currentDateTime = dayjs(new Date()).format("HH:mm:ss");

  const [billSales, setBillSales] = useState([]);
  const [billSale, setBillSale] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
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
        const res = await BillSaleService.removeBill(billSale.id); // 🌟 ใช้ Service

        if (res.data.message === "success") {
          Toast.fire({
            icon: "success",
            title: "ยกเลิกออเดอร์ของ " + billSale.customerName + " แล้ว",
          });

          await fetchData();
        } else {
          throw new Error("API return not success");
        }
      }
    } catch (e) {
      Toast.fire({
        icon: "error",
        title: "ยกเลิกออเดอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
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
          Toast.fire({
            icon: "success",
            title: "บันทึกการชำระเงินสำเร็จ",
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
        Toast.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด ไม่สามารถชำระเงินได้",
        });
        console.error("Pay Error:", e);
      } finally {
        setIsPaying(false);
      }
    }
  };

  // 🌟 ค้นหาบิลฝั่ง client จากรายการที่โหลดมาแล้ว (ไม่ยิง API เพิ่ม)
  const filteredBillSales = billSales.filter((item) => {
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
              title="รายการสั่งซื้อ"
              description="ตรวจสอบรายการสั่งซื้อสลาก และอัปเดตสถานะการชำระเงินของลูกค้า"
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
                <h4 style={styles.cardTitle}>บิลรายการสั่งซื้อล่าสุด</h4>
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
                    ) : filteredBillSales.length > 0 ? (
                      filteredBillSales.map((item, index) => (
                        <tr key={index} style={styles.tableRow}>
                          <td style={styles.td}>
                            {formatDate(item.createdDate)}
                          </td>

                          <td style={styles.tdName}>{item.customerName}</td>

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
                                {formatDateTime(item.payDate, item.payTime)}
                              </span>
                            ) : (
                              <span style={styles.statusPending}>
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
                                รายละเอียด
                              </button>

                              <button
                                onClick={(e) => handlePay(item)}
                                data-bs-toggle="modal"
                                data-bs-target="#modalPay"
                                style={styles.btnSuccess}
                                title="ยืนยันการชำระเงิน"
                              >
                                ยืนยันชำระ
                              </button>

                              <button
                                onClick={(e) => handleRemove(item)}
                                style={styles.btnCancel}
                                title="ยกเลิกออเดอร์"
                                aria-label="ยกเลิกออเดอร์"
                              >
                                <i className="bi bi-x-lg"></i>
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
                            📭
                          </div>
                          {searchTerm
                            ? `ไม่พบรายการที่ตรงกับ "${searchTerm}"`
                            : "ยังไม่มีรายการสั่งซื้อเข้ามา"}
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
                  backgroundColor: "var(--blue-50)",
                  border: "1px solid var(--slate-200)",
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
    maxWidth: "1250px",
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
  addressText: {
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
    backgroundColor: "var(--amber-100)",
    color: "#1d4ed8",
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
  btnCancel: {
    background: "var(--red-50)",
    color: "var(--red-600)",
    border: "1px solid var(--red-100)",
    padding: "6px 10px",
    minHeight: "34px",
    borderRadius: "var(--radius-sm)",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s",
  },
  emptyState: {
    textAlign: "center",
    color: "var(--slate-400)",
    padding: "60px 20px",
    fontWeight: "600",
    fontSize: "16px",
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
