import React, { useState, useEffect } from 'react';
import projectsBase from '../data/projects.json';

const projects = projectsBase;

const formatDescriptionToHtml = (raw) => {
  if (!raw || typeof raw !== 'string') return '';

  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const withLinks = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, text, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #5abb9a; text-decoration: underline;">${text}</a>`;
  });

  return withLinks.replace(/\n/g, '<br/>');
};

const badgeLinks = (project) => {
  const badges = [];

  if (project.website) {
    badges.push({
      href: project.website,
      alt: 'Website',
      src: 'https://cdn.simpleicons.org/googlechrome/ffebcd',
    });
  }

  if (project.github) {
    badges.push({
      href: project.github,
      alt: 'GitHub',
      src: 'https://cdn.simpleicons.org/github/ffebcd',
    });
  }

  const extras = Array.isArray(project.extra)
    ? project.extra
    : (project.extra ? [project.extra] : []);

  extras.forEach((item) => {
    if (!item) return;
    if (typeof item === 'string') {
      badges.push({ href: item, alt: 'Post', src: '/globe.svg' });
      return;
    }
    const href = item.href || item.url;
    if (!href) return;
    badges.push({
      href,
      alt: item.alt || 'Post',
      src: item.src || '/globe.svg',
    });
  });

  return badges.map((badge, i) => (
    <a
      key={`${badge.href}-${i}`}
      href={badge.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ marginRight: 10, marginBottom: 6, display: 'inline-block' }}
    >
      <img
        src={badge.src}
        alt={badge.alt}
        style={{ height: 32, borderRadius: 6, boxShadow: '0 1px 4px #0002' }}
      />
    </a>
  ));
};

