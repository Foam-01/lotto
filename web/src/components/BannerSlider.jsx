import { useEffect, useState } from "react";
import BannerService from "../services/banner.service";

function BannerSlider() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchActiveBanners();
  }, []);

  const fetchActiveBanners = async () => {
    try {
      const res = await BannerService.list();
      setBanners(res.data.filter((b) => b.isActive));
    } catch (e) {
      console.error("ดึงข้อมูลแบนเนอร์ไม่สำเร็จ", e);
    }
  };

  if (banners.length === 0) return null;

  // 🌟 แบนเนอร์ 1-4 เอาไปทำป้ายลอยด้านข้างแล้ว
  // เอาตั้งแต่รูปที่ 5 เป็นต้นไป มาโชว์ด้านบน
  const topBanners = banners;

  if (topBanners.length === 0) return null;

  return (
    <div className="mb-4 mt-2">
      {/* 🌟 ใช้ Bootstrap Grid (row) และแบ่งครึ่ง (col-6) เพื่อให้ได้แถวละ 2 อัน */}
      <div className="row g-3">
        {topBanners.map((b) => (
          <div key={b.id} className="col-12 col-md-6">
            <a
              href={b.link || "#"}
              target={b.link ? "_blank" : "_self"}
              rel="noreferrer"
              style={{
                display: "block",
                overflow: "hidden",
                borderRadius: "12px", // ปรับความมนให้ดูเพรียวขึ้น
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <img
                src={b.src}
                className="w-100"
                style={{
                  height: "90px", // 🌟 ปรับตรงนี้! ลดความสูงให้เป็นป้ายเรียวยาว
                  objectFit: "cover", // ให้รูปตัดพอดีกรอบ ไม่เบี้ยว
                  transition: "transform 0.3s ease",
                }}
                alt={b.name || "Banner"}
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/600x90/f1f5f9/94a3b8?text=Image+Error";
                }}
                // Effect ซูมตอนเอาเมาส์ชี้
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.03)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BannerSlider;
