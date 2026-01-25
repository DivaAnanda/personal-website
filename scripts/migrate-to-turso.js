// Migration script: SQLite local -> Turso cloud
import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Local SQLite
const localDbPath = join(__dirname, '../db/website.db');
const localDb = new Database(localDbPath);

// Turso
const tursoDb = createClient({
    url: 'libsql://portofolio-divaananda.aws-ap-northeast-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjkzMjE4MjYsImlkIjoiYjkxNzI5OGMtNTIwMi00ZDM4LThiN2EtMjk2NzE3NjVjMzAxIiwicmlkIjoiYTk3OWUxODEtMzE0My00OTVjLWFjNTAtNTY5ZDRkYjE1ZTk2In0.gqVOKbS3hmonwEurbdZN-tXEUUJGcgxDpBiymTcrr8BJTJN6FKwPubRYYuBlLxAOMSBf13WAK0duSxznozVzDA',
});

async function migrate() {
    console.log('🔄 Starting migration from SQLite to Turso...\n');

    // Step 1: Clear all Turso tables
    console.log('📤 Clearing Turso database...');
    const tables = ['sessions', 'floating_labels', 'projects', 'experience', 'skills', 'site_stats', 'seo_settings', 'personal_info', 'admin_users'];
    for (const table of tables) {
        try {
            await tursoDb.execute(`DELETE FROM ${table}`);
            console.log(`  ✓ Cleared ${table}`);
        } catch (e) {
            console.log(`  ⚠ Table ${table} might not exist yet`);
        }
    }

    // Step 2: Migrate admin_users
    console.log('\n👤 Migrating admin users...');
    try {
        const admins = localDb.prepare('SELECT * FROM admin_users').all();
        for (const admin of admins) {
            await tursoDb.execute({
                sql: 'INSERT INTO admin_users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
                args: [admin.id, admin.email, admin.password_hash, admin.created_at]
            });
        }
        console.log(`  ✓ Migrated ${admins.length} admin users`);
    } catch (e) {
        // Create default admin if migration fails
        const hash = bcrypt.hashSync('Narxene2004', 10);
        await tursoDb.execute({
            sql: 'INSERT INTO admin_users (email, password_hash) VALUES (?, ?)',
            args: ['admin@divaananda.com', hash]
        });
        console.log('  ✓ Created default admin');
    }

    // Step 3: Migrate personal_info
    console.log('\n📝 Migrating personal info...');
    try {
        const info = localDb.prepare('SELECT * FROM personal_info WHERE id = 1').get();
        if (info) {
            await tursoDb.execute({
                sql: `INSERT INTO personal_info (id, name, nickname, role, tagline, about, location, email, phone, github, linkedin, updated_at)
                      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [info.name, info.nickname, info.role, info.tagline, info.about, info.location, info.email, info.phone, info.github, info.linkedin, info.updated_at]
            });
            console.log('  ✓ Migrated personal info');
        }
    } catch (e) {
        console.log('  ⚠ No personal info to migrate');
    }

    // Step 4: Migrate site_stats
    console.log('\n📊 Migrating site stats...');
    try {
        const stats = localDb.prepare('SELECT * FROM site_stats').all();
        for (const stat of stats) {
            await tursoDb.execute({
                sql: 'INSERT INTO site_stats (id, label, value, sort_order) VALUES (?, ?, ?, ?)',
                args: [stat.id, stat.label, stat.value, stat.sort_order]
            });
        }
        console.log(`  ✓ Migrated ${stats.length} stats`);
    } catch (e) {
        console.log('  ⚠ No stats to migrate');
    }

    // Step 5: Migrate skills
    console.log('\n🛠 Migrating skills...');
    try {
        const skills = localDb.prepare('SELECT * FROM skills').all();
        for (const skill of skills) {
            await tursoDb.execute({
                sql: 'INSERT INTO skills (id, name, sort_order, created_at) VALUES (?, ?, ?, ?)',
                args: [skill.id, skill.name, skill.sort_order, skill.created_at]
            });
        }
        console.log(`  ✓ Migrated ${skills.length} skills`);
    } catch (e) {
        console.log('  ⚠ No skills to migrate');
    }

    // Step 6: Migrate experience
    console.log('\n💼 Migrating experience...');
    try {
        const experiences = localDb.prepare('SELECT * FROM experience').all();
        for (const exp of experiences) {
            await tursoDb.execute({
                sql: 'INSERT INTO experience (id, role, company, date_range, description, tech, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                args: [exp.id, exp.role, exp.company, exp.date_range, exp.description, exp.tech, exp.sort_order, exp.created_at]
            });
        }
        console.log(`  ✓ Migrated ${experiences.length} experience entries`);
    } catch (e) {
        console.log('  ⚠ No experience to migrate');
    }

    // Step 7: Migrate projects
    console.log('\n📁 Migrating projects...');
    try {
        const projects = localDb.prepare('SELECT * FROM projects').all();
        for (const proj of projects) {
            await tursoDb.execute({
                sql: `INSERT INTO projects (id, title, slug, description, full_content, tech, image_path, hero_image, gallery_images, trailer_url, project_role, project_date, highlight, challenge_solution, link, github, featured, sort_order, created_at, updated_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [proj.id, proj.title, proj.slug, proj.description, proj.full_content, proj.tech, proj.image_path, proj.hero_image, proj.gallery_images, proj.trailer_url, proj.project_role, proj.project_date, proj.highlight, proj.challenge_solution, proj.link, proj.github, proj.featured, proj.sort_order, proj.created_at, proj.updated_at]
            });
        }
        console.log(`  ✓ Migrated ${projects.length} projects`);
    } catch (e) {
        console.log('  ⚠ Error migrating projects:', e.message);
    }

    // Step 8: Migrate floating_labels
    console.log('\n🏷 Migrating floating labels...');
    try {
        const labels = localDb.prepare('SELECT * FROM floating_labels').all();
        for (const label of labels) {
            await tursoDb.execute({
                sql: 'INSERT INTO floating_labels (id, label, sort_order, created_at) VALUES (?, ?, ?, ?)',
                args: [label.id, label.label, label.sort_order, label.created_at]
            });
        }
        console.log(`  ✓ Migrated ${labels.length} floating labels`);
    } catch (e) {
        console.log('  ⚠ No floating labels to migrate');
    }

    // Step 9: Migrate SEO settings
    console.log('\n🔍 Migrating SEO settings...');
    try {
        const seo = localDb.prepare('SELECT * FROM seo_settings WHERE id = 1').get();
        if (seo) {
            await tursoDb.execute({
                sql: 'INSERT INTO seo_settings (id, title, description, url, image, updated_at) VALUES (1, ?, ?, ?, ?, ?)',
                args: [seo.title, seo.description, seo.url, seo.image, seo.updated_at]
            });
            console.log('  ✓ Migrated SEO settings');
        }
    } catch (e) {
        console.log('  ⚠ No SEO settings to migrate');
    }

    console.log('\n✅ Migration complete!');
    console.log('You can now restart the dev server and your data should be in Turso.');
    
    localDb.close();
}

migrate().catch(console.error);
