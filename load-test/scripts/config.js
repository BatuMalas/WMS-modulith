/**
 * ============================================================
 * WMS Load Test — Konfigurasi Global & Helper
 * ============================================================
 * File ini berisi konfigurasi environment, fungsi login,
 * data generator, dan threshold standar untuk semua skenario.
 */

import http from 'k6/http';
import { check } from 'k6';

// ─── Environment ─────────────────────────────────────────────
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000/api';

// ─── Akun Test ───────────────────────────────────────────────
// Staff account (untuk membuat transaksi)
export const STAFF_CREDENTIALS = {
  username: __ENV.STAFF_USER || 'staff1',
  password: __ENV.STAFF_PASS || 'password',
};

// Manajer account (untuk approve transaksi)
export const MANAJER_CREDENTIALS = {
  username: __ENV.MANAJER_USER || 'manajer1',
  password: __ENV.MANAJER_PASS || 'password',
};

// Admin account
export const ADMIN_CREDENTIALS = {
  username: __ENV.ADMIN_USER || 'admin',
  password: __ENV.ADMIN_PASS || 'password',
};

// ─── Dataset Constants ───────────────────────────────────────
export const TOTAL_BARANG = 250;   // Jumlah barang di database
export const TOTAL_SUPPLIER = 15;  // Jumlah supplier di database
export const TOTAL_CUSTOMER = 10;  // Jumlah customer di database
export const TOTAL_GUDANG = 5;     // Jumlah gudang di database

// ─── Stages Configuration ────────────────────────────────────
/**
 * Konfigurasi bertahap:
 *  - Fase 1: Ramp-up ke 50 RPS   → 60 detik
 *  - Fase 2: Ramp-up ke 100 RPS  → 90 detik
 *  - Fase 3: Ramp-up ke 200 RPS  → 120 detik
 *  - Fase 4: Ramp-down            → 30 detik
 */
export const LOAD_STAGES = [
  // ── Warm-up ──
  { duration: '10s', target: 10 },

  // ── Fase 1: 50 RPS ──
  { duration: '10s', target: 50 },   // ramp-up
  { duration: '60s', target: 50 },   // sustain

  // ── Fase 2: 100 RPS ──
  { duration: '10s', target: 100 },  // ramp-up
  { duration: '90s', target: 100 },  // sustain

  // ── Fase 3: 200 RPS ──
  { duration: '15s', target: 200 },  // ramp-up
  { duration: '120s', target: 200 }, // sustain

  // ── Cool-down ──
  { duration: '15s', target: 0 },    // ramp-down
];

// ─── Thresholds Standar ──────────────────────────────────────
export const STANDARD_THRESHOLDS = {
  // Latency targets
  'http_req_duration': [
    'p(95)<2000',  // P95 harus < 2000ms
    'avg<1000',    // Mean harus < 1000ms
  ],
  // Throughput & error rate
  'http_req_failed': ['rate<0.10'],  // Error rate < 10%
  'http_reqs': ['rate>0'],           // Throughput > 0 req/s
};

// ─── Headers ─────────────────────────────────────────────────
export function getAuthHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
}

export function getJsonHeaders() {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };
}

// ─── Login Helper ────────────────────────────────────────────
/**
 * Login dan dapatkan JWT token.
 * @param {object} credentials - { username, password }
 * @returns {string} JWT token
 */
export function login(credentials) {
  const loginPayload = JSON.stringify({
    username: credentials.username,
    password: credentials.password,
  });

  const res = http.post(`${BASE_URL}/auth/login`, loginPayload, getJsonHeaders());

  const success = check(res, {
    'login berhasil (status 200)': (r) => r.status === 200,
    'login response memiliki token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.token;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    console.error(`Login gagal untuk user: ${credentials.username}`);
    console.error(`Status: ${res.status}, Body: ${res.body}`);
    return null;
  }

  const body = JSON.parse(res.body);
  return body.data.token;
}

// ─── Data Generators ─────────────────────────────────────────

/**
 * Generate kode transaksi unik.
 * Format: TRX-{timestamp}-{random}
 */
export function generateKodeTransaksi(prefix = 'TRX') {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `${prefix}-${ts}-${rand}`;
}

/**
 * Random integer antara min dan max (inclusive).
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random barang_id (1 sampai TOTAL_BARANG).
 */
export function randomBarangId() {
  return randomInt(1, TOTAL_BARANG);
}

/**
 * Random supplier_id (1 sampai TOTAL_SUPPLIER).
 */
export function randomSupplierId() {
  return randomInt(1, TOTAL_SUPPLIER);
}

/**
 * Random customer_id (1 sampai TOTAL_CUSTOMER).
 */
export function randomCustomerId() {
  return randomInt(1, TOTAL_CUSTOMER);
}

/**
 * Random gudang_id (1 sampai TOTAL_GUDANG).
 */
export function randomGudangId() {
  return randomInt(1, TOTAL_GUDANG);
}

/**
 * Format tanggal hari ini (YYYY-MM-DD).
 */
export function todayDate() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

/**
 * Generate payload transaksi masuk (inbound).
 */
export function generateInboundPayload() {
  return {
    kode_transaksi: generateKodeTransaksi('IN'),
    jenis: 'masuk',
    tanggal: todayDate(),
    barang_id: randomBarangId(),
    jumlah: randomInt(10, 100),
    supplier_id: randomSupplierId(),
    gudang_id: randomGudangId(),
    harga_satuan: randomInt(5000, 500000),
    penerima: `Staff-${randomInt(1, 6)}`,
    keterangan: `Load test inbound - ${Date.now()}`,
  };
}

/**
 * Generate payload transaksi keluar (outbound).
 */
export function generateOutboundPayload() {
  return {
    kode_transaksi: generateKodeTransaksi('OUT'),
    jenis: 'keluar',
    tanggal: todayDate(),
    barang_id: randomBarangId(),
    jumlah: randomInt(1, 5), // Jumlah kecil agar stok tidak habis
    customer_id: randomCustomerId(),
    pengambil: `Customer-${randomInt(1, 10)}`,
    keterangan: `Load test outbound - ${Date.now()}`,
  };
}

/**
 * Generate payload stock adjustment (tambah stok langsung).
 */
export function generateStockAdjustmentPayload() {
  return {
    jumlah: randomInt(5, 50),
    tanggal_masuk: todayDate(),
    supplier_id: randomSupplierId(),
    keterangan: `Load test stock adjustment - ${Date.now()}`,
  };
}

// ─── Response Checkers ───────────────────────────────────────

/**
 * Check apakah response sukses (2xx).
 */
export function checkSuccess(res, label) {
  return check(res, {
    [`${label} - status 2xx`]: (r) => r.status >= 200 && r.status < 300,
  });
}

/**
 * Check apakah response sukses (201 Created).
 */
export function checkCreated(res, label) {
  return check(res, {
    [`${label} - status 201`]: (r) => r.status === 201,
  });
}

/**
 * Extract ID dari response transaksi.
 */
export function extractTransaksiId(res) {
  try {
    const body = JSON.parse(res.body);
    return body.data ? body.data.id : null;
  } catch (e) {
    return null;
  }
}
