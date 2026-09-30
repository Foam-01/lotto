import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Company from "./pages/company";
import Lotto from "./pages/Lotto";
import Index from "./pages/Index";
import BillSale from "./pages/BillSale";
import LottoInShop from "./pages/LottoInShop";
import LottoForSend from "./pages/LottoForSend";
import Bonus from "./pages/Bonus";
import SaleBonus from "./pages/SaleBonus";
import ReportIncome from "./pages/ReportIncome";
import LottoIsBonus from "./pages/LottoIsBonus";
import ReportProfit from "./pages/ReportProfit";
import User from "./pages/User";
import ChangePrice from "./pages/ChangePrice";
import Banner from "./pages/Banner";
import Dashboard from "./pages/Dashboard";
import RouteErrorFallback from "./components/RouteErrorFallback";

// 🌟 ทุก route แนบ errorElement ตัวเดียวกันไว้ กันเวลาหน้าไหน render พัง
// (เช่น API ตอบข้อมูลผิดรูป/undefined หรือ endpoint หาย) จะได้ไม่เจอจอ error
// เต็มจอแบบ default ของ react-router — เห็นหน้าจอที่อ่านรู้เรื่องแทน
const errorElement = <RouteErrorFallback />;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement,
  },
  {
    path: "/home",
    element: <Dashboard />,
    errorElement,
  },
  {
    path: "/company",
    element: <Company />,
    errorElement,
  },
  {
    path: "/Lotto",
    element: <Lotto />,
    errorElement,
  },
  {
    path: "/billSale",
    element: <BillSale />,
    errorElement,
  },
  {
    path: "/lottoInShop",
    element: <LottoInShop />,
    errorElement,
  },
  {
    path: "/lottoForSend",
    element: <LottoForSend />,
    errorElement,
  },
  {
    path: "/bonus",
    element: <Bonus />,
    errorElement,
  },
  {
    path: "/saleBonus",
    element: <SaleBonus />,
    errorElement,
  },
  {
    path: "/reportIncome",
    element: <ReportIncome />,
    errorElement,
  },
  {
    path: "/lottoIsBonus",
    element: <LottoIsBonus />,
    errorElement,
  },
  {
    path: "/reportProfit",
    element: <ReportProfit />,
    errorElement,
  },
  {
    path: "/user",
    element: <User />,
    errorElement,
  },
  {
    path: "/changePrice",
    element: <ChangePrice />,
    errorElement,
  },
  {
    path: '/banner',
    element: <Banner />,
    errorElement,
  }
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);

reportWebVitals();
