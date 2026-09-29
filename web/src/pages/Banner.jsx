import Home from "./Home";
import { useEffect, useState } from "react";
import BannerService from "../services/banner.service";
import Swal from "sweetalert2";
import MyDrawer from "../components/MyDrawer";
import { PageHeader, PageHeaderPill } from "../components/shared/PageHeader";

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
  const [togglingIds, setTogglingIds] = useState(() => new Set());
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
      Toast.fire({ icon: "error", title: "ไม่สามารถดึงข้อมูลแบนเนอร์ได้" });
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
      const payload = { ...bannerForm, sequence: Number(bannerForm.sequence) };
      if (isEditing) {
        await BannerService.edit(editId, payload);
        Toast.fire({ icon: "success", title: "อัปเดตแบนเนอร์สำเร็จ" });
      } else {
        await BannerService.create(payload);
        Toast.fire({ icon: "success", title: "เพิ่มแบนเนอร์ใหม่เรียบร้อย" });
      }
      document.getElementById("closeModalBtn").click();
      fetchBanners();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "var(--brand-600)",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBanner = async (id, name) => {
    Swal.fire({
      title: `ลบแบนเนอร์ "${name}"?`,
      text: "รูปและข้อมูลจะถูกลบออกจากระบบอย่างถาวร ไม่สามารถกู้คืนได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--red-600)",
      cancelButtonColor: "var(--slate-400)",
      confirmButtonText: "ยืนยันการลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await BannerService.remove(id);
          Toast.fire({ icon: "success", title: "ลบแบนเนอร์ออกแล้ว" });
          fetchBanners();
        } catch (e) {
          Toast.fire({ icon: "error", title: "ลบไม่สำเร็จ เกิดข้อผิดพลาด" });
        }
      }
    });
  };

  const toggleActiveStatus = async (item) => {
    if (togglingIds.has(item.id)) return; // 🛡️ กันคลิกรัวๆ ยิง request ซ้อนสำหรับแบนเนอร์เดียวกัน
    setTogglingIds((prev) => new Set(prev).add(item.id));
    try {
      const payload = { ...item, isActive: !item.isActive };
      await BannerService.edit(item.id, payload);
      Toast.fire({
        icon: "success",
        title: `เปลี่ยนสถานะเป็น ${payload.isActive ? "เปิดใช้งาน" : "ปิดซ่อน"} แล้ว`,
      });
      fetchBanners();
    } catch (e) {
      Toast.fire({ icon: "error", title: "เปลี่ยนสถานะไม่สำเร็จ" });
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  return (
    <>
      <Home>
        <style>{`
          /* ── Page base ── */
          .bn-page {
            background: var(--slate-50);
            min-height: 100vh;
            padding: 20px 20px 40px;
          }

          .bn-add-btn {
            background: var(--blue-50);
            color: var(--blue-700);
            border: 1px solid var(--blue-100, var(--blue-50));
            border-radius: var(--radius-sm);
            padding: 10px 20px;
            font-weight: 600;
            font-size: 0.88rem;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.15s;
            position: relative;
            z-index: 1;
            white-space: nowrap;
          }
          .bn-add-btn:hover {
            background: var(--blue-100, var(--blue-50));
          }
          .bn-add-btn i { font-size: 1rem; }

          /* ── Floating card ── */
          .bn-card {
            margin: 0;
            background: var(--color-white);
            border-radius: var(--radius-lg);
            border: 1px solid var(--slate-200);
            box-shadow: var(--shadow-card);
            overflow: hidden;
            position: relative;
          }

          /* ── Table ── */
          .bn-table-wrap {
            max-height: 62vh;
            overflow-y: auto;
            overflow-x: auto;
            padding: 4px 16px 16px;
          }
          .bn-table-wrap::-webkit-scrollbar { width: 4px; }
          .bn-table-wrap::-webkit-scrollbar-track { background: transparent; }
          .bn-table-wrap::-webkit-scrollbar-thumb { background: var(--brand-200); border-radius: var(--radius-md); }
          .bn-table-wrap::-webkit-scrollbar-thumb:hover { background: var(--brand-400); }

          .bn-table {
            width: 100%;
            border-collapse: collapse;
          }
          .bn-table thead th {
            padding: 12px 14px;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--slate-500);
            border: none;
            border-bottom: 1px solid var(--slate-200);
            position: sticky;
            top: 0;
            z-index: 5;
            background: var(--slate-50);
            white-space: nowrap;
          }
          .bn-table tbody tr {
            background: var(--color-white);
            transition: background-color 0.15s;
          }
          .bn-table tbody tr:hover {
            background: var(--slate-50);
          }
          .bn-table tbody td {
            padding: 14px 14px;
            border-top: 1px solid var(--slate-100);
            border-bottom: none;
            vertical-align: middle;
          }

          /* ── Sequence badge ── */
          .bn-seq {
            width: 36px;
            height: 36px;
            border-radius: var(--radius-sm);
            background: var(--blue-50);
            color: var(--blue-700);
            font-weight: 700;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: auto;
          }

          /* ── Banner preview image ── */
          .bn-thumb {
            width: 110px;
            height: 58px;
            object-fit: cover;
            border-radius: var(--radius-md);
            border: 1.5px solid var(--slate-100);
            background: var(--slate-50);
            box-shadow: 0 2px 8px rgba(0,0,0,0.07);
            flex-shrink: 0;
          }

          /* ── Status pill ── */
          .bn-status-on {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: var(--green-100);
            color: var(--green-700);
            border: none;
            border-radius: var(--radius-pill);
            padding: 6px 14px;
            font-size: 0.78rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s;
          }
          .bn-status-on:hover {
            filter: brightness(0.97);
          }
          .bn-status-off {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: var(--slate-100);
            color: var(--slate-500);
            border: none;
            border-radius: var(--radius-pill);
            padding: 6px 14px;
            font-size: 0.78rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s;
          }
          .bn-status-off:hover {
            filter: brightness(0.97);
          }
          .bn-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
          }

          /* ── Action buttons ── */
          .bn-btn-edit {
            width: 36px;
            height: 36px;
            border-radius: var(--radius-sm);
            border: 1px solid var(--slate-200);
            background: var(--color-white);
            color: var(--slate-600);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.15s;
          }
          .bn-btn-edit:hover {
            background: var(--slate-50);
          }
          .bn-btn-del {
            width: 36px;
            height: 36px;
            border-radius: var(--radius-sm);
            border: 1px solid var(--red-100);
            background: var(--red-50);
            color: var(--red-600);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.15s;
          }
          .bn-btn-del:hover {
            filter: brightness(0.97);
          }

          /* ── Empty state ── */
          .bn-empty {
            padding: 60px 20px;
            text-align: center;
          }
          .bn-empty-icon {
            font-size: 4rem;
            display: block;
            margin-bottom: 16px;
            opacity: 0.5;
          }

          /* ── Modal enhancements ── */
          .bn-modal-preview {
            border-radius: var(--radius-lg);
            border: 1px solid var(--slate-200);
            background: var(--slate-50);
            height: 110px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            transition: border-color 0.2s;
          }
          .bn-modal-preview:has(img) {
            background: var(--color-white);
          }
          .bn-field-label {
            font-size: 0.78rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--slate-500);
            margin-bottom: 6px;
          }
          .bn-input {
            background: var(--slate-50);
            border: 1px solid var(--slate-200);
            border-radius: var(--radius-md);
            padding: 10px 14px;
            font-size: 0.9rem;
            width: 100%;
            transition: border-color 0.15s, box-shadow 0.15s;
            outline: none;
            color: var(--slate-900);
          }
          .bn-input:focus {
            border-color: var(--blue-500, #3b82f6);
            box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
            background: var(--color-white);
          }
          .bn-input-group {
            display: flex;
            align-items: center;
            background: var(--slate-50);
            border: 1px solid var(--slate-200);
            border-radius: var(--radius-md);
            overflow: hidden;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .bn-input-group:focus-within {
            border-color: var(--blue-500, #3b82f6);
            box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
            background: var(--color-white);
          }
          .bn-input-icon {
            padding: 0 12px;
            color: var(--slate-400);
            font-size: 1rem;
            flex-shrink: 0;
          }
          .bn-input-group input,
          .bn-input-group select {
            background: transparent;
            border: none;
            padding: 10px 12px 10px 0;
            font-size: 0.9rem;
            width: 100%;
            outline: none;
            color: var(--slate-900);
          }
          .bn-divider {
            border: none;
            border-top: 1px solid var(--slate-100);
            margin: 20px 0;
          }
          .bn-save-btn {
            background: var(--blue-50);
            color: var(--blue-700);
            border: 1px solid var(--blue-100, var(--blue-50));
            border-radius: var(--radius-sm);
            padding: 10px 24px;
            font-weight: 700;
            font-size: 0.88rem;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.15s;
            cursor: pointer;
          }
          .bn-save-btn:hover:not(:disabled) {
            background: var(--blue-100, var(--blue-50));
          }
          .bn-save-btn:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }
          .bn-cancel-btn {
            background: var(--slate-100);
            color: var(--slate-500);
            border: none;
            border-radius: var(--radius-pill);
            padding: 11px 24px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background 0.15s;
          }
          .bn-cancel-btn:hover {
            background: var(--slate-200);
          }

          /* ── Loading shimmer ── */
          @keyframes shimmer {
            0% { background-position: -600px 0; }
            100% { background-position: 600px 0; }
          }
          .bn-shimmer td {
            padding: 18px 14px;
          }
          .bn-shimmer-bar {
            height: 14px;
            border-radius: 6px;
            background: linear-gradient(90deg, var(--slate-100) 25%, var(--slate-200) 50%, var(--slate-100) 75%);
            background-size: 600px 100%;
            animation: shimmer 1.4s infinite;
          }
        `}</style>

        <div className="bn-page">
          {/* ── Header (มาตรฐาน PageHeader) ── */}
          <PageHeader
            eyebrow="ตั้งค่าระบบ"
            title="จัดการป้ายแบนเนอร์"
            description="อัปโหลดและจัดเรียงรูปภาพโปรโมชั่นหน้าเว็บ"
            summary={
              !isLoading &&
              banners.length > 0 && (
                <>
                  <PageHeaderPill tone="blue">
                    ทั้งหมด {banners.length}
                  </PageHeaderPill>
                  <PageHeaderPill tone="emerald">
                    เปิดใช้งาน {banners.filter((b) => b.isActive).length}
                  </PageHeaderPill>
                  <PageHeaderPill tone="muted">
                    ปิดซ่อน {banners.filter((b) => !b.isActive).length}
                  </PageHeaderPill>
                </>
              )
            }
            actions={
              <button
                className="bn-add-btn"
                data-bs-toggle="offcanvas"
                data-bs-target="#bannerModal"
                onClick={handleOpenAddModal}
              >
                <i className="bi bi-plus-lg"></i>
                เพิ่มแบนเนอร์ใหม่
              </button>
            }
          />

          {/* ── Floating card ── */}
          <div className="bn-card" style={{ margin: "0" }}>
            {/* Table */}
            <div className="bn-table-wrap">
              <table className="bn-table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: 60, textAlign: "center" }}>ลำดับ</th>
                    <th scope="col">รูปภาพ & รายละเอียด</th>
                    <th scope="col" style={{ width: 130, textAlign: "center" }}>สถานะ</th>
                    <th scope="col" style={{ width: 110, textAlign: "center" }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="bn-shimmer">
                        <td style={{ textAlign: "center" }}>
                          <div
                            className="bn-shimmer-bar"
                            style={{
                              width: 36,
                              margin: "auto",
                              height: 36,
                              borderRadius: 10,
                            }}
                          ></div>
                        </td>
                        <td>
                          <div className="d-flex gap-3 align-items-center">
                            <div
                              className="bn-shimmer-bar"
                              style={{
                                width: 110,
                                height: 58,
                                borderRadius: 10,
                                flexShrink: 0,
                              }}
                            ></div>
                            <div style={{ flex: 1 }}>
                              <div
                                className="bn-shimmer-bar"
                                style={{ width: "60%", marginBottom: 8 }}
                              ></div>
                              <div
                                className="bn-shimmer-bar"
                                style={{ width: "40%", height: 10 }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div
                            className="bn-shimmer-bar"
                            style={{
                              width: 90,
                              margin: "auto",
                              height: 30,
                              borderRadius: 50,
                            }}
                          ></div>
                        </td>
                        <td>
                          <div
                            className="bn-shimmer-bar"
                            style={{
                              width: 80,
                              margin: "auto",
                              height: 34,
                              borderRadius: 10,
                            }}
                          ></div>
                        </td>
                      </tr>
                    ))
                  ) : banners.length > 0 ? (
                    banners.map((item) => (
                      <tr key={item.id}>
                        <td style={{ textAlign: "center" }}>
                          <div className="bn-seq">{item.sequence}</div>
                        </td>

                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={item.src}
                              alt={item.alt || item.name}
                              className="bn-thumb"
                              onError={(e) => {
                                e.target.src =
                                  "https://placehold.co/110x58/f1f5f9/94a3b8?text=Error";
                              }}
                            />
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "var(--slate-900)",
                                  fontSize: "0.92rem",
                                  marginBottom: 4,
                                }}
                              >
                                {item.name}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.78rem",
                                  color: "var(--slate-400)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <i className="bi bi-link-45deg"></i>
                                <span
                                  className="text-truncate"
                                  style={{ maxWidth: 220 }}
                                >
                                  {item.link || "ไม่ได้ตั้งค่าลิงก์"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <button
                            className={
                              item.isActive ? "bn-status-on" : "bn-status-off"
                            }
                            onClick={() => toggleActiveStatus(item)}
                            disabled={togglingIds.has(item.id)}
                          >
                            <span
                              className="bn-dot"
                              style={{
                                background: item.isActive
                                  ? "var(--green-600)"
                                  : "var(--slate-300)",
                              }}
                            ></span>
                            {item.isActive ? "แสดงอยู่" : "ปิดซ่อน"}
                          </button>
                        </td>

                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="bn-btn-edit"
                              data-bs-toggle="offcanvas"
                              data-bs-target="#bannerModal"
                              onClick={() => handleOpenEditModal(item)}
                              title="แก้ไข"
                              aria-label="แก้ไขแบนเนอร์"
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button
                              className="bn-btn-del"
                              onClick={() =>
                                handleDeleteBanner(item.id, item.name)
                              }
                              title="ลบ"
                              aria-label="ลบแบนเนอร์"
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">
                        <div className="bn-empty">
                          <h5 style={{ color: "var(--slate-700)", fontWeight: 700 }}>
                            ยังไม่มีแบนเนอร์เลย
                          </h5>
                          <p style={{ color: "var(--slate-400)", margin: 0 }}>
                            กดปุ่ม "เพิ่มแบนเนอร์ใหม่"
                            ด้านบนเพื่อเริ่มอัปโหลดรูปภาพ
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
      </Home>

      {/* ── Drawer ── */}
      <MyDrawer
        id="bannerModal"
        title={isEditing ? "แก้ไขแบนเนอร์" : "เพิ่มแบนเนอร์ใหม่"}
        width="520px"
      >
        <form
          onSubmit={handleSaveBanner}
          className="d-flex flex-column h-100"
        >
          <div
            className="p-4 flex-grow-1"
            style={{ overflowY: "auto" }}
          >
            {/* Preview */}
            <div className="mb-4">
              <div className="bn-field-label mb-2">
                ตัวอย่างรูปภาพ (Preview)
              </div>
              <div className="bn-modal-preview">
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
                        "https://placehold.co/600x200/fff7ed/dc2626?text=URL+Invalid";
                    }}
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "var(--slate-300)" }}>
                    <i
                      className="bi bi-image"
                      style={{
                        fontSize: "2.5rem",
                        display: "block",
                        marginBottom: 8,
                      }}
                    ></i>
                    <span style={{ fontSize: "0.8rem" }}>
                      วางลิงก์รูปภาพด้านล่างเพื่อดูตัวอย่าง
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="mb-3">
              <label htmlFor="bannerNameInput" className="bn-field-label">
                ชื่อแบนเนอร์ <span style={{ color: "var(--red-500)" }}>*</span>
              </label>
              <div className="bn-input-group">
                <span className="bn-input-icon">
                  <i className="bi bi-tag-fill"></i>
                </span>
                <input
                  id="bannerNameInput"
                  type="text"
                  placeholder="เช่น โปรโมชั่นปีใหม่, ประกาศวันหยุด"
                  value={bannerForm.name}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="mb-3">
              <label htmlFor="bannerSrcInput" className="bn-field-label">
                ลิงก์รูปภาพ (Image URL){" "}
                <span style={{ color: "var(--red-500)" }}>*</span>
              </label>
              <div className="bn-input-group">
                <span className="bn-input-icon">
                  <i className="bi bi-link-45deg"></i>
                </span>
                <input
                  id="bannerSrcInput"
                  type="text"
                  placeholder="https://..."
                  value={bannerForm.src}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, src: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <hr className="bn-divider" />

            {/* Link */}
            <div className="mb-3">
              <label htmlFor="bannerLinkInput" className="bn-field-label">
                ลิงก์ปลายทางเมื่อคลิก (Optional)
              </label>
              <div className="bn-input-group">
                <span className="bn-input-icon">
                  <i className="bi bi-cursor-fill"></i>
                </span>
                <input
                  id="bannerLinkInput"
                  type="text"
                  placeholder="วาง URL หรือเว้นว่างไว้"
                  value={bannerForm.link}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, link: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Sequence + Status */}
            <div className="row g-3">
              <div className="col-6">
                <label htmlFor="bannerSequenceInput" className="bn-field-label">
                  ลำดับการแสดง
                </label>
                <div className="bn-input-group">
                  <span className="bn-input-icon">
                    <i className="bi bi-sort-numeric-down"></i>
                  </span>
                  <input
                    id="bannerSequenceInput"
                    type="number"
                    value={bannerForm.sequence}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, sequence: e.target.value })
                    }
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--slate-500)",
                    marginTop: 4,
                  }}
                >
                  เลขน้อยจะขึ้นก่อน (1, 2, 3...)
                </div>
              </div>
              <div className="col-6">
                <label htmlFor="bannerStatusSelect" className="bn-field-label">
                  สถานะ
                </label>
                <div className="bn-input-group">
                  <span className="bn-input-icon">
                    <i className="bi bi-toggles"></i>
                  </span>
                  <select
                    id="bannerStatusSelect"
                    value={bannerForm.isActive}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        isActive: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">🟢 เปิดใช้งาน</option>
                    <option value="false">🔴 ปิดใช้งาน</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="d-flex justify-content-end gap-2 border-0 py-3 px-4"
            style={{ background: "var(--stone-50)" }}
          >
            <button
              type="button"
              className="bn-cancel-btn"
              id="closeModalBtn"
              data-bs-dismiss="offcanvas"
            >
              ยกเลิก
            </button>
            <button type="submit" disabled={isSaving} className="bn-save-btn">
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <i className="bi bi-save-fill"></i>
                  บันทึกแบนเนอร์
                </>
              )}
            </button>
          </div>
        </form>
      </MyDrawer>
    </>
  );
}

export default Banner;
