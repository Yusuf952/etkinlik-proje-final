const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = 3000;

const usersFile = path.join(__dirname, 'users.json');
const eventsFile = path.join(__dirname, 'events.json');
const cartFile = path.join(__dirname, 'sepetler.json');
const announcementsFile = path.join(__dirname, 'announcements.json');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// === KAYIT ===
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Eksik bilgi." });

  let users = [];
  try {
    users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile)) : [];
  } catch {
    return res.status(500).json({ success: false, message: "Kullanıcı verisi okunamadı." });
  }

  if (users.find(u => u.email === email))
    return res.status(409).json({ success: false, message: "E-posta zaten kayıtlı." });

  const role = email === "admin@gmail.com" ? "admin" : "user";
  const approved = role === "admin";
  const mustChangePassword = role === "user";

  users.push({ email, password, role, approved, mustChangePassword });

  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Kayıt sırasında hata oluştu." });
  }
});

// === GİRİŞ ===
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "E-posta ve şifre zorunludur." });

  try {
    const users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile)) : [];
    const user = users.find(u => u.email === email && u.password === password);
    if (!user)
      return res.status(401).json({ success: false, message: "Geçersiz e-posta veya şifre." });

    if (!user.approved)
      return res.status(403).json({ success: false, message: "Hesabınız henüz onaylanmadı." });

    if (user.mustChangePassword)
      return res.json({ success: true, redirect: "sifre-degistir.html" });

    res.json({ success: true, redirect: user.role === "admin" ? "main.html" : "etkinlikler.html" });
  } catch {
    res.status(500).json({ success: false, message: "Giriş sırasında hata oluştu." });
  }
});

// === KULLANICI BİLGİSİ ===
app.get('/get-user', (req, res) => {
  const email = req.query.email;
  if (!email || !fs.existsSync(usersFile)) return res.json({ success: false });

  try {
    const users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find(u => u.email === email);
    if (!user) return res.json({ success: false });

    res.json({
      success: true,
      role: user.role,
      mustChangePassword: user.mustChangePassword
    });
  } catch {
    res.json({ success: false });
  }
});

// === ŞİFRE DEĞİŞTİR ===
app.post('/change-password', (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword)
    return res.status(400).json({ success: false, message: "Eksik bilgi." });

  try {
    const users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile)) : [];
    const user = users.find(u => u.email === email);
    if (!user)
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

    user.password = newPassword;
    user.mustChangePassword = false;

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.json({ success: true, message: "Şifre başarıyla değiştirildi." });
  } catch {
    res.status(500).json({ success: false, message: "Şifre değiştirilemedi." });
  }
});

// === YÖNETİCİ: KULLANICI ONAYI ===
app.get('/pending-users', (req, res) => {
  try {
    const users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile)) : [];
    const pending = users.filter(u => u.role === "user" && !u.approved);
    res.json(pending);
  } catch {
    res.status(500).json({ success: false, message: "Kullanıcılar alınamadı." });
  }
});

app.post('/approve-user', (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "E-posta gerekli." });

  try {
    const users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile)) : [];
    const user = users.find(u => u.email === email);
    if (!user)
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

    user.approved = true;
    user.mustChangePassword = true;

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.json({ success: true, message: "Kullanıcı onaylandı." });
  } catch {
    res.status(500).json({ success: false, message: "Onay işlemi sırasında hata oluştu." });
  }
});

// === ETKİNLİKLER ===
app.get('/events', (req, res) => {
  try {
    const events = fs.existsSync(eventsFile) ? JSON.parse(fs.readFileSync(eventsFile)) : [];
    const sorted = events.filter(e => e.date).sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(sorted);
  } catch {
    res.status(500).json({ message: "Etkinlikler alınamadı." });
  }
});

app.post('/events', (req, res) => {
  const { name, price, date } = req.body;

  if (!name || name.trim() === "" || isNaN(price) || price < 0 || !date) {
    return res.status(400).json({ success: false, message: "Geçerli ad, fiyat ve tarih giriniz." });
  }

  const kontenjan = 200; // Sabit kontenjan

  try {
    const events = fs.existsSync(eventsFile) ? JSON.parse(fs.readFileSync(eventsFile)) : [];
    events.push({ name, price, date, kontenjan });
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Etkinlik kaydedilemedi." });
  }
});

