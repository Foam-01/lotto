import React from "react";

// 🌟 variant="drawer" ใช้ Bootstrap Offcanvas (เลื่อนออกจากขอบขวาจอ) แทน Modal
// กลางจอแบบเดิม — ค่า default (ไม่ส่ง variant) ยังเป็น modal เดิมทุกประการ
// เพื่อไม่กระทบหน้าอื่นที่ใช้ MyModal อยู่ก่อนแล้ว
function MyModal(props) {
  if (props.variant === "drawer") {
    return (
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id={props.id}
        aria-labelledby={`${props.id}-title`}
        style={{ width: "min(480px, 100vw)" }}
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

  return (
    <>
      <div
        className="modal fade"
        id={props.id}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${props.id}-title`}
      >
        {/* 🌟 จุดที่แก้: เพิ่มรับค่า props.modalSize และเพิ่ม modal-dialog-scrollable */}
        <div
          className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${props.modalSize ? props.modalSize : ""}`}
        >
          <div
            className="modal-content"
            style={{
              borderRadius: "var(--radius-xl)",
              border: "none",
              overflow: "hidden",
              boxShadow: "var(--shadow-card-lifted)",
            }}
          >
            <div
              className="modal-header"
              style={{
                backgroundColor: "var(--brand-50)",
                borderBottom: "2px solid var(--brand-200)",
                padding: "20px 30px",
              }}
            >
              <h5
                className="modal-title fw-bold"
                id={`${props.id}-title`}
                style={{ color: "var(--brand-600)", fontSize: "20px" }}
              >
                {props.title}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="ปิดหน้าต่าง"
                id={props.btnCloseId}
              ></button>
            </div>
            <div className="modal-body" style={{ padding: "25px 30px" }}>
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyModal;
