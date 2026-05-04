import Swal from "sweetalert2";
import Home from "./Home";
import axios from "axios";
import config from "../config";
import { useEffect, useState } from "react";
import MyModal from "./componnents/MyModal";
import moment from "moment";

function SaleBonus() {
  const [billSaleDetailsBonus, setBillSaleDetailsBonus] = useState([]);
  const [tranferMoneyDate, setTranferMoneyDate] = useState("");
  const [tranferMoneyTime, setTranferMoneyTime] = useState("");
  const [price, setPrice] = useState(0);
  const [billSaleId, setBillSaleId] = useState(0);
  const [deliverDate, setDeliverDate] = useState("");

  useEffect(() => {
    fetchDate();
  }, []);

  const fetchDate = async () => {
    try {
      const res = await axios.get(config.apiPath + "/api/bonus/checkBonus");
      if (res.data.results !== undefined) {
        setBillSaleDetailsBonus(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด 😿",
        text: "ไม่สามารถโหลดข้อมูลผู้ถูกรางวัลได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#ea580c",
      });
    }
  };

  const handleTranferMoney = async () => {
    const button = await Swal.fire({
      title: "ยืนยันการโอนเงิน? 💸",
      text: "เตรียมโอนเงินรางวัลให้เศรษฐีใหม่ป้ายแดง!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ea580c", // 🌟 ธีมส้ม
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "ยืนยันการโอน 🎉",
      cancelButtonText: "ยกเลิก",
    });

    if (button.isConfirmed) {
      try {
        const payload = {
          billSaleId: parseInt(billSaleId),
          tranferMoneyDate: new Date(tranferMoneyDate),
          tranferMoneyTime: tranferMoneyTime,
          price: parseInt(price),
        };
        const res = await axios.post(
          config.apiPath + "/api/billSale/TranferMoney",
          payload,
        );

        if (res.data.message === "success") {
          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            },
          });

          Toast.fire({
            icon: "success",
            title: "โอนเงินรางวัลสำเร็จ! 🎊 เจ้านายเก่งมาก",
          });

          document.getElementById("btnCloseModalTransfer").click();
          setTranferMoneyDate("");
          setTranferMoneyTime("");
          setPrice(0);
          fetchDate();
        }
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถโอนเงินได้ กรุณาลองใหม่อีกครั้ง",
          confirmButtonColor: "#ea580c",
        });
      }
    }
  };

  const handleDeliverMoney = async () => {
    const button = await Swal.fire({
      title: "ยืนยันการมอบเงินสด? 🎁",
      text: "เตรียมมอบเงินรางวัลให้ลูกค้าด้วยตัวเอง!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ea580c",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "ยืนยันการมอบ 🎊",
      cancelButtonText: "ยกเลิก",
    });

    if (button.isConfirmed) {
      try {
        const payload = {
          billSaleId: parseInt(billSaleId),
          deliverDate: new Date(deliverDate),
          price: parseInt(price),
        };
        const res = await axios.post(
          config.apiPath + "/api/billSale/deliverMoney",
          payload,
        );

        if (res.data.message === "success") {
          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            },
          });

          Toast.fire({
            icon: "success",
            title: "บันทึกการมอบเงินสดสำเร็จ! 🥳",
          });

          document.getElementById("btnCloseModalDeliver").click();
          setDeliverDate("");
          setPrice(0);
          fetchDate();
        }
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถบันทึกได้ กรุณาลองใหม่อีกครั้ง",
          confirmButtonColor: "#ea580c",
        });
      }
    }
  };

  return (
    <>
      <Home>
        <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
          <div className="h3 mb-0 fw-bold" style={{ color: "#ea580c" }}>
            🎉 รายงานเศรษฐีใหม่ 🐈✨
          </div>
        </div>

        {/* 🌟 ตารางแสดงผู้ถูกรางวัล (Winner Board) 🌟 */}
        <div
          className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4"
          style={{ backgroundColor: "#fff" }}
        >
          <div className="card-body p-0">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: "#ffedd5" }}>
                <tr>
                  <th
                    className="px-4 py-3 border-0 text-center text-uppercase"
                    style={{ color: "#c2410c", fontWeight: "600" }}
                  >
                    <i className="bi bi-ticket-perforated-fill me-1"></i>{" "}
                    เลขที่ถูกรางวัล
                  </th>
                  <th
                    className="px-3 py-3 border-0 text-center text-uppercase"
                    style={{ color: "#c2410c", fontWeight: "600" }}
                  >
                    <i className="bi bi-cash-stack me-1"></i> ยอดเงินรางวัล
                  </th>
                  <th
                    className="px-3 py-3 border-0 text-center"
                    style={{ color: "#c2410c" }}
                  >
                    งวดประจำวันที่
                  </th>
                  <th
                    className="px-3 py-3 border-0"
                    style={{ color: "#c2410c" }}
                  >
                    ข้อมูลเศรษฐีใหม่
                  </th>
                  <th
                    className="px-3 py-3 border-0 text-center"
                    style={{ color: "#c2410c" }}
                  >
                    วันที่โอน/ส่งมอบ
                  </th>
                  <th
                    className="px-4 py-3 border-0 text-end"
                    width="280px"
                    style={{ color: "#c2410c", fontWeight: "600" }}
                  >
                    สถานะการจ่ายเงิน
                  </th>
                </tr>
              </thead>
              <tbody>
                {billSaleDetailsBonus.length > 0 ? (
                  billSaleDetailsBonus.map((item) => {
                    // 🌟 เช็คสถานะว่าจ่ายเงินไปแล้วหรือยัง
                    const isTransfered =
                      item.BillSaleDetail?.billSale?.tranferMoneyDate;
                    const isDelivered =
                      item.BillSaleDetail?.billSale?.deliverDate;
                    const isPaid = isTransfered || isDelivered;

                    return (
                      <tr key={item.id}>
                        {/* เลขที่ถูกรางวัล */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className="badge rounded-pill fs-5 shadow-sm"
                            style={{
                              backgroundColor: "#fff7f2",
                              color: "#ea580c",
                              border: "1px dashed #fdba74",
                              letterSpacing: "2px",
                            }}
                          >
                            🏆 {item.BonusResultDetail?.number}
                          </span>
                        </td>

                        {/* ยอดเงินรางวัล (เน้นสีเขียวรับทรัพย์) */}
                        <td className="px-3 py-4 text-center">
                          <span
                            className="fw-bold fs-5"
                            style={{
                              color: "#10b981",
                              textShadow: "1px 1px 0px #d1fae5",
                            }}
                          >
                            💰{" "}
                            {item.BonusResultDetail?.price?.toLocaleString(
                              "th-TH",
                            )}{" "}
                            ฿
                          </span>
                        </td>

                        {/* งวดวันที่ */}
                        <td className="px-3 py-4 text-center text-muted">
                          {item.BonusResultDetail?.bonusDate}
                        </td>

                        {/* ข้อมูลลูกค้า */}
                        <td className="px-3 py-4">
                          <div
                            className="fw-bold text-dark"
                            style={{ fontSize: "1.1rem" }}
                          >
                            👤{" "}
                            {item.BillSaleDetail?.billSale?.customerName ||
                              "ไม่ระบุ"}
                          </div>
                          <div className="text-muted small">
                            <i className="bi bi-telephone-fill me-1"></i>
                            {item.BillSaleDetail?.billSale?.customerPhone ||
                              "-"}
                          </div>
                        </td>

                        {/* วันที่โอน / มอบ */}
                        <td className="px-3 py-4 text-center">
                          {isTransfered ? (
                            <div className="small text-muted">
                              โอน:{" "}
                              {moment(
                                item.BillSaleDetail.billSale.tranferMoneyDate,
                              ).format("DD/MM/YYYY")}
                              <br />
                              เวลา{" "}
                              {moment(
                                item.BillSaleDetail.billSale.tranferMoneyTime,
                                "HH:mm",
                              ).format("HH:mm")}{" "}
                              น.
                            </div>
                          ) : isDelivered ? (
                            <div className="small text-muted">
                              มอบสด:{" "}
                              {moment(
                                item.BillSaleDetail.billSale.deliverDate,
                              ).format("DD/MM/YYYY")}
                            </div>
                          ) : (
                            <span className="text-black-50 small">-</span>
                          )}
                        </td>

                        {/* สถานะการจ่ายเงิน & ปุ่มจัดการ */}
                        <td className="px-4 py-4 text-end">
                          {isPaid ? (
                            // 🌟 ถ้าจ่ายแล้ว ขึ้นป้ายเขียวๆ สวยๆ
                            <span
                              className="badge rounded-pill px-3 py-2"
                              style={{
                                backgroundColor: "#d1fae5",
                                color: "#059669",
                                fontSize: "0.9rem",
                              }}
                            >
                              <i className="bi bi-check-circle-fill me-1"></i>{" "}
                              รับทรัพย์แล้ว 🎉
                            </span>
                          ) : (
                            // 🌟 ถ้ายังไม่จ่าย โชว์ปุ่มโอน/มอบ
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                data-bs-toggle="modal"
                                data-bs-target="#modalTransfer"
                                className="btn btn-sm rounded-pill px-3 fw-medium transition-all"
                                style={{
                                  backgroundColor: "#ea580c",
                                  color: "#fff",
                                  border: "none",
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.transform = "translateY(-2px)";
                                  e.target.style.boxShadow =
                                    "0 4px 8px rgba(234, 88, 12, 0.3)";
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.transform = "translateY(0)";
                                  e.target.style.boxShadow = "none";
                                }}
                                onClick={(e) => {
                                  setBillSaleId(item.BillSaleDetail.billSaleId);
                                  setPrice(item.BonusResultDetail?.price || 0);

                                  const now = new Date();
                                  const year = now.getFullYear();
                                  const month = String(
                                    now.getMonth() + 1,
                                  ).padStart(2, "0");
                                  const day = String(now.getDate()).padStart(
                                    2,
                                    "0",
                                  );
                                  const currentDate = `${year}-${month}-${day}`;

                                  const hours = String(now.getHours()).padStart(
                                    2,
                                    "0",
                                  );
                                  const minutes = String(
                                    now.getMinutes(),
                                  ).padStart(2, "0");
                                  const currentTime = `${hours}:${minutes}`;

                                  setTranferMoneyDate(currentDate);
                                  setTranferMoneyTime(currentTime);
                                }}
                              >
                                <i className="bi bi-bank me-1"></i> โอนเงิน
                              </button>

                              <button
                                data-bs-toggle="modal"
                                data-bs-target="#modalDeliver"
                                className="btn btn-sm rounded-pill px-3 fw-medium transition-all"
                                style={{
                                  backgroundColor: "#fff7f2",
                                  color: "#ea580c",
                                  border: "1px solid #ea580c",
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
                                onClick={(e) => {
                                  setBillSaleId(item.BillSaleDetail.billSaleId);
                                  setPrice(item.BonusResultDetail?.price || 0);

                                  const now = new Date();
                                  const year = now.getFullYear();
                                  const month = String(
                                    now.getMonth() + 1,
                                  ).padStart(2, "0");
                                  const day = String(now.getDate()).padStart(
                                    2,
                                    "0",
                                  );
                                  const currentDate = `${year}-${month}-${day}`;

                                  setDeliverDate(currentDate);
                                }}
                              >
                                <i className="bi bi-gift-fill me-1"></i> มอบสด
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  /* 🌟 Empty State สไตล์น่ารักๆ ไม่มีคนถูกรางวัล */
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="text-muted d-flex flex-column align-items-center">
                        <div style={{ fontSize: "3.5rem" }}>🐱💦</div>
                        <span
                          className="fs-5 mt-2 fw-bold"
                          style={{ color: "#c2410c" }}
                        >
                          งวดนี้แผงเรายังไม่มีเศรษฐีใหม่เลยเจ้านาย!
                        </span>
                        <span className="small mt-1 text-secondary">
                          รอลุ้นกันใหม่งวดหน้านะ แง้ววว...
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Home>

      {/* 🌟 Modal โอนเงิน อัปเกรดความอลังการ */}
      <MyModal
        id="modalTransfer"
        title="💸 โอนเงินรางวัลให้เศรษฐีใหม่!"
        btnCloseId="btnCloseModalTransfer"
      >
        {/* ป้ายประกาศเฉลิมฉลอง */}
        <div
          className="p-3 mb-4 rounded-4 text-center shadow-sm"
          style={{
            backgroundColor: "#fef3c7",
            border: "2px dashed #f59e0b",
            color: "#d97706",
          }}
        >
          <h5 className="fw-bold mb-1">🎉 เตรียมส่งมอบความรวย!</h5>
          <small>
            กรุณาตรวจสอบสลิปและเลขบัญชีให้เป๊ะ ก่อนโอนความสุขให้ลูกค้านะครับ
          </small>
        </div>

        {/* แถวใส่วันที่และเวลา (จัดให้อยู่คู่กัน) */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold text-secondary">
              วันที่โอนเงิน
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 rounded-start-pill text-warning">
                <i className="bi bi-calendar-check-fill"></i>
              </span>
              <input
                type="date"
                className="form-control border-start-0 rounded-end-pill px-2"
                value={tranferMoneyDate}
                onChange={(e) => setTranferMoneyDate(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold text-secondary">
              เวลาที่โอน
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 rounded-start-pill text-warning">
                <i className="bi bi-clock-fill"></i>
              </span>
              <input
                type="time"
                className="form-control border-start-0 rounded-end-pill px-2"
                value={tranferMoneyTime}
                onChange={(e) => setTranferMoneyTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* กล่องใส่เงินรางวัล ใหญ่สะใจ! */}
        <div
          className="mb-4 text-center p-4 rounded-4 shadow-sm"
          style={{ backgroundColor: "#ecfdf5", border: "2px solid #10b981" }}
        >
          <label
            className="form-label fw-bold mb-2"
            style={{ color: "#059669", fontSize: "1.2rem" }}
          >
            💰 ยอดเงินรางวัลที่ต้องโอน
          </label>
          <input
            type="text"
            className="form-control text-center fw-bold bg-transparent border-0"
            style={{
              fontSize: "3.5rem",
              color: "#047857",
              textShadow: "2px 2px 0px #d1fae5",
              padding: "0",
            }}
            value={price ? Number(price).toLocaleString("th-TH") : ""}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/,/g, "");
              if (!isNaN(rawValue)) {
                setPrice(rawValue);
              }
            }}
          />
          <div
            className="fw-bold mt-1"
            style={{ color: "#059669", fontSize: "1.1rem" }}
          >
            บาทถ้วน
          </div>
        </div>

        <div className="mb-2 text-center">
          <button
            className="btn rounded-pill px-5 py-3 shadow fw-bold fs-5 transition-all"
            style={{
              backgroundColor: "#10b981",
              color: "white",
              width: "100%",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "scale(1.02)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "scale(1)";
            }}
            onClick={handleTranferMoney}
          >
            <i className="bi bi-send-check-fill me-2"></i>
            ยืนยันการโอนเงิน 🎉
          </button>
        </div>
      </MyModal>

      {/* 🌟 Modal มอบเงินสด อัปเกรดความอลังการ */}
      <MyModal
        id="modalDeliver"
        title="🎁 นำเงินสดไปมอบให้ลูกค้า"
        btnCloseId="btnCloseModalDeliver"
      >
        {/* ป้ายประกาศธีมแมวส้ม */}
        <div
          className="p-3 mb-4 rounded-4 text-center shadow-sm"
          style={{
            backgroundColor: "#fff7f2",
            border: "2px dashed #ea580c",
            color: "#c2410c",
          }}
        >
          <h5 className="fw-bold mb-1">📸 แชะภาพเป็นที่ระลึกด้วยนะ!</h5>
          <small>
            เตรียมเงินสดก้อนโตให้พร้อม แล้วส่งมอบความรวยถึงมือลูกค้าเลย
          </small>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold text-secondary">
            วันที่ทำการส่งมอบ
          </label>
          <div className="input-group">
            <span
              className="input-group-text bg-white border-end-0 rounded-start-pill text-orange"
              style={{ color: "#ea580c" }}
            >
              <i className="bi bi-calendar-event-fill"></i>
            </span>
            <input
              type="date"
              className="form-control border-start-0 rounded-end-pill px-2"
              value={deliverDate}
              onChange={(e) => setDeliverDate(e.target.value)}
            />
          </div>
        </div>

        {/* กล่องใส่เงินรางวัล ใหญ่สะใจ! */}
        <div
          className="mb-4 text-center p-4 rounded-4 shadow-sm"
          style={{ backgroundColor: "#fff1f2", border: "2px solid #e11d48" }}
        >
          <label
            className="form-label fw-bold mb-2"
            style={{ color: "#be123c", fontSize: "1.2rem" }}
          >
            🧧 จำนวนเงินสดที่มอบ
          </label>
          <input
            type="text"
            className="form-control text-center fw-bold bg-transparent border-0"
            style={{
              fontSize: "3.5rem",
              color: "#9f1239",
              textShadow: "2px 2px 0px #ffe4e6",
              padding: "0",
            }}
            value={price ? Number(price).toLocaleString("th-TH") : ""}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/,/g, "");
              if (!isNaN(rawValue)) {
                setPrice(rawValue);
              }
            }}
          />
          <div
            className="fw-bold mt-1"
            style={{ color: "#be123c", fontSize: "1.1rem" }}
          >
            บาทถ้วน
          </div>
        </div>

        <div className="mb-2 text-center">
          <button
            className="btn rounded-pill px-5 py-3 shadow fw-bold fs-5 transition-all"
            style={{
              backgroundColor: "#e11d48",
              color: "white",
              width: "100%",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "scale(1.02)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "scale(1)";
            }}
            onClick={handleDeliverMoney}
          >
            <i className="bi bi-box2-heart-fill me-2"></i>
            ยืนยันการมอบเงินสด 🎊
          </button>
        </div>
      </MyModal>
    </>
  );
}

export default SaleBonus;