app.post('/delete-event', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Etkinlik adı gerekli." });

  try {
    let events = fs.existsSync(eventsFile) ? JSON.parse(fs.readFileSync(eventsFile)) : [];
    const filtered = events.filter(event => event.name !== name);
    if (filtered.length === events.length)
      return res.status(404).json({ success: false, message: "Etkinlik bulunamadı." });

    fs.writeFileSync(eventsFile, JSON.stringify(filtered, null, 2));

    let carts = fs.existsSync(cartFile) ? JSON.parse(fs.readFileSync(cartFile)) : [];
    carts = carts.map(cart => ({
      ...cart,
      items: cart.items.filter(item => item.name !== name)
    }));
    fs.writeFileSync(cartFile, JSON.stringify(carts, null, 2));

    res.json({ success: true, message: "Etkinlik ve ilgili sepet verileri silindi." });
  } catch {
    res.status(500).json({ success: false, message: "Etkinlik silinemedi." });
  }
});

// === SEPET ===
app.post('/add-to-cart', (req, res) => {
  const { email, item } = req.body;
  if (!email || !item?.name || item.price === undefined) {
    return res.status(400).json({ success: false, message: "Eksik sepet verisi." });
  }

  try {
    const carts = fs.existsSync(cartFile) ? JSON.parse(fs.readFileSync(cartFile)) : [];
    const events = fs.existsSync(eventsFile) ? JSON.parse(fs.readFileSync(eventsFile)) : [];

    const eventIndex = events.findIndex(e => e.name === item.name);
    if (eventIndex === -1)
      return res.status(404).json({ success: false, message: "Etkinlik bulunamadı." });

    if (events[eventIndex].kontenjan <= 0)
      return res.status(400).json({ success: false, message: "Etkinlikte yer kalmadı." });

    let userCart = carts.find(c => c.email === email);
    if (!userCart) {
      userCart = { email, items: [] };
      carts.push(userCart);
    }

    const alreadyInCart = userCart.items.some(i => i.name === item.name);
    if (alreadyInCart)
      return res.status(400).json({ success: false, message: "Bu etkinlik zaten sepetinizde." });

    events[eventIndex].kontenjan -= 1;
    userCart.items.push(item);

    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
    fs.writeFileSync(cartFile, JSON.stringify(carts, null, 2));

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Sepete eklenemedi." });
  }
});

app.get('/cart', (req, res) => {
  const email = req.query.email;
  if (!email)
    return res.status(400).json({ success: false, message: "E-posta gerekli." });

  try {
    const carts = fs.existsSync(cartFile) ? JSON.parse(fs.readFileSync(cartFile)) : [];
    const userCart = carts.find(c => c.email === email);
    res.json(userCart ? userCart.items : []);
  } catch {
    res.status(500).json({ success: false, message: "Sepet alınamadı." });
  }
});

app.post('/checkout', (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "E-posta gerekli." });

  try {
    let carts = fs.existsSync(cartFile) ? JSON.parse(fs.readFileSync(cartFile)) : [];
    carts = carts.filter(c => c.email !== email);
    fs.writeFileSync(cartFile, JSON.stringify(carts, null, 2));
    res.json({ success: true, message: "Ödeme tamamlandı, sepet temizlendi." });
  } catch (err) {
    console.error("🛑 Ödeme hatası:", err);
    res.status(500).json({ success: false, message: "Ödeme sırasında hata oluştu." });
  }
});

// === DUYURULAR ===
app.get('/announcements', (req, res) => {
  try {
    const announcements = fs.existsSync(announcementsFile)
      ? JSON.parse(fs.readFileSync(announcementsFile))
      : [];
    const sorted = announcements.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  } catch {
    res.status(500).json({ success: false, message: "Duyurular alınamadı." });
  }
});

app.post('/announcements', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: "Başlık ve içerik gerekli." });
  }

  try {
    const announcements = fs.existsSync(announcementsFile)
      ? JSON.parse(fs.readFileSync(announcementsFile))
      : [];

    announcements.push({ title, content, date: new Date().toISOString() });

    fs.writeFileSync(announcementsFile, JSON.stringify(announcements, null, 2));
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Duyuru kaydedilemedi." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
});
