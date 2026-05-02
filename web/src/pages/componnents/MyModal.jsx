import React from "react";

function MyModal(props) {
  return (
    <>
      <div className="modal fade" id={props.id} tabIndex="-1">
        {/* 🌟 จุดที่แก้: เพิ่มรับค่า props.modalSize และเพิ่ม modal-dialog-scrollable */}
        <div
          className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${props.modalSize ? props.modalSize : ""}`}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold text-primary">
                {props.title}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id={props.btnCloseId}
              ></button>
            </div>
            <div className="modal-body">{props.children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyModal;
