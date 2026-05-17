import Swal from "sweetalert2";
import Home from "./Home";
import BonusService from "../services/bonus.service";
import { useEffect, useState } from "react";
import MyModal from "../components/MyModal";

function Bonus() {
  const [bonusDetails, setBonusDetails] = useState([]);
  const [details, setDetails] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
        confirmButtonColor: "#ea580c",
      });
    }
  };

  const handleGetBonus = async () => {
    try {
      Swal.fire({
        title: "กำลังดึงข้อมูลสลาก... 🐾",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await BonusService.getLatestBonus(); // 🌟 ใช้ Service

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ! 🐈",
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
          confirmButtonColor: "#ea580c",
        });
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#ea580c",
      });
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
        confirmButtonColor: "#ea580c",
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
      style={{ borderColor: "#ffedd5" }}
    >
      <h5
        className="fw-bold mb-2"
        style={{ color: highlight ? "#ea580c" : "#9a3412" }}
      >
        {highlight && <i className="bi bi-star-fill me-2 text-warning"></i>}
        {title}
      </h5>
      <div
        className="badge rounded-pill mb-3 px-3 py-2"
        style={{
          backgroundColor: "#fff7f2",
          color: "#ea580c",
          fontSize: "0.85rem",
          border: "1px dashed #fdba74", // เพิ่มขอบเส้นประให้ดูเหมือนคูปองน่ารักๆ
        }}
      >
        💰 รางวัลละ {price} บาท
      </div>
      <div className="d-flex flex-wrap gap-3">
        {numbers.length > 0 ? (
          numbers.map((n, i) => (
            <span
              key={i}
              className="fw-bold"
              style={{
                fontSize: highlight ? "2.5rem" : "1.25rem",
                color: highlight ? "#dc2626" : "#431407",
                letterSpacing: "2px",
                textShadow: highlight ? "2px 2px 0px #fed7aa" : "none", // เงาสีส้มอ่อน
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
          {/* 🌟 ส่วน Header 🌟 */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="h3 mb-0 fw-bold" style={{ color: "#ea580c" }}>
              🐈 ผลรางวัลสลากกินแบ่งฯ
            </div>
            <button
              onClick={handleGetBonus}
              className="btn text-white rounded-pill px-4 py-2 shadow-sm"
              style={{
                backgroundColor: "#ea580c",
                border: "none",
                fontWeight: "500",
              }}
            >
              <i className="bi bi-cloud-arrow-down-fill me-2"></i>
              ดึงผลรางวัลล่าสุด 🐟
            </button>
          </div>

          {/* 🌟 ตารางแสดงผลงวดต่างๆ 🌟 */}
          <div
            className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="card-body p-0">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ backgroundColor: "#ffedd5" }}>
                  <tr>
                    <th
                      className="px-4 py-3 border-0 text-uppercase"
                      style={{
                        color: "#ea580c",
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                      }}
                    >
                      <i className="bi bi-calendar2-heart-fill me-2"></i>{" "}
                      งวดวันที่ออกรางวัล
                    </th>
                    <th
                      className="px-4 py-3 border-0 text-end text-uppercase"
                      width="180px"
                      style={{
                        color: "#ea580c",
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                      }}
                    >
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bonusDetails.length > 0 ? (
                    // 🌟 1. เพิ่มคำว่า index เข้ามาในวงเล็บตรงนี้ครับ
                    bonusDetails.map((item, index) => (
                      // 🌟 2. เปลี่ยนจาก item.id เป็น index ตรงนี้เลยครับ!
                      <tr key={index}>
                        <td className="px-4 py-4">
                          <div className="d-flex align-items-center">
                            {/* ไอคอนหน้ารายการ (เปลี่ยนเป็นโบว์/ของขวัญ น่ารักๆ) */}
                            <div
                              className="rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm"
                              style={{
                                width: "48px",
                                height: "48px",
                                backgroundColor: "#fff7f2",
                                color: "#ea580c",
                                border: "2px solid #ffedd5",
                              }}
                            >
                              <i className="bi bi-award-fill fs-4"></i>
                            </div>
                            <div>
                              <div className="fw-bold fs-5 text-dark mb-1">
                                {item.bonusDate}
                              </div>
                              <div className="text-muted small">
                                <i className="bi bi-check-circle-fill text-success me-1"></i>
                                ออกรางวัลเรียบร้อยแล้ว
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-end">
                          <button
                            onClick={() => handleDetail(item.bonusDate)}
                            data-bs-toggle="modal"
                            data-bs-target="#myModal"
                            className="btn rounded-pill px-4 py-2 fw-medium shadow-sm transition-all text-nowrap"
                            style={{
                              backgroundColor: "#fff7f2",
                              color: "#ea580c",
                              border: "1px solid #fdba74",
                              transition: "all 0.2s ease-in-out",
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = "#ea580c";
                              e.target.style.color = "#fff";
                              e.target.style.transform = "translateY(-2px)";
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = "#fff7f2";
                              e.target.style.color = "#ea580c";
                              e.target.style.transform = "translateY(0)";
                            }}
                          >
                            <i className="bi bi-search me-1"></i> ดูผลรางวัล
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    /* 🌟 Empty State สไตล์แมวอ้อน 🌟 */
                    <tr>
                      <td colSpan="2" className="text-center py-5">
                        <div className="text-muted d-flex flex-column align-items-center">
                          <div style={{ fontSize: "4rem" }}>😿</div>
                          <span
                            className="fs-5 mt-2 fw-bold"
                            style={{ color: "#c2410c" }}
                          >
                            แง้ววว... ยังไม่มีข้อมูลผลรางวัลในระบบ
                          </span>
                          <span className="small mt-1 text-secondary">
                            กดปุ่ม "ดึงผลรางวัลล่าสุด"
                            ด้านบนเพื่อป้อนข้อมูลให้น้อนเลยเจ้านาย! 🐟
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
              style={{ borderColor: "#ffedd5" }}
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
              style={{ borderColor: "#ffedd5" }}
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
              style={{ borderColor: "#ffedd5" }}
            >
              <div className="col-12">
                <PrizeBox title="รางวัลที่ 3" price="80,000" numbers={prize3} />
              </div>
            </div>

            {/* แถวที่ 4 */}
            <div
              className="row g-0 border-bottom"
              style={{ borderColor: "#ffedd5" }}
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
