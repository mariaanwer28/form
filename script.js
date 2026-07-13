let allApps = [];

function switchTab(tab){
  document.getElementById('tabFormBtn').classList.toggle('active', tab==='form');
  document.getElementById('tabAdminBtn').classList.toggle('active', tab==='admin');
  document.getElementById('formSection').style.display = tab==='form' ? 'block':'none';
  document.getElementById('adminSection').style.display = tab==='admin' ? 'block':'none';
  if(tab==='admin') loadApplications();
}

document.getElementById('jobForm').addEventListener('submit', function(e){
  e.preventDefault();

  const app = {
    id: 'app_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
    position: document.getElementById('position').value.trim(),
    fullName: document.getElementById('fullName').value.trim(),
    fatherName: document.getElementById('fatherName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    city: document.getElementById('city').value.trim(),
    age: document.getElementById('age').value.trim(),
    education: document.getElementById('education').value.trim(),
    experience: document.getElementById('experience').value.trim(),
    skills: document.getElementById('skills').value.trim(),
    coverNote: document.getElementById('coverNote').value.trim(),
    status: 'pending',
    submittedAt: new Date().toISOString()
  };

  try{
    const apps = JSON.parse(localStorage.getItem('job_applications') || '[]');
    apps.push(app);
    localStorage.setItem('job_applications', JSON.stringify(apps));

    document.getElementById('jobForm').reset();
    const msg = document.getElementById('successMsg');
    msg.style.display = 'block';
    setTimeout(()=>{ msg.style.display='none'; }, 4000);
  }catch(err){
    console.error(err);
    alert('Submit karne mein error aayi. Dobara koshish karein.');
  }
});

function loadApplications(){
  const listEl = document.getElementById('appsList');
  try{
    const apps = JSON.parse(localStorage.getItem('job_applications') || '[]');
    apps.sort((a,b)=> new Date(b.submittedAt) - new Date(a.submittedAt));
    allApps = apps;
    renderApplications();
  }catch(err){
    console.error(err);
    listEl.innerHTML = '<div class="empty-state">Applications load nahi ho saken. Dobara try karein.</div>';
  }
}

function renderApplications(){
  const listEl = document.getElementById('appsList');
  const search = document.getElementById('searchBox').value.trim().toLowerCase();

  let apps = allApps;
  if(search){
    apps = apps.filter(a =>
      (a.fullName||'').toLowerCase().includes(search) ||
      (a.position||'').toLowerCase().includes(search)
    );
  }

  document.getElementById('countPill').textContent = allApps.length + ' applications';

  if(apps.length === 0){
    listEl.innerHTML = '<div class="empty-state">Abhi koi application nahi hai.</div>';
    return;
  }

  listEl.innerHTML = apps.map(a => {
    const statusClass = a.status === 'hired' ? 'status-hired' : (a.status === 'rejected' ? 'status-rejected' : 'status-pending');
    const statusText = a.status === 'hired' ? '✅ Hired' : (a.status === 'rejected' ? '❌ Rejected' : '⏳ Pending');
    const date = new Date(a.submittedAt).toLocaleString('en-GB', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
    return `
      <div class="app-card">
        <div class="app-top">
          <div>
            <div class="app-name">${escapeHtml(a.fullName)}</div>
            <div class="app-position">${escapeHtml(a.position)}</div>
          </div>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="app-details">
          <b>Phone:</b> ${escapeHtml(a.phone || '-')} &nbsp; | &nbsp; <b>Email:</b> ${escapeHtml(a.email || '-')}<br>
          <b>City:</b> ${escapeHtml(a.city || '-')} &nbsp; | &nbsp; <b>Age:</b> ${escapeHtml(a.age || '-')} &nbsp; | &nbsp; <b>Father:</b> ${escapeHtml(a.fatherName || '-')}<br>
          <b>Education:</b> ${escapeHtml(a.education || '-')}<br>
          ${a.experience ? `<b>Experience:</b> ${escapeHtml(a.experience)}<br>` : ''}
          ${a.skills ? `<b>Skills:</b> ${escapeHtml(a.skills)}<br>` : ''}
          ${a.coverNote ? `<b>Note:</b> ${escapeHtml(a.coverNote)}<br>` : ''}
          <b>Submitted:</b> ${date}
        </div>
        <div class="app-actions">
          <button class="btn-hire" onclick="updateStatus('${a.id}','hired')">✅ Hire</button>
          <button class="btn-pending" onclick="updateStatus('${a.id}','pending')">⏳ Pending</button>
          <button class="btn-reject" onclick="updateStatus('${a.id}','rejected')">❌ Reject</button>
        </div>
      </div>
    `;
  }).join('');
}

function updateStatus(id, status){
  const app = allApps.find(a => a.id === id);
  if(!app) return;
  app.status = status;
  try{
    const apps = JSON.parse(localStorage.getItem('job_applications') || '[]');
    const idx = apps.findIndex(a => a.id === id);
    if(idx !== -1){
      apps[idx] = app;
      localStorage.setItem('job_applications', JSON.stringify(apps));
    }
    renderApplications();
  }catch(err){
    console.error(err);
    alert('Status update nahi ho saka, dobara koshish karein.');
  }
}

function escapeHtml(str){
  if(str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
