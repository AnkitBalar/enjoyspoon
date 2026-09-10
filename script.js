/* =========================================================
   ENJOY SPOON — Product data (add your real photos by setting
   an 'img' key on a product, e.g. "products/gehu.jpg")
   ========================================================= */
const PRODUCTS = [
  {id:'p1', name:'Golden Grains', desc:'Traditional wheat crunch, ready to eat — the taste you grew up with', price:249, mrp:399, cat:'gehu', color:'#c99a3e', rating:4.9, img:'gehu.png', sku:'ES-WHEAT-CRUNCH'},
  {id:'p2', name:'Pearl Millet', desc:'Traditional bajra crunch, ready to eat — the taste you grew up with', price:249, mrp:399, cat:'bajri', color:'#4f7a3d', rating:4.8, img:'bajri.png', sku:'ES-BAJRI-CRUNCH'},
];

/* -------- Product icon (placeholder art, used only if a product has no photo) -------- */
function productIcon(color){
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="${color}22"/>
    <path d="M50 14c10 8 16 18 16 28a16 16 0 0 1-32 0c0-10 6-20 16-28z" fill="${color}"/>
    <rect x="47" y="58" width="6" height="26" rx="3" fill="${color}"/>
    <circle cx="40" cy="42" r="3" fill="#fff" opacity=".7"/>
    <circle cx="58" cy="46" r="2.5" fill="#fff" opacity=".6"/>
    <circle cx="50" cy="36" r="2" fill="#fff" opacity=".5"/>
  </svg>`;
}
/* -------- Product media: real photo if available, else the placeholder icon -------- */
function productMedia(p){
  return p.img ? `<img src="${p.img}" alt="${p.name}">` : productIcon(p.color);
}

let cart = {}; // {productId: qty}

function renderProducts(filter){
  const grid = document.getElementById('productGrid');
  const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p=>p.cat===filter);
  grid.innerHTML = list.map((p,i) => `
    <div class="product-card card-in" style="animation-delay:${i*0.08}s;">
      <div class="product-media" style="background:${p.color}14;">
        ${productMedia(p)}
        <span class="product-rating">★ ${p.rating}</span>
      </div>
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${p.desc}</div>
      <div class="product-price">₹${p.price} <span>₹${p.mrp}</span></div>
      <button class="add-btn" id="btn-${p.id}" onclick="addToCart('${p.id}', this)">Add to Cart</button>
    </div>
  `).join('');
}
renderProducts('all');

document.getElementById('tabs').addEventListener('click', e=>{
  const btn = e.target.closest('.tab');
  if(!btn) return;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(btn.dataset.cat);
});

/* -------- Scroll-reveal animation -------- */
if('IntersectionObserver' in window){
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:.15, rootMargin:'0px 0px -60px 0px'});
  document.querySelectorAll('.reveal, .reveal-group').forEach(el=>revealObserver.observe(el));
}

/* -------- Mobile menu -------- */
const navLinksEl = document.querySelector('.nav-links');
const burgerBtn = document.getElementById('burgerBtn');

function toggleMobileMenu(){
  const isOpen = navLinksEl.classList.toggle('mobile-open');
  burgerBtn.classList.toggle('open', isOpen);
  burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}
function closeMobileMenu(){
  navLinksEl.classList.remove('mobile-open');
  burgerBtn.classList.remove('open');
  burgerBtn.setAttribute('aria-expanded', 'false');
}
navLinksEl.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeMobileMenu));
window.addEventListener('resize', ()=>{ if(window.innerWidth > 980) closeMobileMenu(); });

/* -------- FAQ -------- */
function toggleFaq(btn){
  const item = btn.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i=>{
    i.classList.remove('open');
    i.querySelector('.icon').textContent = '+';
  });
  if(!wasOpen){
    item.classList.add('open');
    item.querySelector('.icon').textContent = '×';
  }
}

/* -------- Cart logic -------- */
function addToCart(id, btnEl){
  cart[id] = (cart[id]||0) + 1;
  updateCartUI();
  showToast('Added to cart ✓');
  if(btnEl){
    btnEl.classList.add('added');
    btnEl.textContent = 'Added ✓';
    setTimeout(()=>{ btnEl.classList.remove('added'); btnEl.textContent='Add to Cart'; }, 1200);
  }
}
function changeQty(id, delta){
  if(!cart[id]) return;
  cart[id] += delta;
  if(cart[id] <= 0) delete cart[id];
  updateCartUI();
}
function removeFromCart(id){
  delete cart[id];
  updateCartUI();
}
function cartTotal(){
  return Object.entries(cart).reduce((sum,[id,qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return sum + (p ? p.price*qty : 0);
  }, 0);
}
function cartCountTotal(){
  return Object.values(cart).reduce((a,b)=>a+b,0);
}
function updateCartUI(){
  const countEl = document.getElementById('cartCount');
  countEl.textContent = cartCountTotal();
  countEl.classList.remove('bump');
  void countEl.offsetWidth;
  countEl.classList.add('bump');
  const itemsEl = document.getElementById('cartItems');
  const entries = Object.entries(cart);
  if(entries.length === 0){
    itemsEl.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
  } else {
    itemsEl.innerHTML = entries.map(([id,qty])=>{
      const p = PRODUCTS.find(x=>x.id===id);
      if(!p) return '';
      return `
        <div class="cart-row">
          <div class="thumb" style="background:${p.color}14;">${productMedia(p)}</div>
          <div class="info">
            <b>${p.name}</b>
            <span class="price">₹${p.price}</span>
            <div class="qty-box">
              <button onclick="changeQty('${id}',-1)">−</button>
              <span>${qty}</span>
              <button onclick="changeQty('${id}',1)">+</button>
            </div>
          </div>
          <button class="remove-row" onclick="removeFromCart('${id}')">Remove</button>
        </div>`;
    }).join('');
  }
  const total = cartTotal();
  document.getElementById('cartTotal').textContent = '₹'+total;
  document.getElementById('checkoutBtn').disabled = total === 0;
}
updateCartUI();

/* -------- Drawer / Modal control -------- */
function openCart(){
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}
function closeCart(){
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}
function openCheckout(){
  if(cartTotal() === 0){ showToast('Please add a product to your cart first'); return; }
  document.getElementById('cartDrawer').classList.remove('open');
  renderCheckoutSummary();
  document.getElementById('checkoutModal').classList.add('show');
  document.getElementById('overlay').classList.add('show');
}
function renderCheckoutSummary(){
  const itemsEl = document.getElementById('checkoutItems');
  itemsEl.innerHTML = Object.entries(cart).map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    if(!p) return '';
    return `
      <div class="summary-item">
        <div class="s-thumb">${productMedia(p)}</div>
        <div class="s-info">
          <span class="s-name">${p.name}</span>
          <span class="s-qty">Qty: ${qty}</span>
        </div>
        <div class="s-price">₹${p.price * qty}</div>
      </div>`;
  }).join('');
  const total = cartTotal();
  document.getElementById('summarySubtotal').textContent = '₹' + total;
  document.getElementById('summaryTotal').textContent = '₹' + total;
}
function closeAllOverlays(){
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('checkoutModal').classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
}
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 1800);
}

/* =========================================================
   RAZORPAY PAYMENT INTEGRATION
   ⚠️ IMPORTANT: replace "rzp_test_XXXXXXXXXXXX" below with your
   real Razorpay Key ID (Razorpay Dashboard > Settings > API Keys).
   For production (live) use, the order_id should be generated on
   your server — see the note in the comment below.
   ========================================================= */
const RAZORPAY_KEY_ID = "rzp_live_TaHuPX4zNHPUJB"; // <-- put your Razorpay Key ID here

/* =========================================================
   GOOGLE SHEET ORDER LOGGING
   ⚠️ IMPORTANT: paste your Google Apps Script Web App URL below.
   See the "Google Apps Script" setup file provided alongside this
   project for the exact script to deploy — it logs every order
   into a Sheet and lets you print courier labels from it.
   ========================================================= */
const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwUA7NEJkFsq3sQN0037vp3ZBMF_reFklv6swJODv7VkwvVCjGdKYCfSXhedupD0Ym0Pw/exec";

function cartItemsSummary(){
  return Object.entries(cart).map(([id,qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return p ? `${p.name} x${qty}` : '';
  }).filter(Boolean).join(', ');
}

function cartItemsJSON(){
  const items = Object.entries(cart).map(([id,qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return p ? { name:p.name, sku:p.sku||'', qty:qty, price:p.price } : null;
  }).filter(Boolean);
  return JSON.stringify(items);
}

function sendOrderToGoogleSheet(order){
  if(!GOOGLE_SHEET_WEBHOOK_URL || GOOGLE_SHEET_WEBHOOK_URL.indexOf('PASTE_YOUR') === 0){
    console.warn('Google Sheet webhook URL not set — order was not logged to Sheet.');
    return;
  }
  const body = new URLSearchParams(order);
  // mode:'no-cors' — we don't need to read the response, just fire the request.
  // Apps Script web apps don't send CORS headers back for a readable response,
  // but the POST still reaches doPost() and appends the row correctly.
  fetch(GOOGLE_SHEET_WEBHOOK_URL, { method:'POST', mode:'no-cors', body })
    .catch(err => console.warn('Order logging to Google Sheet failed:', err));
}

/* -------- Per-field validation -------- */
function setFieldError(fieldId, inputId, hasError){
  document.getElementById(fieldId).classList.toggle('has-error', hasError);
  document.getElementById(inputId).classList.toggle('invalid', hasError);
}
function clearFieldError(fieldId, inputId){
  setFieldError(fieldId, inputId, false);
}
['custName','custPhone','custEmail','custHouseNo','custStreet','custCity','custState','custCountry','custPincode'].forEach(id=>{
  const el = document.getElementById(id);
  if(el){
    el.addEventListener('input', ()=>{
      const fieldId = 'field' + id.replace('cust','');
      clearFieldError(fieldId, id);
    });
  }
});

function validateCheckoutForm(){
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const houseNo = document.getElementById('custHouseNo').value.trim();
  const street = document.getElementById('custStreet').value.trim();
  const city = document.getElementById('custCity').value.trim();
  const state = document.getElementById('custState').value.trim();
  const country = document.getElementById('custCountry').value.trim();
  const pincode = document.getElementById('custPincode').value.trim();

  let isValid = true;

  if(!name){
    setFieldError('fieldName','custName', true);
    isValid = false;
  } else {
    clearFieldError('fieldName','custName');
  }

  const phoneOk = /^[0-9]{10}$/.test(phone);
  if(!phoneOk){
    setFieldError('fieldPhone','custPhone', true);
    isValid = false;
  } else {
    clearFieldError('fieldPhone','custPhone');
  }

  const emailOk = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if(!emailOk){
    setFieldError('fieldEmail','custEmail', true);
    isValid = false;
  } else {
    clearFieldError('fieldEmail','custEmail');
  }

  if(!houseNo){
    setFieldError('fieldHouseNo','custHouseNo', true);
    isValid = false;
  } else {
    clearFieldError('fieldHouseNo','custHouseNo');
  }

  if(!street){
    setFieldError('fieldStreet','custStreet', true);
    isValid = false;
  } else {
    clearFieldError('fieldStreet','custStreet');
  }

  if(!city){
    setFieldError('fieldCity','custCity', true);
    isValid = false;
  } else {
    clearFieldError('fieldCity','custCity');
  }

  if(!state){
    setFieldError('fieldState','custState', true);
    isValid = false;
  } else {
    clearFieldError('fieldState','custState');
  }

  if(!country){
    setFieldError('fieldCountry','custCountry', true);
    isValid = false;
  } else {
    clearFieldError('fieldCountry','custCountry');
  }

  const pincodeOk = /^[0-9]{6}$/.test(pincode);
  if(!pincodeOk){
    setFieldError('fieldPincode','custPincode', true);
    isValid = false;
  } else {
    clearFieldError('fieldPincode','custPincode');
  }

  return isValid;
}

function getFullAddress(){
  const houseNo = document.getElementById('custHouseNo').value.trim();
  const street = document.getElementById('custStreet').value.trim();
  const city = document.getElementById('custCity').value.trim();
  const state = document.getElementById('custState').value.trim();
  const country = document.getElementById('custCountry').value.trim();
  const pincode = document.getElementById('custPincode').value.trim();
  return `${houseNo}, ${street}, ${city}, ${state}, ${country} - ${pincode}`;
}

function startRazorpayPayment(){
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const email = document.getElementById('custEmail').value.trim();

  if(!validateCheckoutForm()){
    showToast('Please check the highlighted fields');
    return;
  }
  const houseNo = document.getElementById('custHouseNo').value.trim();
  const street = document.getElementById('custStreet').value.trim();
  const city = document.getElementById('custCity').value.trim();
  const state = document.getElementById('custState').value.trim();
  const country = document.getElementById('custCountry').value.trim();
  const pincode = document.getElementById('custPincode').value.trim();
  const address = getFullAddress();
  const items = cartItemsSummary();
  const itemsJson = cartItemsJSON();
  const amount = cartTotal();
  if(amount <= 0){
    showToast('Your cart is empty');
    return;
  }

  if(typeof Razorpay === 'undefined'){
    showToast('Razorpay failed to load, please try again');
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount * 100, // in paise
    currency: "INR",
    name: "Enjoy Spoon",
    description: "Premium Mukhwas Order",
    image: "logo.png",
    // ⚠️ For production: add order_id: "order_xxx" here,
    // generated on your server via the Razorpay Orders API.
    handler: function(response){
      showToast('Payment successful! Payment ID: ' + response.razorpay_payment_id);
      sendOrderToGoogleSheet({
        name: name,
        phone: phone,
        email: email,
        houseNo: houseNo,
        street: street,
        city: city,
        state: state,
        country: country,
        pincode: pincode,
        items: items,
        itemsJson: itemsJson,
        amount: amount,
        paymentId: response.razorpay_payment_id
      });
      cart = {};
      updateCartUI();
      closeAllOverlays();
      document.getElementById('custName').value = '';
      document.getElementById('custPhone').value = '';
      document.getElementById('custEmail').value = '';
      document.getElementById('custHouseNo').value = '';
      document.getElementById('custStreet').value = '';
      document.getElementById('custCity').value = '';
      document.getElementById('custState').value = '';
      document.getElementById('custCountry').value = 'India';
      document.getElementById('custPincode').value = '';
    },
    prefill: { name: name, email: email, contact: phone },
    notes: { address: address },
    theme: { color: "#173319" },
    modal:{
      ondismiss: function(){ showToast('Payment was cancelled'); }
    }
  };

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', function(response){
    showToast('Payment failed, please try again');
  });
  rzp.open();
}
