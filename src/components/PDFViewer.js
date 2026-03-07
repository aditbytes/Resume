import React from 'react';
import profileData from '../data/profile.json';

const PDFViewer = () => {
  const resumeUrl = profileData?.resumeUrl;

  if (!resumeUrl) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          color: '#ffebcd',
          textAlign: 'center'
        }}
      >
        <div>
          <h3 style={{ color: '#5abb9a' }}>Resume Not Configured</h3>
          <p>Add a resume URL in <code>src/data/profile.json</code> under <code>resumeUrl</code>.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <iframe
        src={resumeUrl}
        title="Resume PDF"
        width="100%"
        height="800px"
        sandbox="allow-same-origin"
        style={{
          border: 'none',
          maxWidth: '1000px'
        }}
      />
    </div>
  );
};

export default PDFViewer;
