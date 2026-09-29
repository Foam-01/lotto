import { useEffect, useState } from "react";
import Home from "./Home";
import Swal from "sweetalert2";
import LottoService from "../services/lotto.service";
import { PageHeader } from "../components/shared/PageHeader";

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
          <PageHeader
            eyebrow="ผลรางวัล"
            title="รางวัลของร้าน"
            description="รายการสลากที่แผงถือไว้แล้วถูกรางวัลเอง"
            count={`${totalTickets} ใบ`}
          />

          <div className="row g-3 mb-4">
            {[
              {
                label: "จำนวนสลากที่ถูกรางวัล",
                value: totalTickets.toLocaleString(),
                suffix: "ใบ",
              },
              {
                label: "ยอดเงินรางวัลรวม",
                value: totalPrizeAmount.toLocaleString("th-TH"),
                suffix: "฿",
                accent: "var(--green-700)",
              },
            ].map((kpi, i) => (
              <div className="col-12 col-md-6" key={i}>
                <div
                  className="card border h-100"
                  style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
                >
                  <div className="card-body">
                    <p
                      className="mb-1 fw-semibold"
                      style={{ color: "var(--slate-500)", fontSize: "13px" }}
                    >
                      {kpi.label}
                    </p>
                    <h3 className="fw-bold mb-0" style={{ color: kpi.accent || "var(--slate-900)" }}>
                      {kpi.value}{" "}
                      <span className="fs-6 fw-normal text-muted">{kpi.suffix}</span>
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 🌟 ตารางแสดงรายการสลากที่ถูกรางวัล 🌟 */}
          <div
            className="card border overflow-hidden bg-white"
            style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: "var(--slate-50)" }}>
                    <tr>
                      <th
                        className="px-4 py-3 border-0 text-center"
                        style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}
                      >
                        งวดประจำวันที่
                      </th>
                      <th
                        className="px-4 py-3 border-0 text-center"
                        style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}
                      >
                        เลขที่ถูกรางวัล
                      </th>
                      <th
                        className="px-4 py-3 border-0 text-center"
                        style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}
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

                          <td className="px-4 py-3 text-center">
                            <span
                              className="fw-bold"
                              style={{ color: "var(--blue-700)", fontSize: "15px", letterSpacing: "1px" }}
                            >
                              {item.BonusResultDetail?.number}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span
                              className="fw-bold"
                              style={{ color: "var(--green-700)", fontSize: "15px" }}
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
