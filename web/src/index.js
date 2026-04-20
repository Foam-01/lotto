import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Company from './pages/company';
import Lotto from './pages/Lotto';

const router = createBrowserRouter([
  {
    path: "/",
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
  }
]);




const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
   <RouterProvider router={router} />
  
);


reportWebVitals();
