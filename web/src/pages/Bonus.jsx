import Swal from "sweetalert2";
import Home from "./Home";
import BonusService from "../services/bonus.service";
import { useEffect, useState } from "react";
import MyModal from "../components/MyModal";
import { PageHeader } from "../components/shared/PageHeader";

function Bonus() {
  const [bonusDetails, setBonusDetails] = useState([]);
  const [details, setDetails] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingBonus, setIsFetchingBonus] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await BonusService.getList(); // 🌟 ใช้ Service
      if (res.data.results !== undefined) {
        setBonusDetails(res.data.results);
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

  const handleGetBonus = async () => {
    setIsFetchingBonus(true);
    try {
      Swal.fire({
        title: "กำลังดึงข้อมูลสลาก...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await BonusService.getLatestBonus(); // 🌟 ใช้ Service

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text: res.data.message,
          timer: 2500,
          showConfirmButton: false,
        });
        fetchData();
      } else {
        Swal.fire({
          icon: "error",
          title: "แจ้งเตือน",
          text: res.data.message,
          confirmButtonColor: "var(--brand-600)",
        });
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "var(--brand-600)",
      });
    } finally {
      setIsFetchingBonus(false);
    }
  };

  const handleDetail = async (bonusDate) => {
    setSelectedDate(bonusDate);
    try {
      const res = await BonusService.getDetail(bonusDate); // 🌟 ใช้ Service
      if (res.data.results !== undefined) {
        setDetails(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "var(--brand-600)",
      });
    }
  };

  const prize1 = details.filter((d) => d.price === 6000000);
  const prize1Near = details.filter((d) => d.price === 100000);
  const prize2 = details.filter((d) => d.price === 200000);
  const prize3 = details.filter((d) => d.price === 80000);
  const prize4 = details.filter((d) => d.price === 40000);
  const prize5 = details.filter((d) => d.price === 20000);
  const prize3Digits = details.filter(
    (d) => d.price === 4000 && d.number.length === 3,
  );
  const front3 = prize3Digits.slice(0, 2);
  const back3 = prize3Digits.slice(2, 4);
  const back2 = details.filter(
    (d) => d.price === 2000 && d.number.length === 2,
  );

  // 🌟 PrizeBox อัปเกรดความน่ารัก ธีมแมวส้ม
  const PrizeBox = ({
    title,
    price,
    numbers,
    highlight = false,
    isBorderRight = false,
  }) => (
    <div
      className={`p-4 h-100 ${isBorderRight ? "border-end" : ""}`}
      style={{ borderColor: "var(--brand-100)" }}
    >
      <h5
        className="fw-bold mb-2"
        style={{ color: highlight ? "var(--brand-600)" : "var(--brand-800)" }}
      >
        {highlight && <i className="bi bi-star-fill me-2 text-warning"></i>}
        {title}
      </h5>
      <div
        className="badge rounded-pill mb-3 px-3 py-2"
        style={{
          backgroundColor: "var(--blue-50)",
          color: "var(--blue-700)",
          fontSize: "0.85rem",
          border: "1px solid var(--blue-100, var(--blue-50))",
        }}
      >
        รางวัลละ {price} บาท
      </div>
      <div className="d-flex flex-wrap gap-3">
        {numbers.length > 0 ? (
          numbers.map((n, i) => (
            <span
              key={i}
              className="fw-bold"
              style={{
                fontSize: highlight ? "2.5rem" : "1.25rem",
                color: highlight ? "var(--red-600)" : "#1e3a8a",
                letterSpacing: "2px",
                textShadow: highlight ? "2px 2px 0px var(--brand-200)" : "none", // เงาสีส้มอ่อน
              }}
            >
              {n.number}
            </span>
          ))
        ) : (
          <span className="text-muted fs-5">-</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Home>
        {/* 🌟 เพิ่ม container-fluid และ padding เพื่อแก้ปัญหาเนื้อหาชิดขอบซ้าย 🌟 */}
        <div className="container-fluid px-3 px-md-4 pb-4 pt-3">
          <PageHeader
            eyebrow="ผลรางวัล"
            title="ผลรางวัลสลากกินแบ่งฯ"
            description="ดึงผลรางวัลล่าสุดจากสำนักงานสลากฯ และดูผลรางวัลย้อนหลังแต่ละงวด"
            count={`${bonusDetails.length} งวด`}
            actions={
              <button
                onClick={handleGetBonus}
                disabled={isFetchingBonus}
                className="btn px-4 py-2"
                style={{
                  backgroundColor: "var(--blue-50)",
                  color: "var(--blue-700)",
                  border: "1px solid var(--blue-100, var(--blue-50))",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: "600",
                  fontSize: "14px",
                  opacity: isFetchingBonus ? 0.7 : 1,
                  cursor: isFetchingBonus ? "not-allowed" : "pointer",
                }}
              >
                ดึงผลรางวัลล่าสุด
              </button>
            }
          />

          <div
            className="card border overflow-hidden mb-4"
            style={{
              backgroundColor: "var(--color-white)",
              borderRadius: "var(--radius-lg)",
              borderColor: "var(--slate-200)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="card-body p-0">
              <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ backgroundColor: "var(--slate-50)" }}>
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 border-0"
                      style={{
                        color: "var(--slate-500)",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      งวดวันที่ออกรางวัล
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 border-0 text-end"
                      width="180px"
                      style={{
                        color: "var(--slate-500)",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="2" className="text-center py-5">
                        <div
                          className="spinner-border text-warning mb-2"
                          role="status"
                        >
                          <span className="visually-hidden">
                            กำลังโหลด...
                          </span>
                        </div>
                        <div className="text-muted fw-bold">
                          กำลังโหลดข้อมูล...
                        </div>
                      </td>
                    </tr>
                  ) : bonusDetails.length > 0 ? (
                    // 🌟 1. เพิ่มคำว่า index เข้ามาในวงเล็บตรงนี้ครับ
                    bonusDetails.map((item, index) => (
                      // 🌟 2. เปลี่ยนจาก item.id เป็น index ตรงนี้เลยครับ!
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div
                            className="fw-bold mb-1"
                            style={{ color: "var(--blue-700)", fontSize: "14px" }}
                          >
                            {item.bonusDate}
                          </div>
                          <span
                            style={{
                              backgroundColor: "var(--green-100)",
                              color: "var(--green-700)",
                              padding: "3px 12px",
                              borderRadius: "var(--radius-pill)",
                              fontSize: "12px",
                              fontWeight: "700",
                              display: "inline-block",
                            }}
                          >
                            ออกรางวัลเรียบร้อยแล้ว
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <button
                            onClick={() => handleDetail(item.bonusDate)}
                            data-bs-toggle="modal"
                            data-bs-target="#myModal"
                            className="btn px-3 py-2 text-nowrap"
                            style={{
                              background: "var(--color-white)",
                              color: "var(--slate-600)",
                              border: "1px solid var(--slate-200)",
                              borderRadius: "var(--radius-sm)",
                              fontWeight: "600",
                              fontSize: "13px",
                            }}
                          >
                            ดูผลรางวัล
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    /* 🌟 Empty State สไตล์แมวอ้อน 🌟 */
                    <tr>
                      <td colSpan="2" className="text-center py-5">
                        <div className="text-muted d-flex flex-column align-items-center">
                          <div style={{ fontSize: "4rem" }}>📭</div>
                          <span
                            className="fs-5 mt-2 fw-bold"
                            style={{ color: "var(--brand-700)" }}
                          >
                            ยังไม่มีข้อมูลผลรางวัลในระบบ
                          </span>
                          <span className="small mt-1 text-secondary">
                            กดปุ่ม "ดึงผลรางวัลล่าสุด" ด้านบนเพื่อดึงข้อมูลเข้าระบบ
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

        {/* 🌟 Modal 🌟 */}
        <MyModal
          id="myModal"
          title={`ผลการออกรางวัล ประจำวันที่ ${selectedDate} `}
          btnCloseId="btnCloseId"
          modalSize="modal-xl"
        >
          <div className="container-fluid p-0">
            {/* แถวที่ 1 */}
            <div
              className="row g-0 border-bottom"
              style={{ borderColor: "var(--brand-100)" }}
            >
              <div className="col-md-3">
                <PrizeBox
                  title="รางวัลที่ 1"
                  price="6,000,000"
                  numbers={prize1}
                  highlight={true}
                  isBorderRight={true}
                />
              </div>
              <div className="col-md-3">
                <PrizeBox
                  title="รางวัลเลขหน้า 3 ตัว"
                  price="4,000"
                  numbers={front3}
                  isBorderRight={true}
                />
              </div>
              <div className="col-md-3">
                <PrizeBox
                  title="รางวัลเลขท้าย 3 ตัว"
                  price="4,000"
                  numbers={back3}
                  isBorderRight={true}
                />
              </div>
              <div className="col-md-3">
                <PrizeBox
                  title="รางวัลเลขท้าย 2 ตัว"
                  price="2,000"
                  numbers={back2}
                />
              </div>
            </div>

            {/* แถวที่ 2 */}
            <div
              className="row g-0 border-bottom"
              style={{ borderColor: "var(--brand-100)" }}
            >
              <div className="col-md-3">
                <PrizeBox
                  title="ข้างเคียงรางวัลที่ 1"
                  price="100,000"
                  numbers={prize1Near}
                  isBorderRight={true}
                />
              </div>
              <div className="col-md-9">
                <PrizeBox
                  title="รางวัลที่ 2"
                  price="200,000"
                  numbers={prize2}
                />
              </div>
            </div>

            {/* แถวที่ 3 */}
            <div
              className="row g-0 border-bottom"
              style={{ borderColor: "var(--brand-100)" }}
            >
              <div className="col-12">
                <PrizeBox title="รางวัลที่ 3" price="80,000" numbers={prize3} />
              </div>
            </div>

            {/* แถวที่ 4 */}
            <div
              className="row g-0 border-bottom"
              style={{ borderColor: "var(--brand-100)" }}
            >
              <div className="col-12">
                <PrizeBox title="รางวัลที่ 4" price="40,000" numbers={prize4} />
              </div>
            </div>

            {/* แถวที่ 5 */}
            <div className="row g-0">
              <div className="col-12">
                <PrizeBox title="รางวัลที่ 5" price="20,000" numbers={prize5} />
              </div>
            </div>
          </div>
        </MyModal>
      </Home>
    </>
  );
}

export default Bonus;
