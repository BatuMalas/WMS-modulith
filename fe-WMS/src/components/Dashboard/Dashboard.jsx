import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spinner, Table, Badge, ProgressBar } from "react-bootstrap";
import {
  FaBoxes, FaMoneyBillWave, FaExclamationTriangle, FaExchangeAlt,
  FaArrowDown, FaArrowUp, FaClock, FaTruck, FaUsers, FaUserFriends,
  FaHistory, FaChartLine
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import DashboardService from "../../services/dashboardService";
import { InventoryFlowChart, StockDistributionChart, TopProductsChart } from "./Charts";

// ─── Helpers ───

function formatRupiah(num) {
  if (!num && num !== 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatNumber(num) {
  if (!num && num !== 0) return "0";
  return new Intl.NumberFormat("id-ID").format(num);
}

// ─── Stat Card ───

function StatCard({ icon, label, value, subtitle, gradient, iconBg }) {
  return (
    <Col xl={3} md={6} className="mb-4">
      <Card className="border-0 shadow-sm h-100 stat-card" style={{ overflow: "hidden" }}>
        <Card.Body className="position-relative p-4">
          <div className="d-flex align-items-start justify-content-between">
            <div>
              <p className="text-muted mb-1" style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {label}
              </p>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.6rem" }}>{value}</h3>
              {subtitle && <small className="text-muted">{subtitle}</small>}
            </div>
            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: 52,
                height: 52,
                background: gradient || iconBg || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "1.3rem", color: "#fff" }}>{icon}</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}

// ─── Section Header ───

function SectionHeader({ icon, title }) {
  return (
    <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
      {icon} {title}
    </h6>
  );
}

// ─── Low Stock Table ───

function LowStockTable({ items = [] }) {
  if (!items.length) {
    return (
      <Card className="border-0 shadow-sm h-100">
        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
          <h6 className="fw-bold mb-0">⚠️ Barang Low Stock</h6>
        </Card.Header>
        <Card.Body className="d-flex align-items-center justify-content-center text-muted" style={{ minHeight: 200 }}>
          Semua stok dalam kondisi aman 👍
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0">⚠️ Barang Low Stock</h6>
          <Badge bg="danger" className="rounded-pill">{items.length} item</Badge>
        </div>
        <small className="text-muted">Stok di bawah batas minimum</small>
      </Card.Header>
      <Card.Body className="p-0">
        <Table hover responsive className="mb-0" size="sm">
          <thead className="table-light">
            <tr>
              <th style={{ fontSize: "0.75rem" }}>Barang</th>
              <th style={{ fontSize: "0.75rem" }} className="text-center">Stok</th>
              <th style={{ fontSize: "0.75rem" }} className="text-center">Min</th>
              <th style={{ fontSize: "0.75rem" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 8).map((item, i) => {
              const pct = item.stok_min > 0 ? Math.round((item.stok / item.stok_min) * 100) : 0;
              const variant = pct <= 25 ? "danger" : pct <= 50 ? "warning" : "info";
              return (
                <tr key={i}>
                  <td style={{ fontSize: "0.8rem" }}>
                    <div className="fw-semibold">{item.nama}</div>
                    <small className="text-muted">{item.kode_barang}</small>
                  </td>
                  <td className="text-center" style={{ fontSize: "0.8rem" }}>
                    <span className="fw-bold text-danger">{item.stok}</span>
                  </td>
                  <td className="text-center" style={{ fontSize: "0.8rem" }}>{item.stok_min}</td>
                  <td style={{ width: 120 }}>
                    <ProgressBar now={pct} variant={variant} style={{ height: 6 }} />
                    <small className="text-muted" style={{ fontSize: "0.65rem" }}>{pct}%</small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

// ─── Top Supplier Table ───

function TopSupplierTable({ suppliers = [] }) {
  if (!suppliers.length) {
    return (
      <Card className="border-0 shadow-sm h-100">
        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
          <h6 className="fw-bold mb-0">🏭 Supplier Paling Aktif</h6>
        </Card.Header>
        <Card.Body className="d-flex align-items-center justify-content-center text-muted" style={{ minHeight: 200 }}>
          Belum ada data supplier
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
        <h6 className="fw-bold mb-0">🏭 Supplier Paling Aktif</h6>
        <small className="text-muted">Berdasarkan total transaksi yang disetujui</small>
      </Card.Header>
      <Card.Body className="p-0">
        <Table hover responsive className="mb-0" size="sm">
          <thead className="table-light">
            <tr>
              <th style={{ fontSize: "0.75rem" }}>#</th>
              <th style={{ fontSize: "0.75rem" }}>Supplier</th>
              <th style={{ fontSize: "0.75rem" }} className="text-center">Transaksi</th>
              <th style={{ fontSize: "0.75rem" }} className="text-center">Total Unit</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => (
              <tr key={i}>
                <td style={{ fontSize: "0.8rem" }}>
                  <Badge bg={i === 0 ? "warning" : i === 1 ? "secondary" : "light"} text={i > 1 ? "dark" : undefined} className="rounded-circle" style={{ width: 24, height: 24, lineHeight: "16px" }}>
                    {i + 1}
                  </Badge>
                </td>
                <td style={{ fontSize: "0.8rem" }}>
                  <div className="fw-semibold">{s.nama_supplier}</div>
                  <small className="text-muted">{s.kota || "-"}</small>
                </td>
                <td className="text-center" style={{ fontSize: "0.8rem" }}>
                  <Badge bg="primary" className="rounded-pill">{s.total_transaksi}</Badge>
                </td>
                <td className="text-center fw-semibold" style={{ fontSize: "0.8rem" }}>
                  {formatNumber(s.total_unit)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

// ─── Stock Mutation Log ───

function MutationLog({ mutations = [] }) {
  if (!mutations.length) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
          <h6 className="fw-bold mb-0">📋 Log Mutasi Stok Terbaru</h6>
        </Card.Header>
        <Card.Body className="d-flex align-items-center justify-content-center text-muted" style={{ minHeight: 120 }}>
          Belum ada mutasi stok
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
        <h6 className="fw-bold mb-0">📋 Log Mutasi Stok Terbaru</h6>
        <small className="text-muted">Transaksi yang sudah disetujui</small>
      </Card.Header>
      <Card.Body className="p-0">
        <Table hover responsive className="mb-0" size="sm">
          <thead className="table-light">
            <tr>
              <th style={{ fontSize: "0.75rem" }}>Kode</th>
              <th style={{ fontSize: "0.75rem" }}>Jenis</th>
              <th style={{ fontSize: "0.75rem" }}>Barang</th>
              <th style={{ fontSize: "0.75rem" }} className="text-center">Jumlah</th>
              <th style={{ fontSize: "0.75rem" }}>Disetujui Oleh</th>
              <th style={{ fontSize: "0.75rem" }}>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {mutations.map((m, i) => (
              <tr key={i}>
                <td style={{ fontSize: "0.8rem" }}>
                  <code style={{ fontSize: "0.75rem" }}>{m.kode_transaksi}</code>
                </td>
                <td>
                  {m.jenis === "masuk" ? (
                    <Badge bg="success" className="d-inline-flex align-items-center gap-1">
                      <FaArrowDown size={10} /> Masuk
                    </Badge>
                  ) : (
                    <Badge bg="danger" className="d-inline-flex align-items-center gap-1">
                      <FaArrowUp size={10} /> Keluar
                    </Badge>
                  )}
                </td>
                <td style={{ fontSize: "0.8rem" }} className="fw-semibold">{m.barang}</td>
                <td className="text-center fw-bold" style={{ fontSize: "0.8rem" }}>{formatNumber(m.jumlah)}</td>
                <td style={{ fontSize: "0.8rem" }}>{m.approved_by}</td>
                <td style={{ fontSize: "0.8rem" }} className="text-muted">{m.approved_at}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

// ─── Activity Log ───

function ActivityLogSection({ activities = [] }) {
  if (!activities.length) return null;

  const actionColors = {
    login: "primary",
    create_transaksi: "success",
    approve_transaksi: "info",
    reject_transaksi: "danger",
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
        <h6 className="fw-bold mb-0">👤 Aktivitas User Terbaru</h6>
        <small className="text-muted">Log aktivitas staff gudang</small>
      </Card.Header>
      <Card.Body className="p-0">
        <Table hover responsive className="mb-0" size="sm">
          <thead className="table-light">
            <tr>
              <th style={{ fontSize: "0.75rem" }}>Waktu</th>
              <th style={{ fontSize: "0.75rem" }}>User</th>
              <th style={{ fontSize: "0.75rem" }}>Aksi</th>
              <th style={{ fontSize: "0.75rem" }}>Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a, i) => (
              <tr key={i}>
                <td style={{ fontSize: "0.8rem" }} className="text-muted text-nowrap">{a.created_at}</td>
                <td style={{ fontSize: "0.8rem" }}>
                  <span className="fw-semibold">{a.user}</span>
                  {a.role && a.role !== "-" && (
                    <Badge bg="light" text="dark" className="ms-1" style={{ fontSize: "0.65rem" }}>{a.role}</Badge>
                  )}
                </td>
                <td>
                  <Badge bg={actionColors[a.action] || "secondary"} style={{ fontSize: "0.7rem" }}>
                    {a.action.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td style={{ fontSize: "0.8rem" }}>{a.description}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// ─── MAIN DASHBOARD COMPONENT ───
// ════════════════════════════════════════════════════════════

export default function Dashboard() {
  const { user, isAdmin, isManajer, isPetugas } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DashboardService.getSummary()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
          <p className="text-muted mt-3">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── Admin / Owner Dashboard ───
  if (isAdmin()) {
    return (
      <div className="dashboard-admin">
        {/* Header */}
        <div className="mb-4">
          <h4 className="fw-bold mb-1">📊 Dashboard Admin</h4>
          <p className="text-muted mb-0">
            Selamat datang, <strong>{user?.name}</strong>! Berikut ringkasan gudang Anda.
          </p>
        </div>

        {/* Section 1: Top Stat Cards */}
        <Row>
          <StatCard
            icon={<FaBoxes />}
            label="Total Stok"
            value={formatNumber(data?.total_stok || 0)}
            subtitle={`${formatNumber(data?.total_barang || 0)} jenis barang`}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <StatCard
            icon={<FaMoneyBillWave />}
            label="Nilai Aset"
            value={formatRupiah(data?.total_nilai_aset || 0)}
            subtitle="Total nilai seluruh inventory"
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
          />
          <StatCard
            icon={<FaExclamationTriangle />}
            label="Low Stock"
            value={data?.low_stock_count || 0}
            subtitle="Barang di bawah stok minimum"
            gradient={
              (data?.low_stock_count || 0) > 0
                ? "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
                : "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)"
            }
          />
          <StatCard
            icon={<FaExchangeAlt />}
            label="Transaksi Hari Ini"
            value={data?.total_transaksi_hari_ini || 0}
            subtitle={`↓${data?.transaksi_masuk_hari_ini || 0} masuk · ↑${data?.transaksi_keluar_hari_ini || 0} keluar`}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Row>

        {/* Row 2: Quick Info Cards */}
        <Row className="mb-2">
          <StatCard
            icon={<FaTruck />}
            label="Total Supplier"
            value={data?.total_supplier || 0}
            gradient="linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"
          />
          <StatCard
            icon={<FaUserFriends />}
            label="Total Customer"
            value={data?.total_customer || 0}
            gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
          />
          <StatCard
            icon={<FaUsers />}
            label="Total Pengguna"
            value={data?.total_users || 0}
            gradient="linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)"
          />
          <StatCard
            icon={<FaClock />}
            label="Pending Approval"
            value={data?.pending_count || 0}
            subtitle="Menunggu persetujuan manajer"
            gradient={
              (data?.pending_count || 0) > 0
                ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                : "linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)"
            }
          />
        </Row>

        {/* Section 2: Inventory Flow Chart */}
        <Row className="mb-4">
          <Col xs={12}>
            <InventoryFlowChart data={data?.inventory_flow_monthly} />
          </Col>
        </Row>

        {/* Section 3: Top Products + Stock Distribution */}
        <Row className="mb-4">
          <Col lg={7}>
            <TopProductsChart data={data?.top_moving_products} />
          </Col>
          <Col lg={5}>
            <StockDistributionChart data={data?.stock_by_kategori} />
          </Col>
        </Row>

        {/* Section 4: Supplier + Low Stock */}
        <Row className="mb-4">
          <Col lg={6}>
            <TopSupplierTable suppliers={data?.top_suppliers} />
          </Col>
          <Col lg={6}>
            <LowStockTable items={data?.low_stock_items} />
          </Col>
        </Row>

        {/* Section 5: Stock Mutation Log */}
        <Row className="mb-4">
          <Col xs={12}>
            <MutationLog mutations={data?.recent_mutations} />
          </Col>
        </Row>

        {/* Section 6: User Activity Log */}
        <Row className="mb-4">
          <Col xs={12}>
            <ActivityLogSection activities={data?.recent_activities} />
          </Col>
        </Row>
      </div>
    );
  }

  // ─── Manajer Dashboard ───
  if (isManajer()) {
    return (
      <div className="dashboard-manajer">
        <div className="mb-4">
          <h4 className="fw-bold mb-1">📊 Dashboard Manajer</h4>
          <p className="text-muted mb-0">
            Selamat datang, <strong>{user?.name}</strong>!
          </p>
        </div>

        <Row>
          <StatCard
            icon={<FaBoxes />}
            label="Total Stok"
            value={formatNumber(data?.total_stok || 0)}
            subtitle={`${formatNumber(data?.total_barang || 0)} jenis barang`}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <StatCard
            icon={<FaClock />}
            label="Transaksi Pending"
            value={data?.pending_count || 0}
            subtitle="Menunggu approval Anda"
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
          <StatCard
            icon={<FaArrowDown />}
            label="Masuk Hari Ini"
            value={data?.transaksi_masuk_hari_ini || 0}
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
          />
          <StatCard
            icon={<FaArrowUp />}
            label="Keluar Hari Ini"
            value={data?.transaksi_keluar_hari_ini || 0}
            gradient="linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
          />
        </Row>

        <Row className="mb-4">
          <Col xs={12}>
            <InventoryFlowChart data={data?.inventory_flow_monthly} />
          </Col>
        </Row>

        <Row className="mb-4">
          <Col lg={6}>
            <LowStockTable items={data?.low_stock_items} />
          </Col>
          <Col lg={6}>
            <MutationLog mutations={data?.recent_mutations} />
          </Col>
        </Row>
      </div>
    );
  }

  // ─── Petugas Dashboard ───
  if (isPetugas()) {
    return (
      <div className="dashboard-petugas">
        <div className="mb-4">
          <h4 className="fw-bold mb-1">📊 Dashboard Petugas</h4>
          <p className="text-muted mb-0">
            Selamat datang, <strong>{user?.name}</strong>!
          </p>
        </div>

        <Row>
          <StatCard
            icon={<FaBoxes />}
            label="Total Barang"
            value={formatNumber(data?.total_barang || 0)}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <StatCard
            icon={<FaArrowDown />}
            label="Masuk Hari Ini"
            value={data?.transaksi_masuk_hari_ini || 0}
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
          />
          <StatCard
            icon={<FaArrowUp />}
            label="Keluar Hari Ini"
            value={data?.transaksi_keluar_hari_ini || 0}
            gradient="linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
          />
          <StatCard
            icon={<FaChartLine />}
            label="Total Transaksi"
            value={data?.total_transaksi_hari_ini || 0}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Row>
      </div>
    );
  }

  // Fallback
  return (
    <div className="text-center py-5">
      <h5>Selamat datang, {user?.name}!</h5>
      <p className="text-muted">Dashboard sedang dimuat...</p>
    </div>
  );
}
