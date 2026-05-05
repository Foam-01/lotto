import Swal from "sweetalert2";
import Home from "./Home";
import BonusService from "../services/bonus.service";
import { useEffect, useState } from "react";
import MyModal from "../components/MyModal";
import moment from "moment";

function SaleBonus() {
  const [billSaleDetailsBonus, setBillSaleDetailsBonus] = useState([]);
  const [tranferMoneyDate, setTranferMoneyDate] = useState("");
  const [tranferMoneyTime, setTranferMoneyTime] = useState("");
  const [price, setPrice] = useState(0);
  const [billSaleId, setBillSaleId] = useState(0);
  const [deliverDate, setDeliverDate] = useState("");

  // 🛡️ State สำหรับจัดการ Loading และป้องกันการกดปุ่มซ้ำ
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDate();
  }, []);

  const fetchDate = async () => {
    setIsLoading(true);
    try {
      const res = await BonusService.getCheckBonus(); // 🌟 ใช้ Service
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranferMoney = async () => {
    if (isSubmitting) return; // ป้องกันกดซ้ำ

    const button = await Swal.fire({
      title: "ยืนยันการโอนเงิน? 💸",
      text: "เตรียมโอนเงินรางวัลให้เศรษฐีใหม่ป้ายแดง!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981", // สีเขียวรับทรัพย์
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "ยืนยันการโอน 🎉",
      cancelButtonText: "ยกเลิก",
      background: "#ecfdf5",
      reverseButtons: true, // ให้ปุ่มยืนยันอยู่ขวา
    });

    if (button.isConfirmed) {
      setIsSubmitting(true);
      try {
        const payload = {
          billSaleId: parseInt(billSaleId),
          tranferMoneyDate: new Date(tranferMoneyDate),
          tranferMoneyTime: tranferMoneyTime,
          price: parseInt(price),
        };
        const res = await BonusService.transferMoney(payload); // 🌟 ใช้ Service

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
          resetForms();
          fetchDate();
        }
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถโอนเงินได้ กรุณาลองใหม่อีกครั้ง",
          confirmButtonColor: "#ea580c",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeliverMoney = async () => {
    if (isSubmitting) return; // ป้องกันกดซ้ำ

    const button = await Swal.fire({
      title: "ยืนยันการมอบเงินสด? 🎁",
      text: "เตรียมมอบเงินรางวัลให้ลูกค้าด้วยตัวเอง!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#e11d48", // สีแดงชมพู
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "ยืนยันการมอบ 🎊",
      cancelButtonText: "ยกเลิก",
      background: "#fff1f2",
      reverseButtons: true,
    });

    if (button.isConfirmed) {
      setIsSubmitting(true);
      try {
        const payload = {
          billSaleId: parseInt(billSaleId),
          deliverDate: new Date(deliverDate),
          price: parseInt(price),
        };
        const res = await BonusService.deliverMoney(payload); // 🌟 ใช้ Service

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
          resetForms();
          fetchDate();
        }
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถบันทึกได้ กรุณาลองใหม่อีกครั้ง",
          confirmButtonColor: "#ea580c",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 🛡️ จัดการรีเซ็ตฟอร์มให้เป็นระเบียบ
  const resetForms = () => {
    setTranferMoneyDate("");
    setTranferMoneyTime("");
    setDeliverDate("");
    setPrice(0);
  };

  // 🌟 คำนวณข้อมูลสำหรับ KPI Dashboard
  const totalWinners = billSaleDetailsBonus.length;

  const totalPrizeAmount = billSaleDetailsBonus.reduce((sum, item) => {
    return sum + (item.BonusResultDetail?.price || 0);
  }, 0);

  const paidAmount = billSaleDetailsBonus.reduce((sum, item) => {
    const isPaid =
      item.BillSaleDetail?.billSale?.tranferMoneyDate ||
      item.BillSaleDetail?.billSale?.deliverDate;
    if (isPaid) return sum + (item.BonusResultDetail?.price || 0);
    return sum;
  }, 0);

  const pendingAmount = totalPrizeAmount - paidAmount;

  const pendingCount = billSaleDetailsBonus.filter(
    (item) =>
      !(
        item.BillSaleDetail?.billSale?.tranferMoneyDate ||
        item.BillSaleDetail?.billSale?.deliverDate
      ),
  ).length;

  return (
    <>
      <Home>
        <div className="container-fluid px-3 px-md-4 pb-4 pt-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="h3 mb-0 fw-bold" style={{ color: "#ea580c" }}>
              🎉 รายงานเศรษฐีใหม่ 
            </div>
          </div>

          {/* 🌟 KPI Dashboard Cards 🌟 */}
          <div className="row g-3 mb-4">
            {/* Card 1: จำนวนเศรษฐีใหม่ */}
            <div className="col-12 col-md-6 col-xl-3">
              <div
                className="card border-0 shadow-sm rounded-4 h-100"
                style={{
                  backgroundColor: "#fff7f2",
                  borderBottom: "4px solid #ea580c",
                }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 fw-bold fs-6">
                        เศรษฐีใหม่ (บิล)
                      </p>
                      <h3 className="fw-bold mb-0" style={{ color: "#ea580c" }}>
                        {totalWinners}{" "}
                        <span className="fs-6 fw-normal text-muted">
                          รายการ
                        </span>
                      </h3>
                    </div>
                    <div
                      className="rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#ea580c",
                        color: "#fff",
                      }}
                    >
                      <i className="bi bi-people-fill fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: ยอดเงินรางวัลรวม */}
            <div className="col-12 col-md-6 col-xl-3">
              <div
                className="card border-0 shadow-sm rounded-4 h-100"
                style={{
                  backgroundColor: "#fef3c7",
                  borderBottom: "4px solid #f59e0b",
                }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 fw-bold fs-6">
                        รางวัลรวมทั้งหมด
                      </p>
                      <h3 className="fw-bold mb-0" style={{ color: "#d97706" }}>
                        {totalPrizeAmount.toLocaleString("th-TH")}{" "}
                        <span className="fs-6 fw-normal text-muted">฿</span>
                      </h3>
                    </div>
                    <div
                      className="rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#f59e0b",
                        color: "#fff",
                      }}
                    >
                      <i className="bi bi-cash-coin fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: จ่ายเงินแล้ว */}
            <div className="col-12 col-md-6 col-xl-3">
              <div
                className="card border-0 shadow-sm rounded-4 h-100"
                style={{
                  backgroundColor: "#ecfdf5",
                  borderBottom: "4px solid #10b981",
                }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 fw-bold fs-6">
                        จ่ายเงินแล้ว
                      </p>
                      <h3 className="fw-bold mb-0" style={{ color: "#059669" }}>
                        {paidAmount.toLocaleString("th-TH")}{" "}
                        <span className="fs-6 fw-normal text-muted">฿</span>
                      </h3>
                    </div>
                    <div
                      className="rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#10b981",
                        color: "#fff",
                      }}
                    >
                      <i className="bi bi-check-circle-fill fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: รอจ่าย */}
            <div className="col-12 col-md-6 col-xl-3">
              <div
                className="card border-0 shadow-sm rounded-4 h-100"
                style={{
                  backgroundColor: "#fff1f2",
                  borderBottom: "4px solid #e11d48",
                }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 fw-bold fs-6">
                        รอจ่าย ({pendingCount})
                      </p>
                      <h3 className="fw-bold mb-0" style={{ color: "#e11d48" }}>
                        {pendingAmount.toLocaleString("th-TH")}{" "}
                        <span className="fs-6 fw-normal text-muted">฿</span>
                      </h3>
                    </div>
                    <div
                      className="rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#e11d48",
                        color: "#fff",
                      }}
                    >
                      <i className="bi bi-hourglass-split fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 ตารางแสดงผู้ถูกรางวัล (Winner Board) 🌟 */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table
                  className="table table-hover align-middle mb-0"
                  style={{ minWidth: "1000px" }}
                >
                  <thead
                    style={{
                      backgroundColor: "#ffedd5",
                      borderBottom: "2px solid #fdba74",
                    }}
                  >
                    <tr>
                      <th
                        className="px-4 py-3 border-0 text-center text-uppercase"
                        style={{ color: "#c2410c", fontWeight: "700" }}
                      >
                        <i className="bi bi-ticket-perforated-fill me-1"></i>{" "}
                        เลขที่ถูกรางวัล
                      </th>
                      <th
                        className="px-3 py-3 border-0 text-center text-uppercase"
                        style={{ color: "#c2410c", fontWeight: "700" }}
                      >
                        <i className="bi bi-cash-stack me-1"></i> ยอดเงินรางวัล
                      </th>
                      <th
                        className="px-3 py-3 border-0 text-center"
                        style={{ color: "#c2410c", fontWeight: "700" }}
                      >
                        งวดประจำวันที่
                      </th>
                      <th
                        className="px-3 py-3 border-0"
                        style={{ color: "#c2410c", fontWeight: "700" }}
                      >
                        ข้อมูลเศรษฐีใหม่
                      </th>
                      <th
                        className="px-3 py-3 border-0 text-center"
                        style={{ color: "#c2410c", fontWeight: "700" }}
                      >
                        วันที่โอน/ส่งมอบ
                      </th>
                      <th
                        className="px-4 py-3 border-0 text-end"
                        style={{
                          color: "#c2410c",
                          fontWeight: "700",
                          minWidth: "220px",
                        }}
                      >
                        สถานะการจ่ายเงิน
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      /* ⏳ Loading State */
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div
                            className="spinner-border text-warning mb-3"
                            role="status"
                            style={{ width: "3rem", height: "3rem" }}
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <h5 className="text-muted fw-bold">
                            กำลังค้นหาเศรษฐีใหม่... 🐾
                          </h5>
                        </td>
                      </tr>
                    ) : billSaleDetailsBonus.length > 0 ? (
                      billSaleDetailsBonus.map((item) => {
                        // 🌟 เช็คสถานะว่าจ่ายเงินไปแล้วหรือยัง
                        const isTransfered =
                          item.BillSaleDetail?.billSale?.tranferMoneyDate;
                        const isDelivered =
                          item.BillSaleDetail?.billSale?.deliverDate;
                        const isPaid = isTransfered || isDelivered;

                        return (
                          <tr
                            key={item.id}
                            style={{ borderBottom: "1px solid #f3f4f6" }}
                          >
                            {/* เลขที่ถูกรางวัล */}
                            <td className="px-4 py-4 text-center">
                              <span
                                className="badge rounded-pill fs-5 shadow-sm bg-white"
                                style={{
                                  color: "#ea580c",
                                  border: "1px dashed #fdba74",
                                  letterSpacing: "1px",
                                }}
                              >
                                🏆 {item.BonusResultDetail?.number}
                              </span>
                            </td>

                            {/* ยอดเงินรางวัล */}
                            <td className="px-3 py-4 text-center">
                              <span
                                className="fw-bold fs-4"
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
                            <td className="px-3 py-4 text-center text-muted fw-medium">
                              {item.BonusResultDetail?.bonusDate}
                            </td>

                            {/* ข้อมูลลูกค้า */}
                            <td className="px-3 py-4">
                              <div
                                className="fw-bold text-dark mb-1"
                                style={{ fontSize: "1.05rem" }}
                              >
                                👤{" "}
                                {item.BillSaleDetail?.billSale?.customerName ||
                                  "ไม่ระบุ"}
                              </div>
                              <div className="text-muted small">
                                <span className="badge bg-light text-secondary border px-2 py-1 fw-normal">
                                  <i className="bi bi-telephone-fill me-1"></i>
                                  {item.BillSaleDetail?.billSale
                                    ?.customerPhone || "-"}
                                </span>
                              </div>
                            </td>

                            {/* 🌟 วันที่โอน / มอบ (ปรับใหม่ คลีนๆ อ่านง่าย) 🌟 */}
                            <td className="px-3 py-4 text-center">
                              {isTransfered ? (
                                <div className="small fw-medium">
                                  <span className="text-success mb-1 d-block">
                                    <i className="bi bi-bank me-1"></i>
                                    โอนเงินแล้ว
                                  </span>
                                  <span className="text-dark">
                                    {moment(
                                      item.BillSaleDetail.billSale
                                        .tranferMoneyDate,
                                    ).format("DD/MM/YYYY")}
                                  </span>
                                  <span className="text-muted ms-1">
                                    (
                                    {moment(
                                      item.BillSaleDetail.billSale
                                        .tranferMoneyTime,
                                      "HH:mm",
                                    ).format("HH:mm")}{" "}
                                    น.)
                                  </span>
                                </div>
                              ) : isDelivered ? (
                                <div className="small fw-medium">
                                  <span className="text-danger mb-1 d-block">
                                    <i className="bi bi-gift-fill me-1"></i>
                                    มอบเงินสดแล้ว
                                  </span>
                                  <span className="text-dark">
                                    {moment(
                                      item.BillSaleDetail.billSale.deliverDate,
                                    ).format("DD/MM/YYYY")}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>

                            {/* สถานะการจ่ายเงิน & ปุ่มจัดการ */}
                            <td className="px-4 py-4 text-end">
                              {isPaid ? (
                                <span
                                  className="badge rounded-pill px-4 py-2 shadow-sm"
                                  style={{
                                    backgroundColor: "#d1fae5",
                                    color: "#059669",
                                    fontSize: "0.95rem",
                                    border: "1px solid #34d399",
                                  }}
                                >
                                  <i className="bi bi-check-circle-fill me-1"></i>{" "}
                                  รับทรัพย์แล้ว 🎉
                                </span>
                              ) : (
                                <div className="d-flex justify-content-end gap-2">
                                  <button
                                    data-bs-toggle="modal"
                                    data-bs-target="#modalTransfer"
                                    className="btn btn-sm rounded-pill px-3 py-2 fw-bold shadow-sm transition-all text-nowrap"
                                    style={{
                                      backgroundColor: "#ea580c",
                                      color: "#fff",
                                      border: "none",
                                    }}
                                    onMouseOver={(e) => {
                                      e.target.style.transform =
                                        "translateY(-2px)";
                                      e.target.style.boxShadow =
                                        "0 4px 8px rgba(234, 88, 12, 0.3)";
                                    }}
                                    onMouseOut={(e) => {
                                      e.target.style.transform =
                                        "translateY(0)";
                                      e.target.style.boxShadow = "none";
                                    }}
                                    onClick={() => {
                                      setBillSaleId(
                                        item.BillSaleDetail.billSaleId,
                                      );
                                      setPrice(
                                        item.BonusResultDetail?.price || 0,
                                      );

                                      const now = new Date();
                                      setTranferMoneyDate(
                                        moment(now).format("YYYY-MM-DD"),
                                      );
                                      setTranferMoneyTime(
                                        moment(now).format("HH:mm"),
                                      );
                                    }}
                                  >
                                    <i className="bi bi-bank me-1"></i> โอนเงิน
                                  </button>

                                  <button
                                    data-bs-toggle="modal"
                                    data-bs-target="#modalDeliver"
                                    className="btn btn-sm rounded-pill px-3 py-2 fw-bold shadow-sm transition-all text-nowrap"
                                    style={{
                                      backgroundColor: "#fff7f2",
                                      color: "#ea580c",
                                      border: "1px solid #ea580c",
                                    }}
                                    onMouseOver={(e) => {
                                      e.target.style.backgroundColor =
                                        "#ea580c";
                                      e.target.style.color = "#fff";
                                      e.target.style.transform =
                                        "translateY(-2px)";
                                    }}
                                    onMouseOut={(e) => {
                                      e.target.style.backgroundColor =
                                        "#fff7f2";
                                      e.target.style.color = "#ea580c";
                                      e.target.style.transform =
                                        "translateY(0)";
                                    }}
                                    onClick={() => {
                                      setBillSaleId(
                                        item.BillSaleDetail.billSaleId,
                                      );
                                      setPrice(
                                        item.BonusResultDetail?.price || 0,
                                      );
                                      setDeliverDate(
                                        moment(new Date()).format("YYYY-MM-DD"),
                                      );
                                    }}
                                  >
                                    <i className="bi bi-gift-fill me-1"></i>{" "}
                                    มอบสด
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      /* 🌟 Empty State */
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div className="text-muted d-flex flex-column align-items-center py-4">
                            <div
                              style={{
                                fontSize: "4rem",
                                animation: "bounce 2s infinite",
                              }}
                            >
                              🐱💦
                            </div>
                            <span
                              className="fs-4 mt-3 fw-bold"
                              style={{ color: "#c2410c" }}
                            >
                              งวดนี้แผงเรายังไม่มีเศรษฐีใหม่เลยเจ้านาย!
                            </span>
                            <span className="mt-2 text-secondary fs-6">
                              รอลุ้นกันใหม่งวดหน้านะ แง้ววว... 🐾
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

      {/* 🌟 Modal โอนเงิน */}
      <MyModal
        id="modalTransfer"
        title="💸 โอนเงินรางวัลให้เศรษฐีใหม่!"
        btnCloseId="btnCloseModalTransfer"
      >
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

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold text-secondary">
              วันที่โอนเงิน
            </label>
            <div className="input-group shadow-sm rounded-pill overflow-hidden border">
              <span className="input-group-text bg-light border-0 text-warning">
                <i className="bi bi-calendar-check-fill"></i>
              </span>
              <input
                type="date"
                className="form-control border-0 px-2 bg-light fw-medium"
                value={tranferMoneyDate}
                onChange={(e) => setTranferMoneyDate(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold text-secondary">
              เวลาที่โอน
            </label>
            <div className="input-group shadow-sm rounded-pill overflow-hidden border">
              <span className="input-group-text bg-light border-0 text-warning">
                <i className="bi bi-clock-fill"></i>
              </span>
              <input
                type="time"
                className="form-control border-0 px-2 bg-light fw-medium"
                value={tranferMoneyTime}
                onChange={(e) => setTranferMoneyTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div
          className="mb-4 text-center p-4 rounded-4 shadow-sm position-relative"
          style={{
            backgroundColor: "#ecfdf5",
            border: "2px solid #10b981",
            overflow: "hidden",
          }}
        >
          <i
            className="bi bi-cash-stack position-absolute opacity-25"
            style={{
              fontSize: "8rem",
              right: "-20px",
              bottom: "-30px",
              color: "#34d399",
            }}
          ></i>
          <label
            className="form-label fw-bold mb-2 position-relative"
            style={{ color: "#059669", fontSize: "1.2rem" }}
          >
            💰 ยอดเงินรางวัลที่ต้องโอน
          </label>
          <input
            type="text"
            inputMode="numeric"
            className="form-control text-center fw-bold bg-transparent border-0 position-relative w-100"
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
            className="fw-bold mt-1 position-relative"
            style={{ color: "#059669", fontSize: "1.1rem" }}
          >
            บาทถ้วน
          </div>
        </div>

        <div className="mb-2 text-center">
          <button
            disabled={isSubmitting}
            className="btn rounded-pill px-5 py-3 shadow fw-bold fs-5 transition-all w-100 d-flex justify-content-center align-items-center"
            style={{
              backgroundColor: isSubmitting ? "#9ca3af" : "#10b981",
              color: "white",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) e.target.style.transform = "scale(1.02)";
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) e.target.style.transform = "scale(1)";
            }}
            onClick={handleTranferMoney}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>{" "}
                กำลังโอนเงิน...
              </>
            ) : (
              <>
                <i className="bi bi-send-check-fill me-2"></i> ยืนยันการโอนเงิน
                🎉
              </>
            )}
          </button>
        </div>
      </MyModal>

      {/* 🌟 Modal มอบเงินสด */}
      <MyModal
        id="modalDeliver"
        title="🎁 นำเงินสดไปมอบให้ลูกค้า"
        btnCloseId="btnCloseModalDeliver"
      >
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
          <div className="input-group shadow-sm rounded-pill overflow-hidden border">
            <span className="input-group-text bg-light border-0 text-danger">
              <i className="bi bi-calendar-event-fill"></i>
            </span>
            <input
              type="date"
              className="form-control border-0 px-2 bg-light fw-medium"
              value={deliverDate}
              onChange={(e) => setDeliverDate(e.target.value)}
            />
          </div>
        </div>

        <div
          className="mb-4 text-center p-4 rounded-4 shadow-sm position-relative"
          style={{
            backgroundColor: "#fff1f2",
            border: "2px solid #e11d48",
            overflow: "hidden",
          }}
        >
          <i
            className="bi bi-gift-fill position-absolute opacity-25"
            style={{
              fontSize: "8rem",
              left: "-20px",
              bottom: "-30px",
              color: "#fb7185",
            }}
          ></i>
          <label
            className="form-label fw-bold mb-2 position-relative"
            style={{ color: "#be123c", fontSize: "1.2rem" }}
          >
            🧧 จำนวนเงินสดที่มอบ
          </label>
          <input
            type="text"
            inputMode="numeric"
            className="form-control text-center fw-bold bg-transparent border-0 position-relative w-100"
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
            className="fw-bold mt-1 position-relative"
            style={{ color: "#be123c", fontSize: "1.1rem" }}
          >
            บาทถ้วน
          </div>
        </div>

        <div className="mb-2 text-center">
          <button
            disabled={isSubmitting}
            className="btn rounded-pill px-5 py-3 shadow fw-bold fs-5 transition-all w-100 d-flex justify-content-center align-items-center"
            style={{
              backgroundColor: isSubmitting ? "#9ca3af" : "#e11d48",
              color: "white",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) e.target.style.transform = "scale(1.02)";
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) e.target.style.transform = "scale(1)";
            }}
            onClick={handleDeliverMoney}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>{" "}
                กำลังบันทึก...
              </>
            ) : (
              <>
                <i className="bi bi-box2-heart-fill me-2"></i>{" "}
                ยืนยันการมอบเงินสด 🎊
              </>
            )}
          </button>
        </div>
      </MyModal>
    </>
  );
}

export default SaleBonus;
