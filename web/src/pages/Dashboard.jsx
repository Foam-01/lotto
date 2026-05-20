import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Home from "./Home";
import dayjs from "dayjs";
import ReportService from "../services/report.service";
import BillSaleService from "../services/bill-sale.service";
import LottoService from "../services/lotto.service";

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

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
        available = allLottos.filter((l) => l.inSale !== 1).length;
        sold = allLottos.filter((l) => l.inSale === 1).length;
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Home>
      <div
        className="container-fluid px-3 px-md-4 pb-4 pt-3"
        style={styles.page}
      >
        <div className="sunburst-bg"></div>
        <div className="bg-pattern"></div>

        {/* 🌟 Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 mt-2 position-relative z-2">
          <div
            className="h3 mb-0 fw-bold d-flex align-items-center"
            style={{ color: "#ea580c" }}
          >
            <div
              className="d-flex justify-content-center align-items-center rounded-3 me-3 shadow-sm"
              style={{
                width: "45px",
                height: "45px",
                backgroundColor: "#ea580c",
                color: "white",
              }}
            >
              <i className="bi bi-speedometer2 fs-5"></i>
            </div>
            ภาพรวมแผงแมวส้ม 📊
          </div>
          <div className="text-muted small fw-bold bg-white px-3 py-2 rounded-pill shadow-sm">
            <i className="bi bi-calendar-event me-2 text-orange"></i>
            ข้อมูลเดือนนี้: {dayjs().format("MMMM YYYY")}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5 position-relative z-2">
            <div
              className="spinner-border text-warning"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            ></div>
            <h5 className="mt-3 text-muted fw-bold">
              กำลังรวบรวมข้อมูลแผง... 🐈
            </h5>
          </div>
        ) : (
          <div className="position-relative z-2">
            {/* 🌟 1. Financial KPIs (รายได้และกำไร) */}
            <div className="row g-4 mb-4">
              <div className="col-12 col-md-6 col-xl-4">
                <div
                  className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
                  style={styles.cardIncome}
                >
                  <div className="card-body p-4 position-relative">
                    <i
                      className="bi bi-wallet2 position-absolute opacity-25"
                      style={styles.cardBgIcon}
                    ></i>
                    <p className="fw-bold mb-1 fs-6" style={{ color: "#fff" }}>
                      รายได้รวมเดือนนี้
                    </p>
                    <h2 className="fw-bold mb-0" style={{ color: "#fff" }}>
                      ฿{stats.totalIncome.toLocaleString()}
                    </h2>
                    <div className="mt-3">
                      <Link
                        to="/reportIncome"
                        className="btn btn-sm btn-light rounded-pill px-3 fw-bold text-success shadow-sm"
                      >
                        ดูรายงานรายได้{" "}
                        <i className="bi bi-arrow-right-short"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 col-xl-4">
                <div
                  className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
                  style={styles.cardProfit}
                >
                  <div className="card-body p-4 position-relative">
                    <i
                      className="bi bi-graph-up-arrow position-absolute opacity-25"
                      style={styles.cardBgIcon}
                    ></i>
                    <p
                      className="fw-bold mb-1 fs-6"
                      style={{ color: "#064e3b" }}
                    >
                      กำไรสุทธิเดือนนี้
                    </p>
                    <h2 className="fw-bold mb-0" style={{ color: "#064e3b" }}>
                      ฿{stats.totalProfit.toLocaleString()}
                    </h2>
                    <div className="mt-3">
                      <Link
                        to="/reportProfit"
                        className="btn btn-sm bg-white rounded-pill px-3 fw-bold text-success shadow-sm border-0"
                      >
                        ดูรายงานกำไร <i className="bi bi-arrow-right-short"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white">
                  <div className="card-body p-4 d-flex flex-column justify-content-center">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-bold mb-0" style={{ color: "#9333ea" }}>
                        <i className="bi bi-stars me-2"></i>เงินรางวัลแผงถูกเอง
                      </h6>
                      <span
                        className="badge rounded-pill"
                        style={{
                          backgroundColor: "#fdf4ff",
                          color: "#c026d3",
                        }}
                      >
                        รอบล่าสุด
                      </span>
                    </div>
                    <h2 className="fw-bold mb-0" style={{ color: "#a21caf" }}>
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
                    className="card border-0 shadow-sm rounded-4 h-100 transition-hover"
                    style={{
                      backgroundColor: "#fff",
                      borderLeft: "6px solid #ef4444",
                    }}
                  >
                    <div className="card-body p-4 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex justify-content-center align-items-center"
                          style={{
                            width: "55px",
                            height: "55px",
                            backgroundColor: "#fee2e2",
                            color: "#ef4444",
                          }}
                        >
                          <i className="bi bi-clock-history fs-3"></i>
                        </div>
                        <div>
                          <h5 className="fw-bold text-dark mb-1">รอชำระเงิน</h5>
                          <p className="text-muted mb-0 small">
                            ลูกค้าทำรายการจองไว้แต่ยังไม่โอนเงิน
                          </p>
                        </div>
                      </div>
                      <div className="text-end">
                        <h2 className="fw-bold mb-0 text-danger">
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
                    className="card border-0 shadow-sm rounded-4 h-100 transition-hover"
                    style={{
                      backgroundColor: "#fff",
                      borderLeft: "6px solid #3b82f6",
                    }}
                  >
                    <div className="card-body p-4 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex justify-content-center align-items-center"
                          style={{
                            width: "55px",
                            height: "55px",
                            backgroundColor: "#eff6ff",
                            color: "#3b82f6",
                          }}
                        >
                          <i className="bi bi-box-seam fs-3"></i>
                        </div>
                        <div>
                          <h5 className="fw-bold text-dark mb-1">
                            รอจัดส่งพัสดุ
                          </h5>
                          <p className="text-muted mb-0 small">
                            สลากตัวจริงที่ลูกค้าต้องการให้ส่งไปรษณีย์
                          </p>
                        </div>
                      </div>
                      <div className="text-end">
                        <h2 className="fw-bold mb-0 text-primary">
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
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-ticket-detailed me-2 text-orange"></i>
                  สถานะสลากบนแผง
                </h5>
                <Link
                  to="/lotto"
                  className="btn btn-sm rounded-pill px-3 fw-bold"
                  style={styles.btnOutlineOrange}
                >
                  จัดการสต๊อก
                </Link>
              </div>
              <div className="card-body p-4">
                <div className="row text-center g-4">
                  <div className="col-4 border-end">
                    <p className="text-muted fw-bold mb-1 small text-uppercase">
                      พร้อมขาย
                    </p>
                    <h2 className="fw-bold text-success mb-0">
                      {stats.availableLottos.toLocaleString()}
                    </h2>
                    <span className="text-muted small">ใบ</span>
                  </div>
                  <div className="col-4 border-end">
                    <p className="text-muted fw-bold mb-1 small text-uppercase">
                      ขายแล้ว
                    </p>
                    <h2 className="fw-bold text-secondary mb-0">
                      {stats.soldLottos.toLocaleString()}
                    </h2>
                    <span className="text-muted small">ใบ</span>
                  </div>
                  <div className="col-4">
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
                    <span className="text-orange">
                      {stats.availableLottos + stats.soldLottos > 0
                        ? Math.round(
                            (stats.soldLottos /
                              (stats.availableLottos + stats.soldLottos)) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div
                    className="progress"
                    style={{
                      height: "12px",
                      borderRadius: "10px",
                      backgroundColor: "#ffedd5",
                    }}
                  >
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      style={{
                        width: `${
                          stats.availableLottos + stats.soldLottos > 0
                            ? (stats.soldLottos /
                                (stats.availableLottos + stats.soldLottos)) *
                              100
                            : 0
                        }%`,
                        backgroundColor: "#ea580c",
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
  },
  cardIncome: {
    background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
  },
  cardProfit: {
    background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
  },
  cardBgIcon: {
    fontSize: "8rem",
    right: "-15px",
    bottom: "-25px",
    color: "#fff",
  },
  btnOutlineOrange: {
    color: "#ea580c",
    border: "1px solid #ea580c",
    backgroundColor: "transparent",
  },
};

export default Dashboard;
