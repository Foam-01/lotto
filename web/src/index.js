import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App";
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
import NotFound from "./pages/NotFound";

// 🌟 เมื่อ Token หมดอายุ (401) ให้เคลียร์ session แล้วพากลับไปหน้า Login
// ทำงานเฉพาะตอนที่เคย "ล็อกอินอยู่" จริง (มี token ค้างอยู่) และไม่ใช่ตอนที่กรอกรหัสผ่าน Login ผิด
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/user/login");
    const hadToken = !!localStorage.getItem("token");

    if (error.response?.status === 401 && hadToken && !isLoginRequest) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Dashboard />,
  },
  {
    path: "/company",
    element: <Company />,
  },
  {
    path: "/Lotto",
    element: <Lotto />,
  },
  {
    path: "/billSale",
    element: <BillSale />,
  },
  {
    path: "/lottoInShop",
    element: <LottoInShop />,
  },
  {
    path: "/lottoForSend",
    element: <LottoForSend />,
  },
  {
    path: "/bonus",
    element: <Bonus />,
  },
  {
    path: "/saleBonus",
    element: <SaleBonus />,
  },
  {
    path: "/reportIncome",
    element: <ReportIncome />,
  },
  {
    path: "/lottoIsBonus",
    element: <LottoIsBonus />,
  },
  {
    path: "/reportProfit",
    element: <ReportProfit />,
  },
  {
    path: "/user",
    element: <User />,
  },
  {
    path: "/changePrice",
    element: <ChangePrice />,
  },
  {
    path: '/banner',
    element: <Banner />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);

reportWebVitals();
