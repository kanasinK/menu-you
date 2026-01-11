-- ใส่ข้อมูลตัวอย่างสำหรับตาราง master
-- รัน SQL นี้ใน Supabase SQL Editor หลังจากสร้างตารางแล้ว

-- 1. Service Types
INSERT INTO service_types (name, code, is_active) VALUES
('ออกแบบอย่างเดียว', 'DESIGN_ONLY', true),
('ผลิตอย่างเดียว', 'PRODUCTION_ONLY', true),
('ออกแบบและผลิต', 'DESIGN_AND_PRODUCTION', true);

-- 2. Themes
INSERT INTO themes (name, code, image_group_name, image_urls, is_active) VALUES
('เรียบอ่านง่ายสบายตา', 'SIMPLE', 'simple', ARRAY['https://example.com/themes/simple-1.jpg', 'https://example.com/themes/simple-2.jpg'], true),
('หรูหรา', 'LUXURY', 'luxury', ARRAY['https://example.com/themes/luxury-1.jpg', 'https://example.com/themes/luxury-2.jpg'], true),
('เท่ทันสมัย', 'MODERN', 'cool', ARRAY['https://example.com/themes/modern-1.jpg', 'https://example.com/themes/modern-2.jpg'], true);

-- 3. Colors
INSERT INTO colors (name, code, image_name, hex_code, image_urls, is_active) VALUES
('ขาว', 'WHITE', 'panetone-01.png', '#FFFFFF', 'https://example.com/images/panetone-01.png', true),
('เหลือง', 'YELLOW', 'panetone-02.png', '#F59E0B', 'https://example.com/images/panetone-02.png', true),
('แดง', 'RED', 'panetone-03.png', '#EF4444', 'https://example.com/images/panetone-03.png', true),
('เขียว', 'GREEN', 'panetone-04.png', '#10B981', 'https://example.com/images/panetone-04.png', true);

-- 4. Products
INSERT INTO products (name, code, category_id, description, is_active) VALUES
('ป้ายเมนู', 'MENU_SIGN', 1, 'ป้ายเมนูสำหรับร้านอาหาร', true),
('นามบัตร', 'BUSINESS_CARD', 2, 'นามบัตรสำหรับธุรกิจ', true);

-- 5. Sizes
INSERT INTO sizes (name, code, width, height, unit, is_active) VALUES
('A4', 'A4', 210, 297, 'mm', true),
('A3', 'A3', 297, 420, 'mm', true),
('ขนาดอื่นๆ', 'CUSTOM', NULL, NULL, 'mm', true);

-- 6. Orientations
INSERT INTO orientations (name, code, is_active) VALUES
('แนวตั้ง', 'PORTRAIT', true),
('แนวนอน', 'LANDSCAPE', true);

-- 7. Page Options
INSERT INTO page_options (name, code, is_active) VALUES
('หน้าเดียว', 'SINGLE', true),
('2 หน้า', 'DOUBLE', true);

-- 8. Image Options
INSERT INTO image_options (name, code, is_active) VALUES
('ภาพถ่าย', 'PHOTO', true),
('กราฟิก', 'GRAPHIC', true);

-- 9. Brand Options
INSERT INTO brand_options (name, code, is_active) VALUES
('มีแบรนด์', 'BRANDED', true),
('ไม่มีแบรนด์', 'UNBRANDED', true);

-- 10. Materials
INSERT INTO materials (name, code, is_active) VALUES
('ไวนิล', 'VINYL', true),
('พาสวูดหนา 3 mm.', 'PASWOOD_3MM', true),
('กระดาษธรรมดา', 'PAPER_NORMAL', true);

-- 11. Coatings
INSERT INTO coatings (name, code, is_active) VALUES
('ไม่มีเคลือบ', 'NONE', true),
('เคลือบมัน', 'GLOSS', true);

-- 12. Equipments
INSERT INTO equipments (name, code, category, is_active) VALUES
('เครื่องพิมพ์ดิจิตอล', 'DIGITAL_PRINTER', 'PRINTING', true),
('เครื่องตัด', 'CUTTING_MACHINE', 'CUTTING', true);

-- 13. Roles
INSERT INTO roles (name, code, is_active) VALUES
('Super Admin', 'SUPER_ADMIN', true),
('Admin', 'ADMIN', true),
('Designer (In-house)', 'DESIGNER_INHOUSE', true);
