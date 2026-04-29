import { useEffect, useState } from "react";
import Home from "./Home";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import MyModal from "./componnents/MyModal";

function LottoForSend() {
  const [billSales, setBillSales] = useState([]);
  const [billSale, setBillSale] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(config.apiPath + "/api/lotto/lottoForSend");
      if (res.data.results !== undefined) {
        setBillSales(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลสลากได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#ea580c",
      });
    }
  };

  const handleInfo = (item) => {
    setBillSale(item);
  };

  return (
    <>
      <Home>
        <div className="h4">รายการต้องจัดส่ง</div>

        <table className="table mt-3 table-bordered table-striped">
          <thead>
            <tr>
              <th>เลขบิล</th>
              <th>ลูกค้า</th>
              <th>เบอร์โทร</th>
              <th>ที่อยู่</th>
              <th>วันที่ชำระ</th>
              <th>เวลาชำระ</th>
              <th width="200px"></th>
            </tr>
          </thead>
          <tbody>
            {billSales.length > 0
              ? billSales.map((item) => (
                  <tr>
                    <td>{item.id}</td>
                    <td>{item.customerName}</td>
                    <td>{item.customerPhone}</td>
                    <td>{item.customerAddress}</td>
                    <td>{item.payDate}</td>
                    <td>{item.payTime}</td>
                    <td>
                      <button
                        onClick={() => handleInfo(item)}
                        data-bs-toggle="modal"
                        data-bs-target="#modalDetail"
                        className="btn btn-primary"
                      >
                        <i className="fa fa-file me-2"></i>
                        ดูเลข
                      </button>
                      <button
                        data-bs-toggle="modal"
                        data-bs-target="#modalSend"
                        className="btn btn-success"
                      >
                        <i className="fa fa-print me-2"></i>
                        จัดส่ง
                      </button>
                    </td>
                  </tr>
                ))
              : ""}
          </tbody>
        </table>
      </Home>

      <MyModal title="บันทึกการจัดส่ง" id="modalSend" btnCloseId="btnClose">
        <div>
          <label>ผู้จัดส่ง</label>
          <input type="text" className="form-control" />
        </div>
        <div>
          <label>วันที่ส่ง</label>
          <input type="text" className="form-control" />
        </div>
        <div>
          <label>เวลา</label>
          <input type="text" className="form-control" />
        </div>
        <div>
          <label>เลขติดตาม</label>
          <input type="text" className="form-control" />
        </div>
        <div>
          <label>หมายเหตุ</label>
          <input type="text" className="form-control" />
        </div>
        <div>
          <label>ค่าจัดส่ง</label>
          <input type="text" className="form-control" />
        </div>
        <div>
          <button className="btn btn-primary">
            <i className="fa fa-save me-2"></i>
            บันทึก
          </button>
        </div>
      </MyModal>

      {/* 🌟 Modal ดูรายละเอียดสลากโฉมใหม่ 🌟 */}
      <MyModal
        title="รายการสลากที่ต้องจัดส่ง"
        id="modalDetail"
        btnCloseId="btnClose"
      >
        <div className="p-2" style={{ fontFamily: "'Kanit', sans-serif" }}>
          {/* ส่วนหัวใบเสร็จ (Header Ticket) */}
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: "#fffcf0", // สีครีมละมุน
              borderRadius: "15px",
              border: "2px dashed #fed7aa", // เส้นประสีส้มอ่อน
              position: "relative",
            }}
          >
            {/* รอยเจาะตั๋วเก๋ๆ */}
            <div
              style={{
                position: "absolute",
                width: "20px",
                height: "20px",
                backgroundColor: "white",
                borderRadius: "50%",
                left: "-11px",
                top: "calc(50% - 10px)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                width: "20px",
                height: "20px",
                backgroundColor: "white",
                borderRadius: "50%",
                right: "-11px",
                top: "calc(50% - 10px)",
              }}
            ></div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="fs-6 fw-bold text-muted">
                <i className="bi bi-receipt me-2"></i>เลขที่บิล
              </div>
              <div className="fs-5 fw-bold" style={{ color: "#ea580c" }}>
                #{billSale?.id || "-"}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "15px" }}>
              <div className="row">
                <div className="col-6">
                  <small className="text-muted d-block mb-1">ชื่อลูกค้า</small>
                  <span className="fw-bold text-dark fs-6">
                    <i className="bi bi-person-circle me-1"></i>
                    {billSale?.customerName || "-"}
                  </span>
                </div>
                <div className="col-6 text-end">
                  <small className="text-muted d-block mb-1">เบอร์โทร</small>
                  <span className="fw-bold text-dark">
                    {billSale?.customerPhone || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* หัวข้อรายการ */}
          <div className="h6 fw-bold mt-3 mb-3 text-dark d-flex align-items-center">
            <span
              style={{
                width: "4px",
                height: "20px",
                backgroundColor: "#ea580c",
                display: "inline-block",
                marginRight: "10px",
                borderRadius: "2px",
              }}
            ></span>
            รายการสลากทั้งหมด ({billSale?.billSaleDetail?.length || 0} ใบ)
          </div>

          {/* ตารางรายการสลาก (Lottery List Table) */}
          <table className="table table-borderless table-striped align-middle">
            <thead
              style={{
                backgroundColor: "#fff7ed", // สีส้มอ่อนจัดๆ
                borderBottom: "2px solid #fed7aa",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <tr>
                <th
                  className="text-muted ps-3 py-3"
                  style={{ fontSize: "14px", fontWeight: "600" }}
                >
                  เลขสลาก
                </th>
                <th
                  className="text-end text-muted pe-3 py-3"
                  style={{ fontSize: "14px", fontWeight: "600" }}
                >
                  ราคา
                </th>
              </tr>
            </thead>
            <tbody>
              {billSale?.billSaleDetail?.length > 0 ? (
                billSale.billSaleDetail.map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td className="ps-3 py-3">
                      <div className="d-flex align-items-center">
                        <span
                          className="text-muted me-3 fw-bold"
                          style={{ fontSize: "13px" }}
                        >
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                        <span
                          className="fw-bold fs-5"
                          style={{
                            color: "#1d4ed8", // สีน้ำเงินเข้มดูเป็นตัวเลขทางการ
                            letterSpacing: "1px",
                            fontFamily: "monospace", // ใช้ Font ตัวเลขตรงๆ
                          }}
                        >
                          {item.lotto?.numbers || item.lotto?.number || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="text-end pe-3 py-3">
                      <span className="text-success fw-bold fs-6">
                        ฿{item.price?.toLocaleString() || 0}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center text-muted py-5">
                    <i className="bi bi-inbox fs-1 d-block mb-2 text-light"></i>
                    ไม่พบรายการสลากในบิลนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ส่วนสรุปยอดรวม (Total Section) */}
          {billSale?.billSaleDetail?.length > 0 && (
            <div
              className="mt-4 p-3 d-flex justify-content-between align-items-center"
              style={{
                backgroundColor: "#ea580c", // สีส้มเข้ม brand
                color: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(234, 88, 12, 0.2)",
              }}
            >
              <span className="fw-bold fs-6">ยอดชำระรวมทั้งสิ้น</span>
              <span className="fw-bold fs-4">
                ฿
                {billSale.billSaleDetail
                  .reduce((sum, item) => sum + (parseInt(item.price) || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </MyModal>
    </>
  );
}

export default LottoForSend;