const ProjectPreview = ({ project, height = 225, mobile = false }) => {
  const spacing = mobile ? 0 : 16;

  if (project.previewImg) {
    return (
      <div
        style={{
          marginBottom: spacing,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1.5px solid rgba(90,187,154,0.18)',
          boxShadow: '0 2px 16px 0 rgba(90,187,154,0.10)',
          background: '#181818',
          height,
          maxWidth: '100%',
          display: 'block',
        }}
      >
        <img
          src={project.previewImg}
          alt={`${project.title} preview`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }

  if (project.website && project.showIframe === true && !mobile) {
    return (
      <div
        style={{
          marginBottom: spacing,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1.5px solid rgba(90,187,154,0.18)',
          boxShadow: '0 2px 16px 0 rgba(90,187,154,0.10)',
          background: '#181818',
          height,
          maxWidth: '100%',
          display: 'block',
        }}
      >
        <iframe
          src={project.website}
          title={`${project.title} preview`}
          style={{ width: '100%', height: '100%', border: 'none', background: '#181818' }}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups"
        >
          Your browser does not support iframes or this site does not allow embedding.
        </iframe>
      </div>
    );
  }

  return null;
};

const MobileProjectsCarousel = () => {
  const [current, setCurrent] = useState(0);

  if (!projects.length) {
    return null;
  }

  const total = projects.length;
  const goLeft = () => setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  const goRight = () => setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
  const project = projects[current];

  return (
    <div className="mobile-projects-carousel" style={{ maxWidth: 420, margin: '0 auto', padding: '16px 0' }}>
      <div
        className="mobile-project-card"
        style={{
          background: 'linear-gradient(135deg, rgba(30,30,30,0.95) 60%, rgba(90,187,154,0.10) 100%)',
          borderRadius: 18,
          marginBottom: 24,
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
          padding: '24px 12px',
          color: '#ffebcd',
          fontFamily: "'JetBrains Mono', monospace",
          border: '1.5px solid rgba(90,187,154,0.13)',
          position: 'relative',
          minHeight: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', marginBottom: 16, borderRadius: 12, overflow: 'hidden', background: '#181818', height: 200 }}>
          <ProjectPreview project={project} height={200} mobile />
        </div>

        <div style={{ fontWeight: 700, fontSize: '1.18em', color: '#5abb9a', marginBottom: 10, textAlign: 'center' }}>
          {project.title}
        </div>

        <div
          style={{ fontSize: '1em', marginBottom: 16, textAlign: 'center', lineHeight: 1.5 }}
          dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(project.description) }}
        />

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          {badgeLinks(project)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 10 }}>
          <button onClick={goLeft} style={{ background: '#111', color: '#5abb9a', border: '1.5px solid #333', borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 22, width: 44, height: 44, cursor: 'pointer', boxShadow: '0 1px 4px #0002' }}>&lt;</button>
          <button onClick={goRight} style={{ background: '#111', color: '#5abb9a', border: '1.5px solid #333', borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 22, width: 44, height: 44, cursor: 'pointer', boxShadow: '0 1px 4px #0002' }}>&gt;</button>
        </div>

        <div style={{ marginTop: 8, fontSize: '0.92em', color: '#5abb9a', textAlign: 'center' }}>
          {current + 1} / {total}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .mobile-projects-carousel { display: block; }
          .project-masonry-card, .projects-grid { display: none !important; }
        }
        @media (min-width: 701px) {
          .mobile-projects-carousel { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const ProjectsMasonry = () => {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth <= 900) setColumns(1);
      else if (window.innerWidth <= 1300) setColumns(2);
      else setColumns(3);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  if (!projects.length) {
    return <div style={{ color: '#ffebcd' }}>No projects added yet.</div>;
  }

  const columnProjects = Array.from({ length: columns }, () => []);
  projects.forEach((project, i) => {
    columnProjects[i % columns].push(project);
  });

  return (
    <>
      <div
        className="projects-grid"
        style={{
          display: 'flex',
          gap: '32px',
          maxWidth: 1300,
          margin: '0 auto',
          padding: '40px 0',
          alignItems: 'start',
        }}
      >
        {columnProjects.map((col, colIndex) => (
          <div key={colIndex} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', minWidth: 0 }}>
            {col.map((project) => (
              <div
                key={project.title}
                className="project-masonry-card"
                style={{
                  display: 'inline-block',
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(30,30,30,0.95) 60%, rgba(90,187,154,0.10) 100%)',
                  borderRadius: 18,
                  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
                  padding: '24px 20px',
                  color: '#ffebcd',
                  fontFamily: "'JetBrains Mono', monospace",
                  position: 'relative',
                  border: '1.5px solid rgba(90,187,154,0.13)',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  alignSelf: 'start',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.025)';
                  e.currentTarget.style.boxShadow = '0 12px 36px 0 rgba(90,187,154,0.18)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31,38,135,0.18)';
                }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <ProjectPreview project={project} />

                  <div style={{ fontWeight: 700, fontSize: '1.25em', marginBottom: 8, color: '#5abb9a' }}>
                    {project.title}
                  </div>

                  <div
                    style={{ fontSize: '1em', marginBottom: 16 }}
                    dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(project.description) }}
                  />

                  <div className="project-badges" style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap' }}>
                    {badgeLinks(project)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        <style>{`
          .project-masonry-card {
            position: relative;
            overflow: hidden;
            z-index: 1;
          }
          .project-masonry-card::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 0;
            background: linear-gradient(120deg, rgba(90,187,154,0.08) 0%, rgba(90,187,154,0.18) 100%);
            opacity: 0;
            transition: opacity 0.4s, filter 0.4s;
            filter: blur(0px);
            pointer-events: none;
          }
          .project-masonry-card:hover::before {
            opacity: 1;
            filter: blur(6px) brightness(1.2) saturate(1.3);
            animation: projectCardBgAnim 1.2s linear infinite alternate;
          }
          .project-masonry-card:hover {
            box-shadow: 0 0 32px 0 #5abb9a55, 0 12px 36px 0 rgba(90,187,154,0.18);
            border-color: #5abb9a;
          }
          @keyframes projectCardBgAnim {
            0% { background-position: 0% 0%; }
            100% { background-position: 100% 100%; }
          }
          @media (max-width: 900px) {
            .project-iframe-container, .project-iframe {
              display: none !important;
            }
          }
          @media (max-width: 700px) {
            .project-masonry-card {
              padding: 14px 4vw !important;
              margin-bottom: 18px !important;
              font-size: 0.98em !important;
              border-radius: 12px !important;
            }
            .project-masonry-card img {
              height: 120px !important;
              min-height: 80px !important;
              object-fit: cover !important;
            }
            .project-masonry-card .project-iframe-container {
              display: none !important;
            }
            .project-badges {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 6px !important;
            }
            .project-masonry-card .project-badges img {
              height: 26px !important;
              width: 26px !important;
            }
            .project-masonry-card div[style*='fontWeight: 700'] {
              font-size: 1.08em !important;
            }
            .project-masonry-card div[style*='fontSize: 1em'] {
              font-size: 0.97em !important;
            }
          }
        `}</style>
      </div>

      <MobileProjectsCarousel />
    </>
  );
};

export default ProjectsMasonry;
