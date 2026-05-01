import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt, FaBox, FaArrowDown, FaArrowUp, FaTruck, FaUsers,
  FaCog, FaTags, FaUserFriends, FaClipboardList, FaChartBar, FaWarehouse,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { isAdmin, isManajer, isPetugas } = useAuth();

  let menuItems = [];

  if (isAdmin()) {
    menuItems = [
      { path: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard", color: "primary" },
      { path: "/users", icon: <FaUsers />, label: "Data Pengguna", color: "danger" },
      { path: "/supplier", icon: <FaTruck />, label: "Data Supplier", color: "info" },
      { path: "/customer", icon: <FaUserFriends />, label: "Data Customer", color: "success" },
      { path: "/settings", icon: <FaCog />, label: "Pengaturan", color: "dark" },
    ];
  } else if (isManajer()) {
    menuItems = [
      { path: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard", color: "primary" },
      { path: "/barang", icon: <FaBox />, label: "Data Barang", color: "success" },
      { path: "/supplier", icon: <FaTruck />, label: "Data Supplier", color: "info" },
      { path: "/customer", icon: <FaUserFriends />, label: "Data Customer", color: "teal" },
      { path: "/barang-masuk", icon: <FaArrowDown />, label: "Data Barang Masuk", color: "warning" },
      { path: "/barang-keluar", icon: <FaArrowUp />, label: "Data Barang Keluar", color: "danger" },
      { path: "/stok-barang", icon: <FaChartBar />, label: "Data Stok Barang", color: "secondary" },
      { path: "/gudang", icon: <FaWarehouse />, label: "Gudang", color: "teal" },
      { path: "/settings", icon: <FaCog />, label: "Pengaturan", color: "dark" },
    ];
  } else if (isPetugas()) {
    menuItems = [
      { path: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard", color: "primary" },
      { path: "/barang", icon: <FaBox />, label: "Data Barang", color: "success" },
      { path: "/barang-masuk-form", icon: <FaArrowDown />, label: "Barang Masuk", color: "warning" },
      { path: "/barang-keluar-form", icon: <FaArrowUp />, label: "Barang Keluar", color: "danger" },
      { path: "/kategori", icon: <FaTags />, label: "Kategori", color: "info" },
      { path: "/gudang", icon: <FaWarehouse />, label: "Gudang", color: "teal" },
    ];
  }

  return (
    <div className="sidebar bg-white shadow position-fixed"
      style={{
        width: "250px", height: "calc(100vh - 56px)", left: 0, top: "56px",
        overflowY: "auto", zIndex: 1000
      }}>
      <div className="p-3">
        <h6 className="text-muted text-uppercase mb-3">Main Menu</h6>
        <Nav className="flex-column">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Nav.Item key={item.path} className="mb-2">
                <Link to={item.path}
                  className={`d-flex align-items-center py-3 px-3 text-decoration-none rounded ${isActive ? `bg-${item.color} text-white` : "text-dark hover-bg-light"
                    }`}
                  style={{ transition: "all 0.2s" }}>
                  <span className={`me-3 ${isActive ? "text-white" : `text-${item.color}`}`}>
                    {item.icon}
                  </span>
                  <span className="fw-medium">{item.label}</span>
                </Link>
              </Nav.Item>
            );
          })}
        </Nav>

        <div className="mt-5 pt-3 border-top">
          <div className="text-center">
            <small className="text-muted">WMS v2.0</small><br />
            <small className="text-muted">© 2026 Warehouse System</small>
          </div>
        </div>
      </div>
    </div>
  );
}
