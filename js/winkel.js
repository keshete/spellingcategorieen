// ---------- 🛍️ het winkeltje: je eigen avatar ----------
// Met je eikels koop je dieren en spulletjes voor je avatar. Je kunt ook een foto
// maken (bijvoorbeeld van je eigen kat): die foto blijft alleen op dit apparaat.

const WINKEL_SOORTEN = [
  { id: "dier", emoji: "🐾", naam: "Dieren" },
  { id: "hoofd", emoji: "🎩", naam: "Op je hoofd" },
  { id: "ogen", emoji: "🕶️", naam: "Brillen" },
  { id: "hand", emoji: "🎈", naam: "Vasthouden" },
  { id: "achtergrond", emoji: "🌈", naam: "Achtergrond" },
  { id: "foto", emoji: "📷", naam: "Eigen foto" },
];

const WINKEL = [
  // dieren (de eerste drie heb je meteen)
  { id: "kat", soort: "dier", emoji: "🐱", naam: "kat", prijs: 0 },
  { id: "hond", soort: "dier", emoji: "🐶", naam: "hond", prijs: 0 },
  { id: "konijn", soort: "dier", emoji: "🐰", naam: "konijn", prijs: 0 },
  { id: "eekhoorn", soort: "dier", emoji: "🐿️", naam: "eekhoorn", prijs: 5 },
  { id: "beer", soort: "dier", emoji: "🐻", naam: "beer", prijs: 5 },
  { id: "panda", soort: "dier", emoji: "🐼", naam: "panda", prijs: 5 },
  { id: "vos", soort: "dier", emoji: "🦊", naam: "vos", prijs: 5 },
  { id: "kikker", soort: "dier", emoji: "🐸", naam: "kikker", prijs: 5 },
  { id: "aap", soort: "dier", emoji: "🐵", naam: "aap", prijs: 5 },
  { id: "varken", soort: "dier", emoji: "🐷", naam: "varken", prijs: 5 },
  { id: "koe", soort: "dier", emoji: "🐮", naam: "koe", prijs: 5 },
  { id: "muis", soort: "dier", emoji: "🐭", naam: "muis", prijs: 5 },
  { id: "tijger", soort: "dier", emoji: "🐯", naam: "tijger", prijs: 10 },
  { id: "leeuw", soort: "dier", emoji: "🦁", naam: "leeuw", prijs: 10 },
  { id: "koala", soort: "dier", emoji: "🐨", naam: "koala", prijs: 10 },
  { id: "pinguin", soort: "dier", emoji: "🐧", naam: "pinguïn", prijs: 10 },
  { id: "uil", soort: "dier", emoji: "🦉", naam: "uil", prijs: 10 },
  { id: "paard", soort: "dier", emoji: "🐴", naam: "paard", prijs: 10 },
  { id: "olifant", soort: "dier", emoji: "🐘", naam: "olifant", prijs: 15 },
  { id: "giraf", soort: "dier", emoji: "🦒", naam: "giraf", prijs: 15 },
  { id: "zebra", soort: "dier", emoji: "🦓", naam: "zebra", prijs: 15 },
  { id: "dolfijn", soort: "dier", emoji: "🐬", naam: "dolfijn", prijs: 15 },
  { id: "eenhoorn", soort: "dier", emoji: "🦄", naam: "eenhoorn", prijs: 40 },
  { id: "draak", soort: "dier", emoji: "🐲", naam: "draak", prijs: 60 },
  // op je hoofd
  { id: "strik", soort: "hoofd", emoji: "🎀", naam: "strik", prijs: 5 },
  { id: "bloem", soort: "hoofd", emoji: "🌸", naam: "bloem", prijs: 5 },
  { id: "pet", soort: "hoofd", emoji: "🧢", naam: "pet", prijs: 10 },
  { id: "hoed", soort: "hoofd", emoji: "🎩", naam: "hoge hoed", prijs: 20 },
  { id: "kroon", soort: "hoofd", emoji: "👑", naam: "kroon", prijs: 40 },
  // brillen
  { id: "bril", soort: "ogen", emoji: "👓", naam: "bril", prijs: 10 },
  { id: "duikbril", soort: "ogen", emoji: "🥽", naam: "duikbril", prijs: 15 },
  { id: "zonnebril", soort: "ogen", emoji: "🕶️", naam: "zonnebril", prijs: 20 },
  // vasthouden
  { id: "ballon", soort: "hand", emoji: "🎈", naam: "ballon", prijs: 5 },
  { id: "ijsje", soort: "hand", emoji: "🍦", naam: "ijsje", prijs: 5 },
  { id: "bal", soort: "hand", emoji: "⚽", naam: "bal", prijs: 10 },
  { id: "knuffel", soort: "hand", emoji: "🧸", naam: "knuffel", prijs: 15 },
  { id: "gitaar", soort: "hand", emoji: "🎸", naam: "gitaar", prijs: 20 },
  { id: "toverstaf", soort: "hand", emoji: "🪄", naam: "toverstaf", prijs: 30 },
  // achtergrond
  { id: "zon", soort: "achtergrond", emoji: "🌞", naam: "zon", prijs: 5, kleur: "radial-gradient(circle, #fff59d, #ffb300)" },
  { id: "zee", soort: "achtergrond", emoji: "🌊", naam: "zee", prijs: 10, kleur: "linear-gradient(#81d4fa, #0277bd)" },
  { id: "bos", soort: "achtergrond", emoji: "🌲", naam: "bos", prijs: 10, kleur: "linear-gradient(#c5e1a5, #2e7d32)" },
  { id: "snoep", soort: "achtergrond", emoji: "🍭", naam: "snoep", prijs: 15, kleur: "linear-gradient(135deg, #f8bbd0, #ce93d8)" },
  { id: "regenboog", soort: "achtergrond", emoji: "🌈", naam: "regenboog", prijs: 25, kleur: "linear-gradient(#ef5350, #ffa726, #ffee58, #66bb6a, #42a5f5, #ab47bc)" },
  { id: "ruimte", soort: "achtergrond", emoji: "🚀", naam: "ruimte", prijs: 40, kleur: "radial-gradient(circle at 30% 30%, #5c6bc0, #1a1446 70%)" },
];
const winkelDing = (id) => WINKEL.find((d) => d.id === id);

