import React from "react";
import ReactDOM from "react-dom/client";
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
    element: <Home />,
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
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);

reportWebVitals();
