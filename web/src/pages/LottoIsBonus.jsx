import { useEffect, useState } from "react";
import Home from "./Home";
import Swal from "sweetalert2";
import LottoService from "../services/lotto.service";

function LottoIsBonus() {
  const [lottoisbonus, setLottoisbonus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      await handleLottoIsBonus(); // 1. สั่งรันอัปเดตตรวจรางวัลก่อน
      await fetchData(); // 2. ค่อยดึงข้อมูลล่าสุดมาแสดง
      setIsLoading(false);
    };

    initData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await LottoService.lottoIsBonuslist();
      if (res.data.results !== undefined) {
        setLottoisbonus(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลสลากได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "var(--brand-600)",
      });
    }
  };

  const handleLottoIsBonus = async () => {
    try {
      await LottoService.lottoIsBonus();
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลสลากได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonColor: "var(--brand-600)",
      });
    }
  };

  // 🌟 คำนวณสรุปยอดรางวัลที่ร้านถูก
  const totalTickets = lottoisbonus.length;
  const totalPrizeAmount = lottoisbonus.reduce((sum, item) => {
    return sum + (item.BonusResultDetail?.price || 0);
  }, 0);

  return (
    <>
      <Home>
        <div className="container-fluid px-3 px-md-4 pb-4 pt-3">
          {/* 🌟 Header แบบคลีนๆ มินิมอล */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
            <h1 className="h3 mb-0 fw-bold" style={{ color: "var(--brand-600)" }}>
              รายงานรางวัลของร้าน
            </h1>
          </div>

          {/* 🌟 KPI Dashboard สรุปยอดที่ร้านถูกรางวัล 🌟 */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <div
                className="card border-0 shadow-sm rounded-4 h-100"
                style={{
                  backgroundColor: "var(--brand-tint)",
                  borderBottom: "4px solid var(--brand-600)",
                }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 fw-bold fs-6">
                        จำนวนสลากที่ถูกรางวัล
                      </p>
                      <h3 className="fw-bold mb-0" style={{ color: "var(--brand-600)" }}>
                        {totalTickets}{" "}
                        <span className="fs-6 fw-normal text-muted">ใบ</span>
                      </h3>
                    </div>
                    <div
                      className="rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "var(--brand-600)",
                        color: "var(--color-white)",
                      }}
                    >
                      <i className="bi bi-ticket-detailed-fill fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div
                className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden"
                style={{
                  backgroundColor: "var(--emerald-50)",
                  borderBottom: "4px solid var(--emerald-500)",
                }}
              >
                <i
                  className="bi bi-cash-stack position-absolute opacity-25"
                  style={{
                    fontSize: "6rem",
                    right: "-10px",
                    bottom: "-20px",
                    color: "var(--emerald-400)",
                  }}
                ></i>
                <div className="card-body position-relative z-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p
                        className="text-muted mb-1 fw-bold fs-6"
                        style={{ color: "var(--emerald-600)" }}
                      >
                        ยอดเงินรางวัลรวม
                      </p>
                      <h3 className="fw-bold mb-0" style={{ color: "var(--emerald-700)" }}>
                        {totalPrizeAmount.toLocaleString("th-TH")}{" "}
                        <span className="fs-5 fw-normal">฿</span>
                      </h3>
                    </div>
                    <div
                      className="rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "var(--emerald-500)",
                        color: "var(--color-white)",
                      }}
                    >
                      <i className="bi bi-piggy-bank-fill fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 ตารางแสดงรายการสลากที่ถูกรางวัล 🌟 */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead
                    style={{
                      backgroundColor: "var(--brand-100)",
                      borderBottom: "2px solid var(--brand-300)",
                    }}
                  >
                    <tr>
                      <th
                        className="px-4 py-3 border-0 text-center"
                        style={{ color: "var(--brand-700)", fontWeight: "700" }}
                      >
                        งวดประจำวันที่
                      </th>
                      <th
                        className="px-4 py-3 border-0 text-center"
                        style={{ color: "var(--brand-700)", fontWeight: "700" }}
                      >
                        เลขที่ถูกรางวัล
                      </th>
                      <th
                        className="px-4 py-3 border-0 text-center"
                        style={{ color: "var(--brand-700)", fontWeight: "700" }}
                      >
                        ยอดเงินรางวัล
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      /* ⏳ Loading State */
                      <tr>
                        <td colSpan="3" className="text-center py-5">
                          <div
                            className="spinner-border text-warning mb-3"
                            role="status"
                            style={{ width: "3rem", height: "3rem" }}
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <h5 className="text-muted fw-bold">
                            กำลังตรวจรางวัลให้ร้าน...
                          </h5>
                        </td>
                      </tr>
                    ) : lottoisbonus.length > 0 ? (
                      lottoisbonus.map((item, index) => (
                        <tr
                          key={index}
                          style={{ borderBottom: "1px solid var(--gray-100)" }}
                        >
                          {/* วันที่ */}
                          <td className="px-4 py-4 text-center text-muted fw-medium">
                            {item.BonusResultDetail?.bonusDate}
                          </td>

                          {/* เลขสลาก */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className="badge rounded-pill fs-5 shadow-sm bg-white"
                              style={{
                                color: "var(--brand-600)",
                                border: "1px dashed var(--brand-300)",
                                letterSpacing: "2px",
                              }}
                            >
                              🎟️ {item.BonusResultDetail?.number}
                            </span>
                          </td>

                          {/* ยอดเงิน (สีเขียว) */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className="fw-bold fs-5"
                              style={{
                                color: "var(--emerald-500)",
                                textShadow: "1px 1px 0px var(--emerald-100)",
                              }}
                            >
                              +{" "}
                              {item.BonusResultDetail?.price?.toLocaleString(
                                "th-TH",
                              )}{" "}
                              ฿
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      /* 🌟 Empty State สไตล์แมวอ้อน 🌟 */
                      <tr>
                        <td colSpan="3" className="text-center py-5">
                          <div className="text-muted d-flex flex-column align-items-center py-4">
                            <div style={{ fontSize: "4rem" }}>📭</div>
                            <span
                              className="fs-5 mt-3 fw-bold"
                              style={{ color: "var(--brand-700)" }}
                            >
                              งวดนี้ร้านเรายังไม่ถูกรางวัล
                            </span>
                            <span className="mt-1 text-secondary small">
                              ลองตรวจสอบผลรางวัลงวดถัดไป
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

export default LottoIsBonus;
