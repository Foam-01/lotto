import React from "react";

function MyModal(props) {
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
