import React from "react";

function MyModal(props) {
  return (
    <>
      {/* 🌟 1. ดึง id จาก props.id มาใช้ */}
      <div className="modal fade" id={props.id} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
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
            <div className="modal-body">
              {/* 🌟 2. ใช้ props.children (พิมพ์ให้ถูก) และไม่ต้องครอบ <p> */}
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyModal;
