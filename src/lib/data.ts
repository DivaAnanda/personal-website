// Data helper - reads from database with fallback to JSON
import { 
    getPersonalInfo, 
    getAllSkills, 
    getAllExperience, 
    getAllProjects,
    getAllStats,
    getAllFloatingLabels,
    updatePersonalInfo,
    addSkill,
    addExperience,
    addProject,
    addStat,
    addFloatingLabel,
    ensureSchema
} from './db';
import { ensureAdminExists } from './auth';
import content from '../data/content.json';

// Check if database is initialized
async function isDatabaseEmpty(): Promise<boolean> {
    const info = await getPersonalInfo();
    const skills = await getAllSkills();
    return !info && skills.length === 0;
}

// Seed database with JSON content
export async function seedDatabaseFromJson() {
    const isEmpty = await isDatabaseEmpty();
    if (!isEmpty) {
        console.log('Database already seeded, skipping...');
        return;
    }
    
    console.log('Seeding database from content.json...');
    
    // Seed personal info
    if (content.personal) {
        await updatePersonalInfo({
            name: content.personal.name,
            nickname: content.personal.nickname,
            role: content.personal.role,
            tagline: content.personal.tagline,
            about: content.personal.about,
            location: content.personal.location,
            email: content.personal.email,
            phone: content.personal.phone,
            github: (content.socials as any)?.github,
            linkedin: (content.socials as any)?.linkedin
        });
    }
    
    // Seed stats
    const defaultStats = [
        { label: 'Years Learning', value: '2+', sort_order: 0 },
        { label: 'Projects Delivered', value: '10+', sort_order: 1 }
    ];
    for (const stat of defaultStats) {
        await addStat(stat.label, stat.value, stat.sort_order);
    }
    
    // Seed skills
    if (content.skills) {
        for (let i = 0; i < content.skills.length; i++) {
            await addSkill(content.skills[i], i);
        }
    }
    
    // Seed experience
    if (content.experience) {
        for (let i = 0; i < content.experience.length; i++) {
            const exp = content.experience[i];
            await addExperience({
                role: exp.role,
                company: exp.company,
                date_range: exp.date,
                description: exp.description,
                tech: exp.tech,
                sort_order: i
            });
        }
    }
    
    // Seed projects
    if (content.projects) {
        for (let i = 0; i < content.projects.length; i++) {
            const proj = content.projects[i] as any;
            const slug = proj.title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            
            await addProject({
                title: proj.title,
                slug,
                description: proj.description,
                tech: proj.tech,
                image_path: null,
                hero_image: null,
                gallery_images: [],
                trailer_url: null,
                project_role: proj.role || null,
                project_date: proj.date || null,
                highlight: null,
                challenge_solution: null,
                link: proj.link !== '#' ? proj.link : null,
                github: proj.github !== '#' ? proj.github : null,
                featured: i === 0,
                sort_order: i
            });
        }
    }
    
    // Seed floating labels
    const defaultFloatingLabels = ['React', 'Unity', 'TypeScript', 'Game Dev'];
    for (let i = 0; i < defaultFloatingLabels.length; i++) {
        await addFloatingLabel(defaultFloatingLabels[i], i);
    }
    
    // Ensure admin exists
    await ensureAdminExists();
    
    console.log('Database seeded successfully!');
}

// Get all data (from database)
export async function getSiteData() {
    // Ensure schema exists
    await ensureSchema();
    
    // Seed database if needed
    await seedDatabaseFromJson();
    
    const personal: any = await getPersonalInfo() || content.personal;
    const skills = await getAllSkills();
    const experience = await getAllExperience();
    const projects = await getAllProjects();
    const stats = await getAllStats();
    const floatingLabels = await getAllFloatingLabels();
    
    return {
        personal: {
            name: personal?.name || content.personal.name,
            nickname: personal?.nickname || content.personal.nickname,
            role: personal?.role || content.personal.role,
            tagline: personal?.tagline || content.personal.tagline,
            about: personal?.about || content.personal.about,
            location: personal?.location || content.personal.location,
            email: personal?.email || content.personal.email,
            phone: personal?.phone || content.personal.phone
        },
        socials: {
            github: personal?.github || content.socials.github,
            linkedin: personal?.linkedin || content.socials.linkedin,
            email: `mailto:${personal?.email || content.personal.email}`
        },
        stats: stats.length > 0 ? stats.map((s: any) => ({
            label: s.label,
            value: s.value
        })) : [
            { label: 'Years Learning', value: '2+' },
            { label: 'Projects Delivered', value: '10+' }
        ],
        skills: skills.length > 0 ? skills.map((s: any) => s.name) : content.skills,
        experience: experience.length > 0 ? experience.map((e: any) => ({
            id: e.id,
            role: e.role,
            company: e.company,
            date: e.date_range,
            description: e.description,
            tech: e.tech || []
        })) : content.experience,
        projects: projects.length > 0 ? projects.map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description,
            full_content: p.full_content,
            tech: p.tech || [],
            image: p.image_path,
            hero_image: p.hero_image,
            gallery_images: p.gallery_images || [],
            trailer_url: p.trailer_url,
            project_role: p.project_role,
            project_date: p.project_date,
            highlight: p.highlight,
            challenge_solution: p.challenge_solution,
            link: p.link,
            github: p.github,
            featured: p.featured
        })) : content.projects,
        education: content.education,
        achievements: content.achievements,
        certifications: content.certifications,
        seo: content.seo,
        floatingLabels: floatingLabels.length > 0 
            ? floatingLabels.map((l: any) => l.label) 
            : ['React', 'Unity', 'TypeScript', 'Game Dev']
    };
}
