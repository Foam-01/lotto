import Swal from "sweetalert2";
import Home from "./Home";
import { useEffect, useState } from "react";
import lotto from "../services/lotto.service";
import { PageHeader } from "../components/shared/PageHeader";
import {
  FilterBar,
  FilterBarSearch,
  FilterBarButton,
} from "../components/shared/FilterBar";

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
                box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15) !important;
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
                box-shadow: 0 10px 25px rgba(37, 99, 235, 0.08);
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
                background-color: var(--blue-50) !important;
              }
              .row-changed td:first-child {
                border-left: 3px solid var(--blue-500, #3b82f6);
              }

              /* ดีไซน์ตั๋วลอตเตอรี่ */
              .ticket-badge {
                background: var(--color-white);
                border: 1px solid var(--slate-200);
                color: var(--blue-700);
                padding: 8px 16px;
                border-radius: var(--radius-sm);
                display: inline-block;
              }

              /* สีสถานะ */
              .bg-success-subtle { background-color: var(--emerald-100); }
              .text-success { color: var(--emerald-600); }
              .bg-danger-subtle { background-color: var(--red-100); }
              .text-danger { color: var(--red-600); }
              .text-orange { color: var(--brand-600); }
            `}
          </style>

          <PageHeader
            eyebrow="จัดการสลาก"
            title="ปรับราคาแบบเร่งด่วน"
            description="แก้ไขราคาขายสลากได้หลายใบพร้อมกัน แล้วกดบันทึกทีเดียว"
            actions={
              <>
                <button
                  onClick={handleReset}
                  disabled={isSaving || changedCount === 0}
                  className="btn px-4 fw-semibold"
                  style={{
                    background: "var(--color-white)",
                    color: "var(--slate-600)",
                    border: "1px solid var(--slate-200)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 18px",
                    fontSize: "14px",
                  }}
                >
                  ล้างค่า ({changedCount})
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving || changedCount === 0}
                  className="btn px-4 fw-semibold"
                  style={{
                    backgroundColor:
                      changedCount > 0 ? "var(--blue-50)" : "var(--slate-100)",
                    color: changedCount > 0 ? "var(--blue-700)" : "var(--slate-400)",
                    padding: "10px 20px",
                    border: changedCount > 0 ? "1px solid var(--blue-100, var(--blue-50))" : "1px solid var(--slate-200)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "14px",
                  }}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      กำลังบันทึก...
                    </>
                  ) : (
                    "บันทึกการเปลี่ยนแปลง"
                  )}
                </button>
              </>
            }
          />

          {/* 🌟 แถบสถิติภาพรวม (Cat Stall Dashboard) */}
          <div className="row g-3 mb-4">
            {/* จำนวนสลากทั้งหมด */}
            {[
              {
                label: "สลากทั้งหมดบนแผง",
                value: `${totalTickets.toLocaleString()} ใบ`,
              },
              {
                label: "มูลค่าแผงรวม (ราคาปัจจุบัน)",
                value: `฿${currentTotalValue.toLocaleString()}`,
                accent: "var(--green-700)",
              },
            ].map((kpi, i) => (
              <div className="col-12 col-md-6" key={i}>
                <div
                  className="card border h-100"
                  style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
                >
                  <div className="card-body p-4">
                    <p
                      className="mb-1 fw-semibold"
                      style={{ color: "var(--slate-500)", fontSize: "13px" }}
                    >
                      {kpi.label}
                    </p>
                    <div className="fs-3 fw-bold" style={{ color: kpi.accent || "var(--slate-900)" }}>
                      {kpi.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 🌟 แถบค้นหา/ตัวกรอง (มาตรฐาน FilterBar) */}
          <FilterBar>
            <FilterBarSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="พิมพ์เลขลอตเตอรี่เพื่อค้นหา..."
              ariaLabel="ค้นหาด้วยเลขสลาก"
            />
            <FilterBarButton
              active={!showOnlyChanged}
              icon="bi-grid-fill"
              onClick={() => setShowOnlyChanged(false)}
            >
              รายการทั้งหมด
            </FilterBarButton>
            <FilterBarButton
              active={showOnlyChanged}
              icon="bi-pencil-square"
              badge={changedCount > 0}
              onClick={() => setShowOnlyChanged(true)}
            >
              แก้ไขแล้ว
            </FilterBarButton>
          </FilterBar>

          <div
            className="card border overflow-hidden"
            style={{ backgroundColor: "var(--color-white)", borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
          >
            {/* 🌟 ตารางแสดงผล เปลี่ยนสีพื้นให้กลืนกับการ์ด */}
            <div
              className="card-body p-0 px-3 pt-3"
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
                        className="px-4 py-3 text-start"
                        style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}
                      >
                        เลขลอตเตอรี่
                      </th>
                      <th
                        className="px-3 py-3"
                        style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}
                      >
                        ราคาเดิม
                      </th>
                      <th
                        className="px-4 py-3"
                        style={{ width: "300px", color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}
                      >
                        กำหนดราคาใหม่
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
                                    className="ms-3 py-1 px-3"
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "700",
                                      backgroundColor: "var(--blue-50)",
                                      color: "var(--blue-700)",
                                      borderRadius: "var(--radius-pill)",
                                    }}
                                  >
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
