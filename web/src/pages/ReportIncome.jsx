import Home from "./Home";
import ReportService from "../services/report.service";
import { useEffect, useState } from "react";
import { formatDateTime } from "../utils/format";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { PageHeader } from "../components/shared/PageHeader";
import { FilterBar, FilterBarButton } from "../components/shared/FilterBar";

function ReportIncome() {
  const [billSaleDetails, setBillSaleDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 ค่าเริ่มต้นเปิดหน้ามาให้เห็นข้อมูลตั้งแต่ต้นปี (1 ม.ค.) ถึงวันนี้ ผู้ใช้ยังเลือกช่วงเองได้ตามปกติ
  const [fromDate, setFromDate] = useState(dayjs().startOf("year").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ตั้งใจรันครั้งเดียวตอน mount เท่านั้น
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
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลรายได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "var(--brand-600)",
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
          <PageHeader
            eyebrow="รายงาน"
            title="รายงานรายได้"
            description="ดูยอดรายได้จากการขายสลากตามช่วงเวลาที่เลือก"
            count={`${totalBills} รายการ`}
          />

          <FilterBar
            actions={
              <FilterBarButton
                variant="primary"
                icon="bi-search"
                onClick={fetchData}
              >
                ค้นหารายได้
              </FilterBarButton>
            }
          >
            <label
              htmlFor="incomeFromDate"
              className="fw-bold text-secondary small mb-0"
            >
              ตั้งแต่
            </label>
            <input
              id="incomeFromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              type="date"
              className="form-control form-control-sm rounded-pill border"
              style={{ width: "auto" }}
            />
            <label
              htmlFor="incomeToDate"
              className="fw-bold text-secondary small mb-0"
            >
              ถึง
            </label>
            <input
              id="incomeToDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              type="date"
              className="form-control form-control-sm rounded-pill border"
              style={{ width: "auto" }}
            />
          </FilterBar>

          <div className="row g-4 mb-4">
            <div className="col-12 col-xl-4">
              <div
                className="card border h-100"
                style={{
                  backgroundColor: "var(--color-white)",
                  borderColor: "var(--slate-200)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="card-body d-flex flex-column justify-content-center">
                  <p
                    className="mb-1 fw-semibold"
                    style={{ color: "var(--slate-500)", fontSize: "13px" }}
                  >
                    ยอดรายได้รวมช่วงนี้
                  </p>
                  <h2 className="fw-bold mb-0" style={{ color: "var(--green-700)" }}>
                    {totalIncome.toLocaleString("th-TH")}{" "}
                    <span className="fs-5 fw-normal text-muted">฿</span>
                  </h2>
                  <div
                    className="small fw-medium mt-2"
                    style={{ color: "var(--slate-500)" }}
                  >
                    ขายได้ทั้งหมด {totalBills} รายการ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 ตารางแสดงรายได้ */}
          <div
            className="card border overflow-hidden bg-white"
            style={{
              borderColor: "var(--slate-200)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="card-body p-0">
              <div className="table-responsive">
                <table
                  className="table table-hover align-middle mb-0"
                  style={{ minWidth: "900px" }}
                >
                  <thead style={{ backgroundColor: "var(--slate-50)" }}>
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 border-0 text-center"
                        style={{ color: "var(--slate-500)", fontWeight: "600", fontSize: "13px" }}
                      >
                        เลขสลาก
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 border-0 text-center"
                        style={{ color: "var(--slate-500)", fontWeight: "600", fontSize: "13px" }}
                      >
                        ยอดเงินโอน
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 border-0 text-center"
                        style={{ color: "var(--slate-500)", fontWeight: "600", fontSize: "13px" }}
                      >
                        วันที่/เวลาโอน
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 border-0"
                        style={{ color: "var(--slate-500)", fontWeight: "600", fontSize: "13px" }}
                      >
                        ข้อมูลลูกค้า
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 border-0"
                        style={{ color: "var(--slate-500)", fontWeight: "600", fontSize: "13px" }}
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
                            กำลังคำนวณเงิน...
                          </h5>
                        </td>
                      </tr>
                    ) : billSaleDetails.length > 0 ? (
                      billSaleDetails.map((item, index) => (
                        <tr
                          key={index}
                          style={{ borderBottom: "1px solid var(--gray-100)" }}
                        >
                          <td className="px-4 py-3 text-center">
                            <span
                              style={{
                                color: "var(--blue-700)",
                                fontWeight: 700,
                                fontSize: "14px",
                                letterSpacing: "1px",
                              }}
                            >
                              {item.lotto?.bookNumber || "-"}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-center">
                            <span
                              className="fw-bold"
                              style={{ color: "var(--green-700)", fontSize: "15px" }}
                            >
                              + {item.price?.toLocaleString("th-TH")} ฿
                            </span>
                          </td>

                          <td className="px-3 py-3 text-center">
                            <div className="small text-muted">
                              {formatDateTime(
                                item.billSale?.payDate,
                                item.billSale?.payTime,
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <div
                              className="fw-bold mb-1"
                              style={{ fontSize: "14px", color: "var(--slate-800)" }}
                            >
                              {item.billSale?.customerName || "ไม่ระบุ"}
                            </div>
                            <div className="text-muted small">
                              {item.billSale?.customerPhone || "-"}
                            </div>
                          </td>

                          <td className="px-4 py-3">
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
                            <div style={{ fontSize: "4rem" }}>📭</div>
                            <span
                              className="fs-5 mt-3 fw-bold"
                              style={{ color: "var(--brand-700)" }}
                            >
                              ช่วงเวลานี้ยังไม่มีรายได้เข้ามา
                            </span>
                            <span className="mt-1 text-secondary small">
                              ลองเปลี่ยนช่วงวันที่ค้นหาใหม่อีกครั้ง
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
