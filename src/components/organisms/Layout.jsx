import { Outlet } from "react-router-dom";
import { useAuth } from "@/layouts/Root";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Sidebar from "@/components/organisms/Sidebar";
import MobileNav from "@/components/organisms/MobileNav";
import Button from "@/components/atoms/Button";

export default function Layout() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 right-0 z-50 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="bg-white shadow-md hover:bg-gray-50"
        >
          <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
      <Sidebar />
      <MobileNav />
      <div className="lg:pl-64">
        <main className="p-6 pt-20 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}