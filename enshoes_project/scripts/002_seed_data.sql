-- Seed data para EN SHOES

-- Inserir categorias
INSERT INTO categories (name, slug, description, image_url) VALUES
('Running', 'running', 'Tênis de corrida de alta performance', '/images/categories/running.jpg'),
('Casual', 'casual', 'Tênis casuais para o dia a dia', '/images/categories/casual.jpg'),
('Basketball', 'basketball', 'Tênis de basquete profissionais', '/images/categories/basketball.jpg'),
('Skate', 'skate', 'Tênis para skatistas', '/images/categories/skate.jpg'),
('Lifestyle', 'lifestyle', 'Tênis estilo de vida urbano', '/images/categories/lifestyle.jpg')
ON CONFLICT (slug) DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, sizes, featured, active) 
SELECT 
  'Air Max Pulse',
  'air-max-pulse',
  'O Nike Air Max Pulse combina estilo futurista com o conforto clássico da tecnologia Air. Design moderno com materiais premium.',
  599.90,
  799.90,
  '/images/products/air-max-pulse.jpg',
  c.id,
  ARRAY[38, 39, 40, 41, 42, 43, 44],
  true,
  true
FROM categories c WHERE c.slug = 'lifestyle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, sizes, featured, active)
SELECT 
  'Jordan 1 Retro High',
  'jordan-1-retro-high',
  'O icônico Jordan 1 que revolucionou o mundo dos sneakers. Couro premium e design atemporal.',
  899.90,
  1199.90,
  '/images/products/jordan-1-retro.jpg',
  c.id,
  ARRAY[39, 40, 41, 42, 43, 44],
  true,
  true
FROM categories c WHERE c.slug = 'basketball'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, sizes, featured, active)
SELECT 
  'Ultraboost Light',
  'ultraboost-light',
  'O tênis de corrida mais leve da linha Ultraboost. Boost renovado para máximo retorno de energia.',
  749.90,
  999.90,
  '/images/products/ultraboost-light.jpg',
  c.id,
  ARRAY[38, 39, 40, 41, 42, 43],
  true,
  true
FROM categories c WHERE c.slug = 'running'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, sizes, featured, active)
SELECT 
  'Dunk Low Premium',
  'dunk-low-premium',
  'O Dunk Low com acabamento premium. Perfeito para streetwear e skate.',
  549.90,
  699.90,
  '/images/products/dunk-low.jpg',
  c.id,
  ARRAY[36, 37, 38, 39, 40, 41, 42, 43],
  true,
  true
FROM categories c WHERE c.slug = 'skate'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, sizes, featured, active)
SELECT 
  'New Balance 550',
  'new-balance-550',
  'O clássico dos anos 80 de volta. Design retrô com conforto moderno.',
  499.90,
  649.90,
  '/images/products/nb-550.jpg',
  c.id,
  ARRAY[37, 38, 39, 40, 41, 42, 43, 44],
  true,
  true
FROM categories c WHERE c.slug = 'casual'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, sizes, featured, active)
SELECT 
  'Yeezy Boost 350',
  'yeezy-boost-350',
  'O design revolucionário de Kanye West. Primeknit adaptável e Boost confortável.',
  1299.90,
  1599.90,
  '/images/products/yeezy-350.jpg',
  c.id,
  ARRAY[38, 39, 40, 41, 42, 43, 44, 45],
  true,
  true
FROM categories c WHERE c.slug = 'lifestyle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, sizes, featured, active)
SELECT 
  'Air Force 1 Low',
  'air-force-1-low',
  'O tênis mais icônico de todos os tempos. Estilo atemporal que nunca sai de moda.',
  449.90,
  NULL,
  '/images/products/air-force-1.jpg',
  c.id,
  ARRAY[36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
  false,
  true
FROM categories c WHERE c.slug = 'casual'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, sizes, featured, active)
SELECT 
  'Pegasus 41',
  'pegasus-41',
  'O tênis de corrida mais vendido da Nike. Agora ainda mais responsivo.',
  699.90,
  NULL,
  '/images/products/pegasus-41.jpg',
  c.id,
  ARRAY[38, 39, 40, 41, 42, 43, 44],
  false,
  true
FROM categories c WHERE c.slug = 'running'
ON CONFLICT (slug) DO NOTHING;

-- Admin padrão (senha: admin123 - hash bcrypt)
INSERT INTO admins (email, password_hash, name) VALUES
('admin@enshoes.com.br', '$2a$10$rQZ8Jc3Jz5Y8XZz5Y8XZz.QZ8Jc3Jz5Y8XZz5Y8XZzQZ8Jc3Jz5Y8', 'Admin EN SHOES')
ON CONFLICT (email) DO NOTHING;
