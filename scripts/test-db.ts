import fs from 'fs';
import path from 'path';

// Override environment variables BEFORE importing db or auth
process.env.TURSO_DATABASE_URL = 'file:test-temp.db';
process.env.TURSO_AUTH_TOKEN = '';

// Delete old test db if exists
const dbPath = path.join(process.cwd(), 'test-temp.db');
if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
    } catch (e) {}
}

async function runTests() {
    console.log('🧪 Starting database & auth integration tests...\n');
    
    try {
        // Dynamically import the database and auth modules after setting env variables
        const db = await import('../src/lib/db');
        const auth = await import('../src/lib/auth');

        // Test 1: Initialize schema
        console.log('1. Testing schema initialization...');
        await db.ensureSchema();
        console.log('   ✓ Schema initialized successfully.');
        
        // Test 2: Personal Info
        console.log('\n2. Testing Personal Info...');
        await db.updatePersonalInfo({
            name: 'Test Name',
            role: 'Tester',
            nickname: 'test',
            tagline: 'Just testing',
            about: 'Testing database functions',
            location: 'Bali',
            email: 'test@example.com',
            phone: '123'
        });
        const info: any = await db.getPersonalInfo();
        if (!info || info.name !== 'Test Name' || info.role !== 'Tester') {
            throw new Error('Personal info mismatch: ' + JSON.stringify(info));
        }
        console.log('   ✓ Personal Info written and verified.');

        // Test 3: Skills CRUD
        console.log('\n3. Testing Skills CRUD...');
        await db.addSkill('Test Skill 1', 1);
        await db.addSkill('Test Skill 2', 2);
        let skills = await db.getAllSkills();
        if (skills.length !== 2 || (skills[0] as any).name !== 'Test Skill 1') {
            throw new Error('Failed to get skills: ' + JSON.stringify(skills));
        }
        await db.updateSkill((skills[0] as any).id, 'Updated Skill 1', 5);
        skills = await db.getAllSkills();
        if ((skills[1] as any).name !== 'Updated Skill 1') {
            throw new Error('Failed to update skill: ' + JSON.stringify(skills));
        }
        await db.deleteSkill((skills[0] as any).id);
        skills = await db.getAllSkills();
        if (skills.length !== 1) {
            throw new Error('Failed to delete skill: ' + JSON.stringify(skills));
        }
        console.log('   ✓ Skills CRUD verified.');

        // Test 4: Stats CRUD
        console.log('\n4. Testing Stats CRUD...');
        await db.addStat('Stat 1', '10', 1);
        let stats = await db.getAllStats();
        if (stats.length !== 1 || (stats[0] as any).label !== 'Stat 1') {
            throw new Error('Failed to get stats: ' + JSON.stringify(stats));
        }
        await db.updateStat((stats[0] as any).id, 'Updated Stat', '20', 1);
        stats = await db.getAllStats();
        if ((stats[0] as any).label !== 'Updated Stat' || (stats[0] as any).value !== '20') {
            throw new Error('Failed to update stat: ' + JSON.stringify(stats));
        }
        await db.deleteStat((stats[0] as any).id);
        stats = await db.getAllStats();
        if (stats.length !== 0) {
            throw new Error('Failed to delete stat');
        }
        console.log('   ✓ Stats CRUD verified.');

        // Test 5: Experience CRUD
        console.log('\n5. Testing Experience CRUD...');
        await db.addExperience({
            role: 'Tester',
            company: 'QA Inc',
            date_range: '2026',
            description: 'Testing',
            tech: ['Jest', 'TS'],
            sort_order: 1
        });
        let experiences = await db.getAllExperience();
        if (experiences.length !== 1 || experiences[0].role !== 'Tester') {
            throw new Error('Failed to get experience: ' + JSON.stringify(experiences));
        }
        await db.updateExperience(experiences[0].id, {
            role: 'Senior Tester',
            company: 'QA Inc',
            date_range: '2026',
            description: 'Testing',
            tech: ['Jest', 'TS', 'Astro'],
            sort_order: 1
        });
        experiences = await db.getAllExperience();
        if (experiences[0].role !== 'Senior Tester' || experiences[0].tech[2] !== 'Astro') {
            throw new Error('Failed to update experience: ' + JSON.stringify(experiences));
        }
        await db.deleteExperience(experiences[0].id);
        experiences = await db.getAllExperience();
        if (experiences.length !== 0) {
            throw new Error('Failed to delete experience');
        }
        console.log('   ✓ Experience CRUD verified.');

        // Test 6: Projects CRUD
        console.log('\n6. Testing Projects CRUD...');
        await db.addProject({
            title: 'Test Project',
            slug: 'test-project',
            description: 'Desc',
            full_content: 'Full content',
            tech: ['Astro', 'TS'],
            link: 'https://example.com',
            github: 'https://github.com',
            featured: true,
            sort_order: 1
        });
        let projects = await db.getAllProjects();
        if (projects.length !== 1 || projects[0].title !== 'Test Project') {
            throw new Error('Failed to get projects: ' + JSON.stringify(projects));
        }
        const projBySlug = await db.getProjectBySlug('test-project');
        if (!projBySlug || projBySlug.title !== 'Test Project') {
            throw new Error('Failed to get project by slug: ' + JSON.stringify(projBySlug));
        }
        const projById = await db.getProjectById(projects[0].id);
        if (!projById || projById.title !== 'Test Project') {
            throw new Error('Failed to get project by ID: ' + JSON.stringify(projById));
        }
        await db.updateProject(projects[0].id, {
            title: 'Updated Project',
            slug: 'updated-project',
            description: 'Desc',
            full_content: 'Full content',
            tech: ['Astro', 'TS', 'React'],
            link: 'https://example.com',
            github: 'https://github.com',
            featured: false,
            sort_order: 2
        });
        projects = await db.getAllProjects();
        if (projects[0].title !== 'Updated Project' || projects[0].featured !== 0) {
            throw new Error('Failed to update project: ' + JSON.stringify(projects));
        }
        await db.deleteProject(projects[0].id);
        projects = await db.getAllProjects();
        if (projects.length !== 0) {
            throw new Error('Failed to delete project');
        }
        console.log('   ✓ Projects CRUD verified.');

        // Test 7: Floating Labels CRUD
        console.log('\n7. Testing Floating Labels CRUD...');
        await db.addFloatingLabel('Badge 1', 1);
        let labels = await db.getAllFloatingLabels();
        if (labels.length !== 1 || (labels[0] as any).label !== 'Badge 1') {
            throw new Error('Failed to get labels: ' + JSON.stringify(labels));
        }
        await db.updateFloatingLabel((labels[0] as any).id, 'Updated Badge', 1);
        labels = await db.getAllFloatingLabels();
        if ((labels[0] as any).label !== 'Updated Badge') {
            throw new Error('Failed to update label');
        }
        await db.deleteFloatingLabel((labels[0] as any).id);
        labels = await db.getAllFloatingLabels();
        if (labels.length !== 0) {
            throw new Error('Failed to delete label');
        }
        console.log('   ✓ Floating Labels CRUD verified.');

        // Test 8: Admin Auth Tests
        console.log('\n8. Testing Admin Auth...');
        await auth.ensureAdminExists(); // Should create default admin
        const admin: any = await auth.getAdminByEmail('admin@divaananda.com');
        if (!admin) {
            throw new Error('Default admin not found');
        }
        const isPasswordValid = auth.verifyPassword('Narxene2004', admin.password_hash);
        if (!isPasswordValid) {
            throw new Error('Default password verification failed');
        }
        
        // Session creation
        const sessionId = await auth.createSession(admin.id);
        const session: any = await auth.getSession(sessionId);
        if (!session || session.user_email !== 'admin@divaananda.com') {
            throw new Error('Failed to get session: ' + JSON.stringify(session));
        }
        
        const isSessionActive = await auth.isSessionValid(sessionId);
        if (!isSessionActive) {
            throw new Error('Session should be valid');
        }
        
        // Session deletion
        await auth.deleteSession(sessionId);
        const sessionAfterDelete = await auth.getSession(sessionId);
        if (sessionAfterDelete !== null) {
            throw new Error('Session still exists after deletion');
        }
        console.log('   ✓ Admin Auth verified.');

        console.log('\n🎉 All tests passed successfully!');
        process.exit(0);
        
    } catch (e: any) {
        console.error('\n❌ Test failed!');
        console.error(e);
        process.exit(1);
    } finally {
        // Cleanup test db
        try {
            if (fs.existsSync(dbPath)) {
                fs.unlinkSync(dbPath);
            }
            const shmPath = dbPath + '-shm';
            const walPath = dbPath + '-wal';
            if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
            if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
        } catch (err) {}
    }
}

runTests();
