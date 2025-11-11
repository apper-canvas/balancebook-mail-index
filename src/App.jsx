import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { router } from "@/router";
import React from "react";
import Goals from "@/components/pages/Goals";
import Budgets from "@/components/pages/Budgets";
import Dashboard from "@/components/pages/Dashboard";
import Transactions from "@/components/pages/Transactions";
import Charts from "@/components/pages/Charts";
import Layout from "@/components/organisms/Layout";


function App() {
  return (
    <>
      <RouterProvider router={router} />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;