import Home from "./Home";
import ReportService from "../services/report.service";
import { useEffect, useState } from "react";
import { formatDateTime } from "../utils/format";
import dayjs from "dayjs";
import Swal from "sweetalert2";

function ReportIncome() {
  const [billSaleDetails, setBillSaleDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 ตั้งค่าให้เป็น YYYY-MM-DD เพื่อให้ <input type="date"> รู้จัก
  const [fromDate, setFromDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const payload = {
        fromDate: fromDate,
        toDate: toDate,
      };

      const res = await ReportService.getIncome(payload);
      if (res.data.results !== undefined) {
        setBillSaleDetails(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด 😿",
        text: "ไม่สามารถโหลดข้อมูลรายได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#ea580c",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 คำนวณสรุปยอดรายได้
  const totalIncome = billSaleDetails.reduce(
    (sum, item) => sum + (item.price || 0),
    0,
  );
  const totalBills = billSaleDetails.length;

  return (
    <>
      <Home>
        <div className="container-fluid px-3 px-md-4 pb-4 pt-3">
          {/* 🌟 Header แบบคลีนสุดๆ (เอาไอคอนด้านหน้าออก) */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
            <div className="h3 mb-0 fw-bold" style={{ color: "#ea580c" }}>
              🐈 รายงานรายได้
            </div>
          </div>

          <div className="row g-4 mb-4">
            {/* 🌟 กล่องค้นหาวันที่ (Filter Box) */}
            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm rounded-4 h-100 p-2">
                <div className="card-body">
                  <h6 className="fw-bold mb-3" style={{ color: "#ea580c" }}>
                    <i className="bi bi-calendar-range-fill me-2"></i>
                    เลือกช่วงเวลาที่ต้องการดูรายได้
                  </h6>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary small mb-1">
                        ตั้งแต่วันที่
                      </label>
                      <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                        <span className="input-group-text bg-light border-0 text-warning">
                          <i className="bi bi-calendar-event"></i>
                        </span>
                        <input
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          type="date"
                          className="form-control border-0 px-2 bg-light fw-medium text-dark"
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary small mb-1">
                        ถึงวันที่
                      </label>
                      <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                        <span className="input-group-text bg-light border-0 text-warning">
                          <i className="bi bi-calendar-event-fill"></i>
                        </span>
                        <input
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          type="date"
                          className="form-control border-0 px-2 bg-light fw-medium text-dark"
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <button
                        onClick={fetchData}
                        className="btn rounded-pill w-100 shadow-sm fw-bold transition-all"
                        style={{
                          backgroundColor: "#ea580c",
                          color: "white",
                          padding: "10px",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.transform = "translateY(-2px)")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.transform = "translateY(0)")
                        }
                      >
                        <i className="bi bi-search me-2"></i>
                        ค้นหารายได้
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 กล่องสรุปยอดรายได้ (KPI Card) */}
            <div className="col-12 col-xl-4">
              <div
                className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden"
                style={{
                  backgroundColor: "#ecfdf5",
                  borderBottom: "4px solid #10b981",
                }}
              >
                <i
                  className="bi bi-cash-stack position-absolute opacity-25"
                  style={{
                    fontSize: "7rem",
                    right: "-15px",
                    bottom: "-25px",
                    color: "#34d399",
                  }}
                ></i>
                <div className="card-body position-relative z-1 d-flex flex-column justify-content-center">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <p
                        className="text-muted mb-1 fw-bold fs-6"
                        style={{ color: "#059669" }}
                      >
                        ยอดรายได้รวมช่วงนี้
                      </p>
                      <h2 className="fw-bold mb-0" style={{ color: "#047857" }}>
                        {totalIncome.toLocaleString("th-TH")}{" "}
                        <span className="fs-5 fw-normal">฿</span>
                      </h2>
                    </div>
                  </div>
                  <div
                    className="small fw-medium mt-2"
                    style={{ color: "#059669" }}
                  >
                    <i className="bi bi-receipt me-1"></i> ขายได้ทั้งหมด{" "}
                    {totalBills} รายการ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 ตารางแสดงรายได้ */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table
                  className="table table-hover align-middle mb-0"
                  style={{ minWidth: "900px" }}
                >
                  <thead
                    style={{
                      backgroundColor: "#ffedd5",
                      borderBottom: "2px solid #fdba74",
                    }}
                  >
                    <tr>
                      <th
                        className="px-4 py-3 border-0 text-center text-uppercase"
                        style={{ color: "#c2410c", fontWeight: "700" }}
                      >
                        เลขสลาก
                      </th>
                      <th
                        className="px-3 py-3 border-0 text-center text-uppercase"
                        style={{ color: "#c2410c", fontWeight: "700" }}
                      >
                        ยอดเงินโอน
                      </th>
                      <th
                        className="px-3 py-3 border-0 text-center text-uppercase"
                        style={{ color: "#c2410c", fontWeight: "700" }}
                      >
                        วันที่/เวลาโอน
                      </th>
                      <th
                        className="px-3 py-3 border-0 text-uppercase"
                        style={{ color: "#c2410c", fontWeight: "700" }}
                      >
                        ข้อมูลลูกค้า
                      </th>
                      <th
                        className="px-4 py-3 border-0 text-uppercase"
                        style={{ color: "#c2410c", fontWeight: "700" }}
                      >
                        ที่อยู่จัดส่ง
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div
                            className="spinner-border text-warning mb-3"
                            role="status"
                            style={{ width: "3rem", height: "3rem" }}
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <h5 className="text-muted fw-bold">
                            กำลังคำนวณเงิน... 💰
                          </h5>
                        </td>
                      </tr>
                    ) : billSaleDetails.length > 0 ? (
                      billSaleDetails.map((item, index) => (
                        <tr
                          key={index}
                          style={{ borderBottom: "1px solid #f3f4f6" }}
                        >
                          {/* เลขสลาก */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className="badge rounded-pill fs-6 shadow-sm bg-white"
                              style={{
                                color: "#ea580c",
                                border: "1px dashed #fdba74",
                                letterSpacing: "1px",
                              }}
                            >
                              🎟️ {item.lotto?.bookNumber || "-"}
                            </span>
                          </td>

                          {/* ยอดเงิน (สีเขียวรับทรัพย์) */}
                          <td className="px-3 py-4 text-center">
                            <span
                              className="fw-bold fs-5"
                              style={{ color: "#10b981" }}
                            >
                              + {item.price?.toLocaleString("th-TH")} ฿
                            </span>
                          </td>

                          {/* วันที่และเวลาโอน */}
                          <td className="px-3 py-4 text-center">
                            <div className="small fw-medium text-dark bg-light rounded-3 p-2 d-inline-block border">
                              <i className="bi bi-clock-history text-warning me-1"></i>
                              {formatDateTime(
                                item.billSale?.payDate,
                                item.billSale?.payTime,
                              )}
                            </div>
                          </td>

                          {/* ข้อมูลลูกค้า */}
                          <td className="px-3 py-4">
                            <div
                              className="fw-bold text-dark mb-1"
                              style={{ fontSize: "1.05rem" }}
                            >
                              👤 {item.billSale?.customerName || "ไม่ระบุ"}
                            </div>
                            <div className="text-muted small">
                              <span className="badge bg-light text-secondary border px-2 py-1 fw-normal">
                                <i className="bi bi-telephone-fill me-1"></i>
                                {item.billSale?.customerPhone || "-"}
                              </span>
                            </div>
                          </td>

                          {/* ที่อยู่ */}
                          <td className="px-4 py-4">
                            <div
                              className="small text-muted"
                              style={{
                                maxWidth: "250px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: "2",
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                              {item.billSale?.customerAddress || "-"}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      /* 🌟 Empty State สไตล์แมวอ้อน 🌟 */
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div className="text-muted d-flex flex-column align-items-center py-4">
                            <div style={{ fontSize: "4rem" }}>😿</div>
                            <span
                              className="fs-5 mt-3 fw-bold"
                              style={{ color: "#c2410c" }}
                            >
                              ช่วงเวลานี้ยังไม่มีรายได้เข้ามาเลยเจ้านาย!
                            </span>
                            <span className="mt-1 text-secondary small">
                              ลองเปลี่ยนวันที่ค้นหาดูใหม่นะ แง้ววว... 🐾
                            </span>
                          </div>
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
    </>
  );
}

export default ReportIncome;
