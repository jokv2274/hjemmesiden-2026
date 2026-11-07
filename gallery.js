// Delt oppførsel for alle kategori-sider under /bilder/*:
// - Filter-chips som skjuler/viser bilder uten page reload (data-tags / data-filter)
// - Lightbox med forrige/neste-piler, tastatur og swipe (touch), uten å laste ny side
(function () {
  const grid = document.querySelector(".gallery-grid");
  if (!grid) return;

  const galleryItems = () => Array.from(grid.querySelectorAll(".gallery-item"));

  // ----- Filter-chips -----
  const chipsBar = document.querySelector(".filter-chips");

  function applyFilter(filter) {
    galleryItems().forEach((item) => {
      const tags = (item.dataset.tags || "").split(/\s+/).filter(Boolean);
      const show = !filter || filter === "alle" || tags.includes(filter);
      item.hidden = !show;
    });
  }

  if (chipsBar) {
    chipsBar.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      chipsBar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      applyFilter(chip.dataset.filter);
    });
  }

  // ----- Lightbox -----
  const lightbox = document.querySelector(".lightbox-overlay");
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector("img");
  const content = lightbox.querySelector(".lightbox-content");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");
  let currentIndex = -1;

  function visibleItems() {
    return galleryItems().filter((item) => !item.hidden);
  }

  function openAt(index) {
    const list = visibleItems();
    if (!list.length) return;
    currentIndex = (index + list.length) % list.length;
    const img = list[currentIndex].querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add("active");
    document.documentElement.classList.add("lightbox-open");
    document.body.classList.add("lightbox-open");
  }

  function openForItem(item) {
    const list = visibleItems();
    const index = list.indexOf(item);
    openAt(index === -1 ? 0 : index);
  }

  function close() {
    lightbox.classList.remove("active");
    document.documentElement.classList.remove("lightbox-open");
    document.body.classList.remove("lightbox-open");
  }

  function step(delta) {
    if (currentIndex === -1) return;
    openAt(currentIndex + delta);
  }

  grid.addEventListener("click", (e) => {
    const link = e.target.closest(".gallery-item a");
    if (!link) return;
    e.preventDefault();
    openForItem(link.closest(".gallery-item"));
  });

  grid.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".gallery-item")) e.preventDefault();
  });
  grid.addEventListener("dragstart", (e) => {
    if (e.target.closest(".gallery-item")) e.preventDefault();
  });
  document.addEventListener("copy", (e) => e.preventDefault());

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
  if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); step(1); });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  // Swipe (touch) i lightbox - venstre/høyre bytter bilde, tap lukker
  let touchStartX = 0;
  let touchStartY = 0;
  let didSwipe = false;

  content.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    didSwipe = false;
  }, { passive: true });

  content.addEventListener("touchmove", (e) => {
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) didSwipe = true;
  }, { passive: true });

  content.addEventListener("touchend", (e) => {
    if (!didSwipe) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  });

  content.addEventListener("click", (e) => {
    if (didSwipe) {
      didSwipe = false;
      return;
    }
    if (e.target.closest(".lightbox-nav") || e.target.closest(".lightbox-close")) return;
    close();
  });
})();
