// ✅ KAYIT FORMU
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (!email || !password || !confirm) {
      return alert("Lütfen tüm alanları doldurunuz.");
    }

    if (password !== confirm) {
      return alert("Şifreler uyuşmuyor.");
    }

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (result.success) {
        alert("Kayıt başarılı!");
        window.location.href = "index.html";
      } else {
        alert(result.message || "Bir hata oluştu.");
      }
    } catch (err) {
      alert("Sunucuya bağlanılamadı.");
    }
  });
}

// ✅ GİRİŞ FORMU
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      return alert("Lütfen e-posta ve şifre giriniz.");
    }

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (result.success) {
        localStorage.setItem("userEmail", email); // ✅ Email'i tarayıcıya kaydet
        alert("Giriş başarılı!");
        window.location.href = result.redirect; // ✅ Sunucunun yönlendirdiği sayfaya git
      } else {
        alert(result.message || "Hatalı e-posta veya şifre.");
      }
    } catch (err) {
      alert("Sunucuya bağlanılamadı.");
    }
  });
}
