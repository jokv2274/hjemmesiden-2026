import { auth, db, storage } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const loginSection = document.getElementById("login-section");
const uploadSection = document.getElementById("upload-section");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const uploadForm = document.getElementById("upload-form");
const categorySelect = document.getElementById("category-select");
const fileInput = document.getElementById("file-input");
const uploadStatus = document.getElementById("upload-status");
const imageList = document.getElementById("image-list");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.hidden = true;
    uploadSection.hidden = false;
    loadImages(categorySelect.value);
  } else {
    loginSection.hidden = false;
    uploadSection.hidden = true;
  }
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  loginError.textContent = "";
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password).catch(() => {
    loginError.textContent = "Feil e-post eller passord.";
  });
});

logoutBtn.addEventListener("click", () => signOut(auth));

categorySelect.addEventListener("change", () => loadImages(categorySelect.value));

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return;

  const category = categorySelect.value;
  uploadStatus.textContent = "Laster opp…";

  try {
    const path = `gallery/${category}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    await addDoc(collection(db, "images"), {
      category,
      url,
      path,
      createdAt: serverTimestamp(),
    });

    uploadStatus.textContent = "Bildet er lastet opp!";
    uploadForm.reset();
    loadImages(category);
  } catch (err) {
    uploadStatus.textContent = "Noe gikk galt: " + err.message;
  }
});

async function loadImages(category) {
  imageList.innerHTML = "";

  const q = query(
    collection(db, "images"),
    where("category", "==", category)
  );
  const snapshot = await getDocs(q);

  const images = snapshot.docs
    .map((docSnap) => ({ id: docSnap.id, data: docSnap.data() }))
    .sort((a, b) => (b.data.createdAt?.seconds || 0) - (a.data.createdAt?.seconds || 0));

  images.forEach(({ id, data }) => {
    const item = document.createElement("div");
    item.className = "admin-image-item";
    item.innerHTML = `
      <img src="${data.url}" alt="" />
      <button class="admin-delete-btn" data-id="${id}" data-path="${data.path}">Slett</button>
    `;
    imageList.appendChild(item);
  });


  imageList.querySelectorAll(".admin-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Slette dette bildet?")) return;
      const { id, path } = btn.dataset;
      await storage.ref().child(path).delete();
      await db.collection("images").doc(id).delete();
      loadImages(categorySelect.value);
    });
  });
}
