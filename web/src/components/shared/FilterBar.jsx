// src/components/shared/FilterBar.jsx
//
// แถบค้นหา/ตัวกรอง มาตรฐาน วางไว้เหนือตาราง ใช้แทน toolbar ที่แต่ละหน้าเคยเขียนเอง
//
// วิธีใช้:
//   import { FilterBar, FilterBarSearch, FilterBarButton, FilterBarClear } from "../components/shared/FilterBar";
//
//   <FilterBar actions={<FilterBarButton variant="primary" onClick={...}>บันทึก</FilterBarButton>}>
//     <FilterBarSearch value={searchTerm} onChange={setSearchTerm} placeholder="ค้นหาเลขสลาก..." />
//     <FilterBarButton active={!showOnlyChanged} onClick={() => setShowOnlyChanged(false)}>
//       รายการทั้งหมด
//     </FilterBarButton>
//     <FilterBarButton active={showOnlyChanged} onClick={() => setShowOnlyChanged(true)}>
//       แก้ไขแล้ว
//     </FilterBarButton>
//     <FilterBarClear show={!!searchTerm} onClick={() => setSearchTerm("")} />
//   </FilterBar>
//
// - children คือช่องค้นหา/ตัวกรอง (ฝั่งซ้าย) actions คือปุ่มระดับรายการ เช่น Export/สร้างใหม่ (ฝั่งขวา)
// - FilterBarButton ใช้ได้ 2 แบบ: ปุ่มสลับมุมมอง (ส่ง active) หรือปุ่มกด (ส่ง variant="primary"/"outline")

export function FilterBar({ children, actions }) {
  return (
    <div
      className="card border-0 shadow-sm rounded-4 mb-3"
      style={{ backgroundColor: "var(--color-white)" }}
    >
      <div className="card-body p-3 p-md-4 d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between flex-wrap">
        <div className="d-flex flex-wrap align-items-center gap-2" style={{ flex: 1 }}>
          {children}
        </div>
        {actions && (
          <div className="d-flex flex-wrap align-items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function FilterBarSearch({
  value,
  onChange,
  placeholder = "ค้นหา...",
  ariaLabel,
  style,
}) {
  return (
    <div
      className="input-group shadow-sm rounded-pill overflow-hidden"
      style={{
        maxWidth: "360px",
        width: "100%",
        border: "1px solid var(--brand-100)",
        ...style,
      }}
    >
      <span className="input-group-text bg-light border-0 ps-4" style={{ color: "var(--brand-600)" }}>
        <i className="bi bi-search"></i>
      </span>
      <input
        type="text"
        className="form-control border-0 bg-light py-2 px-3 fw-medium"
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ outline: "none", boxShadow: "none" }}
      />
      {value && (
        <button
          type="button"
          className="btn btn-light border-0 text-muted pe-4"
          onClick={() => onChange("")}
          aria-label="ล้างคำค้นหา"
        >
          <i className="bi bi-x-circle-fill"></i>
        </button>
      )}
    </div>
  );
}

// active = โหมดตัวสลับ (segmented) — ใช้ข้าง FilterBarButton ตัวอื่นที่มี active ด้วยกัน
// variant = โหมดปุ่มกดทั่วไป: "primary" (สีแบรนด์ ทึบ) | "outline" (ขอบเทา ค่าเริ่มต้น)
export function FilterBarButton({
  children,
  active,
  variant = "outline",
  icon,
  badge,
  ...rest
}) {
  const isActive = active === true;
  const isSegment = active !== undefined;

  let style;
  if (isSegment) {
    style = {
      backgroundColor: isActive ? "var(--color-white)" : "transparent",
      color: isActive ? "var(--brand-600)" : "var(--slate-400)",
      border: "none",
      boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
    };
  } else if (variant === "primary") {
    style = {
      backgroundColor: "var(--brand-600)",
      color: "white",
      border: "none",
    };
  } else {
    style = {
      backgroundColor: "var(--color-white)",
      color: "var(--slate-600)",
      border: "1px solid var(--slate-200)",
    };
  }

  return (
    <button
      type="button"
      className="btn rounded-pill fw-bold px-3 py-2 position-relative"
      style={{ fontSize: "0.9rem", whiteSpace: "nowrap", ...style }}
      aria-pressed={isSegment ? isActive : undefined}
      {...rest}
    >
      {icon && <i className={`bi ${icon} me-2`}></i>}
      {children}
      {badge && (
        <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle shadow-sm"></span>
      )}
    </button>
  );
}

export function FilterBarClear({ show, onClick, children = "ล้างตัวกรอง" }) {
  if (!show) return null;
  return (
    <button
      type="button"
      className="btn btn-link fw-bold text-decoration-none px-2"
      style={{ color: "var(--slate-500)", fontSize: "0.85rem" }}
      onClick={onClick}
    >
      <i className="bi bi-x-lg me-1"></i>
      {children}
    </button>
  );
}

export default FilterBar;
