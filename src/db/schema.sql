-- Schema for Canva Clone
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Teams
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Team Members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- 4. Projects (Designs)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) DEFAULT 'Untitled Design',
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    data JSONB DEFAULT '{}',
    thumbnail_url TEXT,
    width INT NOT NULL DEFAULT 800,
    height INT NOT NULL DEFAULT 600,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Folders
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    data JSONB NOT NULL,
    thumbnail_url TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE template_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, template_id)
);

-- 7. Uploads (Assets)
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Brand Kits
CREATE TABLE brand_kits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    colors JSONB DEFAULT '[]',
    fonts JSONB DEFAULT '[]',
    logos JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    canvas_x FLOAT,
    canvas_y FLOAT,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Collaborations (Active Sessions/Permissions)
CREATE TABLE collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(50) DEFAULT 'viewer', -- viewer, editor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- 11. Version History
CREATE TABLE version_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Plugins
CREATE TABLE plugins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    author_id UUID REFERENCES users(id),
    manifest_url TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PART 2 TABLES

-- 13. Plugin Installs
CREATE TABLE plugin_installs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
    installed_by UUID REFERENCES users(id),
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Analytics Events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. API Keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    scopes JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. NFTs
CREATE TABLE nfts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contract_address VARCHAR(255),
    token_id VARCHAR(255),
    metadata_url TEXT,
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Crypto Transactions
CREATE TABLE crypto_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tx_hash VARCHAR(255) NOT NULL,
    amount DECIMAL(十八,8),
    currency VARCHAR(20),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. AI Models
CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    version VARCHAR(50),
    capabilities JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true
);

-- 20. AI Generations
CREATE TABLE ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    model_id UUID REFERENCES ai_models(id),
    prompt TEXT NOT NULL,
    result_url TEXT,
    generation_type VARCHAR(50), -- image, text, 3d, audio
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. AR/VR Experiences
CREATE TABLE ar_vr_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    experience_type VARCHAR(50),
    config_data JSONB DEFAULT '{}',
    published_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. Print Orders
CREATE TABLE print_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    status VARCHAR(50) DEFAULT 'draft',
    shipping_details JSONB,
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. E-commerce Products
CREATE TABLE ecommerce_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10,2),
    sku VARCHAR(100),
    inventory_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 24. Workflows
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50),
    actions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 25. A/B Tests
CREATE TABLE ab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    variants JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'running',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team owners can manage" ON teams FOR ALL USING (auth.uid() = owner_id);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view their teams" ON team_members FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own projects" ON projects FOR ALL USING (auth.uid() = owner_id);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own folders" ON folders FOR ALL USING (auth.uid() = owner_id);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view templates" ON templates FOR SELECT USING (true);

ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own uploads" ON uploads FOR ALL USING (auth.uid() = user_id);

ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view brand kits" ON brand_kits FOR SELECT USING (EXISTS (SELECT 1 FROM team_members WHERE team_id = brand_kits.team_id AND user_id = auth.uid()));

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own comments" ON comments FOR ALL USING (auth.uid() = user_id);

ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their collaborations" ON collaborations FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE version_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view version history if owner" ON version_history FOR SELECT USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = version_history.project_id AND projects.owner_id = auth.uid()));

ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved plugins" ON plugins FOR SELECT USING (is_approved = true);

ALTER TABLE plugin_installs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their installs" ON plugin_installs FOR SELECT USING (installed_by = auth.uid());

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their analytics" ON analytics_events FOR ALL USING (auth.uid() = user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their api keys" ON api_keys FOR ALL USING (auth.uid() = user_id);

ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their NFTs" ON nfts FOR ALL USING (auth.uid() = owner_id);

ALTER TABLE crypto_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their transactions" ON crypto_transactions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active AI models" ON ai_models FOR SELECT USING (is_active = true);

ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their generations" ON ai_generations FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ar_vr_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view experiences if project owner" ON ar_vr_experiences FOR SELECT USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = ar_vr_experiences.project_id AND projects.owner_id = auth.uid()));

ALTER TABLE print_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their orders" ON print_orders FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ecommerce_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view products" ON ecommerce_products FOR SELECT USING (EXISTS (SELECT 1 FROM team_members WHERE team_id = ecommerce_products.team_id AND user_id = auth.uid()));

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view workflows" ON workflows FOR SELECT USING (EXISTS (SELECT 1 FROM team_members WHERE team_id = workflows.team_id AND user_id = auth.uid()));

ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project owners can manage AB tests" ON ab_tests FOR ALL USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = ab_tests.project_id AND projects.owner_id = auth.uid()));
