import profileData from '../data/profile.json';

const whoamiContent = `
<div class="whoami-glass-card">
  <h3 class="whoami-title">${profileData.name}</h3>
  <div class="whoami-section">
    <p>${profileData.bio.intro}</p>
  </div>
  <div class="whoami-section">
    <p>${profileData.bio.education}</p>
  </div>
  <div class="whoami-section">
    <p>${profileData.bio.projects_highlight}</p>
  </div>
  <div class="whoami-section">
    <p>${profileData.bio.current_work}</p>
  </div>
  <div class="whoami-section">
    <p>${profileData.bio.skills_highlight}</p>
  </div>
  <div class="whoami-footer">
    <p>Type <span class="command-link" data-command="github" style="color: #5abb9a; cursor: pointer; text-decoration: underline;">github</span>, <span class="command-link" data-command="linkedin" style="color: #5abb9a; cursor: pointer; text-decoration: underline;">linkedin</span>, or <span class="command-link" data-command="email" style="color: #5abb9a; cursor: pointer; text-decoration: underline;">email</span> to connect with me.</p>
  </div>
</div>`;

export default whoamiContent;
