-- Design Database Genre System
-- Run this ENTIRE script in your Supabase SQL Editor

-- 1. Create tables (if not exists)
CREATE TABLE IF NOT EXISTS struktur_jabatan (
  id SERIAL PRIMARY KEY,
  nama_jabatan TEXT NOT NULL,
  urutan INT NOT NULL
);

CREATE TABLE IF NOT EXISTS pengurus (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  ttl TEXT,
  jabatan_pengurus TEXT,
  asal_pikr TEXT,
  tlpn TEXT,
  email TEXT,
  instagram TEXT,
  image_url TEXT,
  jabatan_id INT REFERENCES struktur_jabatan(id),
  periode TEXT NOT NULL
);

-- Add role_type to distinguish administrators (shown publicly) vs members (not shown)
ALTER TABLE pengurus
  ADD COLUMN IF NOT EXISTS role_type TEXT DEFAULT 'administrator' CHECK (role_type IN ('administrator','member'));

CREATE TABLE IF NOT EXISTS pik_r_submissions (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  ttl TEXT,
  asal_pikr TEXT NOT NULL,
  alamat_lengkap TEXT NOT NULL,
  tlpn TEXT,
  email TEXT,
  jabatan_pikr TEXT NOT NULL,
  bukti_ss TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration helper: rename old column if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pik_r_submissions' AND column_name = 'asal_kabupaten'
  ) THEN
    ALTER TABLE pik_r_submissions RENAME COLUMN asal_kabupaten TO alamat_lengkap;
  END IF;
END $$;

