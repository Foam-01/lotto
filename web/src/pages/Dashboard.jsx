import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Home from "./Home";
import dayjs from "dayjs";
import ReportService from "../services/report.service";
import BillSaleService from "../services/bill-sale.service";
import LottoService from "../services/lotto.service";
import { PageHeader } from "../components/shared/PageHeader";

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // 🌟 State สำหรับเก็บข้อมูล KPI ทั้งหมด
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalProfit: 0,
    availableLottos: 0,
    soldLottos: 0,
    pendingPayment: 0,
    pendingDelivery: 0,
    shopBonusPrize: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      // 🌟 ดึงข้อมูลรายเดือน (ตั้งแต่วันที่ 1 ถึงวันสุดท้ายของเดือนปัจจุบัน)
      const fromDate = dayjs().startOf("month").format("YYYY-MM-DD");
      const toDate = dayjs().endOf("month").format("YYYY-MM-DD");
      const payload = { fromDate, toDate };

      // 🌟 ยิง API พร้อมกันทุกเส้นด้วย Promise.allSettled (ถ้าเส้นไหนพัง เส้นอื่นยังทำงานต่อได้)
      const [
        incomeRes,
        profitRes,
        lottoAllRes,
        billSalesRes,
        lottoSendRes,
        shopBonusRes,
      ] = await Promise.allSettled([
        ReportService.getIncome(payload),
        ReportService.getProfit(payload),
        LottoService.getList(),
        BillSaleService.getBillSales(),
        BillSaleService.getLottoForSend(),
        LottoService.lottoIsBonuslist(),
      ]);

      // 1️⃣ คำนวณรายได้รวม (จากบิลที่ขายได้)
      let income = 0;
      if (incomeRes.status === "fulfilled" && incomeRes.value.data.results) {
        income = incomeRes.value.data.results.reduce(
          (sum, item) => sum + (item.price || 0),
          0,
        );
      }

      // 2️⃣ คำนวณกำไรสุทธิ (ราคาขาย - ต้นทุน + รางวัลที่แผงถูกเอง)
      let profit = 0;
      if (profitRes.status === "fulfilled" && profitRes.value.data) {
        const billDetails = profitRes.value.data.billSaleDetails || [];
        const bonusList = profitRes.value.data.lottoIsBonus || [];
        let sale = 0;
        let cost = 0;
        billDetails.forEach((item) => {
          sale += item.price || 0;
          cost += item.lotto?.cost || 0;
        });
        const bonus = bonusList.reduce(
          (sum, item) => sum + (item.BonusResultDetail?.price || 0),
          0,
        );
        profit = sale - cost + bonus;
      }

      // 3️⃣ นับสต๊อกสลาก (พร้อมขาย & ขายแล้ว)
      let available = 0;
      let sold = 0;
      if (lottoAllRes.status === "fulfilled" && lottoAllRes.value.data.result) {
        const allLottos = lottoAllRes.value.data.result;
        available = allLottos.filter((l) => !l.inSale).length;
        sold = allLottos.filter((l) => l.inSale).length;
      }

      // 4️⃣ นับบิลรอชำระเงิน (บิลที่ยังไม่มีวันที่ชำระเงิน payDate)
      let pPayment = 0;
      if (
        billSalesRes.status === "fulfilled" &&
        billSalesRes.value.data.result
      ) {
        pPayment = billSalesRes.value.data.result.filter(
          (b) => !b.payDate,
        ).length;
      }

      // 5️⃣ นับบิลรอจัดส่ง (สลากตัวจริง)
      let pDelivery = 0;
      if (
        lottoSendRes.status === "fulfilled" &&
        lottoSendRes.value.data.results
      ) {
        pDelivery = lottoSendRes.value.data.results.length;
      }

      // 6️⃣ นับเงินรางวัลที่แผงถูกเอง
      let sBonus = 0;
      if (
        shopBonusRes.status === "fulfilled" &&
        shopBonusRes.value.data.results
      ) {
        sBonus = shopBonusRes.value.data.results.reduce(
          (sum, item) => sum + (item.BonusResultDetail?.price || 0),
          0,
        );
      }

      // 🌟 อัปเดตลง State ทีเดียวจบ
      setStats({
        totalIncome: income,
        totalProfit: profit,
        availableLottos: available,
        soldLottos: sold,
        pendingPayment: pPayment,
        pendingDelivery: pDelivery,
        shopBonusPrize: sBonus,
      });
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 อัตราการขาย (Sell-through Rate) — คำนวณครั้งเดียว ใช้ทั้งข้อความและ progress bar
  const totalStock = stats.availableLottos + stats.soldLottos;
  const sellThroughRate =
    totalStock > 0 ? Math.round((stats.soldLottos / totalStock) * 100) : 0;

  return (
    <Home>
      <div
        className="container-fluid px-3 px-md-4 pb-4 pt-3"
        style={styles.page}
      >
        <div className="position-relative z-2">
          <PageHeader
            eyebrow="ภาพรวม"
            title="ภาพรวมแผงแมวส้ม"
            description="สรุปยอดขาย กำไร และสถานะสต๊อกสลากประจำเดือนนี้"
            actions={
              <div
                className="text-muted small fw-semibold px-3 py-2"
                style={{
                  backgroundColor: "var(--color-white)",
                  border: "1px solid var(--slate-200)",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                ข้อมูลเดือนนี้: {dayjs().format("MMMM YYYY")}
              </div>
            }
          />
        </div>

        {isLoading ? (
          <div className="text-center py-5 position-relative z-2">
            <div
              className="spinner-border text-warning"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            ></div>
            <h5 className="mt-3 text-muted fw-bold">
              กำลังรวบรวมข้อมูลแผง...
            </h5>
          </div>
        ) : loadError ? (
          <div className="text-center py-5 position-relative z-2">
            <div style={{ fontSize: "3.5rem" }}>😿</div>
            <h5 className="mt-3 text-muted fw-bold">
              ไม่สามารถโหลดข้อมูลภาพรวมได้
            </h5>
            <p className="text-muted mb-3">
              อาจเป็นเพราะอินเทอร์เน็ตหลุดหรือระบบขัดข้องชั่วคราว
            </p>
            <button
              type="button"
              className="btn rounded-pill px-4 fw-bold shadow-sm"
              style={{ backgroundColor: "var(--brand-600)", color: "white" }}
              onClick={fetchDashboardData}
            >
              <i className="bi bi-arrow-clockwise me-2"></i> ลองใหม่
            </button>
          </div>
        ) : (
          <div className="position-relative z-2">
            {/* 🌟 1. Financial KPIs (รายได้และกำไร) */}
            <div className="row g-4 mb-4">
              <div className="col-12 col-md-6 col-xl-4">
                <div
                  className="card border h-100"
                  style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
                >
                  <div className="card-body p-4">
                    <p className="fw-semibold mb-1" style={{ color: "var(--slate-500)", fontSize: "13px" }}>
                      รายได้รวมเดือนนี้
                    </p>
                    <h2 className="fw-bold mb-0" style={{ color: "var(--green-700)" }}>
                      ฿{stats.totalIncome.toLocaleString()}
                    </h2>
                    <div className="mt-3">
                      <Link
                        to="/reportIncome"
                        className="fw-semibold"
                        style={{ color: "var(--blue-700)", fontSize: "13px", textDecoration: "none" }}
                      >
                        ดูรายงานรายได้ &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 col-xl-4">
                <div
                  className="card border h-100"
                  style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
                >
                  <div className="card-body p-4">
                    <p className="fw-semibold mb-1" style={{ color: "var(--slate-500)", fontSize: "13px" }}>
                      กำไรสุทธิเดือนนี้
                    </p>
                    <h2 className="fw-bold mb-0" style={{ color: "var(--green-700)" }}>
                      ฿{stats.totalProfit.toLocaleString()}
                    </h2>
                    <div className="mt-3">
                      <Link
                        to="/reportProfit"
                        className="fw-semibold"
                        style={{ color: "var(--blue-700)", fontSize: "13px", textDecoration: "none" }}
                      >
                        ดูรายงานกำไร &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-4">
                <div
                  className="card border h-100"
                  style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
                >
                  <div className="card-body p-4 d-flex flex-column justify-content-center">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-semibold mb-0" style={{ color: "var(--slate-500)", fontSize: "13px" }}>
                        เงินรางวัลแผงถูกเอง
                      </h6>
                      <span
                        style={{
                          backgroundColor: "var(--blue-50)",
                          color: "var(--blue-700)",
                          fontSize: "12px",
                          fontWeight: 700,
                          padding: "3px 12px",
                          borderRadius: "var(--radius-pill)",
                        }}
                      >
                        รอบล่าสุด
                      </span>
                    </div>
                    <h2 className="fw-bold mb-0" style={{ color: "var(--slate-900)" }}>
                      ฿{stats.shopBonusPrize.toLocaleString()}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 2. Task Alerts (งานที่ต้องทำด่วน) */}
            <div className="row g-4 mb-4">
              <div className="col-12 col-md-6">
                <Link to="/billSale" style={{ textDecoration: "none" }}>
                  <div
                    className="card border h-100"
                    style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="card-body p-4 d-flex align-items-center justify-content-between">
                      <div>
                        <h5 className="fw-bold mb-1" style={{ color: "var(--slate-900)", fontSize: "16px" }}>รอชำระเงิน</h5>
                        <p className="text-muted mb-0 small">
                          ลูกค้าทำรายการจองไว้แต่ยังไม่โอนเงิน
                        </p>
                      </div>
                      <div className="text-end">
                        <h2 className="fw-bold mb-0" style={{ color: "var(--red-600)" }}>
                          {stats.pendingPayment}
                        </h2>
                        <span className="text-muted small">รายการ</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="col-12 col-md-6">
                <Link to="/lottoForSend" style={{ textDecoration: "none" }}>
                  <div
                    className="card border h-100"
                    style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="card-body p-4 d-flex align-items-center justify-content-between">
                      <div>
                        <h5 className="fw-bold mb-1" style={{ color: "var(--slate-900)", fontSize: "16px" }}>
                          รอจัดส่งพัสดุ
                        </h5>
                        <p className="text-muted mb-0 small">
                          สลากตัวจริงที่ลูกค้าต้องการให้ส่งไปรษณีย์
                        </p>
                      </div>
                      <div className="text-end">
                        <h2 className="fw-bold mb-0" style={{ color: "var(--blue-700)" }}>
                          {stats.pendingDelivery}
                        </h2>
                        <span className="text-muted small">รายการ</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* 🌟 3. Stock Overview (สถานะสลากบนแผง) */}
            <div
              className="card border bg-white overflow-hidden"
              style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center" style={{ borderColor: "var(--slate-100)" }}>
                <h5 className="fw-bold mb-0" style={{ color: "var(--slate-900)", fontSize: "16px" }}>
                  สถานะสลากบนแผง
                </h5>
                <Link
                  to="/lotto"
                  className="btn btn-sm px-3 fw-semibold"
                  style={styles.btnOutlineOrange}
                >
                  จัดการสต๊อก
                </Link>
              </div>
              <div className="card-body p-4">
                <div className="row text-center g-4">
                  <div className="col-6 col-md-4 border-end">
                    <p className="text-muted fw-bold mb-1 small text-uppercase">
                      พร้อมขาย
                    </p>
                    <h2 className="fw-bold text-success mb-0">
                      {stats.availableLottos.toLocaleString()}
                    </h2>
                    <span className="text-muted small">ใบ</span>
                  </div>
                  <div className="col-6 col-md-4 border-end">
                    <p className="text-muted fw-bold mb-1 small text-uppercase">
                      ขายแล้ว
                    </p>
                    <h2 className="fw-bold text-secondary mb-0">
                      {stats.soldLottos.toLocaleString()}
                    </h2>
                    <span className="text-muted small">ใบ</span>
                  </div>
                  <div className="col-6 col-md-4">
                    <p className="text-muted fw-bold mb-1 small text-uppercase">
                      รวมทั้งหมด
                    </p>
                    <h2 className="fw-bold text-dark mb-0">
                      {(
                        stats.availableLottos + stats.soldLottos
                      ).toLocaleString()}
                    </h2>
                    <span className="text-muted small">ใบ</span>
                  </div>
                </div>

                {/* Progress Bar แสดงอัตราการขาย */}
                <div className="mt-4">
                  <div className="d-flex justify-content-between small fw-bold mb-2">
                    <span className="text-muted">
                      อัตราการขาย (Sell-through Rate)
                    </span>
                    <span style={{ color: "var(--blue-700)" }}>{sellThroughRate}%</span>
                  </div>
                  <div
                    className="progress"
                    style={{
                      height: "10px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: "var(--slate-100)",
                    }}
                  >
                    <div
                      className="progress-bar"
                      role="progressbar"
                      aria-valuenow={sellThroughRate}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{
                        width: `${sellThroughRate}%`,
                        backgroundColor: "var(--blue-500, #3b82f6)",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Home>
  );
}

// 🟠 CSS Styles
const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "'Kanit', sans-serif",
    backgroundColor: "var(--slate-50)",
  },
  btnOutlineOrange: {
    color: "var(--slate-600)",
    border: "1px solid var(--slate-200)",
    backgroundColor: "var(--color-white)",
    borderRadius: "var(--radius-sm)",
  },
};

export default Dashboard;
