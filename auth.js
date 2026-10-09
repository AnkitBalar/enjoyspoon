/* =========================================================
   ENJOY SPOON — Google Login, saved address & My Orders
   Uses Firebase Authentication (Google) + Cloud Firestore.

   ⚠️ IMPORTANT: paste your Firebase web config below
   (Firebase Console > Project settings > Your apps > Web app).
   Until it is filled in, the login button stays hidden and the
   site keeps working exactly as before (guest checkout).
   ========================================================= */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCLFCwdgSopvrYje3ZVPMOsC3rq4pduA3A",
  authDomain: "enjoy-spoon.firebaseapp.com",
  projectId: "enjoy-spoon",
  storageBucket: "enjoy-spoon.firebasestorage.app",
  messagingSenderId: "33201054333",
  appId: "1:33201054333:web:314bd53671791b7b1bc714",
};

const SDK = 'https://www.gstatic.com/firebasejs/13.0.0/';
const ADDRESS_FIELDS = ['Name','Phone','Email','HouseNo','Street','City','State','Country','Pincode'];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = id => document.getElementById(id);

(async function initAuth(){
  if(FIREBASE_CONFIG.apiKey.indexOf('PASTE_') === 0){
    console.info('Firebase config not set — Google login is disabled.');
    return;
  }

  const [{ initializeApp }, authMod, fs] = await Promise.all([
    import(SDK + 'firebase-app.js'),
    import(SDK + 'firebase-auth.js'),
    import(SDK + 'firebase-firestore.js'),
  ]);
  const { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } = authMod;
  const { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } = fs;

  const app = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  let user = null;
  let savedAddress = null;

  /* ---------------- UI: header button + account drawer ---------------- */
  const accBtn = $('accountBtn');
  if(accBtn) accBtn.hidden = false;

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="acct-overlay" id="acctOverlay"></div>
    <aside class="acct-drawer" id="acctDrawer" aria-label="My account" aria-hidden="true">
      <div class="cart-head">
        <h3>My Account</h3>
        <button class="cart-close" id="acctClose" aria-label="Close">✕</button>
      </div>
      <div class="acct-body" id="acctBody"></div>
    </aside>`;
  document.body.append(...wrap.children);

  const drawer = $('acctDrawer'), overlay = $('acctOverlay'), body = $('acctBody');
  const openDrawer = () => { drawer.classList.add('open'); overlay.classList.add('show'); drawer.setAttribute('aria-hidden','false'); render(); };
  const closeDrawer = () => { drawer.classList.remove('open'); overlay.classList.remove('show'); drawer.setAttribute('aria-hidden','true'); };
  overlay.addEventListener('click', closeDrawer);
  $('acctClose').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeDrawer(); });
  if(accBtn) accBtn.addEventListener('click', openDrawer);

  const googleIcon = `<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>`;
  const googleBtn = label => `<button class="google-btn" data-act="login" type="button">${googleIcon}<span>${label}</span></button>`;

  async function login(){
    try{
      await signInWithPopup(auth, provider);
    }catch(err){
      if(err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment'){
        await signInWithRedirect(auth, provider);
      }else if(err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request'){
        console.warn('Login failed:', err);
        toast('Login failed, please try again');
      }
    }
  }
  function toast(msg){ if(typeof window.showToast === 'function') window.showToast(msg); }

  document.addEventListener('click', e => {
    const act = e.target.closest('[data-act]');
    if(!act) return;
    const a = act.dataset.act;
    if(a === 'login') login();
    if(a === 'logout') signOut(auth).then(()=>{ toast('Logged out'); });
    if(a === 'tab-orders' || a === 'tab-address') render(a === 'tab-orders' ? 'orders' : 'address');
  });

  /* ---------------- Drawer content ---------------- */
  let activeTab = 'orders';
  async function render(tab){
    if(tab) activeTab = tab;
    if(!user){
      body.innerHTML = `
        <div class="acct-guest">
          <div class="acct-guest-icon">👤</div>
          <h4>Login to your account</h4>
          <p>Save your delivery address for faster checkout and track all your orders in one place.</p>
          ${googleBtn('Continue with Google')}
        </div>`;
      return;
    }
    body.innerHTML = `
      <div class="acct-profile">
        ${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : `<span class="acct-initial">${esc((user.displayName||user.email||'?')[0].toUpperCase())}</span>`}
        <div><b>${esc(user.displayName || 'Customer')}</b><small>${esc(user.email || '')}</small></div>
      </div>
      <div class="acct-tabs">
        <button data-act="tab-orders" class="${activeTab==='orders'?'active':''}">My Orders</button>
        <button data-act="tab-address" class="${activeTab==='address'?'active':''}">Saved Address</button>
      </div>
      <div class="acct-panel" id="acctPanel"><div class="acct-loading">Loading…</div></div>
      <button class="acct-logout" data-act="logout" type="button">Logout</button>`;
    if(activeTab === 'orders') renderOrders(); else renderAddress();
  }

  async function renderOrders(){
    const panel = $('acctPanel');
    try{
      const snap = await getDocs(query(collection(db, 'users', user.uid, 'orders'), orderBy('createdAt','desc'), limit(30)));
      if(snap.empty){
        panel.innerHTML = `<div class="cart-empty">No orders yet.<br><a href="/#shop" class="acct-link">Start shopping →</a></div>`;
        return;
      }
      panel.innerHTML = snap.docs.map(d => {
        const o = d.data();
        const date = o.createdAt && o.createdAt.toDate ? o.createdAt.toDate().toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : '';
        const status = o.status || 'Placed';
        return `
          <div class="order-card">
            <div class="order-top"><span>${esc(date)}</span><span class="order-status s-${esc(status.toLowerCase().replace(/\s+/g,'-'))}">${esc(status)}</span></div>
            <div class="order-items">${esc(o.items || '')}</div>
            <div class="order-bottom"><b>₹${esc(o.amount)}</b><small>ID: ${esc(o.paymentId || '')}</small></div>
          </div>`;
      }).join('');
    }catch(err){
      console.warn(err);
      panel.innerHTML = `<div class="cart-empty">Could not load orders. Please try again.</div>`;
    }
  }

  async function renderAddress(){
    const panel = $('acctPanel');
    const a = await loadAddress() || {};
    const f = (key, label, type='text', extra='') => `
      <div class="field"><label>${label}</label><input type="${type}" name="${key}" value="${esc(a[key] || '')}" ${extra}></div>`;
    panel.innerHTML = `
      <form class="acct-form" id="acctForm">
        ${f('name','Full Name')}
        ${f('phone','Phone Number','tel','inputmode="numeric" maxlength="10"')}
        ${f('email','Email','email')}
        <div class="field-row">${f('houseNo','House No.')}${f('street','Street')}</div>
        <div class="field-row">${f('city','City')}${f('state','State')}</div>
        <div class="field-row">${f('country','Country')}${f('pincode','Pincode','text','inputmode="numeric" maxlength="6"')}</div>
        <button class="btn btn-gold" type="submit">Save Address</button>
      </form>`;
    $('acctForm').addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      for(const k in data) data[k] = data[k].trim();
      if(data.phone && !/^[0-9]{10}$/.test(data.phone)){ toast('Enter a valid 10-digit phone number'); return; }
      if(data.pincode && !/^[0-9]{6}$/.test(data.pincode)){ toast('Enter a valid 6-digit pincode'); return; }
      await saveAddress(data);
      toast('Address saved');
    });
  }

  /* ---------------- Firestore helpers ---------------- */
  async function loadAddress(){
    if(!user) return null;
    if(savedAddress) return savedAddress;
    try{
      const snap = await getDoc(doc(db, 'users', user.uid));
      savedAddress = snap.exists() ? (snap.data().address || null) : null;
    }catch(err){ console.warn(err); }
    if(!savedAddress) savedAddress = { name: user.displayName || '', email: user.email || '', country: 'India' };
    return savedAddress;
  }
  async function saveAddress(addr){
    savedAddress = { ...addr };
    await setDoc(doc(db, 'users', user.uid), { address: savedAddress, updatedAt: serverTimestamp() }, { merge: true });
  }

  /* ---------------- Checkout integration ---------------- */
  const form = document.querySelector('#checkoutModal .checkout-form');
  let hint = null;
  if(form){
    hint = document.createElement('div');
    hint.className = 'checkout-login';
    form.insertBefore(hint, form.querySelector('.field'));
  }
  function updateHint(){
    if(!hint) return;
    hint.innerHTML = user
      ? `<span>✓ Logged in as <b>${esc(user.displayName || user.email)}</b> — your address will be saved.</span>`
      : `<span>Have an account? Login to auto-fill your address &amp; track orders.</span>${googleBtn('Login with Google')}`;
  }

  async function prefillCheckout(){
    if(!user || !form) return;
    const a = await loadAddress();
    if(!a) return;
    ADDRESS_FIELDS.forEach(F => {
      const el = $('cust' + F);
      const val = a[F.charAt(0).toLowerCase() + F.slice(1)];
      if(el && val && (!el.value || (F === 'Country' && el.value === 'India'))) el.value = val;
    });
  }

  // called by script.js after a successful payment
  async function saveOrder(order){
    if(!user) return;
    try{
      const addr = {};
      ['name','phone','email','houseNo','street','city','state','country','pincode'].forEach(k => addr[k] = order[k] || '');
      await Promise.all([
        saveAddress(addr),
        addDoc(collection(db, 'users', user.uid, 'orders'), {
          items: order.items, itemsJson: order.itemsJson, amount: Number(order.amount),
          paymentId: order.paymentId, address: addr, status: 'Placed', createdAt: serverTimestamp(),
        }),
      ]);
    }catch(err){ console.warn('Saving order to account failed:', err); }
  }

  window.esAuth = {
    get user(){ return user; },
    prefillCheckout, saveOrder, openAccount: openDrawer,
  };

  /* ---------------- Auth state ---------------- */
  onAuthStateChanged(auth, u => {
    user = u;
    savedAddress = null;
    if(accBtn){
      accBtn.classList.toggle('logged-in', !!u);
      accBtn.setAttribute('aria-label', u ? 'My account' : 'Login');
      accBtn.innerHTML = u && u.photoURL
        ? `<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">`
        : `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;
    }
    updateHint();
    if(drawer.classList.contains('open')) render();
    if(u && $('checkoutModal') && $('checkoutModal').classList.contains('show')) prefillCheckout();
  });
})();
