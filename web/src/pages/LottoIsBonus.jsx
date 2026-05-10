import { useEffect, useState } from "react";
import Home from "./Home";
import Swal from "sweetalert2";
import LottoService from "../services/lotto.service";

function LottoIsBonus() {
    const [lottoisbonus, setLottoisbonus] = useState([]);

    useEffect(async() =>  {
        await handleLottoIsBonus();
        await fetchData();
    },[])

    const fetchData = async () => {
        try {
            
        } catch (e) {
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: "ไม่สามารถโหลดข้อมูลสลากได้ กรุณาลองใหม่อีกครั้ง",
                confirmButtonColor: "#ea580c",
            })
        }
    }

    const handleLottoIsBonus = async () => {
        try {
            await LottoService.lottoIsBonus();
            
        } catch (e) {
            Swal.fire({
                title: "เกิดข้อผิดพลาด",
                text: "ไม่สามารถบันทึกข้อมูลสลากได้ กรุณาลองใหม่อีกครั้ง",
                icon: "error",
                confirmButtonColor: "#ea580c",
            })
        }
    }
    return (
        <>
        <Home>


        </Home>
        </>
    )
}

export default LottoIsBonus;