// Wat je hebt en wat je aan hebt: { dier, aan: { hoofd, ogen, hand, achtergrond }, gekocht: [...] }
function mijnAvatar() {
  const a = JSON.parse(localStorage.getItem("avatar") || "{}");
  return { dier: a.dier || "kat", aan: a.aan || {}, gekocht: a.gekocht || [] };
}
const bewaarAvatar = (a) => localStorage.setItem("avatar", JSON.stringify(a));
const mijnFoto = () => localStorage.getItem("avatarFoto");
const isVanMij = (d, a = mijnAvatar()) => d.prijs === 0 || a.gekocht.includes(d.id);

// De avatar tekenen. `pas` is iets dat je even past in de winkel (nog niet gekocht).
function avatarHtml(klas = "", pas = null) {
  const a = mijnAvatar();
  const aan = { ...a.aan };
  let dier = a.dier;
  if (pas) { if (pas.soort === "dier" || pas.id === "foto") dier = pas.id; else aan[pas.soort] = pas.id; }
  const foto = dier === "foto" && mijnFoto();
  const d = winkelDing(dier) || winkelDing("kat");
  const ding = (soort) => { const x = winkelDing(aan[soort]); return x ? `<span class="av-${soort}">${x.emoji}</span>` : ""; };
  const achter = winkelDing(aan.achtergrond);
  return `<span class="avatar ${klas}" ${achter ? `style="background:${achter.kleur}"` : ""}>
      ${foto ? `<img class="av-foto" src="${foto}" alt="">` : `<span class="av-dier">${d.emoji}</span>`}
      ${ding("hoofd")}${ding("ogen")}${ding("hand")}
    </span>`;
}

// Een rond knopje met je avatar rechtsboven, naast de eikels.
let avatarKnop = null;
document.addEventListener("DOMContentLoaded", () => {
  const balk = document.querySelector(".beloning-balk");
  if (!balk) return;
  avatarKnop = el(`<a class="avatar-knop" href="#winkel" aria-label="Mijn avatar en het winkeltje"></a>`);
  balk.prepend(avatarKnop);
  toonAvatarKnop();
});
function toonAvatarKnop() { if (avatarKnop) avatarKnop.innerHTML = avatarHtml("klein"); }

let winkelTab = "dier";
let winkelPas = null; // het ding dat je nu past

