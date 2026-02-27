// Sistemi başlatma ve müzik
function startSystem() {
  const music = document.getElementById("bgMusic");
  if (music) {
    music
      .play()
      .then(() => {
        document.body.classList.add("system-active");
      })
      .catch(() => {
        // Autoplay engellenirse sadece görsel efektleri aktif et
        document.body.classList.add("system-active");
      });
  } else {
    document.body.classList.add("system-active");
  }
}

// Kartlardaki sosyal linkleri aç/kapat
function toggleSocial(card) {
  card.classList.toggle("active");
}

// İlk kullanıcı etkileşiminde arka plan müziğini dene
window.addEventListener(
  "click",
  () => {
    const music = document.getElementById("bgMusic");
    if (music && music.paused) {
      music
        .play()
        .then(() => {
          document.body.classList.add("system-active");
        })
        .catch(() => {
          // sessizce geç
        });
    }
  },
  { once: true }
);