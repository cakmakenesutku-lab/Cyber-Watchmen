function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function setAriaExpanded(el, expanded) {
  if (!el) return;
  el.setAttribute("aria-expanded", expanded ? "true" : "false");
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function initNav() {
  const toggle = qs('[data-js="nav-toggle"]');
  const menu = qs('[data-js="nav-menu"]');
  if (!toggle || !menu) return;

  const open = () => {
    document.body.classList.add("nav-open");
    setAriaExpanded(toggle, true);
  };

  const close = () => {
    document.body.classList.remove("nav-open");
    setAriaExpanded(toggle, false);
  };

  toggle.addEventListener("click", () => {
    const isOpen = document.body.classList.contains("nav-open");
    if (isOpen) close();
    else open();
  });

  // Close when clicking a link (mobile)
  qsa("a", menu).forEach((a) => a.addEventListener("click", close));

  // Close on outside click / ESC
  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("nav-open")) return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (menu.contains(target) || toggle.contains(target)) return;
    close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function initAudio() {
  const music = qs("#bgMusic");
  const audioToggle = qs('[data-js="audio-toggle"]');
  if (!music || !audioToggle) return;

  const storageKey = "cw_audio";
  const getPref = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };
  const setPref = (val) => {
    try {
      localStorage.setItem(storageKey, val);
    } catch {
      // ignore
    }
  };

  const updateUi = () => {
    const isOn = !music.paused;
    audioToggle.dataset.state = isOn ? "on" : "off";
    audioToggle.setAttribute("aria-pressed", isOn ? "true" : "false");
    audioToggle.querySelector('[data-js="audio-label"]').textContent = isOn
      ? "Ses: Açık"
      : "Ses: Kapalı";
  };

  const tryPlay = async () => {
    try {
      await music.play();
      document.body.classList.add("system-active");
      setPref("on");
    } catch {
      // autoplay restrictions - keep UI consistent
    } finally {
      updateUi();
    }
  };

  const pause = () => {
    music.pause();
    setPref("off");
    updateUi();
  };

  audioToggle.addEventListener("click", async () => {
    if (music.paused) await tryPlay();
    else pause();
  });

  // initial state
  if (prefersReducedMotion()) {
    // avoid auto motion cues when user requests reduced motion
    pause();
    return;
  }

  const pref = getPref();
  if (pref === "on") {
    // attempt on load; if blocked, user can enable manually
    tryPlay();
  } else {
    updateUi();
  }
}

function initSystemButton() {
  const btn = qs('[data-js="start-system"]');
  if (!btn) return;
  btn.addEventListener("click", async () => {
    document.body.classList.add("system-active");
    const music = qs("#bgMusic");
    if (music && music.paused && !prefersReducedMotion()) {
      try {
        await music.play();
        try {
          localStorage.setItem("cw_audio", "on");
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
      const audioToggle = qs('[data-js="audio-toggle"]');
      if (audioToggle) {
        audioToggle.dataset.state = music && !music.paused ? "on" : "off";
        audioToggle.setAttribute(
          "aria-pressed",
          music && !music.paused ? "true" : "false"
        );
        const label = qs('[data-js="audio-label"]', audioToggle);
        if (label) label.textContent = music && !music.paused ? "Ses: Açık" : "Ses: Kapalı";
      }
    }
  });
}

function initTeamCards() {
  qsa('[data-js="member"]').forEach((card) => {
    const toggle = () => card.classList.toggle("active");
    card.addEventListener("click", (e) => {
      // Don't toggle when clicking a link inside the card
      const target = e.target;
      if (target instanceof Element && target.closest("a")) return;
      toggle();
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initAudio();
  initSystemButton();
  initTeamCards();

  // If motion is reduced, keep "system-active" purely visual (no animations/video handled by CSS)
  if (prefersReducedMotion()) {
    document.body.classList.remove("system-active");
  }
});