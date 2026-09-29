import Home from "./Home";
import ReportService from "../services/report.service";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import MyModal from "../components/MyModal";
import { PageHeader } from "../components/shared/PageHeader";
import { FilterBar, FilterBarButton } from "../components/shared/FilterBar";

function ReportProfit() {
  const [billSaleDetails, setBillSaleDetails] = useState([]);
  const [lottoIsBonus, setLottoIsBonus] = useState([]);
  const [summary, setSummary] = useState({
    totalSale: 0,
    totalCost: 0,
    profitFromSale: 0,
    totalBonus: 0,
    grandTotal: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 State สำหรับจัดการ Modal
  const [selectedBillDetail, setSelectedBillDetail] = useState(null); // เก็บข้อมูลสลากที่ถูกคลิก

  // 🌟 ค่าเริ่มต้นเปิดหน้ามาให้เห็นข้อมูลตั้งแต่ต้นปี (1 ม.ค.) ถึงวันนี้ ผู้ใช้ยังเลือกช่วงเองได้ตามปกติ
  const [fromDate, setFromDate] = useState(dayjs().startOf("year").format("YYYY-MM-DD"));
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
        // 🌟 ใช้ตัวเลขสรุปที่ backend คำนวณมาให้แล้ว (summary) แทนการคำนวณซ้ำฝั่งนี้
        // เพื่อให้สูตรกำไรมีอยู่ที่เดียว ไม่เสี่ยงเพี้ยนถ้าวันหลังมีใครแก้สูตรแค่ฝั่งเดียว
        setSummary(
          res.data.summary || {
            totalSale: 0,
            totalCost: 0,
            profitFromSale: 0,
            totalBonus: 0,
            grandTotal: 0,
          },
        );
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลกำไรได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "var(--brand-600)",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          style={{ backgroundColor: "var(--slate-50)", minHeight: "100vh" }}
        >
          <PageHeader
            eyebrow="รายงาน"
            title="สรุปผลกำไร"
            description="ดูกำไรจากการขายสลาก และเงินรางวัลที่แผงถูกเอง ตามช่วงเวลาที่เลือก"
          />

          <FilterBar
            actions={
              <FilterBarButton
                variant="primary"
                icon="bi-search"
                onClick={fetchData}
              >
                คำนวณกำไร
              </FilterBarButton>
            }
          >
            <label
              htmlFor="profitFromDate"
              className="fw-bold text-secondary small mb-0"
            >
              ตั้งแต่
            </label>
            <input
              id="profitFromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              type="date"
              className="form-control form-control-sm rounded-pill border"
              style={{ width: "auto" }}
            />
            <label
              htmlFor="profitToDate"
              className="fw-bold text-secondary small mb-0"
            >
              ถึง
            </label>
            <input
              id="profitToDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              type="date"
              className="form-control form-control-sm rounded-pill border"
              style={{ width: "auto" }}
            />
          </FilterBar>

          <div className="row g-4 mb-4">
            {[
              {
                label: "กำไรจากการขาย (หักทุนแล้ว)",
                value: `+ ${summary.profitFromSale.toLocaleString("th-TH")}`,
                sub: `ขายได้ ${billSaleDetails.length} ใบ`,
                accent: "var(--blue-700)",
              },
              {
                label: "เงินรางวัลแผงถูกเอง",
                value: `+ ${summary.totalBonus.toLocaleString("th-TH")}`,
                sub: `ถูกรางวัล ${lottoIsBonus.length} ใบ`,
                accent: "#a21caf",
              },
              {
                label: "กำไรสุทธิรวมทั้งหมด",
                value: summary.grandTotal.toLocaleString("th-TH"),
                sub: "ยอดรวมสุทธิ",
                accent: "var(--green-700)",
              },
            ].map((kpi, i) => (
              <div className="col-12 col-md-4" key={i}>
                <div
                  className="card border h-100"
                  style={{
                    backgroundColor: "var(--color-white)",
                    borderColor: "var(--slate-200)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div className="card-body">
                    <p
                      className="mb-1 fw-semibold"
                      style={{ color: "var(--slate-500)", fontSize: "13px" }}
                    >
                      {kpi.label}
                    </p>
                    <h3 className="fw-bold mb-0" style={{ color: kpi.accent }}>
                      {kpi.value}{" "}
                      <span className="fs-6 fw-normal text-muted">฿</span>
                    </h3>
                    <div
                      className="small fw-medium mt-2"
                      style={{ color: "var(--slate-500)" }}
                    >
                      {kpi.sub}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 🌟 2 ตารางด้านล่าง แบ่งครึ่งซ้ายขวา */}
          <div className="row g-4">
            {/* --- ตารางฝั่งซ้าย: ประวัติการขาย --- */}
            <div className="col-12 col-xl-7">
              <div
                className="card border overflow-hidden bg-white h-100"
                style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
              >
                <div className="card-header bg-white border-0 pt-4 pb-2">
                  <h5 className="fw-bold mb-0" style={{ color: "var(--slate-900)", fontSize: "16px" }}>
                    รายการขาย (ลูกค้า)
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
                          backgroundColor: "var(--slate-50)",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                        }}
                      >
                        <tr>
                          <th scope="col" className="px-3 py-3 border-0" style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}>
                            เลขสลาก
                          </th>
                          <th scope="col" className="px-3 py-3 border-0" style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}>
                            ทุน
                          </th>
                          <th scope="col" className="px-3 py-3 border-0" style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}>
                            ขาย
                          </th>
                          <th scope="col" className="px-3 py-3 border-0" style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}>
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
                          billSaleDetails.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <button
                                  className="btn btn-sm fw-semibold px-3"
                                  data-bs-toggle="modal"
                                  data-bs-target="#modalSaleDetail"
                                  onClick={() => handleOpenDetailModal(item)}
                                  style={{
                                    background: "var(--color-white)",
                                    color: "var(--blue-700)",
                                    border: "1px solid var(--slate-200)",
                                    borderRadius: "var(--radius-sm)",
                                    fontSize: "13px",
                                  }}
                                >
                                  {item.lotto?.numbers}
                                </button>
                              </td>
                              <td className="text-muted">
                                ฿{item.lotto?.cost}
                              </td>
                              <td className="text-dark">฿{item.price}</td>
                              <td className="fw-bold" style={{ color: "var(--green-700)" }}>
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
              <div
                className="card border overflow-hidden bg-white h-100"
                style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
              >
                <div className="card-header bg-white border-0 pt-4 pb-2">
                  <h5 className="fw-bold mb-0" style={{ color: "var(--slate-900)", fontSize: "16px" }}>
                    แผงถูกรางวัล
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
                          backgroundColor: "var(--slate-50)",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                        }}
                      >
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-3 border-0"
                            style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}
                          >
                            เลขสลาก
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3 border-0"
                            style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}
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
                          lottoIsBonus.map((item) => (
                            <tr key={item.id}>
                              <td className="fw-bold" style={{ color: "var(--blue-700)", fontSize: "15px" }}>
                                {item.BonusResultDetail?.number}
                              </td>
                              <td
                                className="fw-bold"
                                style={{ color: "var(--green-700)", fontSize: "15px" }}
                              >
                                + ฿
                                {item.BonusResultDetail?.price?.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="py-5 text-muted">
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
      <MyModal id="modalSaleDetail" title="รายละเอียดการขาย (ใบเสร็จ)">
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
              className="spinner-border text-warning mb-2"
              role="status"
            >
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <div>กำลังโหลดข้อมูล...</div>
          </div>
        )}
      </MyModal>
    </>
  );
}

export default ReportProfit;
