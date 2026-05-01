<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Customer\Models\Customer;
use App\Modules\Inventory\Models\Barang;
use App\Modules\Inventory\Models\BatchOutflow;
use App\Modules\Inventory\Models\Gudang;
use App\Modules\Inventory\Models\Kategori;
use App\Modules\Inventory\Models\StockBatch;
use App\Modules\Supplier\Models\Supplier;
use App\Modules\Transaction\Models\Transaksi;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RealisticDataSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Users ───
        $admin = User::updateOrCreate(['username' => 'admin'], [
            'name' => 'Pak Sutrisno', 'email' => 'admin@adhitanimulyo.com',
            'password' => 'password', 'role' => 'admin',
            'phone' => '0812-3456-7890', 'address' => 'Jl. Raya Nganjuk No. 10',
        ]);
        $manajer = User::updateOrCreate(['username' => 'manajer'], [
            'name' => 'Bu Wati', 'email' => 'manajer@adhitanimulyo.com',
            'password' => 'password', 'role' => 'manajer',
            'phone' => '0811-2233-4455', 'address' => 'Jl. Diponegoro No. 25, Nganjuk',
        ]);
        $petugas = User::updateOrCreate(['username' => 'petugas'], [
            'name' => 'Mas Andi', 'email' => 'petugas@adhitanimulyo.com',
            'password' => 'password', 'role' => 'petugas',
            'phone' => '0813-9876-5432', 'address' => 'Jl. Gatot Subroto No. 8, Nganjuk',
        ]);

        // ─── Kategori (Pertanian) ───
        $kats = [];
        foreach ([
            ['KAT-001', 'Pupuk'],
            ['KAT-002', 'Pestisida & Herbisida'],
            ['KAT-003', 'Benih & Bibit'],
            ['KAT-004', 'Alat Pertanian'],
            ['KAT-005', 'Pakan Ternak'],
            ['KAT-006', 'Obat Hewan'],
        ] as [$kode, $nama]) {
            $kats[] = Kategori::updateOrCreate(['kode_kategori' => $kode], [
                'kode_kategori' => $kode, 'nama_kategori' => $nama,
            ]);
        }

        // ─── Gudang ───
        $gudangs = [];
        foreach ([
            ['G1-R1', 'Gudang 1 Rak 1', 'Pupuk & bahan kimia'],
            ['G1-R2', 'Gudang 1 Rak 2', 'Pestisida cair'],
            ['G1-R3', 'Gudang 1 Rak 3', 'Herbisida & fungisida'],
            ['G2-R1', 'Gudang 2 Rak 1', 'Benih padi & jagung'],
            ['G2-R2', 'Gudang 2 Rak 2', 'Benih sayuran'],
            ['G3-R1', 'Gudang 3 Rak 1', 'Alat pertanian besar'],
            ['G3-R2', 'Gudang 3 Rak 2', 'Alat pertanian kecil'],
            ['G4-R1', 'Gudang 4 Rak 1', 'Pakan ternak & obat hewan'],
        ] as [$kode, $nama, $desk]) {
            $gudangs[] = Gudang::updateOrCreate(['kode_gudang' => $kode], [
                'kode_gudang' => $kode, 'nama_gudang' => $nama, 'deskripsi' => $desk,
            ]);
        }

        // ─── Supplier ───
        $suppliers = [];
        foreach ([
            ['SUP-001', 'PT Petrokimia Gresik', 'Hendra Wijaya', '031-3981811', 'sales@petrokimia.com', 'Jl. Jend. A. Yani, Gresik', 'Gresik'],
            ['SUP-002', 'PT Pupuk Kalimantan Timur', 'Rina Sari', '0542-765432', 'rina@pupukkaltim.com', 'Jl. James Simandjuntak No.1, Bontang', 'Bontang'],
            ['SUP-003', 'CV Syngenta Indonesia', 'Budi Prasetyo', '021-5512345', 'budi@syngenta.co.id', 'Jl. TB Simatupang Kav.18, Jakarta', 'Jakarta'],
            ['SUP-004', 'UD Tani Makmur', 'Pak Darto', '0858-1234-5678', 'darto@tanimakmur.com', 'Jl. Pasar Tani No. 12, Kediri', 'Kediri'],
            ['SUP-005', 'PT EWINDO Seeds', 'Lisa Andani', '022-7812345', 'lisa@ewindo.com', 'Jl. Raya Purwakarta KM 3, Subang', 'Subang'],
            ['SUP-006', 'CV Alat Tani Jaya', 'Agus Setiawan', '0341-567890', 'agus@alattanijaya.com', 'Jl. Soekarno-Hatta No. 50, Malang', 'Malang'],
        ] as $s) {
            $suppliers[] = Supplier::updateOrCreate(['kode_supplier' => $s[0]], [
                'kode_supplier' => $s[0], 'nama_supplier' => $s[1], 'nama_kontak' => $s[2],
                'telepon' => $s[3], 'email' => $s[4], 'alamat' => $s[5], 'kota' => $s[6],
            ]);
        }

        // ─── Customer ───
        $customers = [];
        foreach ([
            ['CUS-001', 'Toko Tani Berkah', '0812-3456-1111', 'taniberkah@gmail.com', 'Jl. Raya Loceret No. 5, Nganjuk'],
            ['CUS-002', 'KUD Sumber Rejeki', '0813-2222-3333', 'kudsumberrejeki@yahoo.com', 'Ds. Bagor, Kec. Bagor, Nganjuk'],
            ['CUS-003', 'Kelompok Tani Maju Jaya', '0857-4444-5555', 'majujaya.tani@gmail.com', 'Ds. Sukomoro, Kec. Sukomoro, Nganjuk'],
            ['CUS-004', 'UD Subur Tani', '0821-6666-7777', 'suburtani@gmail.com', 'Jl. Pahlawan No. 88, Jombang'],
            ['CUS-005', 'PT Agro Nusantara', '0811-8888-9999', 'info@agronusantara.co.id', 'Jl. Industri Agro KM 5, Kediri'],
            ['CUS-006', 'Koperasi Petani Nganjuk', '0822-1010-2020', 'koptani.nganjuk@gmail.com', 'Jl. A. Yani No. 32, Nganjuk'],
        ] as $c) {
            $customers[] = Customer::updateOrCreate(['kode_customer' => $c[0]], [
                'kode_customer' => $c[0], 'nama' => $c[1], 'telepon' => $c[2],
                'email' => $c[3], 'alamat' => $c[4],
            ]);
        }

        // ─── Barang (Produk pertanian realistis) ───
        $barangData = [
            ['BRG-001','Pupuk Urea Petrokimia 50kg','sak',0,0,'G1-R1',115000,135000,null,20,'Pupuk urea subsidi 50kg/sak',180],
            ['BRG-002','Pupuk NPK Phonska 50kg','sak',0,0,'G1-R1',135000,160000,null,15,'NPK 15-15-15 Phonska',180],
            ['BRG-003','Pupuk ZA Petrokimia 50kg','sak',0,0,'G1-R1',95000,115000,null,10,'Pupuk ZA (Amonium Sulfat)',180],
            ['BRG-004','Pupuk SP-36 50kg','sak',0,0,'G1-R1',120000,145000,null,10,'Pupuk SP-36 Superfosfat',180],
            ['BRG-005','Pupuk KCl 50kg','sak',0,0,'G1-R1',180000,210000,null,8,'Pupuk KCl Muriate of Potash',180],
            ['BRG-006','Pupuk Organik Petroganik 40kg','sak',0,0,'G1-R1',25000,35000,null,20,'Pupuk organik granul',365],
            ['BRG-007','Herbisida Roundup 1L','botol',1,0,'G1-R2',85000,105000,'2027-08-15',15,'Herbisida glifosat 486 g/l',90],
            ['BRG-008','Insektisida Decis 250ml','botol',1,0,'G1-R2',65000,82000,'2027-06-20',10,'Insektisida deltametrin',90],
            ['BRG-009','Fungisida Dithane M-45 1kg','bungkus',2,0,'G1-R3',75000,95000,'2027-10-01',10,'Fungisida mankozeb 80%',90],
            ['BRG-010','Herbisida Gramoxone 1L','botol',1,0,'G1-R3',92000,115000,'2027-09-10',12,'Herbisida parakuat',90],
            ['BRG-011','Benih Padi Ciherang 5kg','bungkus',2,0,'G2-R1',65000,82000,'2027-03-01',25,'Benih padi varietas Ciherang',120],
            ['BRG-012','Benih Padi IR64 5kg','bungkus',2,0,'G2-R1',60000,75000,'2027-04-01',20,'Benih padi varietas IR64',120],
            ['BRG-013','Benih Jagung BISI-18 1kg','bungkus',2,0,'G2-R1',85000,110000,'2027-05-01',15,'Benih jagung hibrida',120],
            ['BRG-014','Benih Cabai TM-999 10gr','sachet',2,0,'G2-R2',35000,48000,'2027-07-01',20,'Benih cabai merah keriting',120],
            ['BRG-015','Benih Tomat Permata 5gr','sachet',2,0,'G2-R2',28000,38000,'2027-06-15',15,'Benih tomat dataran rendah',120],
            ['BRG-016','Cangkul Baja Cap Garuda','pcs',3,0,'G3-R1',45000,62000,null,5,'Cangkul baja tempa',365],
            ['BRG-017','Sabit Rumput Baja','pcs',3,0,'G3-R1',25000,35000,null,8,'Sabit rumput stainless',365],
            ['BRG-018','Sprayer Manual 16L','unit',3,0,'G3-R2',185000,245000,null,3,'Sprayer gendong manual 16 liter',365],
            ['BRG-019','Selang Irigasi PE 1 inch 100m','roll',3,0,'G3-R2',125000,165000,null,5,'Selang PE hitam untuk irigasi',365],
            ['BRG-020','Pakan Ayam BR-1 50kg','sak',4,0,'G4-R1',310000,345000,'2027-02-15',10,'Pakan ayam broiler starter',90],
            ['BRG-021','Pakan Ikan Lele Hi-Pro 30kg','sak',4,0,'G4-R1',245000,280000,'2027-03-20',8,'Pakan ikan lele apung',90],
            ['BRG-022','Vitamin Ternak B-Complex 1L','botol',5,0,'G4-R1',55000,72000,'2027-12-01',5,'Vitamin B-Complex untuk ternak',120],
        ];

        $barangs = [];
        foreach ($barangData as $b) {
            $barangs[] = Barang::updateOrCreate(['kode_barang' => $b[0]], [
                'kode_barang' => $b[0], 'nama' => $b[1], 'satuan' => $b[2],
                'kategori_id' => $kats[$b[3]]->id, 'stok' => 0, 'lokasi' => $b[5],
                'gudang_rak' => $b[5], 'harga_beli' => $b[6], 'harga_jual' => $b[7],
                'kadaluarsa' => $b[8], 'stok_min' => $b[9],
                'deskripsi' => $b[10], 'batas_aging_hari' => $b[11],
            ]);
        }

        // ─── Transaksi Masuk (3 bulan terakhir, sudah approved) ───
        // Setiap transaksi masuk = 1 batch baru di gudang tertentu
        $masukData = [
            // [barang_idx, supplier_idx, gudang_idx, jumlah, harga, hari_lalu]
            [0,0,0,100,112000,85], [0,0,0,80,115000,45], [0,0,0,60,115000,12],
            [1,0,0,80,132000,80], [1,0,0,50,135000,35],
            [2,0,0,60,93000,70], [2,0,0,40,95000,20],
            [3,1,0,50,118000,75], [3,1,0,30,120000,30],
            [4,1,0,40,175000,60],
            [5,0,0,100,23000,50], [5,0,0,80,25000,15],
            [6,2,1,60,82000,65], [6,2,1,40,85000,25],
            [7,2,1,50,63000,55], [7,2,1,30,65000,18],
            [8,2,2,40,72000,60], [8,2,2,30,75000,22],
            [9,2,2,45,90000,58],
            [10,4,3,80,62000,90], [10,4,3,60,65000,40],
            [11,4,3,70,58000,88], [11,4,3,50,60000,38],
            [12,4,3,50,82000,75], [12,4,3,40,85000,30],
            [13,4,4,100,33000,70], [13,4,4,80,35000,28],
            [14,4,4,80,26000,68], [14,4,4,60,28000,25],
            [15,5,5,30,43000,90], [15,5,5,20,45000,35],
            [16,5,5,40,23000,85], [16,5,5,25,25000,32],
            [17,5,6,15,180000,80], [17,5,6,10,185000,30],
            [18,5,6,20,122000,75], [18,5,6,15,125000,28],
            [19,3,7,40,305000,60], [19,3,7,30,310000,20],
            [20,3,7,30,240000,55], [20,3,7,20,245000,18],
            [21,3,7,25,52000,50], [21,3,7,20,55000,15],
        ];

        $trxMasukCounter = 1;
        $batchCounter = 1;
        $transaksiMasuks = [];

        foreach ($masukData as $m) {
            $brg = $barangs[$m[0]];
            $sup = $suppliers[$m[1]];
            $gdg = $gudangs[$m[2]];
            $tgl = Carbon::now()->subDays($m[5]);

            $trx = Transaksi::create([
                'kode_transaksi' => sprintf('TRM-%04d', $trxMasukCounter++),
                'jenis' => 'masuk',
                'tanggal' => $tgl->format('Y-m-d'),
                'barang_id' => $brg->id,
                'jumlah' => $m[3],
                'harga_satuan' => $m[4],
                'supplier_id' => $sup->id,
                'gudang_id' => $gdg->id,
                'gudang_rak' => $gdg->kode_gudang,
                'penerima' => 'Mas Andi',
                'status' => 'diterima',
                'approved_by' => $manajer->id,
                'approved_at' => $tgl->copy()->addHours(2),
                'keterangan' => 'Pembelian rutin',
            ]);
            $trx->created_at = $tgl;
            $trx->save();

            $batch = StockBatch::create([
                'kode_batch' => sprintf('BTH-%s-%03d', $tgl->format('Ymd'), $batchCounter++),
                'barang_id' => $brg->id,
                'transaksi_masuk_id' => $trx->id,
                'jumlah_masuk' => $m[3],
                'sisa_stok' => $m[3],
                'harga_satuan' => $m[4],
                'tanggal_masuk' => $tgl->format('Y-m-d'),
                'tanggal_kadaluarsa' => $brg->kadaluarsa,
                'supplier_id' => $sup->id,
                'gudang_id' => $gdg->id,
                'keterangan' => 'Batch dari ' . $sup->nama_supplier,
            ]);

            $transaksiMasuks[] = ['trx' => $trx, 'batch' => $batch, 'brg_idx' => $m[0]];
        }

        // ─── Transaksi Keluar (sudah approved, kurangi dari batch FIFO) ───
        $keluarData = [
            // [barang_idx, customer_idx, jumlah, hari_lalu]
            [0,0,30,75], [0,1,25,50], [0,2,20,30], [0,5,15,10],
            [1,0,20,70], [1,3,15,40], [1,2,10,15],
            [2,1,15,60], [2,0,10,25],
            [3,4,12,65], [3,1,8,20],
            [4,2,10,50], [4,3,8,15],
            [5,0,30,40], [5,5,25,10],
            [6,1,15,55], [6,3,10,20],
            [7,2,12,45], [7,0,8,12],
            [8,4,10,50], [8,1,8,15],
            [9,5,12,48],
            [10,0,20,80], [10,2,15,30],
            [11,1,18,78], [11,3,12,28],
            [12,4,10,65], [12,0,8,22],
            [13,5,25,60], [13,2,20,20],
            [14,1,20,58], [14,0,15,18],
            [15,3,8,80], [15,4,5,25],
            [16,0,10,75], [16,2,8,22],
            [17,5,4,70], [17,1,3,20],
            [18,3,5,65], [18,4,4,18],
            [19,0,10,50], [19,2,8,12],
            [20,1,8,45], [20,5,5,10],
            [21,4,6,40], [21,3,5,8],
        ];

        $trxKeluarCounter = 1;
        $invCounter = 1;

        foreach ($keluarData as $k) {
            $brg = $barangs[$k[0]];
            $cust = $customers[$k[1]];
            $tgl = Carbon::now()->subDays($k[3]);

            $trx = Transaksi::create([
                'kode_transaksi' => sprintf('TRK-%04d', $trxKeluarCounter++),
                'jenis' => 'keluar',
                'tanggal' => $tgl->format('Y-m-d'),
                'barang_id' => $brg->id,
                'jumlah' => $k[2],
                'harga_satuan' => $brg->harga_jual,
                'customer_id' => $cust->id,
                'pengambil' => $cust->nama,
                'invoice_number' => sprintf('INV-OUT-%s-%03d', $tgl->format('Ymd'), $invCounter++),
                'status' => 'diterima',
                'approved_by' => $manajer->id,
                'approved_at' => $tgl->copy()->addHours(3),
                'keterangan' => 'Penjualan ke ' . $cust->nama,
            ]);
            $trx->created_at = $tgl;
            $trx->save();

            // FIFO: kurangi dari batch tertua
            $remaining = $k[2];
            $batches = StockBatch::where('barang_id', $brg->id)
                ->where('sisa_stok', '>', 0)
                ->orderBy('tanggal_masuk', 'asc')
                ->get();

            foreach ($batches as $batch) {
                if ($remaining <= 0) break;
                $take = min($remaining, $batch->sisa_stok);
                $batch->sisa_stok -= $take;
                $batch->save();

                // Set gudang_id dari batch pertama yang diambil
                if (!$trx->gudang_id) {
                    $trx->gudang_id = $batch->gudang_id;
                    $trx->gudang_rak = $batch->gudang?->kode_gudang;
                    $trx->save();
                }

                BatchOutflow::create([
                    'transaksi_keluar_id' => $trx->id,
                    'stock_batch_id' => $batch->id,
                    'jumlah' => $take,
                ]);
                $remaining -= $take;
            }
        }

        // ─── Transaksi Pending (belum di-approve, baru beberapa hari) ───
        $pendingData = [
            [0,0,0,35,115000,2,'masuk'], // Masuk pending
            [6,2,1,25,85000,1,'masuk'],
            [1,null,null,12,160000,2,'keluar'], // Keluar pending
            [10,null,null,10,82000,1,'keluar'],
            [19,null,null,5,345000,1,'keluar'],
        ];

        $pendMasuk = $trxMasukCounter;
        $pendKeluar = $trxKeluarCounter;

        foreach ($pendingData as $p) {
            $brg = $barangs[$p[0]];
            $tgl = Carbon::now()->subDays($p[5]);
            $isKeluar = $p[6] === 'keluar';

            Transaksi::create([
                'kode_transaksi' => $isKeluar
                    ? sprintf('TRK-%04d', $pendKeluar++)
                    : sprintf('TRM-%04d', $pendMasuk++),
                'jenis' => $p[6],
                'tanggal' => $tgl->format('Y-m-d'),
                'barang_id' => $brg->id,
                'jumlah' => $p[3],
                'harga_satuan' => $p[4],
                'supplier_id' => $isKeluar ? null : $suppliers[$p[1]]->id,
                'customer_id' => $isKeluar ? $customers[0]->id : null,
                'gudang_id' => $isKeluar ? null : $gudangs[$p[2]]->id,
                'gudang_rak' => $isKeluar ? null : $gudangs[$p[2]]->kode_gudang,
                'penerima' => $isKeluar ? null : 'Mas Andi',
                'pengambil' => $isKeluar ? $customers[0]->nama : null,
                'invoice_number' => $isKeluar ? sprintf('INV-OUT-%s-%03d', $tgl->format('Ymd'), $invCounter++) : null,
                'status' => 'pending',
                'keterangan' => 'Menunggu approval manajer',
            ]);
        }

        // ─── Sync stok barang dari batch ───
        foreach ($barangs as $brg) {
            $brg->refresh();
            $brg->syncStokDariBatch();
        }

        $this->command->info('✅ Data realistis berhasil di-seed!');
        $this->command->info('   - 3 Users (admin/manajer/petugas, password: password)');
        $this->command->info('   - 6 Kategori pertanian');
        $this->command->info('   - 8 Gudang/Rak');
        $this->command->info('   - 6 Supplier, 6 Customer');
        $this->command->info('   - 22 Barang pertanian');
        $this->command->info('   - ' . count($masukData) . ' Transaksi masuk (approved)');
        $this->command->info('   - ' . count($keluarData) . ' Transaksi keluar (approved + FIFO)');
        $this->command->info('   - 5 Transaksi pending');
    }
}