function winkel() {
  winkelPas = null;
  const a = mijnAvatar();
  const d = a.dier === "foto" ? null : winkelDing(a.dier);
  zegEekhoorn(`Welkom in het winkeltje! Tik op iets om het te passen. Je hebt ${portemonnee()} eikels.`);
  zeg(`Welkom in het winkeltje! Tik op iets om het te passen.`);
  tekenWinkel(d ? `Dit ben jij: een ${d.naam}!` : "Dit ben jij!");
}

function tekenWinkel(bericht = "") {
  const a = mijnAvatar();
  const geld = portemonnee();
  const pas = winkelPas;
  let actie = `<p class="winkel-bericht">${bericht || "Tik op iets om het te passen!"}</p>`;
  if (pas && !isVanMij(pas, a)) {
    actie = geld >= pas.prijs
      ? `<p class="winkel-bericht">${pas.emoji} Een ${pas.naam}! Wil je die kopen?</p>
         <button class="grote-knop koop-knop" id="koop">Kopen voor 🌰 ${pas.prijs}</button>
         <button class="grote-knop grijs" id="niet">Nee, toch niet</button>`
      : `<p class="winkel-bericht">${pas.emoji} Een ${pas.naam} kost 🌰 ${pas.prijs}.
         Nog ${pas.prijs - geld} eikels sparen! Speel een spelletje en kies eikels.</p>
         <button class="grote-knop grijs" id="niet">Oké</button>`;
  }
  const lijst = winkelTab === "foto" ? fotoVak() : WINKEL.filter((d) => d.soort === winkelTab).map((d) => {
    const van = isVanMij(d, a);
    const aan = a.dier === d.id || a.aan[d.soort] === d.id;
    return `<button class="winkel-ding ${aan ? "aan" : ""} ${pas === d ? "pas" : ""} ${van ? "" : "te-koop"}" data-id="${d.id}">
        <span class="ding-emoji" ${d.kleur ? `style="background:${d.kleur}"` : ""}>${d.emoji}</span>
        <span class="ding-naam">${d.naam}</span>
        <span class="ding-prijs">${aan ? "✅ aan" : van ? "van jou" : `🌰 ${d.prijs}`}</span>
      </button>`;
  }).join("");

  scherm.innerHTML = `
    <div class="kaart winkel">
      <h2>🛍️ Het winkeltje</h2>
      <div class="winkel-top">
        ${avatarHtml("groot", pas && pas.id !== "foto" ? pas : null)}
        <div class="winkel-actie">
          <div class="portemonnee">🌰 ${geld}</div>
          ${actie}
        </div>
      </div>
      <div class="winkel-tabs">${WINKEL_SOORTEN.map((t) => `
        <button class="winkel-tab ${t.id === winkelTab ? "gekozen" : ""}" data-tab="${t.id}"><span>${t.emoji}</span>${t.naam}</button>`).join("")}
      </div>
      <div class="winkel-rek">${lijst}</div>
      <a class="grote-knop" href="#">Klaar</a>
    </div>`;

  scherm.querySelectorAll(".winkel-tab").forEach((b) => b.onclick = () => {
    winkelTab = b.dataset.tab; winkelPas = null; tekenWinkel();
  });
  scherm.querySelectorAll(".winkel-ding").forEach((b) => b.onclick = () => tikDing(winkelDing(b.dataset.id)));
  const koop = scherm.querySelector("#koop");
  if (koop) koop.onclick = () => koopDing(pas);
  const niet = scherm.querySelector("#niet");
  if (niet) niet.onclick = () => { winkelPas = null; tekenWinkel(); };
  if (winkelTab === "foto") koppelFoto();
}

function tikDing(d) {
  const a = mijnAvatar();
  if (!isVanMij(d, a)) {
    winkelPas = d;
    geluid("eikel");
    tekenWinkel();
    zeg(`Een ${d.naam}! Die kost ${d.prijs} eikels.`);
    return;
  }
  winkelPas = null;
  let tekst;
  if (d.soort === "dier") {
    a.dier = d.id;
    tekst = `Je bent nu een ${d.naam}!`;
  } else if (a.aan[d.soort] === d.id) {
    delete a.aan[d.soort]; // nog een keer tikken = weer af
    tekst = d.soort === "achtergrond" ? `Je ${d.naam} is weg.` : `Je ${d.naam} is af.`;
  } else {
    a.aan[d.soort] = d.id;
    tekst = d.soort === "achtergrond" ? `Mooi, een ${d.naam}!` : `Je hebt nu een ${d.naam}!`;
  }
  bewaarAvatar(a); toonAvatarKnop(); geluid("goed");
  zegEekhoorn(tekst); zeg(tekst);
  tekenWinkel(tekst);
}

