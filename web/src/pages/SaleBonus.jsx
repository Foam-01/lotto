import Swal from "sweetalert2";
import Home from "./Home";
import BonusService from "../services/bonus.service";
import { useEffect, useState } from "react";
import MyModal from "../components/MyModal";
import * as dayjs from "dayjs";
import { PageHeader } from "../components/shared/PageHeader";
import {
  FilterBar,
  FilterBarSearch,
  FilterBarButton,
  FilterBarClear,
} from "../components/shared/FilterBar";

function SaleBonus() {
  const [billSaleDetailsBonus, setBillSaleDetailsBonus] = useState([]);
  const [transferMoneyDate, setTransferMoneyDate] = useState("");
  const [transferMoneyTime, setTransferMoneyTime] = useState("");
  const [price, setPrice] = useState(0);
  const [billSaleId, setBillSaleId] = useState(0);
  const [deliverDate, setDeliverDate] = useState("");

  // 🛡️ State สำหรับจัดการ Loading และป้องกันการกดปุ่มซ้ำ
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | paid

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
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลผู้ถูกรางวัลได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "var(--brand-600)",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferMoney = async () => {
    const transferPriceNum = Number(price);
    if (
      !transferMoneyDate ||
      isNaN(transferPriceNum) ||
      transferPriceNum <= 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        text: "กรุณาระบุวันที่และจำนวนเงินให้ถูกต้อง",
      });
      return;
    }

    if (isSubmitting) return; // ป้องกันกดซ้ำ

    const button = await Swal.fire({
      title: "ยืนยันการโอนเงิน?",
      text: "ยืนยันการโอนเงินรางวัลให้ลูกค้าใช่หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--emerald-500)", // สีเขียวรับทรัพย์
      cancelButtonColor: "var(--gray-400)",
      confirmButtonText: "ยืนยันการโอน",
      cancelButtonText: "ยกเลิก",
      background: "var(--emerald-50)",
      reverseButtons: true, // ให้ปุ่มยืนยันอยู่ขวา
    });

    if (button.isConfirmed) {
      setIsSubmitting(true);
      try {
        const payload = {
          billSaleId: parseInt(billSaleId),
          transferMoneyDate: new Date(transferMoneyDate),
          transferMoneyTime: transferMoneyTime,
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
            title: "โอนเงินรางวัลสำเร็จ",
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
          confirmButtonColor: "var(--brand-600)",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeliverMoney = async () => {
    const deliverPriceNum = Number(price);
    if (!deliverDate || isNaN(deliverPriceNum) || deliverPriceNum <= 0) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        text: "กรุณาระบุวันที่และจำนวนเงินให้ถูกต้อง",
      });
      return;
    }

    if (isSubmitting) return; // ป้องกันกดซ้ำ

    const button = await Swal.fire({
      title: "ยืนยันการมอบเงินสด?",
      text: "เตรียมมอบเงินรางวัลให้ลูกค้าด้วยตัวเอง!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--rose-600)", // สีแดงชมพู
      cancelButtonColor: "var(--gray-400)",
      confirmButtonText: "ยืนยันการมอบ",
      cancelButtonText: "ยกเลิก",
      background: "var(--rose-50)",
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
            title: "บันทึกการมอบเงินสดสำเร็จ",
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
          confirmButtonColor: "var(--brand-600)",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 🛡️ จัดการรีเซ็ตฟอร์มให้เป็นระเบียบ
  const resetForms = () => {
    setTransferMoneyDate("");
    setTransferMoneyTime("");
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
      item.BillSaleDetail?.billSale?.transferMoneyDate ||
      item.BillSaleDetail?.billSale?.deliverDate;
    if (isPaid) return sum + (item.BonusResultDetail?.price || 0);
    return sum;
  }, 0);

  const pendingAmount = totalPrizeAmount - paidAmount;

  const pendingCount = billSaleDetailsBonus.filter(
    (item) =>
      !(
        item.BillSaleDetail?.billSale?.transferMoneyDate ||
        item.BillSaleDetail?.billSale?.deliverDate
      ),
  ).length;

  // 🌟 ค้นหา/กรองฝั่ง client จากรายการที่โหลดมาแล้ว (ไม่ยิง API เพิ่ม)
  const filteredWinners = billSaleDetailsBonus.filter((item) => {
    const isPaid =
      item.BillSaleDetail?.billSale?.transferMoneyDate ||
      item.BillSaleDetail?.billSale?.deliverDate;
    if (statusFilter === "paid" && !isPaid) return false;
    if (statusFilter === "pending" && isPaid) return false;

    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      item.BonusResultDetail?.number,
      item.BillSaleDetail?.billSale?.customerName,
      item.BillSaleDetail?.billSale?.customerPhone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return (
    <>
      <Home>
        <div className="container-fluid px-3 px-md-4 pb-4 pt-3">
          <PageHeader
            eyebrow="ผลรางวัล"
            title="รายงานผู้ถูกรางวัล"
            description="ติดตามการโอนเงิน/มอบเงินสดให้ลูกค้าที่ถูกรางวัล"
            count={`${totalWinners} รายการ`}
          />

          {/* 🌟 KPI Dashboard Cards 🌟 */}
          <div className="row g-3 mb-4">
            {[
              {
                label: "ผู้ถูกรางวัล (บิล)",
                value: totalWinners.toLocaleString("th-TH"),
                suffix: "รายการ",
              },
              {
                label: "รางวัลรวมทั้งหมด",
                value: totalPrizeAmount.toLocaleString("th-TH"),
                suffix: "฿",
              },
              {
                label: "จ่ายเงินแล้ว",
                value: paidAmount.toLocaleString("th-TH"),
                suffix: "฿",
                accent: "var(--green-700)",
              },
              {
                label: `รอจ่าย (${pendingCount})`,
                value: pendingAmount.toLocaleString("th-TH"),
                suffix: "฿",
                accent: "var(--red-600)",
              },
            ].map((kpi, i) => (
              <div className="col-12 col-md-6 col-xl-3" key={i}>
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
                    <h3
                      className="fw-bold mb-0"
                      style={{ color: kpi.accent || "var(--slate-900)" }}
                    >
                      {kpi.value}{" "}
                      <span className="fs-6 fw-normal text-muted">
                        {kpi.suffix}
                      </span>
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <FilterBar>
            <FilterBarSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="ค้นหาเลขรางวัล, ชื่อลูกค้า, เบอร์โทร..."
            />
            <FilterBarButton
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            >
              ทั้งหมด
            </FilterBarButton>
            <FilterBarButton
              active={statusFilter === "pending"}
              onClick={() => setStatusFilter("pending")}
            >
              รอจ่าย
            </FilterBarButton>
            <FilterBarButton
              active={statusFilter === "paid"}
              onClick={() => setStatusFilter("paid")}
            >
              จ่ายแล้ว
            </FilterBarButton>
            <FilterBarClear
              show={!!searchTerm || statusFilter !== "all"}
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            />
          </FilterBar>

          {/* 🌟 ตารางแสดงผู้ถูกรางวัล (Winner Board) 🌟 */}
          <div
            className="card border overflow-hidden mb-4 bg-white"
            style={{
              borderColor: "var(--slate-200)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="card-body p-0">
              <div className="table-responsive">
                <table
                  className="table table-hover align-middle mb-0"
                  style={{ minWidth: "1000px" }}
                >
                  <thead style={{ backgroundColor: "var(--slate-50)" }}>
                    <tr>
                      <th
                        className="px-4 py-3 border-0 text-center"
                        style={{ color: "var(--slate-500)", fontWeight: "600", fontSize: "13px" }}
                      >
                        เลขที่ถูกรางวัล
                      </th>
                      <th
                        className="px-3 py-3 border-0 text-center"
                        style={{ color: "var(--slate-500)", fontWeight: "600", fontSize: "13px" }}
                      >
                        ยอดเงินรางวัล
                      </th>
                      <th
                        className="px-3 py-3 border-0 text-center"
                        style={{ color: "var(--slate-500)", fontWeight: "600", fontSize: "13px" }}
                      >
                        งวดประจำวันที่
                      </th>
                      <th
                        className="px-3 py-3 border-0"
                        style={{ color: "var(--slate-500)", fontWeight: "600", fontSize: "13px" }}
                      >
                        ข้อมูลลูกค้า
                      </th>
                      <th
                        className="px-3 py-3 border-0 text-center"
                        style={{ color: "var(--slate-500)", fontWeight: "600", fontSize: "13px" }}
                      >
                        วันที่โอน/ส่งมอบ
                      </th>
                      <th
                        className="px-4 py-3 border-0 text-end"
                        style={{
                          color: "var(--slate-500)",
                          fontWeight: "600",
                          fontSize: "13px",
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
                            กำลังโหลดข้อมูล...
                          </h5>
                        </td>
                      </tr>
                    ) : filteredWinners.length > 0 ? (
                      filteredWinners.map((item) => {
                        // 🌟 เช็คสถานะว่าจ่ายเงินไปแล้วหรือยัง
                        const isTransfered =
                          item.BillSaleDetail?.billSale?.transferMoneyDate;
                        const isDelivered =
                          item.BillSaleDetail?.billSale?.deliverDate;
                        const isPaid = isTransfered || isDelivered;

                        return (
                          <tr
                            key={item.id}
                            style={{ borderBottom: "1px solid var(--gray-100)" }}
                          >
                            {/* เลขที่ถูกรางวัล */}
                            <td className="px-4 py-3 text-center">
                              <span
                                style={{
                                  color: "var(--blue-700)",
                                  fontWeight: 700,
                                  fontSize: "16px",
                                  letterSpacing: "1px",
                                }}
                              >
                                {item.BonusResultDetail?.number}
                              </span>
                            </td>

                            {/* ยอดเงินรางวัล */}
                            <td className="px-3 py-3 text-center">
                              <span
                                className="fw-bold"
                                style={{ color: "var(--green-700)", fontSize: "16px" }}
                              >
                                {item.BonusResultDetail?.price?.toLocaleString(
                                  "th-TH",
                                )}{" "}
                                ฿
                              </span>
                            </td>

                            {/* งวดวันที่ */}
                            <td className="px-3 py-3 text-center text-muted fw-medium">
                              {item.BonusResultDetail?.bonusDate}
                            </td>

                            {/* ข้อมูลลูกค้า */}
                            <td className="px-3 py-3">
                              <div
                                className="fw-bold mb-1"
                                style={{ fontSize: "14px", color: "var(--slate-800)" }}
                              >
                                {item.BillSaleDetail?.billSale?.customerName ||
                                  "ไม่ระบุ"}
                              </div>
                              <div className="text-muted small">
                                {item.BillSaleDetail?.billSale
                                  ?.customerPhone || "-"}
                              </div>
                            </td>

                            <td className="px-3 py-3 text-center">
                              {isTransfered ? (
                                <div className="small fw-medium">
                                  <span className="text-success mb-1 d-block">
                                    โอนเงินแล้ว
                                  </span>
                                  <span className="text-dark">
                                    {dayjs(
                                      item.BillSaleDetail.billSale
                                        .transferMoneyDate,
                                    ).format("DD/MM/YYYY")}
                                  </span>
                                  <span className="text-muted ms-1">
                                    (
                                    {item.BillSaleDetail.billSale.transferMoneyTime?.substring(
                                      0,
                                      5,
                                    )}{" "}
                                    น.)
                                  </span>
                                </div>
                              ) : isDelivered ? (
                                <div className="small fw-medium">
                                  <span className="text-danger mb-1 d-block">
                                    มอบเงินสดแล้ว
                                  </span>
                                  <span className="text-dark">
                                    {dayjs(
                                      item.BillSaleDetail.billSale.deliverDate,
                                    ).format("DD/MM/YYYY")}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>

                            {/* สถานะการจ่ายเงิน & ปุ่มจัดการ */}
                            <td className="px-4 py-3 text-end">
                              {isPaid ? (
                                <span
                                  style={{
                                    backgroundColor: "var(--green-100)",
                                    color: "var(--green-700)",
                                    padding: "3px 14px",
                                    borderRadius: "var(--radius-pill)",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    display: "inline-block",
                                  }}
                                >
                                  ชำระเงินแล้ว
                                </span>
                              ) : (
                                <div className="d-flex justify-content-end gap-2">
                                  <button
                                    data-bs-toggle="modal"
                                    data-bs-target="#modalTransfer"
                                    className="btn btn-sm px-3 py-2 fw-semibold text-nowrap"
                                    style={{
                                      backgroundColor: "var(--color-white)",
                                      color: "var(--slate-600)",
                                      border: "1px solid var(--slate-200)",
                                      borderRadius: "var(--radius-sm)",
                                      fontSize: "13px",
                                    }}
                                    onClick={() => {
                                      setBillSaleId(
                                        item.BillSaleDetail.billSaleId,
                                      );
                                      setPrice(
                                        item.BonusResultDetail?.price || 0,
                                      );

                                      const now = new Date();
                                      setTransferMoneyDate(
                                        dayjs(now).format("YYYY-MM-DD"),
                                      );
                                      setTransferMoneyTime(
                                        dayjs(now).format("HH:mm"),
                                      );
                                    }}
                                  >
                                    โอนเงิน
                                  </button>

                                  <button
                                    data-bs-toggle="modal"
                                    data-bs-target="#modalDeliver"
                                    className="btn btn-sm px-3 py-2 fw-semibold text-nowrap"
                                    style={{
                                      backgroundColor: "var(--color-white)",
                                      color: "var(--slate-600)",
                                      border: "1px solid var(--slate-200)",
                                      borderRadius: "var(--radius-sm)",
                                      fontSize: "13px",
                                    }}
                                    onClick={() => {
                                      setBillSaleId(
                                        item.BillSaleDetail.billSaleId,
                                      );
                                      setPrice(
                                        item.BonusResultDetail?.price || 0,
                                      );
                                      setDeliverDate(
                                        dayjs(new Date()).format("YYYY-MM-DD"),
                                      );
                                    }}
                                  >
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
                              📭
                            </div>
                            <span
                              className="fs-4 mt-3 fw-bold"
                              style={{ color: "var(--brand-700)" }}
                            >
                              {searchTerm || statusFilter !== "all"
                                ? "ไม่พบรายการที่ตรงกับตัวกรอง"
                                : "งวดนี้แผงเรายังไม่มีผู้ถูกรางวัล"}
                            </span>
                            <span className="mt-2 text-secondary fs-6">
                              {searchTerm || statusFilter !== "all"
                                ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองดูใหม่"
                                : "รอผลรางวัลงวดถัดไป"}
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
        title="โอนเงินรางวัลให้ผู้ถูกรางวัล"
        btnCloseId="btnCloseModalTransfer"
      >
        <div
          className="p-3 mb-4 rounded-4 text-center"
          style={{
            backgroundColor: "var(--amber-50, #eff6ff)",
            border: "1px solid var(--amber-100, #dbeafe)",
            color: "#1d4ed8",
          }}
        >
          <h5 className="fw-bold mb-1">ตรวจสอบข้อมูลก่อนโอนเงิน</h5>
          <small>
            กรุณาตรวจสอบสลิปและเลขบัญชีให้ถูกต้องก่อนดำเนินการโอนเงิน
          </small>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label
              htmlFor="transferMoneyDate"
              className="form-label fw-bold text-secondary"
            >
              วันที่โอนเงิน
            </label>
            <div className="input-group shadow-sm rounded-pill overflow-hidden border">
              <span className="input-group-text bg-light border-0 text-warning">
                <i className="bi bi-calendar-check-fill"></i>
              </span>
              <input
                id="transferMoneyDate"
                type="date"
                className="form-control border-0 px-2 bg-light fw-medium"
                value={transferMoneyDate}
                onChange={(e) => setTransferMoneyDate(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <label
              htmlFor="transferMoneyTime"
              className="form-label fw-bold text-secondary"
            >
              เวลาที่โอน
            </label>
            <div className="input-group shadow-sm rounded-pill overflow-hidden border">
              <span className="input-group-text bg-light border-0 text-warning">
                <i className="bi bi-clock-fill"></i>
              </span>
              <input
                id="transferMoneyTime"
                type="time"
                className="form-control border-0 px-2 bg-light fw-medium"
                value={transferMoneyTime}
                onChange={(e) => setTransferMoneyTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div
          className="mb-4 text-center p-4 rounded-4 shadow-sm position-relative"
          style={{
            backgroundColor: "var(--emerald-50)",
            border: "2px solid var(--emerald-500)",
            overflow: "hidden",
          }}
        >
          <i
            className="bi bi-cash-stack position-absolute opacity-25"
            style={{
              fontSize: "8rem",
              right: "-20px",
              bottom: "-30px",
              color: "var(--emerald-400)",
            }}
          ></i>
          <label
            htmlFor="transferPriceAmount"
            className="form-label fw-bold mb-2 position-relative"
            style={{ color: "var(--emerald-600)", fontSize: "1.2rem" }}
          >
            ยอดเงินรางวัลที่ต้องโอน
          </label>
          <input
            id="transferPriceAmount"
            type="text"
            inputMode="numeric"
            className="form-control text-center fw-bold bg-transparent border-0 position-relative w-100"
            style={{
              fontSize: "clamp(1.75rem, 8vw, 3.5rem)",
              color: "var(--emerald-700)",
              textShadow: "2px 2px 0px var(--emerald-100)",
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
            style={{ color: "var(--emerald-600)", fontSize: "1.1rem" }}
          >
            บาทถ้วน
          </div>
        </div>

        <div className="mb-2 text-center">
          <button
            disabled={isSubmitting}
            className="btn rounded-pill px-5 py-3 shadow fw-bold fs-5 transition-all w-100 d-flex justify-content-center align-items-center"
            style={{
              backgroundColor: isSubmitting ? "var(--gray-400)" : "var(--emerald-500)",
              color: "white",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) e.target.style.transform = "scale(1.02)";
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) e.target.style.transform = "scale(1)";
            }}
            onClick={handleTransferMoney}
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
              </>
            )}
          </button>
        </div>
      </MyModal>

      {/* 🌟 Modal มอบเงินสด */}
      <MyModal
        id="modalDeliver"
        title="นำเงินสดไปมอบให้ลูกค้า"
        btnCloseId="btnCloseModalDeliver"
      >
        <div
          className="p-3 mb-4 rounded-4 text-center"
          style={{
            backgroundColor: "var(--slate-50)",
            border: "1px solid var(--slate-200)",
            color: "var(--slate-700)",
          }}
        >
          <h5 className="fw-bold mb-1">บันทึกการมอบเงินสด</h5>
          <small>
            กรุณาเตรียมเงินสดให้ครบถ้วนก่อนส่งมอบให้ลูกค้า
          </small>
        </div>

        <div className="mb-4">
          <label
            htmlFor="deliverDateInput"
            className="form-label fw-bold text-secondary"
          >
            วันที่ทำการส่งมอบ
          </label>
          <div className="input-group shadow-sm rounded-pill overflow-hidden border">
            <span className="input-group-text bg-light border-0 text-danger">
              <i className="bi bi-calendar-event-fill"></i>
            </span>
            <input
              id="deliverDateInput"
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
            backgroundColor: "var(--rose-50)",
            border: "2px solid var(--rose-600)",
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
            htmlFor="deliverPriceAmount"
            className="form-label fw-bold mb-2 position-relative"
            style={{ color: "#be123c", fontSize: "1.2rem" }}
          >
            จำนวนเงินสดที่มอบ
          </label>
          <input
            id="deliverPriceAmount"
            type="text"
            inputMode="numeric"
            className="form-control text-center fw-bold bg-transparent border-0 position-relative w-100"
            style={{
              fontSize: "clamp(1.75rem, 8vw, 3.5rem)",
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
              backgroundColor: isSubmitting ? "var(--gray-400)" : "var(--rose-600)",
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
                ยืนยันการมอบเงินสด
              </>
            )}
          </button>
        </div>
      </MyModal>
    </>
  );
}

export default SaleBonus;