-- Kegiatan: activities/news with up to 3 images
CREATE TABLE IF NOT EXISTS kegiatan (
  id SERIAL PRIMARY KEY,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  tanggal DATE,
  image_url_1 TEXT,
  image_url_2 TEXT,
  image_url_3 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS form_control (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE,
  buka TIMESTAMP,
  tutup TIMESTAMP
);

-- Duta Genre: categories and winners
CREATE TABLE IF NOT EXISTS duta_genre_categories (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  "order" INT DEFAULT 0,
  desired_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS duta_genre_winners (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES duta_genre_categories(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('putra','putri', 'duo')),
  asal TEXT,
  instagram TEXT,
  image_url TEXT,
  periode TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert sample struktur_jabatan data
INSERT INTO struktur_jabatan (nama_jabatan, urutan) VALUES
-- BPI (Badan Pengurus Inti)
('Ketua Umum', 1),
('Wakil Ketua Umum', 2),
('Sekretaris Umum', 3),
('Bendahara Umum', 4),
-- BPH (Badan Pengurus Harian)
('Kepala Bidang', 5),
('Sekretaris Bidang', 6),
-- 4 Divisi/Bidang
('Ketua Bidang Perencanaan dan Pengembangan', 7),
('Sekretaris Bidang Perencanaan dan Pengembangan', 8),
('Ketua Bidang Advokasi dan Kerja Sama', 9),
('Sekretaris Bidang Advokasi dan Kerja Sama', 10),
('Ketua Bidang Data dan Informasi', 11),
('Sekretaris Bidang Data dan Informasi', 12),
('Ketua Bidang Ekonomi Kreatif', 13),
('Sekretaris Bidang Ekonomi Kreatif', 14)
ON CONFLICT DO NOTHING;

-- 3. Insert sample pengurus data
INSERT INTO pengurus (nama, ttl, jabatan_pengurus, asal_pikr, tlpn, email, instagram, image_url, jabatan_id, periode) VALUES
-- BPI (Badan Pengurus Inti)
('Ahmad Rizki Pratama', 'Jakarta, 15 Januari 2001', 'Ketua Umum PIK-R', 'PIK-R Harapan Bangsa', '081234567890', 'ahmad.rizki@email.com', '@ahmad_rizki_pratama', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 1, '2024-2025'),
('Siti Nurhaliza', 'Bandung, 22 Maret 2002', 'Wakil Ketua Umum PIK-R', 'PIK-R Cahaya Remaja', '081234567891', 'siti.nurhaliza@email.com', '@siti_nurhaliza_official', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 2, '2024-2025'),
('Budi Santoso', 'Surabaya, 10 Juli 2001', 'Sekretaris Umum PIK-R', 'PIK-R Generasi Muda', '081234567892', 'budi.santoso@email.com', '@budi_santoso_id', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 3, '2024-2025'),
('Dewi Lestari', 'Yogyakarta, 5 September 2002', 'Bendahara Umum PIK-R', 'PIK-R Bintang Remaja', '081234567893', 'dewi.lestari@email.com', '@dewi_lestari_yoga', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 4, '2024-2025'),
-- BPH (Badan Pengurus Harian)
('Eko Prasetyo', 'Medan, 18 November 2001', 'Kepala Bidang PIK-R', 'PIK-R Pemuda Mandiri', '081234567894', 'eko.prasetyo@email.com', '@eko_prasetyo_medan', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 5, '2024-2025'),
('Fitri Handayani', 'Makassar, 12 April 2002', 'Sekretaris Bidang PIK-R', 'PIK-R Kreasi Muda', '081234567895', 'fitri.handayani@email.com', '@fitri_handayani_mks', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 6, '2024-2025'),
-- Bidang Perencanaan dan Pengembangan
('Galih Nugroho', 'Semarang, 8 Februari 2001', 'Ketua Bidang Perencanaan dan Pengembangan', 'PIK-R Asa Remaja', '081234567896', 'galih.nugroho@email.com', '@galih_nugroho_smg', 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face', 7, '2024-2025'),
('Hani Ramadhani', 'Palembang, 25 Desember 2002', 'Sekretaris Bidang Perencanaan dan Pengembangan', 'PIK-R Inspirasi Muda', '081234567897', 'hani.ramadhani@email.com', '@hani_ramadhani_plg', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', 8, '2024-2025'),
-- Bidang Advokasi dan Kerja Sama
('Indra Wijaya', 'Denpasar, 3 Juni 2001', 'Ketua Bidang Advokasi dan Kerja Sama', 'PIK-R Bali Muda', '081234567898', 'indra.wijaya@email.com', '@indra_wijaya_bali', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 9, '2024-2025'),
('Jessica Putri', 'Pontianak, 14 Agustus 2002', 'Sekretaris Bidang Advokasi dan Kerja Sama', 'PIK-R Kalimantan Muda', '081234567899', 'jessica.putri@email.com', '@jessica_putri_ptk', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 10, '2024-2025'),
-- Bidang Data dan Informasi
('Kevin Pratama', 'Batam, 20 Oktober 2001', 'Ketua Bidang Data dan Informasi', 'PIK-R Kepulauan Riau', '081234567800', 'kevin.pratama@email.com', '@kevin_pratama_btm', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 11, '2024-2025'),
('Luna Sari', 'Manado, 7 Maret 2002', 'Sekretaris Bidang Data dan Informasi', 'PIK-R Sulawesi Utara', '081234567801', 'luna.sari@email.com', '@luna_sari_manado', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 12, '2024-2025'),
-- Bidang Ekonomi Kreatif
('Mario Gunawan', 'Ambon, 11 September 2001', 'Ketua Bidang Ekonomi Kreatif', 'PIK-R Maluku Muda', '081234567802', 'mario.gunawan@email.com', '@mario_gunawan_ambon', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 13, '2024-2025'),
('Nina Anggraini', 'Jayapura, 28 Desember 2002', 'Sekretaris Bidang Ekonomi Kreatif', 'PIK-R Papua Muda', '081234567803', 'nina.anggraini@email.com', '@nina_anggraini_jpr', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 14, '2024-2025')
ON CONFLICT DO NOTHING;

-- 4. Initialize form control
INSERT INTO form_control (id, buka, tutup) VALUES 
  (TRUE, NOW(), NOW() + INTERVAL '30 days')
ON CONFLICT (id) DO UPDATE SET
  buka = NOW(),
  tutup = NOW() + INTERVAL '30 days';

-- Seed Duta Genre categories (idempotent)
INSERT INTO duta_genre_categories (key, title, "order", desired_count) VALUES
  ('juara_1', 'Juara Putra & Putri 1 Duta Genre', 1, 1),
  ('juara_2', 'Juara Putra & Putri 2 Duta Genre', 2, 1),
  ('juara_3', 'Juara Putra & Putri 3 Duta Genre', 3, 1),
  ('harapan_1', 'Juara Harapan 1 Duta Genre', 4, 1),
  ('harapan_2', 'Juara Harapan 2 Duta Genre', 5, 1),
  ('innovator', 'Juara Innovator Duta Genre', 6, 1),
  ('berbakat', 'Juara Berbakat Duta Genre', 7, 1),
  ('terfavorit', 'Juara Terfavorit Duta Genre', 8, 1),
  ('top_10', 'Juara Top 10 Duta Genre', 9, 2),
  ('kelurahan_putra', 'Juara Duta Kelurahan Putra', 10, 16)
ON CONFLICT (key) DO UPDATE SET
  title = EXCLUDED.title,
  "order" = EXCLUDED."order",
  desired_count = EXCLUDED.desired_count;

-- 5. Enable RLS (Row Level Security)
ALTER TABLE struktur_jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengurus ENABLE ROW LEVEL SECURITY;
ALTER TABLE pik_r_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE duta_genre_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE duta_genre_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for public access
DROP POLICY IF EXISTS "Allow public read access on struktur_jabatan" ON struktur_jabatan;
CREATE POLICY "Allow public read access on struktur_jabatan" ON struktur_jabatan FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on pengurus" ON pengurus;
CREATE POLICY "Allow public read access on pengurus" ON pengurus FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on form_control" ON form_control;
CREATE POLICY "Allow public read access on form_control" ON form_control FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on duta_genre_categories" ON duta_genre_categories;
CREATE POLICY "Allow public read access on duta_genre_categories" ON duta_genre_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on duta_genre_winners" ON duta_genre_winners;
CREATE POLICY "Allow public read access on duta_genre_winners" ON duta_genre_winners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on pik_r_submissions" ON pik_r_submissions;
CREATE POLICY "Allow public insert on pik_r_submissions" ON pik_r_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access on kegiatan" ON kegiatan;
CREATE POLICY "Allow public read access on kegiatan" ON kegiatan FOR SELECT USING (true);

-- 7. Create policies for admin access
DROP POLICY IF EXISTS "Allow authenticated users full access on struktur_jabatan" ON struktur_jabatan;
CREATE POLICY "Allow authenticated users full access on struktur_jabatan" ON struktur_jabatan FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users full access on pengurus" ON pengurus;
CREATE POLICY "Allow authenticated users full access on pengurus" ON pengurus FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users full access on pik_r_submissions" ON pik_r_submissions;
CREATE POLICY "Allow authenticated users full access on pik_r_submissions" ON pik_r_submissions FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users full access on form_control" ON form_control;
CREATE POLICY "Allow authenticated users full access on form_control" ON form_control FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users full access on duta_genre_categories" ON duta_genre_categories;
CREATE POLICY "Allow authenticated users full access on duta_genre_categories" ON duta_genre_categories FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users full access on duta_genre_winners" ON duta_genre_winners;
CREATE POLICY "Allow authenticated users full access on duta_genre_winners" ON duta_genre_winners FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users full access on kegiatan" ON kegiatan;
CREATE POLICY "Allow authenticated users full access on kegiatan" ON kegiatan FOR ALL USING (auth.role() = 'authenticated');

-- 8. Verify data
SELECT 'struktur_jabatan' as table_name, COUNT(*) as count FROM struktur_jabatan
UNION ALL
SELECT 'pengurus' as table_name, COUNT(*) as count FROM pengurus
UNION ALL
SELECT 'form_control' as table_name, COUNT(*) as count FROM form_control
UNION ALL
SELECT 'kegiatan' as table_name, COUNT(*) as count FROM kegiatan
UNION ALL
SELECT 'pik_r_submissions' as table_name, COUNT(*) as count FROM pik_r_submissions;

-- Verify Duta Genre tables
SELECT 'duta_genre_categories' as table_name, COUNT(*) as count FROM duta_genre_categories
UNION ALL
SELECT 'duta_genre_winners' as table_name, COUNT(*) as count FROM duta_genre_winners;

-- 9. Test the join query
SELECT 
  p.*,
  s.nama_jabatan,
  s.urutan
FROM pengurus p
LEFT JOIN struktur_jabatan s ON p.jabatan_id = s.id
ORDER BY s.urutan;