function koopDing(d) {
  if (!d || portemonnee() < d.prijs) return;
  localStorage.setItem("uitgegeven", Number(localStorage.getItem("uitgegeven") || 0) + d.prijs);
  const a = mijnAvatar();
  a.gekocht.push(d.id);
  if (d.soort === "dier") a.dier = d.id; else a.aan[d.soort] = d.id;
  bewaarAvatar(a);
  winkelPas = null;
  toonEikels(); toonAvatarKnop(); feest();
  const tekst = d.soort === "dier" ? `Hoera! Je bent nu een ${d.naam}!` : `Hoera! Nu heb je een ${d.naam}!`;
  zegEekhoorn(tekst); zeg(tekst);
  tekenWinkel(tekst);
}

// ---------- 📷 een eigen foto als avatar ----------
function fotoVak() {
  const foto = mijnFoto();
  const aan = mijnAvatar().dier === "foto";
  return `<div class="foto-vak">
      <p>Maak een foto van je huisdier, je knuffel of jezelf. Dan wordt die foto je avatar!</p>
      ${foto ? `<button class="winkel-ding ${aan ? "aan" : ""}" id="foto-aan">
          <span class="ding-emoji"><img src="${foto}" alt=""></span>
          <span class="ding-naam">mijn foto</span>
          <span class="ding-prijs">${aan ? "✅ aan" : "tik om aan te doen"}</span>
        </button>` : ""}
      <label class="grote-knop foto-knop">📷 ${foto ? "Nieuwe foto" : "Maak een foto"}
        <input type="file" accept="image/*" id="foto-kiezen" hidden></label>
      ${foto ? `<button class="grote-knop grijs" id="foto-weg">🗑️ Foto weghalen</button>` : ""}
      <p class="klein">🔒 De foto blijft alleen op dit apparaat. Hij gaat nergens anders heen.</p>
    </div>`;
}

function koppelFoto() {
  const kies = scherm.querySelector("#foto-kiezen");
  kies.onchange = async () => {
    const bestand = kies.files[0];
    if (!bestand) return;
    try {
      localStorage.setItem("avatarFoto", await maakRondjeFoto(bestand));
    } catch (e) {
      tekenWinkel("Oei, die foto lukte niet. Probeer een andere!");
      return;
    }
    const a = mijnAvatar(); a.dier = "foto"; bewaarAvatar(a);
    toonAvatarKnop(); feest();
    zegEekhoorn("Wat een mooie foto! Dat ben jij nu!"); zeg("Wat een mooie foto!");
    tekenWinkel("Wat een mooie foto! Dat ben jij nu!");
  };
  const aan = scherm.querySelector("#foto-aan");
  if (aan) aan.onclick = () => {
    const a = mijnAvatar(); a.dier = "foto"; bewaarAvatar(a);
    toonAvatarKnop(); geluid("goed"); tekenWinkel("Je foto is weer je avatar!");
  };
  const weg = scherm.querySelector("#foto-weg");
  if (weg) weg.onclick = () => {
    localStorage.removeItem("avatarFoto");
    const a = mijnAvatar(); if (a.dier === "foto") a.dier = "kat"; bewaarAvatar(a);
    toonAvatarKnop(); tekenWinkel("De foto is weg.");
  };
}

// Foto klein en vierkant maken (het midden), zodat hij in het geheugen van de app past.
function maakRondjeFoto(bestand) {
  return new Promise((klaar, mis) => {
    const url = URL.createObjectURL(bestand);
    const img = new Image();
    img.onload = () => {
      const kant = Math.min(img.naturalWidth, img.naturalHeight);
      const c = document.createElement("canvas");
      c.width = c.height = 240;
      c.getContext("2d").drawImage(img, (img.naturalWidth - kant) / 2, (img.naturalHeight - kant) / 2, kant, kant, 0, 0, 240, 240);
      URL.revokeObjectURL(url);
      klaar(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); mis(new Error("geen plaatje")); };
    img.src = url;
  });
}
