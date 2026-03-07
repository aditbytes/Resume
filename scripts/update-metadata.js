#!/usr/bin/env node

/**
 * Auto-update metadata files (llms.txt, llms-full.txt, profile.json, sitemap.xml)
 * from source data.
 */

const fs = require('fs');
const path = require('path');

const profileData = require('../src/data/profile.json');
const projectsData = require('../src/data/projects.json');

const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/\/+$/, '');
};

const siteUrl = normalizeUrl(profileData.website || process.env.PORTFOLIO_SITE_URL || 'https://example.com');
const blogUrl = normalizeUrl(profileData.socials?.blog || '');
const currentDate = new Date().toISOString().split('T')[0];

function getAge(birthDateStr) {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (Number.isNaN(birth.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function formatHtmlToMarkdown(html) {
  if (!html) return '';

  let markdown = html.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  markdown = markdown.replace(/<span[^>]*>(.*?)<\/span>/gi, '$1');
  markdown = markdown.replace(/<[^>]*>/g, '');
  return markdown;
}

function getTopProjects(projects, count = 10) {
  return Array.isArray(projects) ? projects.slice(0, count) : [];
}

function formatProjectForLlmsTxt(project) {
  let formatted = `- ${project.title}`;

  if (project.description) {
    const cleanDesc = project.description.replace(/<[^>]*>/g, '');
    formatted += ` — ${cleanDesc}`;
  }

  const links = [];
  if (project.website) links.push(`Site: ${project.website}`);
  if (project.github) links.push(`GitHub: ${project.github}`);

  const extras = Array.isArray(project.extra) ? project.extra : (project.extra ? [project.extra] : []);
  extras.forEach((extra) => {
    if (!extra) return;
    const url = typeof extra === 'string' ? extra : (extra.href || extra.url);
    if (!url) return;
    links.push(`Link: ${url}`);
  });

  if (links.length > 0) {
    formatted += '\n  - ' + links.join('\n  - ');
  }

  return formatted;
}

function formatProjectForProfileJson(project) {
  const formatted = {
    name: project.title,
    status: 'Active',
  };

  if (project.description) formatted.description = project.description;
  if (project.website) formatted.url = project.website;
  if (project.github) formatted.github = project.github;

  return formatted;
}

function writeToPublicAndBuild(relativePath, content) {
  const publicPath = path.join(__dirname, `../public/${relativePath}`);
  const buildPath = path.join(__dirname, `../build/${relativePath}`);

  fs.writeFileSync(publicPath, content);
  console.log(`✅ Updated public/${relativePath}`);

  if (fs.existsSync(path.dirname(buildPath))) {
    fs.writeFileSync(buildPath, content);
    console.log(`✅ Updated build/${relativePath}`);
  }
}

function updateLlmsTxt() {
  const age = getAge(profileData.birthDate);
  const topProjects = getTopProjects(projectsData, 12);

  const bioFields = [
    profileData.bio?.intro,
    formatHtmlToMarkdown(profileData.bio?.education),
    formatHtmlToMarkdown(profileData.bio?.projects_highlight),
    formatHtmlToMarkdown(profileData.bio?.blog_highlight),
    formatHtmlToMarkdown(profileData.bio?.current_work),
    formatHtmlToMarkdown(profileData.bio?.skills_highlight),
    formatHtmlToMarkdown(profileData.bio?.history),
    formatHtmlToMarkdown(profileData.bio?.fun_fact),
    formatHtmlToMarkdown(profileData.bio?.outro),
  ].filter(Boolean);

  const accomplishmentsText = (profileData.accomplishments || []).map((a) => {
    let line = `- ${a.title}`;
    if (a.detail) line += ` — ${a.detail}`;
    if (a.project) line += ` (project: ${a.project})`;
    return line;
  }).join('\n');

  const mediaText = (profileData.media_appearances || []).map((m) => {
    let line = `- ${m.outlet}`;
    if (m.title) line += `: ${m.title}`;
    if (m.project) line += ` (project: ${m.project})`;
    if (m.url) line += `\n  - ${m.url}`;
    return line;
  }).join('\n');

  const educationText = (profileData.education || []).map((e) => {
    return `- ${e.degree} — ${e.institution} (${e.status})`;
  }).join('\n');

  const whoLine = age === null
    ? `${profileData.title} from ${profileData.location}.`
    : `${age}-year-old ${profileData.title} from ${profileData.location}.`;

  const llmsContent = `# llms.txt — ${profileData.name}

A machine-friendly overview of who I am, what I build, and where to find always-fresh information.

Last-Updated: ${currentDate}
Canonical: ${siteUrl}/llms.txt
Full version: ${siteUrl}/llms-full.txt

---

## Quick context for LLMs

- **Who**: ${whoLine}
- **Full context (recommended)**: ${siteUrl}/llms-full.txt
- **Machine-readable data**: ${siteUrl}/profile.json
${blogUrl ? `- **Blog**: ${blogUrl}` : ''}

---

## Primary identity and socials

- Name: ${profileData.name}
${age === null ? '' : `- Age: ${age}`}
- Location: ${profileData.location}
- Role: ${profileData.title}
- Email: mailto:${profileData.email}
- GitHub: ${profileData.socials?.github || ''}
- LinkedIn: ${profileData.socials?.linkedin || ''}
- X/Twitter: ${profileData.socials?.twitter || ''}
- YouTube: ${profileData.socials?.youtube || ''}

---

## Education

${educationText || '- Not listed'}

---

## Short bio

${bioFields.join('\n\n')}

---

## Achievements

${accomplishmentsText || '- Not listed yet'}

---

## Press & media appearances

${mediaText || '- No press entries listed yet'}

---

## Projects (top ${topProjects.length})

For the complete list with all ${projectsData.length} projects, see ${siteUrl}/llms-full.txt

${topProjects.map((project) => formatProjectForLlmsTxt(project)).join('\n\n')}

---

## Contact

- Email: ${profileData.email}
- Portfolio: ${siteUrl}/
- LinkedIn: ${profileData.socials?.linkedin || ''}
- GitHub: ${profileData.socials?.github || ''}
`;

  writeToPublicAndBuild('llms.txt', llmsContent);
}

function updateLlmsFullTxt() {
  const age = getAge(profileData.birthDate);

  const bioFields = [
    profileData.bio?.intro,
    formatHtmlToMarkdown(profileData.bio?.education),
    formatHtmlToMarkdown(profileData.bio?.projects_highlight),
    formatHtmlToMarkdown(profileData.bio?.blog_highlight),
    formatHtmlToMarkdown(profileData.bio?.current_work),
    formatHtmlToMarkdown(profileData.bio?.skills_highlight),
    formatHtmlToMarkdown(profileData.bio?.history),
    formatHtmlToMarkdown(profileData.bio?.fun_fact),
    formatHtmlToMarkdown(profileData.bio?.outro),
  ].filter(Boolean);

  const educationText = (profileData.education || []).map((e) => {
    return `- ${e.degree} — ${e.institution} (${e.status})`;
  }).join('\n');

  const accomplishmentsText = (profileData.accomplishments || []).map((a) => {
    let line = `- ${a.title}`;
    if (a.detail) line += ` — ${a.detail}`;
    if (a.project) line += ` (project: ${a.project})`;
    return line;
  }).join('\n');

  const mediaText = (profileData.media_appearances || []).map((m) => {
    let line = `- ${m.outlet}`;
    if (m.title) line += `: ${m.title}`;
    if (m.project) line += ` (project: ${m.project})`;
    if (m.url) line += `\n  - ${m.url}`;
    return line;
  }).join('\n');

  const allProjectsText = projectsData.map((project) => formatProjectForLlmsTxt(project)).join('\n\n');

  const skillsText = Object.entries(profileData.skills || {}).map(([category, items]) => {
    const itemList = items.map((s) => `  - ${s.name}: ${s.desc}`).join('\n');
    return `### ${category}\n${itemList}`;
  }).join('\n\n');

  const fullContent = `# llms-full.txt — ${profileData.name} (complete reference)

This is the comprehensive, self-contained version of llms.txt. It contains all portfolio data currently available.

Last-Updated: ${currentDate}
Canonical: ${siteUrl}/llms-full.txt
Short version: ${siteUrl}/llms.txt
Machine-readable: ${siteUrl}/profile.json

---

## Identity

- Name: ${profileData.name}
${age === null ? '' : `- Age: ${age} (born ${profileData.birthDate})`}
- Location: ${profileData.location}
- Role: ${profileData.title}
- Email: mailto:${profileData.email}
- GitHub: ${profileData.socials?.github || ''}
- LinkedIn: ${profileData.socials?.linkedin || ''}
- X/Twitter: ${profileData.socials?.twitter || ''}
- YouTube: ${profileData.socials?.youtube || ''}
- Portfolio: ${siteUrl}/
${blogUrl ? `- Blog: ${blogUrl}` : ''}

---

## Education

${educationText || '- Not listed'}

---

## Bio

${bioFields.join('\n\n')}

---

## Achievements

${accomplishmentsText || '- Not listed yet'}

---

## Press & media appearances

${mediaText || '- No press entries listed yet'}

---

## Skills

${skillsText || '- Not listed'}

---

## All projects (${projectsData.length} total)

${allProjectsText}

---

## Contact

- Email: ${profileData.email}
- Portfolio: ${siteUrl}/
- LinkedIn: ${profileData.socials?.linkedin || ''}
- GitHub: ${profileData.socials?.github || ''}
`;

  writeToPublicAndBuild('llms-full.txt', fullContent);
}

function updateProfileJson() {
  const featuredProjects = getTopProjects(projectsData, 8).map((project) => formatProjectForProfileJson(project));
  const age = getAge(profileData.birthDate);

  const achievements = (profileData.accomplishments || []).map((a) => {
    let text = a.title;
    if (a.detail) text += ` — ${a.detail}`;
    return text;
  });

  const profileJsonData = {
    name: profileData.name,
    title: profileData.title,
    ...(age !== null ? { age } : {}),
    location: profileData.location,
    email: profileData.email,
    website: `${siteUrl}`,
    github: profileData.socials?.github || '',
    linkedin: profileData.socials?.linkedin || '',
    blog: blogUrl,
    youtube: profileData.socials?.youtube || '',
    current_role: {
      position: formatHtmlToMarkdown(profileData.bio?.history),
      education: formatHtmlToMarkdown(profileData.bio?.education),
    },
    education: profileData.education || [],
    skills: profileData.skills || {},
    featured_projects: featuredProjects,
    achievements,
    media_appearances: profileData.media_appearances || [],
    interests: profileData.interests || [],
    portfolio_features: {
      type: 'Interactive Terminal',
      technologies: ['React', 'JavaScript', 'CSS'],
      features: [
        'Terminal command interface',
        'Projects showcase',
        'Skills explorer',
        'Utility tools and mini games',
        'Responsive design',
      ],
    },
    last_updated: currentDate,
  };

  writeToPublicAndBuild('profile.json', JSON.stringify(profileJsonData, null, 2));
}

function updateSitemap() {
  const staticRoutes = [
    { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${siteUrl}/profile.json`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${siteUrl}/profile.md`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${siteUrl}/llms.txt`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${siteUrl}/llms-full.txt`, priority: '0.8', changefreq: 'weekly' },
  ];

  if (blogUrl) {
    staticRoutes.push({ loc: blogUrl, priority: '0.8', changefreq: 'weekly' });
  }

  const hashRoutes = [
    'who', 'projects', 'skills', 'misc',
    'misc/calculator', 'misc/qr-generator', 'misc/password-generator', 'misc/github-feed', 'misc/neofetch',
    'games', 'games/snake', 'games/tetris', 'games/2048', 'games/flappybird', 'games/gameoflife',
  ].map((route) => ({
    loc: `${siteUrl}/#/${route}`,
    priority: '0.7',
    changefreq: 'monthly',
  }));

  const unique = new Map();
  [...staticRoutes, ...hashRoutes].forEach((route) => {
    unique.set(route.loc, route);
  });

  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemapXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  unique.forEach((route) => {
    sitemapXml += `\n  <url>`;
    sitemapXml += `\n    <loc>${route.loc}</loc>`;
    sitemapXml += `\n    <lastmod>${currentDate}</lastmod>`;
    sitemapXml += `\n    <changefreq>${route.changefreq}</changefreq>`;
    sitemapXml += `\n    <priority>${route.priority}</priority>`;
    sitemapXml += `\n  </url>`;
  });

  sitemapXml += `\n</urlset>`;

  writeToPublicAndBuild('sitemap.xml', sitemapXml);
}

function main() {
  console.log('🔄 Updating metadata files...');

  try {
    updateLlmsTxt();
    updateLlmsFullTxt();
    updateProfileJson();
    updateSitemap();
    console.log('✅ All metadata files updated successfully!');
  } catch (error) {
    console.error('❌ Error updating metadata files:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
