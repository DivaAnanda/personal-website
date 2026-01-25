import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = join(__dirname, '../../db/website.db');
const dbDir = dirname(dbPath);

// Ensure db directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema if tables don't exist
const schemaPath = join(__dirname, '../../db/schema.sql');
if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
}

export default db;

// ============================================
// Personal Info Functions
// ============================================

export function getPersonalInfo() {
    const stmt = db.prepare('SELECT * FROM personal_info WHERE id = 1');
    return stmt.get();
}

export function updatePersonalInfo(data: {
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
    const stmt = db.prepare(`
        INSERT INTO personal_info (id, name, nickname, role, tagline, about, location, email, phone, github, linkedin, updated_at)
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
            updated_at = CURRENT_TIMESTAMP
    `);
    return stmt.run(
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
    );
}

// ============================================
// Site Stats Functions
// ============================================

export function getAllStats() {
    const stmt = db.prepare('SELECT * FROM site_stats ORDER BY sort_order, id');
    return stmt.all();
}

export function addStat(label: string, value: string, sortOrder?: number) {
    const stmt = db.prepare('INSERT INTO site_stats (label, value, sort_order) VALUES (?, ?, ?)');
    return stmt.run(label, value, sortOrder || 0);
}

export function updateStat(id: number, label: string, value: string, sortOrder?: number) {
    const stmt = db.prepare('UPDATE site_stats SET label = ?, value = ?, sort_order = ? WHERE id = ?');
    return stmt.run(label, value, sortOrder || 0, id);
}

export function deleteStat(id: number) {
    const stmt = db.prepare('DELETE FROM site_stats WHERE id = ?');
    return stmt.run(id);
}

// ============================================
// Skills Functions
// ============================================

export function getAllSkills() {
    const stmt = db.prepare('SELECT * FROM skills ORDER BY sort_order, id');
    return stmt.all();
}

export function addSkill(name: string, sortOrder?: number) {
    const stmt = db.prepare('INSERT INTO skills (name, sort_order) VALUES (?, ?)');
    return stmt.run(name, sortOrder || 0);
}

export function updateSkill(id: number, name: string, sortOrder?: number) {
    const stmt = db.prepare('UPDATE skills SET name = ?, sort_order = ? WHERE id = ?');
    return stmt.run(name, sortOrder || 0, id);
}

export function deleteSkill(id: number) {
    const stmt = db.prepare('DELETE FROM skills WHERE id = ?');
    return stmt.run(id);
}

// ============================================
// Experience Functions
// ============================================

export function getAllExperience() {
    const stmt = db.prepare('SELECT * FROM experience ORDER BY sort_order, id DESC');
    return stmt.all().map((exp: any) => ({
        ...exp,
        tech: exp.tech ? JSON.parse(exp.tech) : []
    }));
}

export function getExperienceById(id: number) {
    const stmt = db.prepare('SELECT * FROM experience WHERE id = ?');
    const exp: any = stmt.get(id);
    if (exp) {
        exp.tech = exp.tech ? JSON.parse(exp.tech) : [];
    }
    return exp;
}

export function addExperience(data: {
    role: string;
    company: string;
    date_range: string;
    description?: string;
    tech?: string[];
    sort_order?: number;
}) {
    const stmt = db.prepare(`
        INSERT INTO experience (role, company, date_range, description, tech, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
        data.role,
        data.company,
        data.date_range,
        data.description || null,
        data.tech ? JSON.stringify(data.tech) : null,
        data.sort_order || 0
    );
}

export function updateExperience(id: number, data: {
    role: string;
    company: string;
    date_range: string;
    description?: string;
    tech?: string[];
    sort_order?: number;
}) {
    const stmt = db.prepare(`
        UPDATE experience SET
            role = ?, company = ?, date_range = ?, description = ?, tech = ?, sort_order = ?
        WHERE id = ?
    `);
    return stmt.run(
        data.role,
        data.company,
        data.date_range,
        data.description || null,
        data.tech ? JSON.stringify(data.tech) : null,
        data.sort_order || 0,
        id
    );
}

export function deleteExperience(id: number) {
    const stmt = db.prepare('DELETE FROM experience WHERE id = ?');
    return stmt.run(id);
}

// ============================================
// Projects Functions (Enhanced)
// ============================================

export function getAllProjects() {
    const stmt = db.prepare('SELECT * FROM projects ORDER BY sort_order, id DESC');
    return stmt.all().map((proj: any) => ({
        ...proj,
        tech: proj.tech ? JSON.parse(proj.tech) : [],
        gallery_images: proj.gallery_images ? JSON.parse(proj.gallery_images) : []
    }));
}

export function getFeaturedProjects() {
    const stmt = db.prepare('SELECT * FROM projects WHERE featured = 1 ORDER BY sort_order, id DESC');
    return stmt.all().map((proj: any) => ({
        ...proj,
        tech: proj.tech ? JSON.parse(proj.tech) : [],
        gallery_images: proj.gallery_images ? JSON.parse(proj.gallery_images) : []
    }));
}

export function getProjectById(id: number) {
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const proj: any = stmt.get(id);
    if (proj) {
        proj.tech = proj.tech ? JSON.parse(proj.tech) : [];
        proj.gallery_images = proj.gallery_images ? JSON.parse(proj.gallery_images) : [];
    }
    return proj;
}

export function getProjectBySlug(slug: string) {
    const stmt = db.prepare('SELECT * FROM projects WHERE slug = ?');
    const proj: any = stmt.get(slug);
    if (proj) {
        proj.tech = proj.tech ? JSON.parse(proj.tech) : [];
        proj.gallery_images = proj.gallery_images ? JSON.parse(proj.gallery_images) : [];
    }
    return proj;
}

export function addProject(data: {
    title: string;
    slug: string;
    description?: string;
    full_content?: string;
    tech?: string[];
    image_path?: string;
    hero_image?: string;
    gallery_images?: string[];
    trailer_url?: string;
    project_role?: string;
    project_date?: string;
    highlight?: string;
    challenge_solution?: string;
    link?: string;
    github?: string;
    featured?: boolean;
    sort_order?: number;
}) {
    const stmt = db.prepare(`
        INSERT INTO projects (title, slug, description, full_content, tech, image_path, hero_image, gallery_images, trailer_url, project_role, project_date, highlight, challenge_solution, link, github, featured, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
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
    );
}

export function updateProject(id: number, data: {
    title: string;
    slug: string;
    description?: string;
    full_content?: string;
    tech?: string[];
    image_path?: string;
    hero_image?: string;
    gallery_images?: string[];
    trailer_url?: string;
    project_role?: string;
    project_date?: string;
    highlight?: string;
    challenge_solution?: string;
    link?: string;
    github?: string;
    featured?: boolean;
    sort_order?: number;
}) {
    const stmt = db.prepare(`
        UPDATE projects SET
            title = ?, slug = ?, description = ?, full_content = ?, tech = ?,
            image_path = ?, hero_image = ?, gallery_images = ?, trailer_url = ?,
            project_role = ?, project_date = ?, highlight = ?, challenge_solution = ?,
            link = ?, github = ?, featured = ?, sort_order = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    return stmt.run(
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
    );
}

export function deleteProject(id: number) {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    return stmt.run(id);
}

// ============================================
// SEO Settings Functions
// ============================================

export function getSeoSettings() {
    const stmt = db.prepare('SELECT * FROM seo_settings WHERE id = 1');
    return stmt.get();
}

export function updateSeoSettings(data: {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
}) {
    const stmt = db.prepare(`
        INSERT INTO seo_settings (id, title, description, url, image, updated_at)
        VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            url = excluded.url,
            image = excluded.image,
            updated_at = CURRENT_TIMESTAMP
    `);
    return stmt.run(
        data.title || null,
        data.description || null,
        data.url || null,
        data.image || null
    );
}

// ============================================
// Floating Labels Functions (About section tech badges)
// ============================================

export function getAllFloatingLabels() {
    const stmt = db.prepare('SELECT * FROM floating_labels ORDER BY sort_order, id');
    return stmt.all();
}

export function addFloatingLabel(label: string, sortOrder?: number) {
    const stmt = db.prepare('INSERT INTO floating_labels (label, sort_order) VALUES (?, ?)');
    return stmt.run(label, sortOrder || 0);
}

export function updateFloatingLabel(id: number, label: string, sortOrder?: number) {
    const stmt = db.prepare('UPDATE floating_labels SET label = ?, sort_order = ? WHERE id = ?');
    return stmt.run(label, sortOrder || 0, id);
}

export function deleteFloatingLabel(id: number) {
    const stmt = db.prepare('DELETE FROM floating_labels WHERE id = ?');
    return stmt.run(id);
}
