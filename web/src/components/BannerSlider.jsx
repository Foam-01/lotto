import { useEffect, useState } from "react";
import BannerService from "../services/banner.service";

function BannerSlider() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchActiveBanners();
  }, []);

  const fetchActiveBanners = async () => {
    const res = await BannerService.list();
    setBanners(res.data.filter((b) => b.isActive));
  };

  if (banners.length === 0) return null;

  // 🌟 แยกแบนเนอร์: 4 อันแรกไว้ซ้าย-ขวา, ที่เหลือไว้บน
  const sideBanners = banners.slice(0, 4);
  const topBanners = banners.slice(4);

  return (
    <>
      {/* 🌟 แบนเนอร์ด้านบน (ถ้ามีเกิน 4 อัน) */}
      {topBanners.length > 0 && (
        <div
          className="carousel slide mb-4"
          id="topBanner"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner rounded-4">
            {topBanners.map((b, i) => (
              <div
                key={b.id}
                className={`carousel-item ${i === 0 ? "active" : ""}`}
              >
                <img
                  src={b.src}
                  className="d-block w-100"
                  style={{ height: "150px", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🌟 สำหรับ Sidebar (ต้องเอาไปเรียกใช้ในหน้า Index.js) */}
      {/* ผมทำแยกเป็น Component ให้เจ้านายเอาไปแปะใน Grid ซ้าย-ขวา */}
    </>
  );
}

// 🌟 ตัวนี้เอาไว้เรียกในหน้า Index.js (Sidebar Banner)
export const SidebarBanner = ({ position }) => {
  const [banners, setBanners] = useState([]);
  useEffect(() => {
    BannerService.list().then((res) =>
      setBanners(res.data.filter((b) => b.isActive)),
    );
  }, []);

  // กรองเอาตามตำแหน่ง (สมมติ Sequence 1,2 คือซ้าย / 3,4 คือขวา)
  const myBanners =
    position === "left" ? banners.slice(0, 2) : banners.slice(2, 4);

  return (
    <div className="d-flex flex-column gap-3">
      {myBanners.map((b) => (
        <a key={b.id} href={b.link} target="_blank">
          <img
            src={b.src}
            style={{
              width: "120px",
              height: "240px",
              borderRadius: "12px",
              objectFit: "cover",
            }}
          />
        </a>
      ))}
    </div>
  );
};

export default BannerSlider;
