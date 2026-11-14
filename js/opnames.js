// ---------- echte stemmen ----------
// Losse woorden worden zo veel mogelijk uitgesproken door echte mensen (opnames van
// Wikimedia Commons). Lukt dat niet, dan praat de computerstem van het apparaat.

const sleutel = (w) => String(w).trim().toLowerCase().replace(/[.!?,:;]+$/, "");

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

function stopGeluid() { try { speler.pause(); } catch (e) { /* niks */ } }

// ---------- echte stemmen van Wikimedia Commons ----------
// Op Wikimedia Commons staan gratis opnames van echte mensen die Nederlandse woorden
// uitspreken (Lingua Libre en WikiWoordenboek, licentie CC BY-SA). De app zoekt die
// op het moment zelf op en kiest steeds een willekeurige spreker.
const COMMONS = "https://commons.wikimedia.org/w/api.php";
const echteStemmen = new Map(); // woord -> Promise<[{url, wie}]>
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function zoekEchteStem(w) {
  const k = sleutel(w);
  if (!/^[a-zà-ÿ'-]+$/i.test(k)) return Promise.resolve([]); // alleen losse woorden
  if (echteStemmen.has(k)) return echteStemmen.get(k);
  const p = (async () => {
    try {
      const basis = { action: "query", format: "json", origin: "*", prop: "videoinfo", viprop: "url|derivatives" };
      const zoek = new URLSearchParams({ ...basis, generator: "search", gsrnamespace: "6", gsrlimit: "50",
        gsrsearch: `intitle:"(nld)" intitle:"${k}" filetype:audio` });
      const vast = new URLSearchParams({ ...basis, titles: `File:Nl-${k}.ogg|File:Nl-${k}.wav|File:Nl-${k}.oga` });
      const antwoorden = await Promise.all([zoek, vast].map((q) =>
        fetch(`${COMMONS}?${q}`).then((r) => r.json()).catch(() => ({}))));
      const paginas = antwoorden.flatMap((d) => Object.values((d.query && d.query.pages) || {}));
      const ll = new RegExp(`^File:LL-Q7411 \\(nld\\)-(.+)-${esc(k)}\\.(wav|ogg|mp3)$`, "i");
      const wwb = new RegExp(`^File:Nl-${esc(k)}(-\\d+)?\\.(ogg|oga|wav|mp3)$`, "i");
      const lijst = [];
      for (const pg of paginas) {
        const info = pg.videoinfo && pg.videoinfo[0];
        if (!info) continue;
        const m = pg.title.match(ll);
        if (!m && !wwb.test(pg.title)) continue;
        // iPhones spelen geen ogg: neem dan de mp3-versie die Commons zelf maakt.
        let url = info.url;
        if (!/\.(wav|mp3)$/i.test(url)) {
          const mp3 = (info.derivatives || []).find((d) => /mpeg|mp3/i.test(d.type || "") || /\.mp3$/i.test(d.src || ""));
          if (!mp3) continue;
          url = mp3.src;
        }
        lijst.push({ url, wie: m ? m[1] : "WikiWoordenboek" });
      }
      return lijst;
    } catch (e) {
      return [];
    }
  })();
  echteStemmen.set(k, p);
  return p;
}

// Speel een echte stem af. Geeft false als er geen is of afspelen niet lukt.
async function speelEchteStem(w) {
  const lijst = await zoekEchteStem(w);
  if (!lijst.length) return false;
  const keuze = lijst[Math.floor(Math.random() * lijst.length)];
  return new Promise((klaar) => {
    let gedaan = false;
    const af = (gelukt) => { if (!gedaan) { gedaan = true; klaar(gelukt); } };
    speler.onended = () => af(true);
    speler.onerror = () => af(false);
    speler.src = keuze.url;
    const p = speler.play();
    if (p) p.catch(() => af(false));
    setTimeout(() => af(true), 8000);
  });
}
// Standaard uit: dan hoor je de stem die je gekozen hebt (meisje of jongen).
const echteStemAan = () => localStorage.getItem("echteStem") === "aan";
