document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".detail-image img").forEach((img) => {
    img.addEventListener("contextmenu", (event) => event.preventDefault());
    img.addEventListener("dragstart", (event) => event.preventDefault());
    img.addEventListener("copy", (event) => event.preventDefault());
  });

  document.querySelectorAll("video").forEach((video) => {
    video.addEventListener("contextmenu", (event) => event.preventDefault());
    video.addEventListener("dragstart", (event) => event.preventDefault());
    video.addEventListener("copy", (event) => event.preventDefault());
  });

  document.querySelectorAll(".landing-image").forEach((frame) => {
    frame.addEventListener("contextmenu", (event) => event.preventDefault());
    frame.addEventListener("dragstart", (event) => event.preventDefault());
    frame.addEventListener("copy", (event) => event.preventDefault());
  });

  const orbitRing = document.getElementById("orbitRing");
  if (!orbitRing) return;

  const gallery = [
    { src: "Bilder%20forside/a1.jpg", page: "bilde-1.html", alt: "A1 bilde i karusellen" },
    { src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80", page: "bilde-2.html", alt: "Solnedgang over kysten" },
    { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80", page: "bilde-3.html", alt: "Nordlig fjordlandskap i rolig lys" },
    { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80", page: "bilde-4.html", alt: "Personer i livlig bymiljø" },
    { src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80", page: "bilde-5.html", alt: "Fjellvei og stille landskap" },
    { src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80", page: "bilde-6.html", alt: "Kvinnelig portrett og naturlig lys" },
    { src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80", page: "bilde-7.html", alt: "Minimalistisk møbel- og interiørbilde" }
  ];

  gallery.forEach(({ src, page, alt }, index) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "orbit-tile";
    tile.style.setProperty("--angle", `${(360 / gallery.length) * index}deg`);
    tile.setAttribute("aria-label", `Gå til ${page}`);

    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.loading = "eager";

    tile.appendChild(img);
    tile.addEventListener("click", () => {
      window.location.href = page;
    });

    orbitRing.appendChild(tile);
  });
});
