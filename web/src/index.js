import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Index from "./pages/Index";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteErrorFallback from "./components/RouteErrorFallback";

// 🌟 หน้าอื่นๆ ที่ไม่ได้เปิดเป็นหน้าแรก โหลดแบบ Code Splitting (React.lazy)
// เพื่อไม่ให้ผู้ใช้ต้องโหลด JS ของทุกหน้าตั้งแต่แรกเข้า (ลดขนาด bundle เริ่มต้น)
const Company = lazy(() => import("./pages/company"));
const Lotto = lazy(() => import("./pages/Lotto"));
const BillSale = lazy(() => import("./pages/BillSale"));
const LottoInShop = lazy(() => import("./pages/LottoInShop"));
const LottoForSend = lazy(() => import("./pages/LottoForSend"));
const Bonus = lazy(() => import("./pages/Bonus"));
const SaleBonus = lazy(() => import("./pages/SaleBonus"));
const ReportIncome = lazy(() => import("./pages/ReportIncome"));
const LottoIsBonus = lazy(() => import("./pages/LottoIsBonus"));
const ReportProfit = lazy(() => import("./pages/ReportProfit"));
const User = lazy(() => import("./pages/User"));
const ChangePrice = lazy(() => import("./pages/ChangePrice"));
const Banner = lazy(() => import("./pages/Banner"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// 🌟 แสดงระหว่างรอโหลดหน้า (chunk) เข้ามา ใช้ spinner แบบเดียวกับที่ใช้อยู่แล้วในระบบ
function RouteLoading() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="spinner-border text-warning" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

function withSuspense(element) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

// 🌟 ทุก route แนบ errorElement ตัวเดียวกันไว้ กันเวลาหน้าไหน render พัง
// (เช่น API ตอบข้อมูลผิดรูป/undefined หรือ endpoint หาย) จะได้ไม่เจอจอ error
// เต็มจอแบบ default ของ react-router — เห็นหน้าจอที่อ่านรู้เรื่องแทน
const errorElement = <RouteErrorFallback />;

// 🌟 การจัดการ session หมดอายุ (401) ย้ายไปอยู่ที่ src/config/index.js แล้ว
// เพราะทุก service เรียกผ่าน apiClient ตัวกลาง ไม่ใช่ axios เปล่าๆ อีกต่อไป

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
    element: withSuspense(<Dashboard />),
    errorElement,
  },
  {
    path: "/company",
    element: withSuspense(<Company />),
    errorElement,
  },
  {
    path: "/Lotto",
    element: withSuspense(<Lotto />),
    errorElement,
  },
  {
    path: "/billSale",
    element: withSuspense(<BillSale />),
    errorElement,
  },
  {
    path: "/lottoInShop",
    element: withSuspense(<LottoInShop />),
    errorElement,
  },
  {
    path: "/lottoForSend",
    element: withSuspense(<LottoForSend />),
    errorElement,
  },
  {
    path: "/bonus",
    element: withSuspense(<Bonus />),
    errorElement,
  },
  {
    path: "/saleBonus",
    element: withSuspense(<SaleBonus />),
    errorElement,
  },
  {
    path: "/reportIncome",
    element: withSuspense(<ReportIncome />),
    errorElement,
  },
  {
    path: "/lottoIsBonus",
    element: withSuspense(<LottoIsBonus />),
    errorElement,
  },
  {
    path: "/reportProfit",
    element: withSuspense(<ReportProfit />),
    errorElement,
  },
  {
    path: "/user",
    element: withSuspense(<User />),
    errorElement,
  },
  {
    path: "/changePrice",
    element: withSuspense(<ChangePrice />),
    errorElement,
  },
  {
    path: '/banner',
    element: withSuspense(<Banner />),
    errorElement,
  },
  {
    path: "*",
    element: withSuspense(<NotFound />),
    errorElement,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>,
);

reportWebVitals();
