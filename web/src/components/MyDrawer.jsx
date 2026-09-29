import React from "react";

function MyDrawer(props) {
  return (
    <div
      className="offcanvas offcanvas-end"
      tabIndex="-1"
      id={props.id}
      aria-labelledby={`${props.id}-title`}
      style={{ width: props.width || "480px" }}
    >
      <div
        className="offcanvas-header"
        style={{
          backgroundColor: "var(--brand-50)",
          borderBottom: "2px solid var(--brand-200)",
          padding: "20px 30px",
        }}
      >
        <h5
          className="offcanvas-title fw-bold"
          id={`${props.id}-title`}
          style={{ color: "var(--brand-600)", fontSize: "20px" }}
        >
          {props.title}
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="ปิดหน้าต่าง"
          id={props.btnCloseId}
        ></button>
      </div>
      <div className="offcanvas-body p-0">{props.children}</div>
    </div>
  );
}

export default MyDrawer;
