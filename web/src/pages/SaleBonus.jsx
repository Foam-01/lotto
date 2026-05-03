import Swal from "sweetalert2";
import Home from "./Home";
import axios from "axios";
import config from "../config";
import { useEffect, useState } from "react";

function SaleBonus() {
  const [billSaleDetailsBonus, setBillSaleDetailsBonus] = useState([]);

  useEffect(() => {
    fetchDate();
  }, []);

  const fetchDate = async () => {
    try {
      const res = await axios.get(config.apiPath + "/api/bonus/checkBonus");
      if (res.data.results !== undefined) {
        setBillSaleDetailsBonus(res.data.results);
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

  // ฟังก์ชันช่วยแปลงวันที่ให้เป็นภาษาไทยแบบสวยงาม (เช่น 2 พฤษภาคม 2569)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Home>
        <div className="h4 mt-3 fw-bold text-success">
          <i className="bi bi-trophy-fill me-2"></i> รายงานผู้ถูกรางวัล
        </div>

        {/* 🌟 เอา <tbody> เข้ามาไว้ข้างใน <table> ให้ถูกต้อง */}
        <table className="table mt-3 table-bordered table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th className="text-center">เลขที่ถูกรางวัล</th>
              <th className="text-end">ยอดเงินรางวัล</th>
              <th className="text-center">งวดประจำวันที่</th>
              <th>ลูกค้า</th>
              <th>เบอร์โทร</th>
            </tr>
          </thead>
          <tbody>
            {billSaleDetailsBonus.length > 0 ? (
              billSaleDetailsBonus.map((item) => (
                <tr key={item.id}>
                  {/* 🌟 1. ดึงเลขจาก BonusResultDetail */}
                  <td className="text-center fw-bold text-primary">
                    {item.BonusResultDetail?.number}
                  </td>

                  {/* 🌟 2. ดึงราคาจาก BonusResultDetail (ใช้ ?. กันเหนียวไว้ด้วย) */}
                  <td className="text-end fw-bold text-success">
                    {item.BonusResultDetail?.price?.toLocaleString("th-TH")} ฿
                  </td>

                  {/* 🌟 3. ดึงวันที่จาก BonusResultDetail */}
                  <td className="text-center">
                    {item.BonusResultDetail?.bonusDate}
                  </td>

                  {/* ส่วนลูกค้าและเบอร์โทรเหมือนเดิม */}
                  <td>
                    {item.BillSaleDetail?.billSale?.customerName || "ไม่ระบุ"}
                  </td>
                  <td>{item.BillSaleDetail?.billSale?.customerPhone || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  ยังไม่มีรายงานผู้ถูกรางวัลในขณะนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Home>
    </>
  );
}

export default SaleBonus;
