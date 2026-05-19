import Home from "./Home";
import { useEffect, useState } from "react";
import BannerService from "../services/banner.service";
import Swal from "sweetalert2";
import MyModal from "../components/MyModal";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

function Banner() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State สำหรับจัดการฟอร์ม Modal
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    name: "",
    src: "",
    link: "",
    alt: "",
    sequence: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await BannerService.list();
      setBanners(res.data || []);
    } catch (e) {
      Toast.fire({ icon: "error", title: "ไม่สามารถดึงข้อมูลแบนเนอร์ได้ 😿" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setBannerForm({
      name: "",
      src: "",
      link: "",
      alt: "",
      sequence: 0,
      isActive: true,
    });
  };

  const handleOpenEditModal = (item) => {
    setIsEditing(true);
    setEditId(item.id);
    setBannerForm({
      name: item.name,
      src: item.src,
      link: item.link || "",
      alt: item.alt || "",
      sequence: item.sequence || 0,
      isActive: item.isActive,
    });
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!bannerForm.name || !bannerForm.src) {
      Toast.fire({ icon: "warning", title: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ!" });
      return;
    }

    setIsSaving(true);
    try {
      // 🌟 แปลง sequence เป็นตัวเลขก่อนส่งไป Database
      const payload = { ...bannerForm, sequence: Number(bannerForm.sequence) };

      if (isEditing) {
        await BannerService.edit(editId, payload);
        Toast.fire({ icon: "success", title: "อัปเดตแบนเนอร์สำเร็จ 📝" });
      } else {
        await BannerService.create(payload);
        Toast.fire({ icon: "success", title: "เพิ่มแบนเนอร์ใหม่เรียบร้อย 🖼️" });
      }

      document.getElementById("closeModalBtn").click();
      fetchBanners();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#ea580c",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBanner = async (id, name) => {
    Swal.fire({
      title: `ลบแบนเนอร์ "${name}"?`,
      text: "รูปและข้อมูลจะหายไปจากระบบเลยนะเจ้านาย เอาจริงดิ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await BannerService.remove(id);
          Toast.fire({ icon: "success", title: "ลบแบนเนอร์ออกแล้ว 🗑️" });
          fetchBanners();
        } catch (e) {
          Toast.fire({ icon: "error", title: "ลบไม่สำเร็จ เกิดข้อผิดพลาด" });
        }
      }
    });
  };

  // 🌟 ฟังก์ชันสลับสถานะเปิด-ปิด ทันทีในตาราง (ไม่ต้องเข้า Modal ไปแก้)
  const toggleActiveStatus = async (item) => {
    try {
      const payload = { ...item, isActive: !item.isActive };
      await BannerService.edit(item.id, payload);
      Toast.fire({
        icon: "success",
        title: `เปลี่ยนสถานะเป็น ${payload.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"} แล้ว`,
      });
      fetchBanners();
    } catch (e) {
      Toast.fire({ icon: "error", title: "เปลี่ยนสถานะไม่สำเร็จ" });
    }
  };

  return (
    <>
      <Home>
        <div
          className="container-fluid px-3 px-md-4 pb-4 pt-3"
          style={{ backgroundColor: "#fafaf9", minHeight: "100vh" }}
        >
          <style>
            {`
              .premium-scrollbar::-webkit-scrollbar { width: 6px; }
              .premium-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .premium-scrollbar::-webkit-scrollbar-thumb { background: #fed7aa; border-radius: 10px; }
              .premium-scrollbar::-webkit-scrollbar-thumb:hover { background: #fb923c; }

              .table-cat-stall tbody tr {
                background-color: #ffffff;
                border-radius: 16px;
                transition: all 0.3s ease;
              }
              .table-cat-stall tbody tr:hover {
                box-shadow: 0 10px 25px rgba(234, 88, 12, 0.08);
                transform: translateY(-3px);
                z-index: 2;
                position: relative;
              }
              .table-cat-stall td {
                border-top: 10px solid #fafaf9 !important;
                border-bottom: 0 !important;
                vertical-align: middle;
              }
              .table-cat-stall td:first-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
              .table-cat-stall td:last-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; }

              .banner-preview {
                width: 120px;
                height: 60px;
                object-fit: cover;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                background-color: #f8fafc;
              }
            `}
          </style>

          {/* 🌟 Header Section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 mt-2 gap-3">
            <div>
              <div
                className="h3 mb-1 fw-bolder d-flex align-items-center"
                style={{ color: "#1e293b", letterSpacing: "-1px" }}
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
                  <i className="bi bi-images fs-5"></i>
                </div>
                จัดการป้ายแบนเนอร์ 🖼️
              </div>
              <p className="text-muted small mb-0 ms-5 ps-2">
                อัปโหลดและจัดเรียงรูปภาพโปรโมชั่นหน้าเว็บ
              </p>
            </div>

            <button
              className="btn rounded-pill px-4 shadow-sm fw-bold transition-all"
              style={{
                backgroundColor: "#ea580c",
                color: "white",
                padding: "12px 24px",
              }}
              data-bs-toggle="modal"
              data-bs-target="#bannerModal"
              onClick={handleOpenAddModal}
            >
              <i className="bi bi-plus-lg me-2 fs-5 align-middle"></i>
              เพิ่มแบนเนอร์ใหม่
            </button>
          </div>

          <div
            className="card border-0 shadow-sm rounded-4 overflow-hidden"
            style={{ backgroundColor: "#ffffff" }}
          >
            {/* 🌟 ตารางแสดงผล */}
            <div
              className="card-body p-0 px-3 bg-light"
              style={{ backgroundColor: "#fafaf9" }}
            >
              <div
                className="table-responsive premium-scrollbar pe-2 pb-3 pt-2"
                style={{ maxHeight: "70vh" }}
              >
                <table
                  className="table align-middle mb-0 text-center table-borderless table-cat-stall"
                  style={{
                    borderSpacing: "0 10px",
                    borderCollapse: "separate",
                  }}
                >
                  <thead
                    style={{
                      backgroundColor: "#fafaf9",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <tr>
                      <th
                        className="px-4 py-3 text-secondary fw-bold"
                        style={{ width: "80px" }}
                      >
                        ลำดับ
                      </th>
                      <th className="px-3 py-3 text-secondary text-start fw-bold">
                        รูปภาพ & รายละเอียด
                      </th>
                      <th className="px-3 py-3 text-secondary fw-bold">
                        สถานะ
                      </th>
                      <th
                        className="px-4 py-3 text-secondary fw-bold"
                        style={{ width: "200px" }}
                      >
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="4" className="py-5 text-muted">
                          กำลังโหลดข้อมูล...
                        </td>
                      </tr>
                    ) : banners.length > 0 ? (
                      banners.map((item) => (
                        <tr key={item.id}>
                          <td
                            className="fw-bolder fs-5"
                            style={{ color: "#ea580c" }}
                          >
                            {item.sequence}
                          </td>

                          <td className="text-start px-3">
                            <div className="d-flex align-items-center gap-3">
                              {/* รูปตัวอย่างย่อๆ */}
                              <img
                                src={item.src}
                                alt={item.alt || item.name}
                                className="banner-preview shadow-sm"
                                onError={(e) => {
                                  e.target.src =
                                    "https://placehold.co/120x60/f1f5f9/94a3b8?text=Image+Error";
                                }}
                              />
                              <div>
                                <h6 className="fw-bold mb-1 text-dark">
                                  {item.name}
                                </h6>
                                <p
                                  className="small text-muted mb-0 text-truncate"
                                  style={{ maxWidth: "250px" }}
                                >
                                  <i className="bi bi-link-45deg me-1"></i>
                                  {item.link || "ไม่ได้ตั้งค่าลิงก์"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td>
                            {/* ปุ่มคลิกสลับสถานะได้เลย */}
                            <button
                              className={`btn btn-sm rounded-pill px-3 fw-bold ${item.isActive ? "btn-success bg-success-subtle text-success border-0" : "btn-secondary bg-secondary-subtle text-secondary border-0"}`}
                              onClick={() => toggleActiveStatus(item)}
                              style={{ width: "100px" }}
                            >
                              {item.isActive ? (
                                <>
                                  <i className="bi bi-eye-fill me-1"></i>{" "}
                                  โชว์อยู่
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-eye-slash-fill me-1"></i>{" "}
                                  ปิดซ่อน
                                </>
                              )}
                            </button>
                          </td>

                          <td className="px-4">
                            <button
                              className="btn btn-sm btn-outline-primary rounded-pill px-3 me-2"
                              data-bs-toggle="modal"
                              data-bs-target="#bannerModal"
                              onClick={() => handleOpenEditModal(item)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-pill px-3"
                              onClick={() =>
                                handleDeleteBanner(item.id, item.name)
                              }
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-5 text-center bg-transparent border-0"
                        >
                          <div className="p-5">
                            <div
                              className="display-1 mb-3"
                              style={{ opacity: "0.8" }}
                            >
                              🖼️
                            </div>
                            <h5
                              className="fw-bold text-orange"
                              style={{ color: "#ea580c" }}
                            >
                              ยังไม่มีแบนเนอร์เลย
                            </h5>
                            <p className="text-muted">
                              กดปุ่ม "เพิ่มแบนเนอร์ใหม่"
                              ด้านบนเพื่อเริ่มอัปโหลดรูปกันเลย!
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

      {/* ========================================== */}
      {/* 🌟 Modal สำหรับ เพิ่ม / แก้ไข แบนเนอร์ */}
      {/* ========================================== */}
      <MyModal
        id="bannerModal"
        title={isEditing ? "✏️ แก้ไขแบนเนอร์" : "➕ เพิ่มแบนเนอร์ใหม่"}
      >
        <form onSubmit={handleSaveBanner}>
          <div
            className="modal-body p-4"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            {/* 🌟 พรีวิวรูปภาพแบบ Real-time! */}
            <div className="mb-4 text-center">
              <label className="form-label fw-bold small text-secondary w-100 text-start">
                ตัวอย่างรูปภาพ (Preview)
              </label>
              <div
                className="rounded-3 border overflow-hidden bg-light d-flex align-items-center justify-content-center shadow-sm"
                style={{ height: "180px", width: "100%" }}
              >
                {bannerForm.src ? (
                  <img
                    src={bannerForm.src}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/600x200/f8fafc/dc2626?text=URL+Invalid";
                    }}
                  />
                ) : (
                  <div className="text-muted">
                    <i className="bi bi-image text-secondary opacity-50 display-4"></i>
                    <p className="mt-2 mb-0 small">
                      วางลิงก์รูปภาพเพื่อดูตัวอย่าง
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary">
                ชื่อแบนเนอร์ <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-tag"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="เช่น โปรโมชั่นปีใหม่, ประกาศวันหยุด"
                  value={bannerForm.name}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary">
                ลิงก์รูปภาพ (Image URL) <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-link"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="https://..."
                  value={bannerForm.src}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, src: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <hr className="my-4 text-muted opacity-25" />

            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary">
                ลิงก์ปลายทางเมื่อคลิก (Optional)
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-cursor"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="วาง URL หรือเว้นว่างไว้"
                  value={bannerForm.link}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, link: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label fw-bold small text-secondary">
                  ลำดับการโชว์ (Sequence)
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <i className="bi bi-sort-numeric-down"></i>
                  </span>
                  <input
                    type="number"
                    className="form-control bg-light text-center"
                    value={bannerForm.sequence}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, sequence: e.target.value })
                    }
                  />
                </div>
                <div className="form-text small" style={{ fontSize: "11px" }}>
                  เลขน้อยสุดจะขึ้นก่อน (เช่น 1, 2, 3)
                </div>
              </div>

              <div className="col-6">
                <label className="form-label fw-bold small text-secondary">
                  สถานะ (Status)
                </label>
                <select
                  className="form-select bg-light"
                  value={bannerForm.isActive}
                  onChange={(e) =>
                    setBannerForm({
                      ...bannerForm,
                      isActive: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">🟢 เปิดใช้งาน</option>
                  <option value="false">🔴 ปิดซ่อนไว้ก่อน</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer border-0 pb-4 pe-4 bg-light rounded-bottom-4">
            <button
              type="button"
              className="btn btn-secondary rounded-pill px-4"
              id="closeModalBtn"
              data-bs-dismiss="modal"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn rounded-pill px-4 fw-bold shadow-sm"
              style={{ backgroundColor: "#ea580c", color: "white" }}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  บันทึก...
                </>
              ) : (
                <>
                  <i className="bi bi-save-fill me-2"></i> บันทึกแบนเนอร์
                </>
              )}
            </button>
          </div>
        </form>
      </MyModal>
    </>
  );
}

export default Banner;
