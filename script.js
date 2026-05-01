// ===== CONFIG =====
// Ganti dengan URL Google Apps Script kamu
const GOOGLE_SHEET_WEBHOOK = "https://script.google.com/macros/s/AKfycbys8K_9eovp8ieVQ8nQeZTpvS49BIiDyUyj7PQ3yfJXJrI1o8QVh5-T-_MincwryiYCqw/exec";

// Admin credentials (ganti sesuai kebutuhan)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'morichansukakelor'
};

// ===== STATE =====
let isAdmin = false;
let orderOpen = true;

// ===== NAVBAR HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== ADMIN MODAL =====
document.getElementById('adminLogoBtn').addEventListener('click', () => {
  if (isAdmin) return; // jika sudah login, abaikan
  openAdminModal();
});

function openAdminModal() {
  document.getElementById('adminModal').classList.add('active');
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPass').value = '';
  document.getElementById('modalErr').classList.remove('show');
  setTimeout(() => document.getElementById('adminUser').focus(), 300);
}
function closeAdminModal() {
  document.getElementById('adminModal').classList.remove('active');
}
document.getElementById('adminModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeAdminModal();
});

function submitAdminLogin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();
  if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
    isAdmin = true;
    closeAdminModal();
    document.getElementById('adminBadge').style.display = 'inline';
    document.getElementById('adminBar').classList.add('visible');
    showToast('Login Admin', 'Berhasil masuk sebagai Admin.', true);
  } else {
    document.getElementById('modalErr').classList.add('show');
    document.getElementById('adminPass').value = '';
    document.getElementById('adminPass').focus();
  }
}

function adminLogout() {
  isAdmin = false;
  document.getElementById('adminBadge').style.display = 'none';
  document.getElementById('adminBar').classList.remove('visible');
  showToast('Logout', 'Kamu telah keluar dari mode Admin.', false);
}

// ===== TOGGLE ORDER =====
function toggleOrderStatus() {
  orderOpen = !orderOpen;
  applyOrderState();
}

function applyOrderState() {
  const formWrap = document.getElementById('orderFormWrap');
  const closedMsg = document.getElementById('orderClosedMsg');
  const toggleBtn = document.getElementById('toggleOrderBtn');
  const pill = document.getElementById('orderStatusPill');
  const pillText = document.getElementById('orderStatusText');
  const navBtn = document.getElementById('navOrderBtn');
  const orderBtns = document.querySelectorAll('.product-order-btn');

  if (orderOpen) {
    formWrap.style.display = '';
    closedMsg.style.display = 'none';
    toggleBtn.textContent = 'Tutup Pemesanan';
    toggleBtn.className = 'toggle-order-btn close-btn';
    pill.className = 'order-status-pill open';
    pillText.textContent = 'Menerima Pesanan';
    navBtn.className = 'nav-order-btn';
    navBtn.textContent = 'Pesan Sekarang';
    orderBtns.forEach(b => { b.disabled = false; b.classList.remove('closed'); });
  } else {
    formWrap.style.display = 'none';
    closedMsg.style.display = 'block';
    toggleBtn.textContent = 'Buka Pemesanan';
    toggleBtn.className = 'toggle-order-btn open-btn';
    pill.className = 'order-status-pill closed';
    pillText.textContent = 'Tidak Menerima Pesanan';
    navBtn.className = 'nav-order-btn closed-state';
    navBtn.textContent = 'Pemesanan Ditutup';
    orderBtns.forEach(b => { b.disabled = true; b.classList.add('closed'); });
  }
}

// ===== SCROLL TO ORDER =====
function scrollToOrder(productName) {
  if (!orderOpen) {
    document.getElementById('pesan').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  document.getElementById('pesan').scrollIntoView({ behavior: 'smooth' });
  if (productName) {
    const sel = document.getElementById('f_produk');
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === productName) {
        sel.selectedIndex = i;
        break;
      }
    }
  }
}

// ===== SUBMIT ORDER =====
async function submitOrder(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Mengirim...';

  const data = {
    nama: document.getElementById('f_nama').value,
    wa: document.getElementById('f_wa').value,
    alamat: document.getElementById('f_alamat').value,
    produk: document.getElementById('f_produk').value,
    qty: document.getElementById('f_qty').value,
    catatan: document.getElementById('f_catatan').value,
    waktu: new Date().toLocaleString('id-ID')
  };

  try {
    // Dengan mode 'no-cors', request pasti tembus dikirim ke Google
    await fetch(GOOGLE_SHEET_WEBHOOK, {
      method: 'POST',
      mode: 'no-cors', 
      // Hapus headers Content-Type sepenuhnya. 
      // Default-nya akan menjadi text/plain, dan script GAS-mu 
      // (JSON.parse(e.postData.contents)) tetap bisa membacanya dengan sempurna.
      body: JSON.stringify(data)
    });

    // PENTING: Karena no-cors membuat response menjadi "opaque" 
    // (browser tidak mengizinkan JS membaca balasan dari Google), 
    // kita tidak perlu menggunakan response.json(). 
    // Selama fetch tidak masuk ke catch (error jaringan putus), kita asumsikan sukses.
    
    showToast('Pesanan Terkirim! 🎉', 'Kami akan segera menghubungi kamu via WhatsApp.', true);
    document.getElementById('orderForm').reset();
  } catch (err) {
    console.error('Submit order error:', err);
    showToast('Terjadi Kesalahan', 'Gagal mengirim pesanan. Cek koneksi internet.', false);
  }

  btn.disabled = false;
  btn.textContent = '✦ Kirim Pesanan';
}

// ===== TOAST =====
function showToast(title, msg, success) {
  const toast = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMsg').textContent = msg;
  toast.style.borderLeftColor = success ? 'var(--accent)' : '#f87171';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== SLIDER =====
const track = document.getElementById('sliderTrack');
const dotsContainer = document.getElementById('sliderDots');
let currentIndex = 0;
let cardsPerView = 3;
let totalCards = 0;
let maxIndex = 0;

function getCardsPerView() {
  if (window.innerWidth <= 640) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function initSlider() {
  totalCards = track.children.length;
  cardsPerView = getCardsPerView();
  maxIndex = Math.max(0, totalCards - cardsPerView);
  currentIndex = Math.min(currentIndex, maxIndex);
  buildDots();
  updateSlider();
}

function buildDots() {
  dotsContainer.innerHTML = '';
  const numDots = maxIndex + 1;
  for (let i = 0; i <= maxIndex; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === currentIndex ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }
}

function updateSlider() {
  const cardWidth = track.children[0] ? track.children[0].offsetWidth + 24 : 0; // 24 = gap
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentIndex);
  });
}

function goTo(i) {
  currentIndex = Math.max(0, Math.min(i, maxIndex));
  updateSlider();
}

document.getElementById('prevBtn').addEventListener('click', () => goTo(currentIndex - 1));
document.getElementById('nextBtn').addEventListener('click', () => goTo(currentIndex + 1));

// Touch swipe
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { diff > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1); }
});

window.addEventListener('resize', () => { initSlider(); });
initSlider();
setInterval(() => { if (currentIndex < maxIndex) goTo(currentIndex + 1); else goTo(0); }, 5000);