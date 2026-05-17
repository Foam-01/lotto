import Home from "./Home";
import ReportService from "../services/report.service";
import { useEffect, useState } from "react";
import { formatDateTime } from "../utils/format";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import MyModal from "../components/MyModal"; 

function ReportProfit() {
  const [billSaleDetails, setBillSaleDetails] = useState([]);
  const [lottoIsBonus, setLottoIsBonus] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 State สำหรับจัดการ Modal
  const [selectedBillDetail, setSelectedBillDetail] = useState(null); // เก็บข้อมูลสลากที่ถูกคลิก

  // 🌟 ตั้งค่าเริ่มต้นวันที่
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

      const res = await ReportService.getProfit(payload);

      if (res.data) {
        setBillSaleDetails(res.data.billSaleDetails || []);
        setLottoIsBonus(res.data.lottoIsBonus || []);
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด 😿",
        text: "ไม่สามารถโหลดข้อมูลกำไรได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#ea580c",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🌟 ระบบคำนวณกำไร
  // ==========================================
  let totalSale = 0;
  let totalCost = 0;
  billSaleDetails.forEach((item) => {
    totalSale += item.price || 0;
    totalCost += item.lotto?.cost || 0;
  });
  const profitFromSale = totalSale - totalCost;

  const totalBonusPrize = lottoIsBonus.reduce(
    (sum, item) => sum + (item.BonusResultDetail?.price || 0),
    0,
  );

  const grandTotalProfit = profitFromSale + totalBonusPrize;

  // ==========================================
  // 🌟 ฟังก์ชันจัดการปุ่ม Modal
  // ==========================================
  const handleOpenDetailModal = (item) => {
    setSelectedBillDetail(item); // ยัดข้อมูลใส่ State
    // ตัว Modal ใน Bootstrap ปกติถ้าใช้ ID มันจะใช้ Data-bs-toggle เปิดให้เองครับ
    // หรือถ้า MyModal เจ้านายใช้คำสั่งอื่น ก็ใช้ state จัดการเปิดปิดตรงนี้ได้เลย
  };

  return (
    <>
      <Home>
        <div
          className="container-fluid px-3 px-md-4 pb-4 pt-3"
          style={{ backgroundColor: "#fafaf9", minHeight: "100vh" }}
        >
          {/* ... (Header และ กล่องค้นหาเหมือนเดิม) ... */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
            <div className="h3 mb-0 fw-bold" style={{ color: "#ea580c" }}>
              📊 สรุปผลกำไร
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 mb-4 p-2">
            <div className="card-body">
              <h6 className="fw-bold mb-3" style={{ color: "#ea580c" }}>
                <i className="bi bi-calendar-range-fill me-2"></i>
                เลือกช่วงเวลาที่ต้องการดูผลประกอบการ
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
                  >
                    <i className="bi bi-search me-2"></i> คำนวณกำไร
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ... (KPI Cards ทั้ง 3 กล่อง เหมือนเดิม) ... */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-4">
              <div
                className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden"
                style={{
                  backgroundColor: "#eff6ff",
                  borderBottom: "4px solid #3b82f6",
                }}
              >
                <i
                  className="bi bi-shop position-absolute opacity-25"
                  style={{
                    fontSize: "6rem",
                    right: "-10px",
                    bottom: "-20px",
                    color: "#93c5fd",
                  }}
                ></i>
                <div className="card-body position-relative z-1">
                  <p
                    className="text-muted mb-1 fw-bold fs-6"
                    style={{ color: "#1d4ed8" }}
                  >
                    กำไรจากการขาย (หักทุนแล้ว)
                  </p>
                  <h3 className="fw-bold mb-0" style={{ color: "#1e3a8a" }}>
                    + {profitFromSale.toLocaleString("th-TH")}{" "}
                    <span className="fs-6 fw-normal">฿</span>
                  </h3>
                  <div className="small fw-medium mt-2 text-primary">
                    ขายได้ {billSaleDetails.length} ใบ
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div
                className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden"
                style={{
                  backgroundColor: "#fdf4ff",
                  borderBottom: "4px solid #d946ef",
                }}
              >
                <i
                  className="bi bi-award-fill position-absolute opacity-25"
                  style={{
                    fontSize: "6rem",
                    right: "-10px",
                    bottom: "-20px",
                    color: "#f0abfc",
                  }}
                ></i>
                <div className="card-body position-relative z-1">
                  <p
                    className="text-muted mb-1 fw-bold fs-6"
                    style={{ color: "#a21caf" }}
                  >
                    เงินรางวัลแผงถูกเอง
                  </p>
                  <h3 className="fw-bold mb-0" style={{ color: "#701a75" }}>
                    + {totalBonusPrize.toLocaleString("th-TH")}{" "}
                    <span className="fs-6 fw-normal">฿</span>
                  </h3>
                  <div
                    className="small fw-medium mt-2"
                    style={{ color: "#c026d3" }}
                  >
                    ถูกรางวัล {lottoIsBonus.length} ใบ
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
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
                    fontSize: "6rem",
                    right: "-10px",
                    bottom: "-20px",
                    color: "#34d399",
                  }}
                ></i>
                <div className="card-body position-relative z-1">
                  <p
                    className="text-muted mb-1 fw-bold fs-6"
                    style={{ color: "#059669" }}
                  >
                    กำไรสุทธิรวมทั้งหมด
                  </p>
                  <h2 className="fw-bold mb-0" style={{ color: "#047857" }}>
                    {grandTotalProfit.toLocaleString("th-TH")}{" "}
                    <span className="fs-5 fw-normal">฿</span>
                  </h2>
                  <div
                    className="small fw-medium mt-2"
                    style={{ color: "#059669" }}
                  >
                    <i className="bi bi-graph-up-arrow me-1"></i> ยอดรวมสุทธิ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 2 ตารางด้านล่าง แบ่งครึ่งซ้ายขวา */}
          <div className="row g-4">
            {/* --- ตารางฝั่งซ้าย: ประวัติการขาย --- */}
            <div className="col-12 col-xl-7">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
                <div className="card-header bg-white border-0 pt-4 pb-2">
                  <h5 className="fw-bold mb-0" style={{ color: "#1e40af" }}>
                    <i className="bi bi-receipt me-2"></i>รายการขาย (ลูกค้า)
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div
                    className="table-responsive"
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                  >
                    <table className="table table-hover align-middle mb-0 text-center">
                      <thead
                        style={{
                          backgroundColor: "#eff6ff",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                        }}
                      >
                        <tr>
                          <th className="px-3 py-3 border-0 text-primary">
                            เลขสลาก
                          </th>
                          <th className="px-3 py-3 border-0 text-primary">
                            ทุน
                          </th>
                          <th className="px-3 py-3 border-0 text-primary">
                            ขาย
                          </th>
                          <th className="px-3 py-3 border-0 text-success">
                            กำไร
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan="4" className="py-4 text-muted">
                              กำลังโหลด...
                            </td>
                          </tr>
                        ) : billSaleDetails.length > 0 ? (
                          billSaleDetails.map((item, index) => (
                            <tr key={index}>
                              {/* 🌟 เปลี่ยน เลขสลาก ให้เป็นปุ่มกดเปิด Modal */}
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary fw-bold rounded-pill px-3 shadow-sm"
                                  data-bs-toggle="modal"
                                  data-bs-target="#modalSaleDetail"
                                  onClick={() => handleOpenDetailModal(item)}
                                >
                                  <i className="bi bi-search me-1"></i>
                                  {item.lotto?.numbers}
                                </button>
                              </td>
                              <td className="text-muted">
                                ฿{item.lotto?.cost}
                              </td>
                              <td className="text-dark">฿{item.price}</td>
                              <td className="fw-bold text-success">
                                + ฿
                                {(
                                  item.price - item.lotto?.cost
                                ).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-4 text-muted">
                              ไม่มีรายการขาย
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* --- ตารางฝั่งขวา: สลากที่แผงถูกรางวัล --- */}
            <div className="col-12 col-xl-5">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
                <div className="card-header bg-white border-0 pt-4 pb-2">
                  <h5 className="fw-bold mb-0" style={{ color: "#86198f" }}>
                    <i className="bi bi-stars me-2"></i>แผงถูกรางวัล
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div
                    className="table-responsive"
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                  >
                    <table className="table table-hover align-middle mb-0 text-center">
                      <thead
                        style={{
                          backgroundColor: "#fdf4ff",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                        }}
                      >
                        <tr>
                          <th
                            className="px-3 py-3 border-0 text-purple"
                            style={{ color: "#a21caf" }}
                          >
                            เลขสลาก
                          </th>
                          <th
                            className="px-3 py-3 border-0 text-purple"
                            style={{ color: "#a21caf" }}
                          >
                            เงินรางวัล
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan="2" className="py-4 text-muted">
                              กำลังโหลด...
                            </td>
                          </tr>
                        ) : lottoIsBonus.length > 0 ? (
                          lottoIsBonus.map((item, index) => (
                            <tr key={index}>
                              <td className="fw-bold text-dark fs-5">
                                {item.BonusResultDetail?.number}
                              </td>
                              <td
                                className="fw-bold"
                                style={{ color: "#d946ef", fontSize: "1.1rem" }}
                              >
                                + ฿
                                {item.BonusResultDetail?.price?.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="py-5 text-muted">
                              <div className="fs-1 mb-2">😿</div>
                              งวดนี้ยังไม่ถูกรางวัลเลย
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

      {/* ========================================== */}
      {/* 🌟 เรียกใช้ Component MyModal */}
      {/* ========================================== */}
      <MyModal id="modalSaleDetail" title="📄 รายละเอียดการขาย (ใบเสร็จ)">
        {selectedBillDetail ? (
          <div className="p-2">
            {/* ส่วนข้อมูลสลาก */}
            <div className="alert alert-primary border-0 shadow-sm rounded-4 mb-3">
              <h5 className="alert-heading fw-bold mb-3 border-bottom pb-2">
                <i className="bi bi-ticket-perforated me-2"></i>ข้อมูลสลาก
              </h5>
              <div className="row g-2 mb-2">
                <div className="col-4 text-muted small">เลขสลาก:</div>
                <div className="col-8 fw-bold fs-5 text-primary">
                  {selectedBillDetail.lotto?.numbers}
                </div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-4 text-muted small">งวด/เล่ม:</div>
                <div className="col-8 fw-bold">
                  {selectedBillDetail.lotto?.roundNumber} /{" "}
                  {selectedBillDetail.lotto?.bookNumber}
                </div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-4 text-muted small">ราคาขาย:</div>
                <div className="col-8 fw-bold text-dark">
                  ฿{selectedBillDetail.price?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* ส่วนข้อมูลลูกค้า */}
            <div className="alert alert-secondary border-0 shadow-sm rounded-4 mb-3 bg-light">
              <h5 className="alert-heading fw-bold mb-3 border-bottom pb-2 text-dark">
                <i className="bi bi-person-lines-fill me-2"></i>ข้อมูลลูกค้า
              </h5>
              <div className="row g-2 mb-2">
                <div className="col-4 text-muted small">ชื่อลูกค้า:</div>
                <div className="col-8 fw-bold text-dark">
                  {selectedBillDetail.billSale?.customerName || "-"}
                </div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-4 text-muted small">เบอร์โทร:</div>
                <div className="col-8 fw-bold text-dark">
                  {selectedBillDetail.billSale?.customerPhone || "-"}
                </div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-4 text-muted small">ที่อยู่จัดส่ง:</div>
                <div className="col-8 text-dark small">
                  {selectedBillDetail.billSale?.customerAddress || "-"}
                </div>
              </div>
            </div>

            {/* ส่วนข้อมูลการโอนเงิน */}
            <div className="alert alert-success border-0 shadow-sm rounded-4 mb-0">
              <h5 className="alert-heading fw-bold mb-3 border-bottom pb-2">
                <i className="bi bi-check-circle-fill me-2"></i>
                ประวัติการโอนเงิน
              </h5>
              <div className="row g-2 mb-2">
                <div className="col-4 text-muted small">วันที่โอน:</div>
                <div className="col-8 fw-bold">
                  {selectedBillDetail.billSale?.payDate
                    ? dayjs(selectedBillDetail.billSale.payDate).format(
                        "DD/MM/YYYY",
                      )
                    : "-"}
                </div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-4 text-muted small">เวลาที่โอน:</div>
                <div className="col-8 fw-bold">
                  {selectedBillDetail.billSale?.payTime || "-"}
                </div>
              </div>
              <div className="row g-2 mb-0">
                <div className="col-4 text-muted small">หมายเหตุ:</div>
                <div className="col-8 small">
                  {selectedBillDetail.billSale?.payRemark || "-"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-4 text-muted">
            <div
              className="spinner-border text-primary mb-2"
              role="status"
            ></div>
            <div>กำลังโหลดข้อมูล...</div>
          </div>
        )}
      </MyModal>
    </>
  );
}

export default ReportProfit;
