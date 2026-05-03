# WMS Modular Monolith - Load Testing Suite

## Deskripsi
Suite pengujian beban (load test) untuk arsitektur Modular Monolith WMS menggunakan **Grafana k6**.

## Skenario Pengujian
| Kode | Skenario | Endpoint Target |
|------|----------|-----------------|
| UC-01 | Inbound / Receiving | `POST /api/transaksi` + `PUT /api/transaksi/{id}/approve` |
| UC-02 | Stock Adjustment | `POST /api/barang/{id}/stok/tambah` + `GET /api/dashboard` |
| UC-03 | Outbound Confirmation | `POST /api/transaksi` + `PUT /api/transaksi/{id}/approve` (keluar) |

## Parameter Beban
- **50 RPS** × 60 detik
- **100 RPS** × 90 detik
- **200 RPS** × 120 detik

## Prasyarat
1. Install k6: https://k6.io/docs/get-started/installation/
2. Docker & Docker Compose terinstal
3. Pastikan backend WMS berjalan di Kubernetes / Docker

## Cara Menjalankan

### 1. Jalankan Environment (Docker Compose)
```bash
cd be-WMS
docker-compose up -d
```

### 2. Seed Database (250 barang, 10 user)
```bash
docker exec wms-app php artisan migrate:fresh --seed
```

### 3. Jalankan Semua Skenario
```bash
# UC-01: Inbound Receiving
k6 run load-test/scripts/uc01-inbound.js

# UC-02: Stock Adjustment
k6 run load-test/scripts/uc02-stock-adjustment.js

# UC-03: Outbound Confirmation
k6 run load-test/scripts/uc03-outbound.js

# Jalankan SEMUA skenario sekaligus
k6 run load-test/scripts/run-all.js
```

### 4. Export Hasil ke JSON (untuk analisis)
```bash
k6 run --out json=load-test/results/uc01-result.json load-test/scripts/uc01-inbound.js
k6 run --out json=load-test/results/uc02-result.json load-test/scripts/uc02-stock-adjustment.js
k6 run --out json=load-test/results/uc03-result.json load-test/scripts/uc03-outbound.js
```

## Struktur Folder
```
load-test/
├── README.md
├── scripts/
│   ├── config.js              # Konfigurasi global & helper
│   ├── uc01-inbound.js        # Skenario UC-01: Inbound/Receiving
│   ├── uc02-stock-adjustment.js # Skenario UC-02: Stock Adjustment
│   ├── uc03-outbound.js       # Skenario UC-03: Outbound Confirmation
│   └── run-all.js             # Runner semua skenario
├── docker/
│   └── docker-compose.loadtest.yml  # Docker Compose + resource limits
└── results/                   # Output hasil test (auto-generated)
```

## Metrik yang Dicatat
- **Latency**: Mean & P95 (ms)
- **Throughput**: req/s (HTTP 2xx)
- **Error Rate**: Persentase request gagal
- **Resource Usage**: CPU & Memory (via Grafana/Prometheus)

## Variabel Kontrol
- Dataset: 250 barang, 10 user
- Resource Limit: 1 vCPU, 512MB RAM
- Jaringan: Docker bridge internal
