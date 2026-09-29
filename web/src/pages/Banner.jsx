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
    }
  };

  return (
    <>
      <Home>
        <style>{`
          /* ── Page base ── */
          .bn-page {
            background: var(--warm-50);
            min-height: 100vh;
            padding: 0 0 40px;
          }

          /* ── Hero header strip ── */
          .bn-hero {
            background: linear-gradient(135deg, var(--brand-700) 0%, var(--brand-600) 55%, var(--brand-500) 100%);
            padding: 28px 28px 56px;
            position: relative;
            overflow: hidden;
          }
          .bn-hero::before {
            content: "";
            position: absolute;
            inset: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }
          .bn-hero::after {
            content: "";
            position: absolute;
            right: -60px;
            top: -60px;
            width: 260px;
            height: 260px;
            border-radius: 50%;
            background: rgba(255,255,255,0.06);
          }
          .bn-hero-title {
            font-size: 1.65rem;
            font-weight: 800;
            color: var(--color-white);
            letter-spacing: -0.5px;
            margin: 0 0 4px;
            position: relative;
            z-index: 1;
          }
          .bn-hero-sub {
            color: rgba(255,255,255,0.75);
            font-size: 0.875rem;
            margin: 0;
            position: relative;
            z-index: 1;
          }
          .bn-hero-icon {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(6px);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            margin-right: 14px;
            flex-shrink: 0;
            position: relative;
            z-index: 1;
          }
          .bn-add-btn {
            background: var(--color-white);
            color: var(--brand-600);
            border: none;
            border-radius: var(--radius-pill);
            padding: 10px 22px;
            font-weight: 700;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.18);
            transition: transform 0.15s, box-shadow 0.15s;
            position: relative;
            z-index: 1;
            white-space: nowrap;
          }
          .bn-add-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 28px rgba(0,0,0,0.22);
            color: var(--brand-700);
          }
          .bn-add-btn i { font-size: 1.1rem; }

          /* ── Floating card ── */
          .bn-card {
            margin: -28px 20px 0;
            background: var(--color-white);
            border-radius: var(--radius-xl);
            box-shadow: 0 8px 40px rgba(0,0,0,0.08);
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
            border-collapse: separate;
            border-spacing: 0 8px;
          }
          .bn-table thead th {
            padding: 10px 14px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: var(--slate-500);
            background: transparent;
            border: none;
            position: sticky;
            top: 0;
            z-index: 5;
            background: var(--color-white);
            white-space: nowrap;
          }
          .bn-table tbody tr {
            background: var(--color-white);
            transition: box-shadow 0.25s, transform 0.2s;
          }
          .bn-table tbody tr:hover {
            box-shadow: 0 6px 24px rgba(234,88,12,0.1);
            transform: translateY(-2px);
          }
          .bn-table tbody td {
            padding: 14px 14px;
            border-top: 8px solid var(--warm-50);
            border-bottom: none;
            vertical-align: middle;
          }
          .bn-table tbody td:first-child {
            border-radius: 14px 0 0 14px;
          }
          .bn-table tbody td:last-child {
            border-radius: 0 14px 14px 0;
          }

          /* ── Sequence badge ── */
          .bn-seq {
            width: 36px;
            height: 36px;
            border-radius: var(--radius-md);
            background: linear-gradient(135deg, var(--brand-50), var(--brand-200));
            color: var(--brand-700);
            font-weight: 800;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: auto;
            border: 1.5px solid var(--brand-200);
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
            background: #f0fdf4;
            color: var(--green-600);
            border: 1.5px solid var(--green-200);
            border-radius: var(--radius-pill);
            padding: 8px 16px;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s;
          }
          .bn-status-on:hover {
            background: var(--green-100);
            box-shadow: 0 2px 8px rgba(22,163,74,0.15);
          }
          .bn-status-off {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: var(--slate-50);
            color: var(--slate-500);
            border: 1.5px solid var(--slate-200);
            border-radius: var(--radius-pill);
            padding: 8px 16px;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s;
          }
          .bn-status-off:hover {
            background: var(--slate-100);
            box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          }
          .bn-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
          }

          /* ── Action buttons ── */
          .bn-btn-edit {
            width: 40px;
            height: 40px;
            border-radius: var(--radius-md);
            border: 1.5px solid #bfdbfe;
            background: var(--blue-50);
            color: var(--blue-500);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.15s;
          }
          .bn-btn-edit:hover {
            background: var(--blue-500);
            color: var(--color-white);
            border-color: var(--blue-500);
            box-shadow: 0 4px 12px rgba(59,130,246,0.3);
          }
          .bn-btn-del {
            width: 40px;
            height: 40px;
            border-radius: var(--radius-md);
            border: 1.5px solid var(--red-200);
            background: #fff5f5;
            color: var(--red-500);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.15s;
          }
          .bn-btn-del:hover {
            background: var(--red-500);
            color: var(--color-white);
            border-color: var(--red-500);
            box-shadow: 0 4px 12px rgba(239,68,68,0.3);
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
            border-radius: 14px;
            border: 2px dashed var(--brand-200);
            background: var(--brand-50);
            height: 170px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            transition: border-color 0.2s;
          }
          .bn-modal-preview:has(img) {
            border-style: solid;
            border-color: var(--brand-300);
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
            background: var(--warm-50);
            border: 1.5px solid #e8e2da;
            border-radius: var(--radius-md);
            padding: 10px 14px;
            font-size: 0.9rem;
            width: 100%;
            transition: border-color 0.15s, box-shadow 0.15s;
            outline: none;
            color: var(--slate-900);
          }
          .bn-input:focus {
            border-color: var(--brand-600);
            box-shadow: 0 0 0 3px rgba(234,88,12,0.12);
            background: var(--color-white);
          }
          .bn-input-group {
            display: flex;
            align-items: center;
            background: var(--warm-50);
            border: 1.5px solid #e8e2da;
            border-radius: var(--radius-md);
            overflow: hidden;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .bn-input-group:focus-within {
            border-color: var(--brand-600);
            box-shadow: 0 0 0 3px rgba(234,88,12,0.12);
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
            border-top: 1.5px dashed #f0e8e0;
            margin: 20px 0;
          }
          .bn-save-btn {
            background: linear-gradient(135deg, var(--brand-600), var(--brand-700));
            color: var(--color-white);
            border: none;
            border-radius: var(--radius-pill);
            padding: 11px 28px;
            font-weight: 700;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 16px rgba(234,88,12,0.35);
            transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
            cursor: pointer;
          }
          .bn-save-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(234,88,12,0.4);
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

          /* ── Stats bar ── */
          .bn-stats {
            display: flex;
            gap: 0;
            border-bottom: 1px solid #f1ede8;
          }
          .bn-stat {
            flex: 1;
            padding: 14px 20px;
            text-align: center;
            border-right: 1px solid #f1ede8;
          }
          .bn-stat:last-child { border-right: none; }
          .bn-stat-num {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--slate-900);
            line-height: 1;
          }
          .bn-stat-label {
            font-size: 0.72rem;
            color: var(--slate-500);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 3px;
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
          {/* ── Hero header ── */}
          <div className="bn-hero d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center">
              <div className="bn-hero-icon">🖼️</div>
              <div>
                <h1 className="bn-hero-title">จัดการป้ายแบนเนอร์</h1>
                <p className="bn-hero-sub">
                  อัปโหลดและจัดเรียงรูปภาพโปรโมชั่นหน้าเว็บ
                </p>
              </div>
            </div>
            <button
              className="bn-add-btn"
              data-bs-toggle="modal"
              data-bs-target="#bannerModal"
              onClick={handleOpenAddModal}
            >
              <i className="bi bi-plus-lg"></i>
              เพิ่มแบนเนอร์ใหม่
            </button>
          </div>

          {/* ── Floating card ── */}
          <div className="bn-card">
            {/* Stats bar */}
            {!isLoading && banners.length > 0 && (
              <div className="bn-stats">
                <div className="bn-stat">
                  <div className="bn-stat-num">{banners.length}</div>
                  <div className="bn-stat-label">ทั้งหมด</div>
                </div>
                <div className="bn-stat">
                  <div className="bn-stat-num" style={{ color: "var(--green-600)" }}>
                    {banners.filter((b) => b.isActive).length}
                  </div>
                  <div className="bn-stat-label">เปิดใช้งาน</div>
                </div>
                <div className="bn-stat">
                  <div className="bn-stat-num" style={{ color: "var(--slate-400)" }}>
                    {banners.filter((b) => !b.isActive).length}
                  </div>
                  <div className="bn-stat-label">ปิดซ่อน</div>
                </div>
              </div>
            )}

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
                              data-bs-toggle="modal"
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
                          <span className="bn-empty-icon">🖼️</span>
                          <h5 style={{ color: "var(--brand-600)", fontWeight: 800 }}>
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

      {/* ── Modal ── */}
      <MyModal
        id="bannerModal"
        title={isEditing ? "✏️ แก้ไขแบนเนอร์" : "➕ เพิ่มแบนเนอร์ใหม่"}
      >
        <form onSubmit={handleSaveBanner}>
          <div
            className="modal-body p-4"
            style={{ maxHeight: "72vh", overflowY: "auto" }}
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
            className="modal-footer border-0 pb-4 px-4"
            style={{ background: "var(--stone-50)", borderRadius: "0 0 16px 16px" }}
          >
            <button
              type="button"
              className="bn-cancel-btn"
              id="closeModalBtn"
              data-bs-dismiss="modal"
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
      </MyModal>
    </>
  );
}

export default Banner;
