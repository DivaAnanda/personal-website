-- Personal Website CMS Database Schema
-- SQLite Database

-- Admin users table (single user for now)
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

-- Personal info table (single row)
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

-- Site stats table (customizable stats for About section)
CREATE TABLE IF NOT EXISTS site_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- Skills table (for marquee)
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
    tech TEXT, -- JSON array stored as text
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table (enhanced with new fields)
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    -- Short description for cards
    description TEXT,
    -- Full description for detail page
    full_content TEXT,
    -- Tech stack
    tech TEXT, -- JSON array stored as text
    -- Images
    image_path TEXT, -- Card thumbnail
    hero_image TEXT, -- Large hero image for detail page
    gallery_images TEXT, -- JSON array of image paths for documentation carousel
    -- Media
    trailer_url TEXT, -- YouTube/Vimeo embed URL (optional)
    -- Project meta
    project_role TEXT, -- e.g., "Project Manager", "Game Developer"
    project_date TEXT, -- e.g., "Dec 2025"
    highlight TEXT, -- Achievement highlight, e.g., "🏆 Best Capstone Project"
    challenge_solution TEXT, -- Simple quote about challenge & solution
    -- Links
    link TEXT,
    github TEXT,
    -- Flags
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

-- Floating labels for About section (customizable floating tech badges)
CREATE TABLE IF NOT EXISTS floating_labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
