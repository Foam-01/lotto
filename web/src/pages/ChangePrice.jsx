import Swal from "sweetalert2";
import Home from "./Home";
import { useEffect, useState } from "react";
import lotto from "../services/lotto.service";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

function ChangePrice() {
  const [lottos, setLottos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับฟีเจอร์ค้นหาและกรอง
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyChanged, setShowOnlyChanged] = useState(false);
  // 🌟 State สำหรับแสดงกรอบโฟกัสของช่องค้นหา (เข้าถึงได้ด้วยคีย์บอร์ด/สกรีนรีดเดอร์)
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    fetchLottos();
  }, []);

  const fetchLottos = async () => {
    setIsLoading(true);
    try {
      const res = await lotto.getListForSale();
      if (res.data.results !== undefined) {
        setLottos(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลลอตเตอรี่ได้",
        icon: "error",
        confirmButtonColor: "var(--brand-600)",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 ฟังก์ชันสำหรับคืนค่าราคาเดิม (Reset)
  const handleReset = () => {
    if (changedCount === 0) return;

    Swal.fire({
      title: "คืนค่าราคาเดิม?",
      text: `คุณต้องการยกเลิกการแก้ไขราคาลอตเตอรี่จำนวน ${changedCount} รายการใช่หรือไม่?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--brand-600)",
      cancelButtonColor: "var(--slate-400)",
      confirmButtonText: "ใช่, คืนค่าเดิม",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        // วนลูปเอา property newPrice ออก
        const resetLottos = lottos.map((item) => {
          if (item.newPrice !== undefined) {
            // สร้าง object ใหม่โดยไม่มี newPrice
            const { newPrice, ...originalItem } = item;
            return originalItem;
          }
          return item;
        });
        setLottos(resetLottos);
        Toast.fire({ icon: "info", title: "คืนค่าราคาเดิมเรียบร้อยแล้ว" });
      }
    });
  };

  const handleSave = async () => {
    try {
      const changedItems = lottos.filter(
        (item) =>
          item.newPrice !== undefined &&
          item.newPrice !== "" &&
          Number(item.newPrice) !== item.sale,
      );

      if (changedItems.length === 0) {
        Toast.fire({ icon: "info", title: "ไม่มีการเปลี่ยนแปลงราคา" });
        return;
      }

      // 🛡️ ตรวจสอบว่าราคาใหม่ทุกรายการเป็นตัวเลขที่ถูกต้องและไม่ติดลบ
      const invalidItems = changedItems.filter(
        (item) => isNaN(Number(item.newPrice)) || Number(item.newPrice) < 0,
      );
      if (invalidItems.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "ราคาไม่ถูกต้อง",
          text: "กรุณากรอกราคาใหม่เป็นตัวเลขที่มากกว่าหรือเท่ากับ 0",
          confirmButtonColor: "var(--brand-600)",
        });
        return;
      }

      // 🛡️ ยืนยันก่อนบันทึก เพราะเป็นการเปลี่ยนราคาหลายรายการพร้อมกัน
      const button = await Swal.fire({
        title: "ยืนยันการบันทึกราคาใหม่?",
        text: `คุณกำลังจะบันทึกการเปลี่ยนราคาลอตเตอรี่จำนวน ${changedItems.length} รายการ`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "var(--brand-600)",
        cancelButtonColor: "var(--slate-400)",
        confirmButtonText: "ยืนยันบันทึก",
        cancelButtonText: "ยกเลิก",
      });

      if (!button.isConfirmed) {
        return;
      }

      setIsSaving(true);
      const res = await lotto.changePrice(changedItems);

      if (res.data.message === "success") {
        Toast.fire({
          icon: "success",
          title: `บันทึกสำเร็จ ${changedItems.length} รายการ`,
        });

        setSearchTerm("");
        setShowOnlyChanged(false);
        fetchLottos();
      }
    } catch (e) {
      Toast.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด บันทึกไม่สำเร็จ",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const changeValue = (id, newPriceValue) => {
    const updatedLottos = lottos.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          newPrice: newPriceValue === "" ? "" : Number(newPriceValue),
        };
      }
      return item;
    });
    setLottos(updatedLottos);
  };

  // 🌟 คำนวณสถิติภาพรวมของแผง
  const totalTickets = lottos.length; // สลากทั้งหมดบนแผง
  // คำนวณมูลค่าแผงรวม (ตามราคาขายปัจจุบัน)
  const currentTotalValue = lottos.reduce((sum, item) => sum + item.sale, 0);

  const changedCount = lottos.filter(
    (item) =>
      item.newPrice !== undefined &&
      item.newPrice !== "" &&
      Number(item.newPrice) !== item.sale,
  ).length;

  // กรองข้อมูลสำหรับแสดงผล (ค้นหา + ตัวกรอง)
  const displayLottos = lottos.filter((item) => {
    const matchSearch = item.numbers?.toString().includes(searchTerm);
    const isChanged =
      item.newPrice !== undefined &&
      item.newPrice !== "" &&
      Number(item.newPrice) !== item.sale;
    const matchFilter = showOnlyChanged ? isChanged : true;

    return matchSearch && matchFilter;
  });

  return (
    <>
      <Home>
       
        <div
          className="container-fluid px-3 px-md-4 pb-4 pt-3"
          style={{ minHeight: "100vh" }}
        >
          {/* 🌟 Premium Cat Theme CSS */}
          <style>
            {`
              .premium-scrollbar::-webkit-scrollbar { width: 6px; }
              .premium-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .premium-scrollbar::-webkit-scrollbar-thumb { background: var(--brand-200); border-radius: var(--radius-md); }
              .premium-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--brand-400); }
              
              .price-input {
                transition: all 0.2s ease-in-out;
                border: 2px solid transparent !important;
                background-color: var(--gray-100);
                border-radius: var(--radius-md);
              }
              .price-input:focus {
                background-color: var(--color-white);
                box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.15) !important;
                border-color: var(--brand-600) !important;
                transform: scale(1.03);
              }
              
              /* ตารางแบบการ์ดลอย (Floating Cards) */
              .table-cat-stall tbody tr {
                background-color: var(--color-white);
                border-radius: var(--radius-lg);
                transition: all 0.3s ease;
              }
              .table-cat-stall tbody tr:hover {
                box-shadow: 0 10px 25px rgba(234, 88, 12, 0.08);
                transform: translateY(-3px);
                z-index: 2;
                position: relative;
              }
              .table-cat-stall td {
                border-top: 10px solid var(--color-white) !important; 
                border-bottom: 0 !important;
                vertical-align: middle;
              }
              .table-cat-stall td:first-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
              .table-cat-stall td:last-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; }

              .row-changed td {
                background-color: var(--brand-50) !important; /* พื้นหลังสีส้มอ่อนไฮไลท์แถวที่แก้ */
              }
              .row-changed td:first-child {
                border-left: 5px solid var(--brand-600); /* ขอบส้มด้านซ้าย */
              }

              /* ดีไซน์ตั๋วลอตเตอรี่ */
              .ticket-badge {
                background: var(--color-white);
                border: 2px dashed var(--brand-300);
                color: var(--brand-700);
                padding: 10px 20px;
                border-radius: var(--radius-md);
                display: inline-block;
                position: relative;
                box-shadow: inset 0 0 10px rgba(253, 186, 116, 0.1);
              }
              .ticket-badge::before, .ticket-badge::after {
                content: '';
                position: absolute;
                top: 50%;
                width: 14px;
                height: 14px;
                background-color: var(--color-white); /* 🌟 ปรับสีเจาะรูให้เข้ากับแถวสีขาว */
                border-radius: 50%;
                transform: translateY(-50%);
              }
              /* ปรับสีรอยแหว่งตั๋วเมื่อแถวถูกเลือก */
              .row-changed .ticket-badge::before, .row-changed .ticket-badge::after {
                background-color: var(--brand-50);
              }
              .ticket-badge::before { left: -8px; border-right: 1px solid var(--brand-300); }
              .ticket-badge::after { right: -8px; border-left: 1px solid var(--brand-300); }
              
              /* สีสถานะ */
              .bg-success-subtle { background-color: var(--emerald-100); }
              .text-success { color: var(--emerald-600); }
              .bg-danger-subtle { background-color: var(--red-100); }
              .text-danger { color: var(--red-600); }
              .text-orange { color: var(--brand-600); }
            `}
          </style>

          {/* 🌟 Header & Action Section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 mt-2 gap-3">
            <div>
              <h1
                className="h3 mb-1 fw-bolder d-flex align-items-center"
                style={{ color: "var(--slate-900)", letterSpacing: "-1px" }}
              >
                <div
                  className="d-flex justify-content-center align-items-center rounded-3 me-3 shadow-sm"
                  style={{
                    width: "45px",
                    height: "45px",
                    backgroundColor: "var(--brand-600)",
                    color: "white",
                  }}
                >
                  <i className="bi bi-tags-fill fs-5"></i>
                </div>
                ปรับราคาแบบเร่งด่วน
              </h1>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              {/* 🌟 ปุ่มคืนค่าเดิม (Reset) */}
              <button
                onClick={handleReset}
                disabled={isSaving || changedCount === 0}
                className="btn btn-outline-secondary rounded-pill px-4 fw-bold shadow-sm"
                style={{
                  padding: "12px 20px",
                  borderColor: changedCount > 0 ? "var(--slate-400)" : "var(--slate-200)",
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                ล้างค่า ({changedCount})
              </button>

              {/* ปุ่มบันทึก */}
              <button
                onClick={handleSave}
                disabled={isSaving || changedCount === 0}
                className="btn rounded-pill px-4 shadow-sm fw-bold transition-all"
                style={{
                  backgroundColor: changedCount > 0 ? "var(--brand-600)" : "var(--slate-200)",
                  color: changedCount > 0 ? "white" : "var(--slate-400)",
                  padding: "12px 24px",
                  border: "none",
                }}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-arrow-up-fill me-2 fs-5 align-middle"></i>
                    บันทึกการเปลี่ยนแปลง
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 🌟 แถบสถิติภาพรวม (Cat Stall Dashboard) */}
          <div className="row g-3 mb-4">
            {/* จำนวนสลากทั้งหมด */}
            <div className="col-12 col-md-6">
              <div
                className="card border-0 shadow-sm rounded-4"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand-600) 0%, var(--brand-400) 100%)",
                  color: "white",
                }}
              >
                <div className="card-body p-4 d-flex align-items-center">
                  <div className="fs-1 me-4 opacity-75">
                    <i className="bi bi-ticket-detailed-fill"></i>
                  </div>
                  <div>
                    <h6
                      className="fw-bold opacity-75 mb-1 text-uppercase"
                      style={{ letterSpacing: "1px" }}
                    >
                      สลากทั้งหมดบนแผง
                    </h6>
                    <div className="display-6 fw-bolder">
                      {totalTickets.toLocaleString()}{" "}
                      <span className="fs-4 fw-normal">ใบ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* มูลค่าแผงรวม */}
            <div className="col-12 col-md-6">
              <div
                className="card border-0 shadow-sm rounded-4 bg-white border-start border-4"
                style={{ borderColor: "var(--brand-600)" }}
              >
                <div className="card-body p-4 d-flex align-items-center">
                  <div className="fs-1 me-4 text-orange opacity-75">
                    <i className="bi bi-cash-coin"></i>
                  </div>
                  <div>
                    <h6
                      className="fw-bold text-secondary mb-1 text-uppercase"
                      style={{ letterSpacing: "1px" }}
                    >
                      มูลค่าแผงรวม (ราคาปัจจุบัน)
                    </h6>
                    <div className="display-6 fw-bolder text-dark">
                      ฿{currentTotalValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="card border-0 shadow-sm rounded-4 overflow-hidden"
            style={{ backgroundColor: "var(--color-white)" }}
          >
            {/* Toolbar (ค้นหา & กรอง) */}
            <div className="card-header bg-white border-bottom p-3 p-md-4 d-flex flex-column flex-md-row gap-3 align-items-center justify-content-between">
              <div
                className="input-group shadow-sm rounded-pill overflow-hidden"
                style={{ maxWidth: "400px", border: "1px solid var(--brand-100)" }}
              >
                <span className="input-group-text bg-light border-0 text-orange ps-4">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 bg-light py-2 px-3 fw-medium"
                  placeholder="พิมพ์เลขลอตเตอรี่เพื่อค้นหา..."
                  aria-label="ค้นหาด้วยเลขสลาก"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  style={{
                    outline: "none",
                    boxShadow: isSearchFocused
                      ? "0 0 0 3px rgba(234, 88, 12, 0.25)"
                      : "none",
                  }}
                />
                {searchTerm && (
                  <button
                    className="btn btn-light border-0 text-muted pe-4"
                    onClick={() => setSearchTerm("")}
                    aria-label="ล้างคำค้นหา"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>

              <div
                className="bg-light p-1 rounded-pill d-inline-flex shadow-sm border flex-wrap"
                style={{ borderColor: "var(--brand-100)" }}
              >
                <button
                  className={`btn rounded-pill fw-bold px-4 transition-all ${!showOnlyChanged ? "btn-white shadow-sm" : "border-0"}`}
                  style={{
                    backgroundColor: !showOnlyChanged ? "var(--color-white)" : "transparent",
                    color: !showOnlyChanged ? "var(--brand-600)" : "var(--slate-400)",
                  }}
                  onClick={() => setShowOnlyChanged(false)}
                  aria-pressed={!showOnlyChanged}
                >
                  <i className="bi bi-grid-fill me-2"></i>รายการทั้งหมด
                </button>
                <button
                  className={`btn rounded-pill fw-bold px-4 position-relative transition-all ${showOnlyChanged ? "btn-white shadow-sm" : "border-0"}`}
                  style={{
                    backgroundColor: showOnlyChanged ? "var(--color-white)" : "transparent",
                    color: showOnlyChanged ? "var(--brand-600)" : "var(--slate-400)",
                  }}
                  onClick={() => setShowOnlyChanged(true)}
                  aria-pressed={showOnlyChanged}
                >
                  <i className="bi bi-pencil-square me-2"></i>แก้ไขแล้ว
                  {changedCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle shadow-sm"></span>
                  )}
                </button>
              </div>
            </div>

            {/* 🌟 ตารางแสดงผล เปลี่ยนสีพื้นให้กลืนกับการ์ด */}
            <div
              className="card-body p-0 px-3"
              style={{ backgroundColor: "var(--color-white)" }}
            >
              <div
                className="table-responsive premium-scrollbar pe-2 pb-3 pt-2"
                style={{ maxHeight: "60vh" }}
              >
                <table
                  className="table align-middle mb-0 text-center table-borderless"
                  style={{
                    borderSpacing: "0 12px",
                    borderCollapse: "separate",
                  }}
                >
                  <thead
                    style={{
                      backgroundColor: "var(--color-white)",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <tr>
                      <th
                        className="px-4 py-3 text-secondary text-start fw-bold"
                        style={{
                          fontSize: "0.9rem",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        🎫 เลขลอตเตอรี่
                      </th>
                      <th
                        className="px-3 py-3 text-secondary fw-bold"
                        style={{
                          fontSize: "0.9rem",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        💰 ราคาเดิม
                      </th>
                      <th
                        className="px-4 py-3 text-secondary fw-bold"
                        style={{
                          width: "300px",
                          fontSize: "0.9rem",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        ✏️ กำหนดราคาใหม่
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-5 text-center bg-transparent border-0"
                        >
                          <div
                            className="spinner-border text-warning mb-3"
                            role="status"
                          >
                            <span className="visually-hidden">
                              กำลังโหลด...
                            </span>
                          </div>
                          <h6 className="fw-bold text-muted">
                            กำลังโหลดข้อมูลลอตเตอรี่...
                          </h6>
                        </td>
                      </tr>
                    ) : displayLottos.length > 0 ? (
                      displayLottos.map((item) => {
                        const isModified =
                          item.newPrice !== undefined &&
                          item.newPrice !== "" &&
                          Number(item.newPrice) !== item.sale;

                        const diff = isModified
                          ? Number(item.newPrice) - item.sale
                          : 0;

                        return (
                          <tr
                            key={item.id}
                            className={`lotto-row ${isModified ? "row-changed" : ""}`}
                          >
                            <td className="text-start px-4 py-3">
                              <div className="d-flex align-items-center">
                                {/* ดีไซน์ตั๋วลอตเตอรี่สมจริง */}
                                <div
                                  className="ticket-badge fw-bold fs-5 shadow-sm"
                                  style={{
                                    letterSpacing: "4px",
                                    fontFamily:
                                      "'Courier New', Courier, monospace",
                                  }}
                                >
                                  {item.numbers}
                                </div>
                                {isModified && (
                                  <span
                                    className="badge rounded-pill bg-warning text-dark ms-3 shadow-sm py-2 px-3"
                                    style={{
                                      fontSize: "0.75rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    <i className="bi bi-pencil-fill me-1"></i>{" "}
                                    ได้แก้ราคา
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3">
                              <span
                                className={`fw-bolder fs-5 ${isModified ? "text-muted text-decoration-line-through opacity-50" : "text-dark"}`}
                              >
                                ฿{item.sale}
                              </span>
                            </td>

                            <td
                              className="px-4 py-3 border-end"
                              style={{ borderRadius: "0 16px 16px 0" }}
                            >
                              <div className="d-flex align-items-center justify-content-center gap-3">
                                <div
                                  className="position-relative flex-grow-1"
                                  style={{ maxWidth: "150px" }}
                                >
                                  <input
                                    type="number"
                                    className={`form-control price-input text-center fw-bolder fs-5 py-2 shadow-sm ${isModified ? "text-danger border-warning" : "text-primary border-0"}`}
                                    placeholder="ระบุราคา"
                                    aria-label={`ราคาสำหรับเลข ${item.numbers}`}
                                    value={
                                      item.newPrice !== undefined
                                        ? item.newPrice
                                        : item.sale
                                    }
                                    onChange={(e) =>
                                      changeValue(item.id, e.target.value)
                                    }
                                    onFocus={(e) => e.target.select()}
                                  />
                                </div>
                                {/* Badge บอกส่วนต่าง โชว์อยู่นอกกล่องเพื่อให้ดูคลีน */}
                                <div
                                  style={{ width: "80px", textAlign: "left" }}
                                >
                                  {isModified && (
                                    <span
                                      className={`badge rounded-pill shadow-sm px-3 py-2 ${diff > 0 ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                                      style={{
                                        border: `1px solid ${diff > 0 ? "var(--green-200)" : "var(--red-200)"}`,
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {diff > 0 ? (
                                        <>
                                          <i className="bi bi-graph-up-arrow me-1"></i>
                                          {diff}
                                        </>
                                      ) : (
                                        <>
                                          <i className="bi bi-graph-down-arrow me-1"></i>
                                          {Math.abs(diff)}
                                        </>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-5 text-center bg-transparent border-0"
                        >
                          <div className="p-5">
                            <div
                              className="display-1 mb-3"
                              style={{ opacity: "0.8" }}
                            >
                              📭
                            </div>
                            <h5 className="fw-bold text-orange">
                              ไม่พบข้อมูลสลาก
                            </h5>
                            <p className="text-muted">
                              ลองค้นหาด้วยเลขอื่น หรือสลับตัวกรองด้านบน
                            </p>
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

export default ChangePrice;
