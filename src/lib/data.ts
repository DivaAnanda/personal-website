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
    addFloatingLabel
} from './db';
import content from '../data/content.json';

// Check if database is initialized
function isDatabaseEmpty(): boolean {
    const info = getPersonalInfo();
    const skills = getAllSkills();
    return !info && skills.length === 0;
}

// Seed database with JSON content
export function seedDatabaseFromJson() {
    if (!isDatabaseEmpty()) {
        console.log('Database already seeded, skipping...');
        return;
    }
    
    console.log('Seeding database from content.json...');
    
    // Seed personal info
    if (content.personal) {
        updatePersonalInfo({
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
    defaultStats.forEach((stat) => {
        addStat(stat.label, stat.value, stat.sort_order);
    });
    
    // Seed skills
    if (content.skills) {
        content.skills.forEach((skill: string, index: number) => {
            addSkill(skill, index);
        });
    }
    
    // Seed experience
    if (content.experience) {
        content.experience.forEach((exp: any, index: number) => {
            addExperience({
                role: exp.role,
                company: exp.company,
                date_range: exp.date,
                description: exp.description,
                tech: exp.tech,
                sort_order: index
            });
        });
    }
    
    // Seed projects
    if (content.projects) {
        content.projects.forEach((proj: any, index: number) => {
            const slug = proj.title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            
            addProject({
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
                featured: index === 0,
                sort_order: index
            });
        });
    }
    
    // Seed floating labels (default tech badges for About section)
    const defaultFloatingLabels = ['React', 'Unity', 'TypeScript', 'Game Dev'];
    defaultFloatingLabels.forEach((label, index) => {
        addFloatingLabel(label, index);
    });
    
    console.log('Database seeded successfully!');
}

// Get all data (from database)
export function getSiteData() {
    // Ensure database is seeded
    seedDatabaseFromJson();
    
    const personal = getPersonalInfo() || content.personal;
    const skills = getAllSkills();
    const experience = getAllExperience();
    const projects = getAllProjects();
    const stats = getAllStats();
    const floatingLabels = getAllFloatingLabels();
    
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
