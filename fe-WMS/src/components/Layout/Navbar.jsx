import React from "react";
import {
  Navbar as BSNavbar, Container, Nav, Badge, Dropdown,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaWarehouse, FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" className="shadow-sm fixed-top"
      style={{ zIndex: 1030 }}>
      <Container fluid>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold">
          <FaWarehouse className="me-2" size={24} />
          Warehouse Management System
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="navbar-nav" />

        <BSNavbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav className="align-items-center">
            <Nav.Link as={Link} to="/notifications" className="position-relative me-3">
              <FaBell size={18} />
              <Badge bg="danger" pill
                className="position-absolute top-0 start-100 translate-middle"
                style={{ fontSize: "10px" }}>
                3
              </Badge>
            </Nav.Link>

            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" className="d-flex align-items-center">
                <FaUserCircle className="me-2" />
                <span>{user?.name || "User"}</span>
                {user?.role && (
                  <Badge bg={user.role === "admin" ? "danger" : user.role === "manajer" ? "warning" : "info"} className="ms-2" style={{ fontSize: "10px" }}>
                    {user.role}
                  </Badge>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                <Dropdown.Item as={Link} to="/settings">Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <FaSignOutAlt className="me-2" />Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
