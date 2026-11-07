// Henter opplastede bilder for én kategori fra Firestore og legger dem inn i galleriet.
// Sett window.GALLERY_CATEGORY i siden før dette skriptet lastes.
import { db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// GALLERY_CATEGORY kan være en enkelt kategori ("ferie") eller, for sammenslåtte
// sider som "Dyr & Natur", en liste med gamle + nye kategori-nøkler som skal vises
// samme sted, f.eks. ["dyr-natur", "dyr", "natur"].
const category = window.GALLERY_CATEGORY;
const categories = Array.isArray(category) ? category : category ? [category] : [];

async function loadGalleryImages() {
  if (!categories.length) return;

  const grid = document.querySelector(".gallery-grid");
  if (!grid) return;

  try {
    // Firestore "in" støtter maks 10 verdier, som er mer enn nok for våre kategorier.
    const q = query(
      collection(db, "images"),
      where("category", "in", categories)
    );
    const snapshot = await getDocs(q);

    const images = snapshot.docs
      .map((docSnap) => docSnap.data())
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    const localNames = new Set(
      Array.from(grid.querySelectorAll("img"), (img) => {
        const path = decodeURIComponent(img.src).split("/").pop();
        return path ? path.split("?")[0].toLowerCase() : "";
      })
    );

    images.forEach((data) => {
      if ((data.path || "").endsWith("077A6824.jpg")) return;

      const uploadedName = decodeURIComponent(data.path || data.url || "")
        .split("/")
        .pop()
        .split("?")[0]
        .toLowerCase();
      if (localNames.has(uploadedName)) return;

      const item = document.createElement("div");
      item.className = "gallery-item";
      item.innerHTML = `
        <a href="${data.url}">
          <img src="${data.url}" alt="" loading="lazy" />
        </a>
      `;
      grid.appendChild(item);
    });
  } catch (err) {
    console.error("Kunne ikke laste opplastede bilder:", err);
  }
}

loadGalleryImages();
