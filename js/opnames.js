// ---------- zelf ingesproken woorden ----------
// Een kind, ouder of juf spreekt de woorden zelf in. De opnames worden op dit apparaat
// bewaard (IndexedDB). Als er van een woord een opname is, speelt de app die af in
// plaats van de computerstem.

const OPNAME_DB = "spelpret-opnames";
const opnameUrls = new Map(); // woord (kleine letters) -> object-URL van de opname
const sleutel = (w) => String(w).trim().toLowerCase().replace(/[.!?,:;]+$/, "");

function openDb() {
  return new Promise((ok, fout) => {
    const r = indexedDB.open(OPNAME_DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("woorden");
    r.onsuccess = () => ok(r.result);
    r.onerror = () => fout(r.error);
  });
}
async function dbDoe(modus, fn) {
  const db = await openDb();
  return new Promise((ok, fout) => {
    const tx = db.transaction("woorden", modus);
    const req = fn(tx.objectStore("woorden"));
    tx.oncomplete = () => ok(req && req.result);
    tx.onerror = () => fout(tx.error);
  });
}

// Bij het opstarten alle opnames inladen.
const opnamesGeladen = (async () => {
  if (!("indexedDB" in window)) return;
  try {
    const db = await openDb();
    await new Promise((ok) => {
      const tx = db.transaction("woorden", "readonly");
      const req = tx.objectStore("woorden").openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c) return ok();
        opnameUrls.set(c.key, URL.createObjectURL(c.value));
        c.continue();
      };
      req.onerror = () => ok();
    });
  } catch (e) { /* geen opslag: dan gewoon de computerstem */ }
})();

const heeftOpname = (w) => opnameUrls.has(sleutel(w));

async function bewaarOpname(w, blob) {
  const k = sleutel(w);
  await dbDoe("readwrite", (s) => s.put(blob, k));
  if (opnameUrls.has(k)) URL.revokeObjectURL(opnameUrls.get(k));
  opnameUrls.set(k, URL.createObjectURL(blob));
}
async function wisOpname(w) {
  const k = sleutel(w);
  await dbDoe("readwrite", (s) => s.delete(k));
  if (opnameUrls.has(k)) URL.revokeObjectURL(opnameUrls.get(k));
  opnameUrls.delete(k);
}

// Eén speler voor alles. Op een iPhone mag geluid pas spelen na een tik; daarom
// "ontgrendelen" we de speler bij de eerste tik op het scherm met een stil geluidje.
const speler = new Audio();
speler.preload = "auto";
const STIL = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
document.addEventListener("pointerdown", function ontgrendel() {
  document.removeEventListener("pointerdown", ontgrendel);
  if (speler.src) return;
  speler.src = STIL;
  speler.play().catch(() => {});
}, { once: true });

// Speel de opname van een woord. Geeft false als er geen opname is of afspelen niet lukt.
function speelOpname(w) {
  const url = opnameUrls.get(sleutel(w));
  if (!url) return Promise.resolve(false);
  return new Promise((klaar) => {
    let gedaan = false;
    const af = (gelukt) => { if (!gedaan) { gedaan = true; klaar(gelukt); } };
    speler.onended = () => af(true);
    speler.onerror = () => af(false);
    speler.src = url;
    const p = speler.play();
    if (p) p.catch(() => af(false));
    setTimeout(() => af(true), 8000); // vangnet
  });
}
function stopOpname() { try { speler.pause(); } catch (e) { /* niks */ } }

// ---------- het inspreek-scherm ----------
let recorder = null;

function alleWoorden() {
  const lijst = [];
  for (const c of CATEGORIEEN) {
    const ws = [...new Set((c.woorden || []).map((x) => (typeof x === "string" ? x : x.w)))];
    lijst.push({ cat: c, woorden: ws });
  }
  return lijst;
}

async function opnameScherm() {
  await opnamesGeladen;
  zegEekhoorn("Tik op 🎙️ en zeg het woord. Tik nog een keer om te stoppen.");
  const kanOpnemen = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  const groepen = alleWoorden();
  const totaal = groepen.reduce((n, g) => n + g.woorden.length, 0);
  const klaar = groepen.reduce((n, g) => n + g.woorden.filter(heeftOpname).length, 0);
  scherm.innerHTML = `
    <div class="kaart opnamekaart">
      <a class="terug" href="#stem">⬅ Terug</a>
      <h2>🎙️ Woorden zelf inspreken</h2>
      <p>Spreek elk woord duidelijk in. Daarna hoor je bij het dictee jouw stem.
        De opnames blijven op dit apparaat. <b><span id="aantal">${klaar}</span> van de ${totaal}</b> woorden zijn ingesproken.</p>
      ${kanOpnemen ? "" : `<p class="tip">Opnemen lukt niet in deze browser. Open de app in Safari of Chrome.</p>`}
      ${groepen.map((g) => `
        <h3 style="color:${g.cat.kleur}">${g.cat.figuur} ${g.cat.nr}. ${g.cat.naam}</h3>
        <ul class="opnamelijst">
          ${g.woorden.map((w) => `
            <li data-w="${w}" class="${heeftOpname(w) ? "heeft" : ""}">
              <span class="ow">${w}</span>
              <button class="rond neem" aria-label="Opnemen">🎙️</button>
              <button class="rond speel" aria-label="Luisteren" ${heeftOpname(w) ? "" : "disabled"}>▶️</button>
              <button class="rond wis" aria-label="Weggooien" ${heeftOpname(w) ? "" : "disabled"}>🗑️</button>
            </li>`).join("")}
        </ul>`).join("")}
    </div>`;

  scherm.querySelectorAll(".opnamelijst li").forEach((li) => {
    const w = li.dataset.w;
    const neem = li.querySelector(".neem"), speel = li.querySelector(".speel"), wis = li.querySelector(".wis");
    const ververs = () => {
      // hetzelfde woord kan in meer categorieën staan: alle regels bijwerken
      scherm.querySelectorAll(".opnamelijst li").forEach((r) => {
        if (r.dataset.w !== w) return;
        r.classList.toggle("heeft", heeftOpname(w));
        r.querySelector(".speel").disabled = r.querySelector(".wis").disabled = !heeftOpname(w);
      });
      const n = groepen.reduce((t, g) => t + g.woorden.filter(heeftOpname).length, 0);
      scherm.querySelector("#aantal").textContent = n;
    };
    speel.onclick = () => speelOpname(w);
    wis.onclick = async () => { await wisOpname(w); ververs(); };
    neem.onclick = async () => {
      if (!kanOpnemen) return;
      if (recorder && recorder.state === "recording") {
        recorder.stop();
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const stukjes = [];
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => { if (e.data && e.data.size) stukjes.push(e.data); };
        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          neem.classList.remove("bezig"); neem.textContent = "🎙️";
          scherm.querySelectorAll(".neem").forEach((b) => (b.disabled = false));
          if (!stukjes.length) return;
          await bewaarOpname(w, new Blob(stukjes, { type: recorder.mimeType || "audio/mp4" }));
          ververs();
          speelOpname(w);
        };
        recorder.start();
        neem.classList.add("bezig"); neem.textContent = "⏹️";
        scherm.querySelectorAll(".neem").forEach((b) => { if (b !== neem) b.disabled = true; });
      } catch (e) {
        zegEekhoorn("De microfoon mag niet aan. Kijk bij de instellingen van je browser.");
      }
    };
  });
}
