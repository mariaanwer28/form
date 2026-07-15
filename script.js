// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const applicationsRef = db.collection('applications');

let allApps = [];
let unsubscribeListener = null;

function switchTab(tab){
  document.getElementById('tabFormBtn').classList.toggle('active', tab==='form');
  document.getElementById('tabAdminBtn').classList.toggle('active', tab==='admin');
  document.getElementById('formSection').style.display = tab==='form' ? 'block':'none';
  document.getElementById('adminSection').style.display = tab==='admin' ? 'block':'none';
  if(tab==='admin') startListening();
}

// Upload photo to Cloudinary, returns secure_url or null
async function uploadPhotoToCloudinary(file){
  if(!file) return null;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if(!response.ok){
    throw new Error('Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

document.getElementById('jobForm').addEventListener('submit', async function(e){
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const uploadStatus = document.getElementById('uploadStatus');
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.style.display = 'none';

  const photoFile = document.getElementById('photoFile').files[0];

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submit ho raha hai...';

  try{
    let photoUrl = null;

    if(photoFile){
      uploadStatus.textContent = '📤 Photo upload ho rahi hai...';
      photoUrl = await uploadPhotoToCloudinary(photoFile);
      uploadStatus.textContent = '✅ Photo upload ho gayi';
    }

    const app = {
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
      photoUrl: photoUrl,
      status: 'pending',
      submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await applicationsRef.add(app);

    document.getElementById('jobForm').reset();
    uploadStatus.textContent = '';
    const msg = document.getElementById('successMsg');
    msg.style.display = 'block';
    setTimeout(()=>{ msg.style.display='none'; }, 4000);

  }catch(err){
    console.error(err);
    errorMsg.textContent = '❌ Submit karne mein error aayi: ' + err.message;
    errorMsg.style.display = 'block';
  }finally{
    submitBtn.disabled = false;
    submitBtn.textContent = 'Application Submit Karein';
  }
});

// Real-time listener for admin panel
function startListening(){
  const listEl = document.getElementById('appsList');
  listEl.innerHTML = '<div class="loading">Loading...</div>';

  if(unsubscribeListener) unsubscribeListener();

  unsubscribeListener = applicationsRef
    .orderBy('submittedAt', 'desc')
    .onSnapshot(function(snapshot){
      allApps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderApplications();
    }, function(err){
      console.error(err);
      listEl.innerHTML = '<div class="empty-state">Applications load nahi ho saken.<br>' + err.message + '</div>';
    });
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
    const date = a.submittedAt && a.submittedAt.toDate ? a.submittedAt.toDate().toLocaleString('en-GB', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'}) : '-';
    const photoHtml = a.photoUrl ? `<img src="${a.photoUrl}" class="app-photo" alt="photo">` : '';

    return `
      <div class="app-card">
        <div class="app-top">
          ${photoHtml}
          <div class="app-info">
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

async function updateStatus(id, status){
  try{
    await applicationsRef.doc(id).update({ status: status });
  }catch(err){
    console.error(err);
    alert('Status update nahi ho saka: ' + err.message);
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
