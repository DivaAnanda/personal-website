import { createClient } from '@libsql/client';

// Initialize Turso client
const db = createClient({
    url: import.meta.env?.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL || '',
    authToken: import.meta.env?.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || '',
});

// Initialize schema
async function initSchema() {
    try {
        await db.executeMultiple(`
            -- Admin users table
            CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Sessions table
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES admin_users(id)
            );

            -- Personal info table
            CREATE TABLE IF NOT EXISTS personal_info (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                name TEXT NOT NULL,
                nickname TEXT,
                role TEXT NOT NULL,
                tagline TEXT,
                about TEXT,
                location TEXT,
                email TEXT,
                phone TEXT,
                github TEXT,
                linkedin TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Site stats table
            CREATE TABLE IF NOT EXISTS site_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                label TEXT NOT NULL,
                value TEXT NOT NULL,
                sort_order INTEGER DEFAULT 0
            );

            -- Skills table
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                sort_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Experience table
            CREATE TABLE IF NOT EXISTS experience (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT NOT NULL,
                company TEXT NOT NULL,
                date_range TEXT NOT NULL,
                description TEXT,
                tech TEXT,
                sort_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Projects table
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                description TEXT,
                full_content TEXT,
                tech TEXT,
                image_path TEXT,
                hero_image TEXT,
                gallery_images TEXT,
                trailer_url TEXT,
                project_role TEXT,
                project_date TEXT,
                highlight TEXT,
                challenge_solution TEXT,
                link TEXT,
                github TEXT,
                featured INTEGER DEFAULT 0,
                sort_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- SEO settings table
            CREATE TABLE IF NOT EXISTS seo_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                title TEXT,
                description TEXT,
                url TEXT,
                image TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Floating labels table
            CREATE TABLE IF NOT EXISTS floating_labels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                label TEXT NOT NULL,
                sort_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Schema initialized');
    } catch (error) {
        console.error('Schema init error:', error);
    }
}

// Initialize schema on first use
let schemaInitialized = false;
async function ensureSchema() {
    if (!schemaInitialized) {
        await initSchema();
        schemaInitialized = true;
    }
}

export { db, ensureSchema };

// ============================================
// Personal Info Functions
// ============================================

export async function getPersonalInfo() {
    await ensureSchema();
    const result = await db.execute('SELECT * FROM personal_info WHERE id = 1');
    return result.rows[0] || null;
}

export async function updatePersonalInfo(data: {
    name: string;
    nickname?: string;
    role: string;
    tagline?: string;
    about?: string;
    location?: string;
    email?: string;
    phone?: string;
    github?: string;
    linkedin?: string;
}) {
    await ensureSchema();
    await db.execute({
        sql: `INSERT INTO personal_info (id, name, nickname, role, tagline, about, location, email, phone, github, linkedin, updated_at)
              VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(id) DO UPDATE SET
                  name = excluded.name,
                  nickname = excluded.nickname,
                  role = excluded.role,
                  tagline = excluded.tagline,
                  about = excluded.about,
                  location = excluded.location,
                  email = excluded.email,
                  phone = excluded.phone,
                  github = excluded.github,
                  linkedin = excluded.linkedin,
                  updated_at = CURRENT_TIMESTAMP`,
        args: [
            data.name,
            data.nickname || null,
            data.role,
            data.tagline || null,
            data.about || null,
            data.location || null,
            data.email || null,
            data.phone || null,
            data.github || null,
            data.linkedin || null
        ]
    });
}

// ============================================
// Site Stats Functions
// ============================================

export async function getAllStats() {
    await ensureSchema();
    const result = await db.execute('SELECT * FROM site_stats ORDER BY sort_order, id');
    return result.rows;
}

export async function addStat(label: string, value: string, sortOrder?: number) {
    await ensureSchema();
    await db.execute({
        sql: 'INSERT INTO site_stats (label, value, sort_order) VALUES (?, ?, ?)',
        args: [label, value, sortOrder || 0]
    });
}

export async function updateStat(id: number, label: string, value: string, sortOrder?: number) {
    await ensureSchema();
    await db.execute({
        sql: 'UPDATE site_stats SET label = ?, value = ?, sort_order = ? WHERE id = ?',
        args: [label, value, sortOrder || 0, id]
    });
}

export async function deleteStat(id: number) {
    await ensureSchema();
    await db.execute({ sql: 'DELETE FROM site_stats WHERE id = ?', args: [id] });
}

// ============================================
// Skills Functions
// ============================================

export async function getAllSkills() {
    await ensureSchema();
    const result = await db.execute('SELECT * FROM skills ORDER BY sort_order, id');
    return result.rows;
}

export async function addSkill(name: string, sortOrder?: number) {
    await ensureSchema();
    await db.execute({
        sql: 'INSERT INTO skills (name, sort_order) VALUES (?, ?)',
        args: [name, sortOrder || 0]
    });
}

export async function updateSkill(id: number, name: string, sortOrder?: number) {
    await ensureSchema();
    await db.execute({
        sql: 'UPDATE skills SET name = ?, sort_order = ? WHERE id = ?',
        args: [name, sortOrder || 0, id]
    });
}

export async function deleteSkill(id: number) {
    await ensureSchema();
    await db.execute({ sql: 'DELETE FROM skills WHERE id = ?', args: [id] });
}

// ============================================
// Experience Functions
// ============================================

export async function getAllExperience() {
    await ensureSchema();
    const result = await db.execute('SELECT * FROM experience ORDER BY sort_order, id');
    return result.rows.map((row: any) => ({
        ...row,
        tech: row.tech ? JSON.parse(row.tech) : []
    }));
}

export async function getExperienceById(id: number) {
    await ensureSchema();
    const result = await db.execute({ sql: 'SELECT * FROM experience WHERE id = ?', args: [id] });
    const row: any = result.rows[0];
    if (!row) return null;
    return { ...row, tech: row.tech ? JSON.parse(row.tech) : [] };
}

export async function addExperience(data: {
    role: string;
    company: string;
    date_range: string;
    description?: string;
    tech?: string[];
    sort_order?: number;
}) {
    await ensureSchema();
    await db.execute({
        sql: 'INSERT INTO experience (role, company, date_range, description, tech, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        args: [
            data.role,
            data.company,
            data.date_range,
            data.description || null,
            data.tech ? JSON.stringify(data.tech) : null,
            data.sort_order || 0
        ]
    });
}

export async function updateExperience(id: number, data: {
    role: string;
    company: string;
    date_range: string;
    description?: string;
    tech?: string[];
    sort_order?: number;
}) {
    await ensureSchema();
    await db.execute({
        sql: 'UPDATE experience SET role = ?, company = ?, date_range = ?, description = ?, tech = ?, sort_order = ? WHERE id = ?',
        args: [
            data.role,
            data.company,
            data.date_range,
            data.description || null,
            data.tech ? JSON.stringify(data.tech) : null,
            data.sort_order || 0,
            id
        ]
    });
}

export async function deleteExperience(id: number) {
    await ensureSchema();
    await db.execute({ sql: 'DELETE FROM experience WHERE id = ?', args: [id] });
}

// ============================================
// Projects Functions
// ============================================

export async function getAllProjects() {
    await ensureSchema();
    const result = await db.execute('SELECT * FROM projects ORDER BY sort_order, id');
    return result.rows.map((row: any) => ({
        ...row,
        tech: row.tech ? JSON.parse(row.tech) : [],
        gallery_images: row.gallery_images ? JSON.parse(row.gallery_images) : []
    }));
}

export async function getProjectBySlug(slug: string) {
    await ensureSchema();
    const result = await db.execute({ sql: 'SELECT * FROM projects WHERE slug = ?', args: [slug] });
    const row: any = result.rows[0];
    if (!row) return null;
    return {
        ...row,
        tech: row.tech ? JSON.parse(row.tech) : [],
        gallery_images: row.gallery_images ? JSON.parse(row.gallery_images) : []
    };
}

export async function getProjectById(id: number) {
    await ensureSchema();
    const result = await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [id] });
    const row: any = result.rows[0];
    if (!row) return null;
    return {
        ...row,
        tech: row.tech ? JSON.parse(row.tech) : [],
        gallery_images: row.gallery_images ? JSON.parse(row.gallery_images) : []
    };
}

export async function addProject(data: {
    title: string;
    slug: string;
    description?: string;
    full_content?: string;
    tech?: string[];
    image_path?: string | null;
    hero_image?: string | null;
    gallery_images?: string[];
    trailer_url?: string | null;
    project_role?: string | null;
    project_date?: string | null;
    highlight?: string | null;
    challenge_solution?: string | null;
    link?: string | null;
    github?: string | null;
    featured?: boolean;
    sort_order?: number;
}) {
    await ensureSchema();
    await db.execute({
        sql: `INSERT INTO projects (title, slug, description, full_content, tech, image_path, hero_image, gallery_images, trailer_url, project_role, project_date, highlight, challenge_solution, link, github, featured, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            data.title,
            data.slug,
            data.description || null,
            data.full_content || null,
            data.tech ? JSON.stringify(data.tech) : null,
            data.image_path || null,
            data.hero_image || null,
            data.gallery_images ? JSON.stringify(data.gallery_images) : null,
            data.trailer_url || null,
            data.project_role || null,
            data.project_date || null,
            data.highlight || null,
            data.challenge_solution || null,
            data.link || null,
            data.github || null,
            data.featured ? 1 : 0,
            data.sort_order || 0
        ]
    });
}

