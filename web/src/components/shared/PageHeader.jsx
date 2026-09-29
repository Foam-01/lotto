// src/components/shared/PageHeader.jsx
//
// หัวข้อหน้ามาตรฐาน ใช้แทนหัวข้อที่แต่ละหน้าเคยเขียนเอง (ไอคอนสี่เหลี่ยม + h1 + ปุ่ม
// คนละแบบ คนละขนาด) ให้ทุกหน้าหน้าตาเหมือนกัน แก้ทีเดียวที่นี่ที่เดียว
//
// วิธีใช้:
//   import { PageHeader, PageHeaderPill } from "../components/shared/PageHeader";
//
//   <PageHeader
//     eyebrow="จัดการสลาก"              // (optional) หมวดเล็กๆ เหนือชื่อหน้า
//     title="ปรับราคาแบบเร่งด่วน"       // ชื่อหน้า
//     description="แก้ไขราคาขายหลายใบพร้อมกัน แล้วกดบันทึกทีเดียว"  // (optional) 1 บรรทัด
//     count="128 ใบ"                    // (optional) ป้ายจำนวนเดี่ยว ห้ามใช้คู่กับ summary
//     summary={<><PageHeaderPill tone="brand">พร้อมขาย 80</PageHeaderPill>...</>} // (optional) ป้ายหลายอัน แทน count
//     actions={<button ...>บันทึก</button>} // (optional) ปุ่มระดับหน้า ชิดขวา
//   />
//
// - count กับ summary เลือกใช้อย่างใดอย่างหนึ่ง ไม่ใช้พร้อมกัน
// - description ควรจบใน 1 บรรทัด ยาวไปให้ตัดคำ ไม่ใช่ลดขนาดฟอนต์เอง
// - ห้ามแก้สี/ขนาะฟอนต์ตรงนี้เป็นรายหน้า ถ้าหน้าไหนต้องการสไตล์ต่าง ให้คุยกันว่าจะเพิ่ม prop ใหม่ดีกว่า

export function PageHeader({
  eyebrow,
  title,
  description,
  count,
  summary,
  actions,
}) {
  return (
    <div
      className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 mt-2 gap-3"
      style={{ flexWrap: "wrap" }}
    >
      <div className="d-flex align-items-start gap-3" style={{ minWidth: 0 }}>
        <div style={{ minWidth: 0 }}>
          {eyebrow && (
            <div
              className="d-inline-flex align-items-center"
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#1d4ed8",
                background: "linear-gradient(90deg, #dbeafe, #eff6ff)",
                border: "1px solid #bfdbfe",
                borderRadius: "50rem",
                padding: "4px 14px",
                marginBottom: "8px",
              }}
            >
              {eyebrow}
            </div>
          )}
          <div className="d-flex align-items-center flex-wrap gap-2">
            <h1
              className="h3 mb-0 fw-bolder"
              style={{ color: "var(--slate-900)", letterSpacing: "-0.5px" }}
            >
              {title}
            </h1>
            {count && <PageHeaderPill tone="blue">{count}</PageHeaderPill>}
            {summary}
          </div>
          {description && (
            <p
              className="mb-0 text-muted"
              style={{ fontSize: "0.9rem", marginTop: "4px", maxWidth: "48rem" }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="d-flex gap-2 flex-wrap flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}

// ป้ายเล็กสำหรับ count เดี่ยว หรือประกอบเป็นชุด summary หลายอัน
// tone: brand (ค่าเริ่มต้น) | amber (รอ) | blue (กำลังทำ) | emerald (เสร็จ) | rose (มีปัญหา) | muted (อื่นๆ)
const PILL_TONES = {
  brand: { bg: "var(--brand-50)", color: "var(--brand-700)", border: "var(--brand-200)" },
  amber: { bg: "var(--amber-100)", color: "#1d4ed8", border: "var(--amber-500)" },
  blue: { bg: "var(--blue-50)", color: "var(--blue-700)", border: "var(--blue-500)" },
  emerald: { bg: "var(--emerald-50)", color: "var(--emerald-700)", border: "var(--emerald-500)" },
  rose: { bg: "var(--rose-50)", color: "var(--rose-600)", border: "var(--rose-600)" },
  muted: { bg: "var(--slate-100)", color: "var(--slate-600)", border: "var(--slate-200)" },
};

export function PageHeaderPill({ tone = "brand", children }) {
  const t = PILL_TONES[tone] || PILL_TONES.brand;
  return (
    <span
      className="fw-bold d-inline-flex align-items-center"
      style={{
        backgroundColor: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
        borderRadius: "50rem",
        padding: "3px 12px",
        fontSize: "0.8rem",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export default PageHeader;
