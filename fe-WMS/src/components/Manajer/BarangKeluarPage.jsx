import React, { useState, useEffect } from "react";
import { Card, Table, Button, InputGroup, Form, Badge, Spinner, Modal } from "react-bootstrap";
import { FaSearch, FaCheck, FaTimes, FaInfoCircle, FaTrash, FaDownload, FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";
import TransaksiService from "../../services/transaksiService";

export default function BarangKeluarPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [approvedItem, setApprovedItem] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await TransaksiService.getAll();
      setData(res.data.data.filter(t => t.jenis === "keluar"));
    } catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  };

  const filtered = data.filter(t =>
    (t.barang?.nama || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.barang?.kode_barang || "").toLowerCase().includes(search.toLowerCase()) ||
    t.kode_transaksi.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (id) => {
    if (!window.confirm("Setujui transaksi ini? Stok akan dikurangi dan invoice PDF akan otomatis digenerate.")) return;
    try {
      const res = await TransaksiService.approve(id);
      toast.success("Transaksi disetujui! Invoice PDF sudah digenerate.");
      const approved = res.data.data;
      setApprovedItem(approved);
      setShowInvoiceModal(true);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || "Gagal menyetujui"); }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Tolak transaksi ini?")) return;
    try {
      await TransaksiService.reject(id);
      toast.success("Transaksi ditolak");
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || "Gagal menolak"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus transaksi ini? Data yang sudah dihapus tidak bisa dikembalikan.")) return;
    try {
      await TransaksiService.delete(id);
      toast.success("Transaksi berhasil dihapus");
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || "Gagal menghapus"); }
  };

  const handleDownloadInvoice = async (id) => {
    try {
      const response = await TransaksiService.downloadInvoice(id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const contentDisposition = response.headers["content-disposition"];
      let filename = `invoice-${id}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Invoice tidak ditemukan");
    }
  };

  const statusBadge = (status) => {
    const map = { pending: "warning", diterima: "success", ditolak: "danger" };
    return <Badge bg={map[status] || "secondary"}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</Badge>;
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

  return (
    <>
      <h3 className="mb-4">📤 Data Barang Keluar</h3>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-end mb-3">
            <InputGroup style={{ maxWidth: 300 }}>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control placeholder="Cari Data..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </InputGroup>
          </div>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th><th>Tanggal Keluar</th><th>Invoice</th><th>Kode Barang</th>
                <th>Nama Barang</th><th>Jumlah</th><th>Harga Jual</th><th>Gudang</th>
                <th>Tujuan/Customer</th><th>Keterangan</th><th>Status</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td>{new Date(t.tanggal).toLocaleDateString("id-ID")}</td>
                  <td>
                    {t.invoice_number ? (
                      <small className="font-monospace">{t.invoice_number}</small>
                    ) : "-"}
                  </td>
                  <td><Badge bg="secondary">{t.barang?.kode_barang}</Badge></td>
                  <td>{t.barang?.nama}</td>
                  <td>{t.jumlah} {t.barang?.satuan || ""}</td>
                  <td>Rp {Number(t.harga_satuan || 0).toLocaleString("id-ID")}</td>
                  <td>{t.gudang?.kode_gudang || t.gudang_rak || "-"}</td>
                  <td>{t.customer?.nama || t.pengambil || "-"}</td>
                  <td>{t.keterangan || "-"}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td className="text-nowrap">
                    <Button size="sm" variant="outline-info" className="me-1" onClick={() => { setSelected(t); setShowInfo(true); }}><FaInfoCircle /></Button>
                    {t.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline-success" className="me-1" onClick={() => handleApprove(t.id)} title="Setujui"><FaCheck /></Button>
                        <Button size="sm" variant="outline-danger" className="me-1" onClick={() => handleReject(t.id)} title="Tolak"><FaTimes /></Button>
                      </>
                    )}
                    {t.status === "diterima" && (t.invoice_generated || t.invoice_file) && (
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => handleDownloadInvoice(t.id)} title="Download Invoice">
                        <FaDownload />
                      </Button>
                    )}
                    {t.status !== "diterima" && (
                      <Button size="sm" variant="outline-dark" onClick={() => handleDelete(t.id)} title="Hapus"><FaTrash /></Button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={12} className="text-center text-muted">Tidak ada data</td></tr>}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal show={showInfo} onHide={() => setShowInfo(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Detail Barang Keluar</Modal.Title></Modal.Header>
        <Modal.Body>
          {selected && (
            <div>
              <p><strong>Kode Transaksi:</strong> {selected.kode_transaksi}</p>
              <p><strong>Tanggal:</strong> {new Date(selected.tanggal).toLocaleDateString("id-ID")}</p>
              <p><strong>Invoice:</strong> {selected.invoice_number || "-"}</p>
              <p><strong>Barang:</strong> {selected.barang?.kode_barang} - {selected.barang?.nama}</p>
              <p><strong>Jumlah:</strong> {selected.jumlah} {selected.barang?.satuan}</p>
              <p><strong>Harga Jual:</strong> Rp {Number(selected.harga_satuan || 0).toLocaleString("id-ID")}</p>
              <p><strong>Customer:</strong> {selected.customer?.nama || selected.pengambil || "-"}</p>
              <p><strong>Gudang:</strong> {selected.gudang?.kode_gudang ? `${selected.gudang.kode_gudang} - ${selected.gudang.nama_gudang}` : (selected.gudang_rak || "-")}</p>
              <p><strong>Status:</strong> {statusBadge(selected.status)}</p>
              <p><strong>Keterangan:</strong> {selected.keterangan || "-"}</p>
              {selected.status === "diterima" && selected.approved_by_user && (
                <p><strong>Disetujui oleh:</strong> {selected.approved_by_user.name} pada {selected.approved_at ? new Date(selected.approved_at).toLocaleString("id-ID") : "-"}</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selected?.status === "diterima" && (selected.invoice_generated || selected.invoice_file) && (
            <Button variant="primary" onClick={() => handleDownloadInvoice(selected.id)}>
              <FaDownload className="me-2" />Download Invoice
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowInfo(false)}>Tutup</Button>
        </Modal.Footer>
      </Modal>

      {/* Invoice Success Modal - shown after approve */}
      <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>✅ Transaksi Disetujui!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <FaFilePdf size={64} className="text-danger" />
          </div>
          <h5>Invoice PDF telah dibuat otomatis</h5>
          <p className="text-muted">
            Transaksi <strong>{approvedItem?.kode_transaksi}</strong> berhasil disetujui.
            <br />Stok telah dikurangi dan invoice PDF sudah digenerate.
          </p>
          {approvedItem?.invoice_number && (
            <Badge bg="info" className="fs-6 mb-2">
              No. Invoice: {approvedItem.invoice_number}
            </Badge>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="primary" size="lg" onClick={() => approvedItem && handleDownloadInvoice(approvedItem.id)}>
            <FaDownload className="me-2" />Download Invoice PDF
          </Button>
          <Button variant="outline-secondary" onClick={() => setShowInvoiceModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