export async function updateProject(id: number, data: {
    title: string;
    slug: string;
    description?: string;
    full_content?: string;
    tech?: string[];
    image_path?: string | null;
    hero_image?: string | null;
    gallery_images?: string[];
    trailer_url?: string | null;
    project_role?: string | null;
    project_date?: string | null;
    highlight?: string | null;
    challenge_solution?: string | null;
    link?: string | null;
    github?: string | null;
    featured?: boolean;
    sort_order?: number;
}) {
    await ensureSchema();
    await db.execute({
        sql: `UPDATE projects SET 
              title = ?, slug = ?, description = ?, full_content = ?, tech = ?,
              image_path = ?, hero_image = ?, gallery_images = ?, trailer_url = ?,
              project_role = ?, project_date = ?, highlight = ?, challenge_solution = ?,
              link = ?, github = ?, featured = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [
            data.title,
            data.slug,
            data.description || null,
            data.full_content || null,
            data.tech ? JSON.stringify(data.tech) : null,
            data.image_path || null,
            data.hero_image || null,
            data.gallery_images ? JSON.stringify(data.gallery_images) : null,
            data.trailer_url || null,
            data.project_role || null,
            data.project_date || null,
            data.highlight || null,
            data.challenge_solution || null,
            data.link || null,
            data.github || null,
            data.featured ? 1 : 0,
            data.sort_order || 0,
            id
        ]
    });
}

export async function deleteProject(id: number) {
    await ensureSchema();
    await db.execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [id] });
}

// ============================================
// SEO Settings Functions
// ============================================

export async function getSeoSettings() {
    await ensureSchema();
    const result = await db.execute('SELECT * FROM seo_settings WHERE id = 1');
    return result.rows[0] || null;
}

export async function updateSeoSettings(data: {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
}) {
    await ensureSchema();
    await db.execute({
        sql: `INSERT INTO seo_settings (id, title, description, url, image, updated_at)
              VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(id) DO UPDATE SET
                  title = excluded.title,
                  description = excluded.description,
                  url = excluded.url,
                  image = excluded.image,
                  updated_at = CURRENT_TIMESTAMP`,
        args: [
            data.title || null,
            data.description || null,
            data.url || null,
            data.image || null
        ]
    });
}

// ============================================
// Floating Labels Functions
// ============================================

export async function getAllFloatingLabels() {
    await ensureSchema();
    const result = await db.execute('SELECT * FROM floating_labels ORDER BY sort_order, id');
    return result.rows;
}

export async function addFloatingLabel(label: string, sortOrder?: number) {
    await ensureSchema();
    await db.execute({
        sql: 'INSERT INTO floating_labels (label, sort_order) VALUES (?, ?)',
        args: [label, sortOrder || 0]
    });
}

export async function updateFloatingLabel(id: number, label: string, sortOrder?: number) {
    await ensureSchema();
    await db.execute({
        sql: 'UPDATE floating_labels SET label = ?, sort_order = ? WHERE id = ?',
        args: [label, sortOrder || 0, id]
    });
}

export async function deleteFloatingLabel(id: number) {
    await ensureSchema();
    await db.execute({ sql: 'DELETE FROM floating_labels WHERE id = ?', args: [id] });
}
