// Kleine spelletjes per categorie. Gebruikt de hulpjes uit app.js
// (zeg, schud, woord, maakGat, foutWoord, gekleurd, speelRonde, ...).
// Dit bestand wordt vóór app.js geladen; de functies worden pas later aangeroepen.

const SPELLETJES = [
  { id: "ballonnen", emoji: "🎈", naam: "Ballonnen knallen", gat: true },
  { id: "eikels", emoji: "🌰", naam: "Eikels vangen", gat: true },
  { id: "kiezen", emoji: "⚖️", naam: "Welke is goed?", gat: true },
  { id: "gaatjes", emoji: "🧩", naam: "Gaatjes", gat: true },
  { id: "dictee", emoji: "🎧", naam: "Dictee" },
];

// Sleutel van een categorie voor links en sterren (id als die er is, anders het nummer).
const catSleutel = (cat) => cat.id || cat.nr;

// Hulpzinnetje bij elk spelletje: waar moet je aan denken?
const TIPS = {
  1: "Hak het woord in stukjes en schrijf wat je hoort.",
  "1s": "Daar mag geen u tussen!",
  2: "Denk aan ng, net als bij ding-dong!",
  3: "Denk aan de ch van lucht! Let op de uitzonderingen: hij ligt, hij legt, hij zegt.",
  4: "Denk aan nk. Daar mag geen g tussen!",
  5: "Denk aan ee, oo of eu!",
  6: "Denk aan de i: aai, ooi of oei!",
  7: "Denk aan de u: eeuw of ieuw!",
  8: "Maak het woord langer. Hoor je d of t?",
  9: "Denk aan be, ge of ver vooraan!",
  10: "Lange klank of korte klank? Denk aan de klankgroep!",
  11: "Denk aan je, tje of pje aan het eind!",
  12: "Denk aan ig of lijk aan het eind!",
};
const tip = (cat) => TIPS[catSleutel(cat)] || cat.tip || cat.regel; // cat.tip: groep 5-8, zie categorieen-hoger.js
// Woorden die hetzelfde klinken (licht / ligt): een plaatje en een zinnetje
// laten zien welk woord we bedoelen. In het zinnetje staat … op de plek van het woord.
const BETEKENIS = {
  licht: { plaatje: "💡", zin: "Het licht is aan." },
  ligt: { plaatje: "🛌", zin: "Hij ligt in bed." },
  legt: { plaatje: "🐔🥚", zin: "De kip legt een ei." },
  zegt: { plaatje: "🧒💬👋", zin: "Hij zegt hallo." },
  raad: { plaatje: "🤔❓", zin: "Raad eens wat ik heb!" },
};
const betekenisHtml = (w) => {
  const b = BETEKENIS[w];
  if (!b) return "";
  // alleen een plaatje, het zinnetje zegt Eva (tik erop om het nog eens te horen)
  return `<button class="betekenis" onclick="zeg('${b.zin}')" aria-label="Plaatje, tik om het zinnetje te horen">${b.plaatje}</button>`;
};
// Wat Eva zegt: het woord, en bij een klinkt-hetzelfde-woord ook het zinnetje.
const metZin = (w) => (BETEKENIS[w] ? `${w}. ${BETEKENIS[w].zin}` : w);
const tipHtml = (cat) => `<div class="tip-dictee">💡 ${tip(cat)}</div>`;

const BALLON_KLEUREN = ["#ef5350", "#42a5f5", "#66bb6a", "#ffa726", "#ab47bc", "#ec407a", "#26c6da"];

// Eindscherm met sterren, en daarna kies je je beloning: eikels of een sticker.
function eindScherm({ cat, n, tekst, verdiend, opnieuw, terug }) {
  terug = terug || (cat ? `#cat/${catSleutel(cat)}` : "#");
  let nieuw = null;
  if (cat) {
    // gaat er een nieuwe categorie open? (alleen als de slotjes er zijn)
    // Krijg je nu een 🔑 voor de volgende categorie? (2 sterren of meer)
    const sleutel = typeof sleutelVoor === "function" ? sleutelVoor : () => null;
    const voor = sleutel();
    geefSterren(catSleutel(cat), n);
    nieuw = !voor ? sleutel() : null;
  }
  if (n >= 2) feest();
  const walnoot = n === 3 && verdiend > 0; // 3 sterren: een walnoot erbij!
  if (walnoot) geefWalnoten(1);
  zegEekhoorn(n === 3 ? "Wauw! Wat ben jij goed!" : n === 2 ? "Heel goed gedaan!" : "Goed geoefend!");
  if (nieuw) { zegEekhoorn(`Hoera! Je krijgt een sleutel! 🔑 Maak ${nieuw.naam} open.`); zeg(`Hoera! Je krijgt een sleutel! Maak ${nieuw.naam} open.`); }
  scherm.innerHTML = `
    <div class="kaart eind" ${cat ? `style="border-color:${cat.kleur}"` : ""}>
      <div class="groot-sterren">${sterTekst(n)}</div>
      <p>${tekst}</p>
      ${walnoot ? `<p class="walnoot-bonus">🏅 3 sterren! Je krijgt een walnoot ${WALNOOT}</p>` : ""}
      ${nieuw ? `<a class="nieuw-open sleutel-wiebel" href="#open/${catSleutel(nieuw)}" style="background:${nieuw.kleur}">🔑 Je hebt een sleutel! Maak ${nieuw.figuur} ${nieuw.naam} open</a>` : ""}
      ${verdiend > 0 ? `
        <div class="beloning">
          <h3>🎁 Kies je beloning!</h3>
          <button class="beloning-knop" id="kies-eikels"><span>🌰 × ${verdiend}</span>Eikels voor de winkel</button>
          <button class="beloning-knop" id="kies-sticker"><span>🌟</span>Een sticker voor je stickerboek</button>
        </div>` : ""}
      <div class="knoppen">
        <button class="grote-knop" id="nog">🔁 Nog een keer</button>
        <a class="grote-knop" href="${terug}">Klaar</a>
      </div>
    </div>`;
  scherm.querySelector("#nog").onclick = opnieuw;
  if (verdiend > 0) {
    if (!nieuw) zeg("Kies je beloning!");
    scherm.querySelector("#kies-eikels").onclick = () => {
      scherm.querySelector(".beloning").innerHTML = `<h3>🌰 +${verdiend} eikels!</h3>`;
      spaarEikels(verdiend);
    };
    scherm.querySelector("#kies-sticker").onclick = () => {
      localStorage.setItem("stickerPlakken", nieuweSticker());
      geluid("feest");
      location.hash = "#stickers";
    };
  }
}

// Alle levens op: geen punten deze keer.
function levensOp({ cat, opnieuw, terug }) {
  geluid("fout");
  zegEekhoorn("Oei, je hartjes zijn op! Geen punten deze keer. Probeer het nog een keer!");
  zeg("Oei, je hartjes zijn op! Probeer het nog een keer!");
  scherm.innerHTML = `
    <div class="kaart eind" ${cat ? `style="border-color:${cat.kleur}"` : ""}>
      <div class="groot-sterren">💔</div>
      <p>Je hartjes zijn op. Deze keer geen punten.</p>
      <p class="regel">${cat ? tip(cat) : "Kijk goed en luister goed!"}</p>
      <div class="knoppen">
        <button class="grote-knop" id="nog">🔁 Nog een keer</button>
        <a class="grote-knop" href="${terug}">Terug</a>
      </div>
    </div>`;
  scherm.querySelector("#nog").onclick = opnieuw;
}

// ---------- 🎈 Ballonnen knallen ----------
// Ballonnen zweven omhoog. Tik alleen de ballonnen waarop het woord goed geschreven is.
// T = een thema uit WERELDEN (bij een eigen spel), anders gewoon ballonnen.
function ballonnen(cat, T, titel) {
  const opnieuw = () => ballonnen(cat, T, titel);
  const hier = location.hash;
  const AANTAL = 12;
  const lijst = cat.woorden.filter((x) => foutWoord(cat, x, true));
  let gemaakt = 0, weg = 0, geknald = 0, goedeBallonnen = 0, foutjes = 0;

  zegEekhoorn(T ? `Tik alleen op de ${T.ding} met een goed geschreven woord!` : "Knal alleen de goed geschreven woorden!");
  zeg("Knal de ballonnen met een goed geschreven woord.");
  scherm.innerHTML = `
    <div class="kaart" style="border-color:${cat.kleur}">
      <div class="voortgang">${titel || "🎈 Ballonnen knallen"}</div>
      <div class="levens-balk"><span class="levens">${hartjes(LEVENS)}</span><span class="pot" id="score">🌰 0</span></div>
      ${tipHtml(cat)}
      <div class="lucht" id="lucht" ${T ? `style="background:linear-gradient(${T.lucht} 70%, ${T.vloer})"` : ""}></div>
      <a class="terug" href="#cat/${catSleutel(cat)}">← Stoppen</a>
    </div>`;
  const lucht = scherm.querySelector("#lucht");
  const score = scherm.querySelector("#score");

  let over = false;
  const klaar = () => {
    if (over || location.hash !== hier) return;
    if (foutjes >= LEVENS) { over = true; lucht.querySelectorAll(".ballon-spel").forEach((b) => b.remove()); return setTimeout(() => levensOp({ cat, opnieuw, terug: `#cat/${catSleutel(cat)}` }), 1200); }
    if (weg < AANTAL) return;
    over = true;
    const punten = Math.max(0, geknald - foutjes);
    const n = punten >= goedeBallonnen ? 3 : punten >= goedeBallonnen * 0.6 ? 2 : punten > 0 ? 1 : 0;
    eindScherm({ cat, n, tekst: `Je knalde ${geknald} goede ${T ? T.ding : "ballonnen"}${foutjes ? ` en ${foutjes} foute` : ""}.`, verdiend: geknald, opnieuw });
  };

  const maakBallon = () => {
    if (location.hash !== hier) return;
    const x = schud(lijst)[0];
    // ongeveer de helft is goed; zorg dat er altijd een paar goede bij zitten
    const isGoed = gemaakt < 2 || Math.random() < 0.5;
    if (isGoed) goedeBallonnen++;
    const tekst = isGoed ? woord(x) : foutWoord(cat, x, true);
    const b = el(T ? `<button class="ballon-spel thema"><span><em>${T.emoji}</em><b>${tekst}</b></span></button>`
      : `<button class="ballon-spel"><span>${tekst}</span></button>`);
    b.style.left = 5 + Math.random() * 65 + "%";
    b.style.setProperty("--kleur", schud(BALLON_KLEUREN)[0]);
    b.style.animationDuration = 7 + Math.random() * 2 + "s";
    b.onclick = () => {
      if (b.classList.contains("knal")) return;
      if (isGoed) {
        geknald++;
        b.classList.add("knal");
        geluid("knal"); eikelVlieg();
        zegEekhoorn(schud(["Knal! Goed zo!", "Pang! Super!", "Ja! Goed geschreven!"])[0]);
        zeg(woord(x));
      } else {
        foutjes++;
        b.classList.add("knal", "mis");
        geluid("fout");
        zegEekhoorn(`Oeps! Zo schrijf je het: ${woord(x)}.`);
      }
      score.textContent = `🌰 ${geknald}`;
      const l = scherm.querySelector(".levens");
      l.textContent = hartjes(Math.max(0, LEVENS - foutjes));
      if (!isGoed) { l.classList.remove("au"); void l.offsetWidth; l.classList.add("au"); }
      setTimeout(() => b.remove(), 400);
      weg++; klaar();
    };
    b.addEventListener("animationend", (e) => {
      if (e.animationName !== "stijg" || b.classList.contains("knal")) return;
      if (isGoed) zegEekhoorn(`Oei, ${woord(x)} vloog weg! Dat was een goede.`);
      b.remove(); weg++; klaar();
    });
    lucht.appendChild(b);
    gemaakt++;
    if (gemaakt < AANTAL && !over) setTimeout(maakBallon, 1700);
  };
  setTimeout(maakBallon, 1200);
}

// ---------- 🌰 Eikels vangen ----------
// Eikels met stukjes vallen uit de boom. Vang de eikel die in het gaatje past, voordat hij op de grond valt.
function eikels(cat, T, titel) {
  const lijst = schud(cat.woorden.filter((x) => maakGat(cat, x)));
  speelRonde({
    titel: titel || "🌰 Eikels vangen", cat, terug: `#cat/${catSleutel(cat)}`,
    maakVraag: (doos, antwoord) => {
      const x = lijst[Math.floor(Math.random() * lijst.length)];
      const g = maakGat(cat, x);
      const opties = schud([g.deel, ...g.fout.slice(0, 2)]);
      let klaar = false;
      zegEekhoorn(T ? `Vang de ${T.ding} die in het gaatje past!` : "Help mij! Vang de eikel die in het gaatje past.");
      doos.innerHTML = `
        <button class="luister" title="Luister">🔊</button>
        ${tipHtml(cat)}
        ${betekenisHtml(woord(x))}
        <div class="woord-groot">${g.voor}<span class="gat">?</span>${g.na}</div>
        <div class="boom" ${T ? `style="background:linear-gradient(${T.lucht}, #fff)"` : ""}>
          ${opties.map((o, i) => `
            <button class="eikel" data-deel="${o}"
              style="left:${10 + i * (75 / opties.length) + Math.random() * 8}%;animation-duration:${7 + Math.random() * 2.5}s;animation-delay:${0.8 + i * 0.4}s">
              <span class="eikel-plaatje">${T ? T.emoji : "🌰"}</span><span class="eikel-tekst">${o}</span></button>`).join("")}
          <div class="grond" ${T ? `style="background:${T.vloer}"` : ""}>${T ? T.doel : "🐿️"}</div>
        </div>`;
      doos.querySelector(".luister").onclick = () => zeg(metZin(woord(x)));
      zeg(metZin(woord(x)));
      const vul = () => { const gat = doos.querySelector(".gat"); gat.textContent = g.deel; gat.classList.add("ingevuld"); };
      const stop = () => { klaar = true; doos.querySelectorAll(".eikel").forEach((e) => e.classList.add("stil")); };
      doos.querySelectorAll(".eikel").forEach((e) => {
        e.onclick = () => {
          if (klaar) return;
          stop();
          const isGoed = e.dataset.deel === g.deel;
          e.classList.add(isGoed ? "gevangen" : "mis");
          vul();
          antwoord(isGoed, `Bijna! Het is ${woord(x)}. ${cat.regel}`);
        };
        e.addEventListener("animationend", (ev) => {
          if (ev.animationName !== "val-eikel" || klaar || e.dataset.deel !== g.deel) return;
          stop(); vul();
          antwoord(false, `Te laat! Het is ${woord(x)}. Probeer de volgende sneller te vangen!`);
        });
      });
    },
  });
}

// ---------- ⚖️ Welke is goed? ----------
// Eva zegt een woord. Er staan twee woorden: één goed, één met een fout (krab of krap?).
// Bij sommige categorieën komen ook uitzonderingen langs (hij ligt, niet hij licht).
const UITZONDERINGEN = {
  3: [
    { w: "ligt", fout: "licht" },
    { w: "legt", fout: "lecht" },
    { w: "zegt", fout: "zecht" },
  ],
};
function kiezen(cat) {
  const lijst = cat.woorden.filter((x) => foutWoord(cat, x));
  const uitz = UITZONDERINGEN[catSleutel(cat)] || [];
  speelRonde({
    titel: "⚖️ Welke is goed?", cat, terug: `#cat/${catSleutel(cat)}`,
    maakVraag: (doos, antwoord) => {
      // ongeveer 1 op de 3 vragen een uitzondering, als die er zijn
      const u = uitz.length && Math.random() < 0.35 ? schud(uitz)[0] : null;
      const x = u ? null : schud(lijst)[0];
      const goedW = u ? u.w : woord(x);
      const foutW = u ? u.fout : foutWoord(cat, x);
      const hoor = metZin(goedW);
      zegEekhoorn("Luister goed. Welk woord is goed geschreven?");
      doos.innerHTML = `
        <button class="luister groot" title="Luister nog een keer">🔊</button>
        ${tipHtml(cat)}
        ${betekenisHtml(goedW)}
        <div class="twee-keuzes">${schud([goedW, foutW]).map((o) => `
          <button class="woordkaart">${o}</button>`).join("")}</div>
        <div class="uitkomst"></div>`;
      doos.querySelector(".luister").onclick = () => zeg(hoor);
      zeg(hoor);
      doos.querySelectorAll(".woordkaart").forEach((k) => (k.onclick = () => {
        doos.querySelectorAll(".woordkaart").forEach((b) => (b.disabled = true));
        const isGoed = k.textContent.trim() === goedW;
        k.classList.add(isGoed ? "goed" : "fout");
        [...doos.querySelectorAll(".woordkaart")].find((b) => b.textContent.trim() === goedW).classList.add("goed");
        const uitkomst = doos.querySelector(".uitkomst");
        if (u) uitkomst.innerHTML = `<span class="uitzondering">⚠️ Uitzondering!</span> ${u.w} schrijf je met een g.`;
        else uitkomst.innerHTML = `${gekleurd(cat, x)}`;
        antwoord(isGoed, u
          ? `Dit is een uitzondering! ${u.w} schrijf je met een g.`
          : `Kijk goed: ${goedW}. ${tip(cat)}`);
      }));
    },
  });
}

// ---------- 🔊 geluidjes (gemaakt met de browser, geen bestanden) ----------
let geluidCtx = null;
function toon(freq, start, duur, type = "sine", volume = 0.15) {
  const t0 = geluidCtx.currentTime + start;
  const o = geluidCtx.createOscillator(), g = geluidCtx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(volume, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duur);
  o.connect(g).connect(geluidCtx.destination);
  o.start(t0); o.stop(t0 + duur);
}
function geluid(soort) {
  try {
    geluidCtx = geluidCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (geluidCtx.state === "suspended") geluidCtx.resume();
    if (soort === "goed") { toon(660, 0, .12); toon(880, .1, .2); }
    if (soort === "fout") { toon(220, 0, .18, "triangle"); toon(175, .15, .25, "triangle"); }
    if (soort === "knal") { toon(900, 0, .06, "square", .08); toon(300, .03, .1, "square", .06); }
    if (soort === "eikel") toon(1200, 0, .1, "sine", .1);
    if (soort === "feest") [523, 659, 784, 1047].forEach((f, i) => toon(f, i * .12, .3));
  } catch (e) { /* geen geluid, geen probleem */ }
}

// ---------- 🌰 eikels sparen en 🛒 het winkeltje ----------
// Met eikels koop je in de winkel een dier als jouw figuur, spulletjes erbij,
// of je mag een foto (bijvoorbeeld van je eigen kat) als figuur gebruiken.
// Alles blijft op dit apparaat (localStorage), de foto gaat nergens naartoe.
const WINKEL = [
  { id: "eekhoorn", soort: "dier", emoji: "🐿️", naam: "Eekhoorn", prijs: 0 },
  { id: "kat", soort: "dier", emoji: "🐱", naam: "Kat", prijs: 8 },
  { id: "hond", soort: "dier", emoji: "🐶", naam: "Hond", prijs: 8 },
  { id: "konijn", soort: "dier", emoji: "🐰", naam: "Konijn", prijs: 8 },
  { id: "hamster", soort: "dier", emoji: "🐹", naam: "Hamster", prijs: 8 },
  { id: "muis", soort: "dier", emoji: "🐭", naam: "Muis", prijs: 8 },
  { id: "vogel", soort: "dier", emoji: "🐦", naam: "Vogel", prijs: 8 },
  { id: "kuiken", soort: "dier", emoji: "🐥", naam: "Kuiken", prijs: 8 },
  { id: "vis", soort: "dier", emoji: "🐠", naam: "Vis", prijs: 8 },
  { id: "schildpad", soort: "dier", emoji: "🐢", naam: "Schildpad", prijs: 9 },
  { id: "kikker", soort: "dier", emoji: "🐸", naam: "Kikker", prijs: 9 },
  { id: "vos", soort: "dier", emoji: "🦊", naam: "Vos", prijs: 10 },
  { id: "beer", soort: "dier", emoji: "🐻", naam: "Beer", prijs: 10 },
  { id: "panda", soort: "dier", emoji: "🐼", naam: "Panda", prijs: 10 },
  { id: "koala", soort: "dier", emoji: "🐨", naam: "Koala", prijs: 10 },
  { id: "aap", soort: "dier", emoji: "🐵", naam: "Aap", prijs: 10 },
  { id: "varken", soort: "dier", emoji: "🐷", naam: "Varken", prijs: 10 },
  { id: "koe", soort: "dier", emoji: "🐮", naam: "Koe", prijs: 10 },
  { id: "paard", soort: "dier", emoji: "🐴", naam: "Paard", prijs: 10 },
  { id: "uil", soort: "dier", emoji: "🦉", naam: "Uil", prijs: 10 },
  { id: "pinguin", soort: "dier", emoji: "🐧", naam: "Pinguïn", prijs: 10 },
  { id: "egel", soort: "dier", emoji: "🦔", naam: "Egel", prijs: 10 },
  { id: "olifant", soort: "dier", emoji: "🐘", naam: "Olifant", prijs: 11 },
  { id: "giraf", soort: "dier", emoji: "🦒", naam: "Giraf", prijs: 11 },
  { id: "leeuw", soort: "dier", emoji: "🦁", naam: "Leeuw", prijs: 11 },
  { id: "tijger", soort: "dier", emoji: "🐯", naam: "Tijger", prijs: 11 },
  { id: "zebra", soort: "dier", emoji: "🦓", naam: "Zebra", prijs: 11 },
  { id: "dolfijn", soort: "dier", emoji: "🐬", naam: "Dolfijn", prijs: 11 },
  { id: "octopus", soort: "dier", emoji: "🐙", naam: "Octopus", prijs: 11 },
  { id: "vlinder", soort: "dier", emoji: "🦋", naam: "Vlinder", prijs: 11 },
  { id: "flamingo", soort: "dier", emoji: "🦩", naam: "Flamingo", prijs: 12 },
  { id: "papegaai", soort: "dier", emoji: "🦜", naam: "Papegaai", prijs: 12 },
  { id: "eenhoorn", soort: "dier", emoji: "🦄", naam: "Eenhoorn", prijs: 20 },
  { id: "draak", soort: "dier", emoji: "🐉", naam: "Draak", prijs: 20 },
  { id: "dino", soort: "dier", emoji: "🦖", naam: "Dino", prijs: 20 },
  { id: "foto", soort: "foto", emoji: "📷", naam: "Mijn foto", prijs: 0 },
  { id: "geen", soort: "spul", emoji: "✖️", naam: "Niks", prijs: 0 },
  { id: "strik", soort: "spul", emoji: "🎀", naam: "Strik", prijs: 8 },
  { id: "ballon", soort: "spul", emoji: "🎈", naam: "Ballon", prijs: 8 },
  { id: "bloem", soort: "spul", emoji: "🌸", naam: "Bloem", prijs: 8 },
  { id: "hartje", soort: "spul", emoji: "💖", naam: "Hartje", prijs: 8 },
  { id: "ster", soort: "spul", emoji: "⭐", naam: "Ster", prijs: 8 },
  { id: "pet", soort: "spul", emoji: "🧢", naam: "Pet", prijs: 9 },
  { id: "muts", soort: "spul", emoji: "👒", naam: "Zonnehoed", prijs: 9 },
  { id: "bril", soort: "spul", emoji: "🕶️", naam: "Zonnebril", prijs: 9 },
  { id: "koptelefoon", soort: "spul", emoji: "🎧", naam: "Koptelefoon", prijs: 10 },
  { id: "hoed", soort: "spul", emoji: "🎩", naam: "Hoge hoed", prijs: 10 },
  { id: "kroon", soort: "spul", emoji: "👑", naam: "Kroon", prijs: 20 },
  { id: "toverstaf", soort: "spul", emoji: "🪄", naam: "Toverstaf", prijs: 10 },
  { id: "regenboog", soort: "spul", emoji: "🌈", naam: "Regenboog", prijs: 10 },
  { id: "ijsje", soort: "spul", emoji: "🍦", naam: "IJsje", prijs: 8 },
  { id: "donut", soort: "spul", emoji: "🍩", naam: "Donut", prijs: 8 },
  { id: "voetbal", soort: "spul", emoji: "⚽", naam: "Voetbal", prijs: 9 },
  { id: "gitaar", soort: "spul", emoji: "🎸", naam: "Gitaar", prijs: 10 },
  { id: "raket", soort: "spul", emoji: "🚀", naam: "Raket", prijs: 20 },
  { id: "kasteel", soort: "spul", emoji: "🏰", naam: "Kasteel", prijs: 20 },
  { id: "trofee", soort: "spul", emoji: "🏆", naam: "Beker", prijs: 20 },
  { id: "walvis", soort: "dier", emoji: "🐳", naam: "Walvis", prijs: 20 },
  { id: "pauw", soort: "dier", emoji: "🦚", naam: "Pauw", prijs: 20 },
  { id: "diamant", soort: "spul", emoji: "💎", naam: "Diamant", prijs: 20 },
];
const aantalEikels = () => Number(localStorage.getItem("eikels") || 0);
// Walnoten: extra bijzondere noten. Je krijgt er een bij 3 sterren, of je ruilt 10 eikels in de winkel.
const aantalWalnoten = () => Number(localStorage.getItem("walnoten") || 0);
const WALNOOT = `<svg class="walnoot" viewBox="0 0 40 40" role="img" aria-label="walnoot"><ellipse cx="20" cy="21" rx="16" ry="17" fill="#b07a45" stroke="#6d4421" stroke-width="2.5"/><path d="M20 5v32" stroke="#6d4421" stroke-width="2.5"/><path d="M10 13c4 2 4 6 0 8m1 5c3 2 3 5 0 7M30 13c-4 2-4 6 0 8m-1 5c-3 2-3 5 0 7" fill="none" stroke="#6d4421" stroke-width="2"/></svg>`;
function geefWalnoten(n) {
  localStorage.setItem("walnoten", Math.max(0, aantalWalnoten() + n));
  toonEikels();
}
const gekocht = () => [...new Set(["eekhoorn", "geen", "foto", ...JSON.parse(localStorage.getItem("gekocht") || "[]")])];
const mijnFiguur = () => ({ dier: "eekhoorn", spul: "geen", ...JSON.parse(localStorage.getItem("figuur") || "{}") });
const winkelItem = (id) => WINKEL.find((w) => w.id === id);

// Jouw figuur als HTML: een dier of je foto, met je spulletje erbij.
function figuurHtml(klasse = "") {
  const f = mijnFiguur();
  const foto = f.dier === "foto" && localStorage.getItem("figuurFoto");
  const spul = f.spul !== "geen" ? winkelItem(f.spul) : null;
  return `<span class="mijn-figuur ${klasse}">
    ${foto ? `<img src="${foto}" alt="Mijn figuur">` : `<span class="figuur-dier">${(winkelItem(f.dier) || WINKEL[0]).emoji}</span>`}
    ${spul ? `<span class="figuur-spul">${spul.emoji}</span>` : ""}</span>`;
}

// Teller rechtsboven, met jouw figuur ernaast.
// (pas na het laden, want el() staat in app.js)
let teller = null;
document.addEventListener("DOMContentLoaded", () => {
  const balk = el(`<div class="beloning-balk">
    <a class="figuur-knop" href="#prijzen" aria-label="Mijn figuur en de winkel"></a>
    <a class="stickerboek-knop" href="#stickers" aria-label="Mijn stickerboek">📒</a>
    <a class="eikel-teller" href="#prijzen" aria-label="Mijn eikels en walnoten, en de winkel">🌰 <b>0</b> <span class="wn">${WALNOOT} <b>0</b></span></a></div>`);
  document.querySelector("header").appendChild(balk);
  teller = balk.querySelector(".eikel-teller");
  toonEikels();
});
function toonEikels() {
  if (!teller) return;
  teller.querySelector("b").textContent = aantalEikels();
  teller.querySelector(".wn b").textContent = aantalWalnoten();
  const knop = document.querySelector(".figuur-knop");
  if (knop) knop.innerHTML = figuurHtml();
}

// Een eikeltje springt op als je iets goed hebt (in het potje van dit spel).
function eikelVlieg() {
  const vlieg = el(`<span class="eikel-vlieg">🌰</span>`);
  document.body.appendChild(vlieg);
  setTimeout(() => vlieg.remove(), 900);
  geluid("eikel");
  const m = document.querySelector(".mascot");
  m.classList.remove("spring"); void m.offsetWidth; m.classList.add("spring");
}
// Eikels echt sparen (aan het eind, als je eikels kiest als beloning).
function spaarEikels(n) {
  localStorage.setItem("eikels", aantalEikels() + n);
  geluid("eikel");
  toonEikels();
  if (teller) { teller.classList.remove("pop"); void teller.offsetWidth; teller.classList.add("pop"); }
  zegEekhoorn(`Nu heb je ${aantalEikels()} eikels! Kijk eens in de winkel. 🛒`);
}

// Foto kleiner maken (vierkant, 200 pixels), zodat hij in de browser past.
function maakFotoKlein(bestand) {
  return new Promise((klaar, mis) => {
    const img = new Image();
    img.onload = () => {
      const z = Math.min(img.width, img.height), M = 200;
      const c = document.createElement("canvas"); c.width = c.height = M;
      c.getContext("2d").drawImage(img, (img.width - z) / 2, (img.height - z) / 2, z, z, 0, 0, M, M);
      URL.revokeObjectURL(img.src);
      klaar(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = mis;
    img.src = URL.createObjectURL(bestand);
  });
}

// Het winkeltje (route #prijzen).
function prijzen() {
  const n = aantalEikels(), heb = gekocht(), f = mijnFiguur();
  const fotoGekocht = heb.includes("foto");
  zegEekhoorn(`Welkom in de winkel! Je hebt ${n} eikels. Wat wil je kopen?`);
  const vak = (w) => {
    const bezit = heb.includes(w.id);
    const aan = (w.soort === "spul" ? f.spul : f.dier) === w.id;
    return `<button class="winkel-vak ${bezit ? "bezit" : ""} ${aan ? "aan" : ""}" data-id="${w.id}">
      <span class="winkel-emoji">${w.emoji}</span>${w.naam}
      <span class="winkel-prijs">${aan ? "✅ Aan" : bezit ? "Kiezen" : `🌰 ${w.prijs}`}</span></button>`;
  };
  scherm.innerHTML = `
    <div class="kaart">
      <h2>🛒 Het eikel-winkeltje</h2>
      <div class="winkel-kop">
        <div class="groot-figuur">${figuurHtml("groot")}</div>
        <div class="groot-eikels">🌰 ${n} <span class="groot-walnoten">${WALNOOT} ${aantalWalnoten()}</span></div>
      </div>
      <p class="regel">Jij kiest! Koop wat je wilt, wanneer je wilt. Als je iets koopt, gaan die eikels eraf.</p>
      <h3 class="spel-kop">📷 Maak een foto van je eigen dier</h3>
      <p class="winkel-uitleg">Van je kat, poes, vogel of elk dier dat je wilt! Dan ben jij dat dier. De foto blijft alleen op dit apparaat.</p>
      <div class="winkel-rij">
        <label class="winkel-vak foto-kiezen"><span class="winkel-emoji">📸</span>Foto maken
          <input type="file" accept="image/*" capture="environment" hidden></label>
        <label class="winkel-vak foto-kiezen"><span class="winkel-emoji">🖼️</span>Foto kiezen
          <input type="file" accept="image/*" hidden></label>
        ${localStorage.getItem("figuurFoto") ? `<button class="winkel-vak ${f.dier === "foto" ? "aan" : "bezit"}" data-id="foto">
          <span class="winkel-emoji"><img class="winkel-foto" src="${localStorage.getItem("figuurFoto")}" alt=""></span>Mijn foto
          <span class="winkel-prijs">${f.dier === "foto" ? "✅ Aan" : "Kiezen"}</span></button>` : ""}
      </div>
      <h3 class="spel-kop">🐾 Kies je dier</h3>
      <div class="winkel-rij">${WINKEL.filter((w) => w.soort === "dier" && w.prijs < 20).map(vak).join("")}</div>
      <h3 class="spel-kop">🎀 Spulletjes</h3>
      <div class="winkel-rij">${WINKEL.filter((w) => w.soort === "spul" && w.prijs < 20).map(vak).join("")}</div>
      <h3 class="spel-kop" id="eigen-stickers">🎨 Eigen stickers (met walnoten)</h3>
      <p class="winkel-uitleg">Teken je eigen sticker. Daarna koop je hem voor ${STICKER_PRIJS} walnoten en plak je hem in je stickerboek. Walnoten krijg je bij 3 sterren, of ruil ${RUIL_EIKELS} eikels.</p>
      <div class="winkel-rij stickers-rij">
        <a class="winkel-vak foto-kiezen" href="#stickermaker"><span class="winkel-emoji">✏️</span>Sticker tekenen</a>
        <button class="winkel-vak ruil-vak" id="ruil"><span class="winkel-emoji">🌰➜${WALNOOT}</span>Ruilen
          <span class="winkel-prijs">🌰 ${RUIL_EIKELS} = 1 ${WALNOOT}</span></button>
        ${mijnStickers().map((m) => `<button class="winkel-vak" data-sticker="${m.id}">
          <span class="winkel-emoji"><img class="winkel-sticker" src="${m.src}" alt="Mijn sticker"></span>Plakken
          <span class="winkel-prijs">${WALNOOT} ${STICKER_PRIJS}</span></button>`).join("")}
      </div>
      <h3 class="spel-kop">🌟 Grote prijzen (🌰 20)</h3>
      <p class="winkel-uitleg">Spaar je eikels voor iets heel bijzonders!</p>
      <div class="winkel-rij groot">${WINKEL.filter((w) => w.prijs >= 20).map(vak).join("")}</div>
      <a class="grote-knop" href="#">Verder spelen</a>
    </div>`;
  scherm.querySelectorAll(".winkel-vak[data-id]").forEach((b) => (b.onclick = () => {
    const w = winkelItem(b.dataset.id);
    const fig = mijnFiguur();
    if (!gekocht().includes(w.id)) {
      if (aantalEikels() < w.prijs) {
        geluid("fout");
        zegEekhoorn(`Je hebt nog ${w.prijs - aantalEikels()} eikels nodig voor ${w.naam.toLowerCase()}. Speel nog een spelletje!`);
        return;
      }
      localStorage.setItem("eikels", aantalEikels() - w.prijs);
      localStorage.setItem("gekocht", JSON.stringify([...gekocht(), w.id]));
      feest();
      zeg(`Gekocht! ${w.naam}!`);
    } else geluid("eikel");
    if (w.soort === "spul") fig.spul = w.id;
    else if (w.soort === "dier") fig.dier = w.id;
    else if (localStorage.getItem("figuurFoto")) fig.dier = "foto";
    localStorage.setItem("figuur", JSON.stringify(fig));
    toonEikels();
    prijzen();
  }));
  scherm.querySelector("#ruil").onclick = () => {
    if (aantalEikels() < RUIL_EIKELS) {
      geluid("fout");
      return zegEekhoorn(`Voor een walnoot heb je ${RUIL_EIKELS} eikels nodig. Je hebt er ${aantalEikels()}.`);
    }
    localStorage.setItem("eikels", aantalEikels() - RUIL_EIKELS);
    geefWalnoten(1); geluid("eikel");
    prijzen();
    zegEekhoorn(`Geruild! Nu heb je ${aantalWalnoten()} ${aantalWalnoten() === 1 ? "walnoot" : "walnoten"}.`);
  };
  scherm.querySelectorAll(".winkel-vak[data-sticker]").forEach((b) => (b.onclick = () => {
    if (aantalWalnoten() < STICKER_PRIJS) {
      geluid("fout");
      return zegEekhoorn(`Je hebt ${STICKER_PRIJS} walnoten nodig. Haal 3 sterren of ruil ${RUIL_EIKELS} eikels voor een walnoot!`);
    }
    geefWalnoten(-STICKER_PRIJS);
    localStorage.setItem("stickerPlakken", "m:" + b.dataset.sticker);
    geluid("feest");
    location.hash = "#stickers";
  }));
  // net een sticker getekend? Laat hem zien.
  if (localStorage.getItem("winkelNaar")) {
    localStorage.removeItem("winkelNaar");
    scherm.querySelector("#eigen-stickers").scrollIntoView({ block: "start" });
    zegEekhoorn(`Wat mooi! Je sticker staat nu in de winkel. Koop hem voor ${STICKER_PRIJS} walnoten en plak hem in je boek!`);
    zeg("Wat mooi! Je sticker staat nu in de winkel!");
  }
  scherm.querySelectorAll('.foto-kiezen input').forEach((kies) => (kies.onchange = async () => {
    if (!kies.files[0]) return;
    try {
      localStorage.setItem("figuurFoto", await maakFotoKlein(kies.files[0]));
      localStorage.setItem("figuur", JSON.stringify({ ...mijnFiguur(), dier: "foto" }));
      feest(); toonEikels(); prijzen();
      zegEekhoorn("Wauw, wat een mooie foto! Dat ben jij nu!");
    } catch (e) {
      zegEekhoorn("Oei, die foto lukt niet. Probeer een andere!");
    }
  }));
}

// ---------- 🗺️ de weg door een categorie ----------
// Per spelletje bewaren we de beste sterren: { "3": { gaatjes: 2, ... } }
const spelSterren = () => JSON.parse(localStorage.getItem("spelSterren") || "{}");
function bewaarSpelSterren(sleutelCat, spel, n) {
  const s = spelSterren();
  s[sleutelCat] = s[sleutelCat] || {};
  s[sleutelCat][spel] = Math.max(s[sleutelCat][spel] || 0, n);
  localStorage.setItem("spelSterren", JSON.stringify(s));
}

const WEG_X = [18, 50, 82, 50]; // links, midden, rechts, midden, ... zo slingert de weg
function tekenWeg(cat) {
  const heeftGat = cat.woorden.some((x) => maakGat(cat, x));
  const mijn = spelSterren()[catSleutel(cat)] || {};
  const stappen = [
    { id: "uitleg", emoji: "🎬", naam: "Uitleg", klaar: !!mijn.uitleg },
    ...["gaatjes", "ballonnen", "eikels", "kiezen", "dictee"]
      .map((id) => SPELLETJES.find((g) => g.id === id))
      .filter((g) => heeftGat || !g.gat)
      .map((g) => ({ ...g, sterren: mijn[g.id] || 0, klaar: (mijn[g.id] || 0) > 0 })),
  ];
  const beker = stappen.every((s) => s.klaar);
  const hier = stappen.findIndex((s) => !s.klaar);
  const alle = [...stappen, { id: "beker", emoji: beker ? "🏆" : "🏁", naam: beker ? "Beker!" : "Finish" }];
  const H = 120; // hoogte per stap
  const punten = alle.map((_, i) => [WEG_X[i % WEG_X.length], i * H + H / 2]);
  const hoogte = alle.length * H;
  return `
    <div class="weg" style="height:${hoogte}px">
      <svg class="weg-lijn" viewBox="0 0 100 ${hoogte}" preserveAspectRatio="none">
        <polyline points="${punten.map(([x, y]) => `${x},${y}`).join(" ")}" />
      </svg>
      ${alle.map((s, i) => {
        const [x, y] = punten[i];
        const isBeker = s.id === "beker";
        const tag = isBeker ? "div" : "a";
        return `
        <${tag} class="steen ${s.klaar ? "klaar" : ""} ${i === hier ? "hier" : ""} ${isBeker && beker ? "gewonnen" : ""}"
          ${isBeker ? "" : `href="#${s.id}/${catSleutel(cat)}"`}
          style="left:${x}%;top:${y}px;${s.klaar || (isBeker && beker) ? `background:${cat.kleur}` : ""}">
          <span class="steen-emoji">${s.emoji}</span>
          <span class="steen-naam">${s.naam}</span>
          ${s.sterren !== undefined ? `<span class="steen-sterren">${sterTekst(s.sterren)}</span>` : ""}
          ${i === hier ? `<span class="eva-hier">🐿️</span>` : ""}
        </${tag}>`;
      }).join("")}
    </div>`;
}

// ---------- 🏀 werelden: kies de goede bal en scoor! ----------
// Eén spel-motor met verschillende "werelden". Eva zegt een woord; op de ballen
// (of vissen, raketten, ...) staan stukjes of woorden. Tik de goede en hij vliegt naar het doel.
const WERELDEN = {
  basketbal: { ding: "ballen", emoji: "🏀", doel: "🗑️", naam: "Basketbal", lucht: "#ffe0b2", vloer: "#bf8040",
    zin: "Gooi de goede bal in de basket!", hoera: ["Score!", "Swish! Raak!", "Twee punten!"], woorden: ["basket", "basketbal", "basketballen"] },
  voetbal: { ding: "ballen", emoji: "⚽", doel: "🥅", naam: "Voetbal", lucht: "#b3e5fc", vloer: "#66bb6a",
    zin: "Schiet de goede bal in het doel!", hoera: ["Goal!", "Doelpunt!", "Wat een schot!"], woorden: ["voetbal", "voetballen", "goal", "doelpunt"] },
  ruimte: { ding: "raketten", emoji: "🚀", doel: "🌙", naam: "Ruimte", lucht: "#283593", vloer: "#1a237e",
    zin: "Stuur de goede raket naar de maan!", hoera: ["Geland!", "Raketje op de maan!", "Woesj!"], woorden: ["ruimte", "raket", "maan", "planeet", "astronaut", "sterren"] },
  pinguin: { ding: "vissen", emoji: "🐟", doel: "🐧", naam: "Pinguïn", lucht: "#e1f5fe", vloer: "#b3e5fc",
    zin: "Geef de pinguïn de goede vis!", hoera: ["Smakelijk!", "Mmm, lekker!", "Hap!"], woorden: ["pinguïn", "pinguin", "pinguïns", "ijs", "vis", "vissen"] },
  konijn: { ding: "wortels", emoji: "🥕", doel: "🐰", naam: "Konijn", lucht: "#f1f8e9", vloer: "#aed581",
    zin: "Geef het konijn de goede wortel!", hoera: ["Knabbel knabbel!", "Lekker!", "Hap!"], woorden: ["konijn", "konijnen", "wortel", "haas"] },
  piraat: { ding: "kogels", emoji: "💣", doel: "🏴‍☠️", naam: "Piraten", lucht: "#80deea", vloer: "#0277bd",
    zin: "Schiet de goede kogel naar het piratenschip!", hoera: ["Boem! Raak!", "Ahoi!", "Raak!"], woorden: ["piraat", "piraten", "schip", "schat", "zee"] },
  poes: { ding: "bolletjes wol", emoji: "🧶", doel: "🐱", naam: "Poes", lucht: "#fce4ec", vloer: "#f48fb1",
    zin: "Geef de poes het goede bolletje wol!", hoera: ["Miauw!", "Prrr!", "Spinnen maar!"], woorden: ["poes", "poesje", "kat", "katten", "kitten", "wol"] },
  hond: { ding: "botten", emoji: "🦴", doel: "🐶", naam: "Hond", lucht: "#fff3e0", vloer: "#bcaaa4",
    zin: "Geef de hond het goede bot!", hoera: ["Woef!", "Kwispel kwispel!", "Woef woef!"], woorden: ["hond", "honden", "puppy", "bot", "botten"] },
  dino: { ding: "eieren", emoji: "🥚", doel: "🦖", naam: "Dino", lucht: "#fff9c4", vloer: "#a1887f",
    zin: "Breng het goede ei naar de dino!", hoera: ["Roaar!", "Stamp stamp!", "Roaaar!"], woorden: ["dino", "dino's", "dinosaurus", "trex"] },
  eenhoorn: { ding: "snoepjes", emoji: "🍬", doel: "🦄", naam: "Eenhoorn", lucht: "#f3e5f5", vloer: "#ce93d8",
    zin: "Geef de eenhoorn het goede snoepje!", hoera: ["Magisch!", "Glitter!", "Hihi!"], woorden: ["eenhoorn", "unicorn", "snoep", "snoepje", "regenboog"] },
  aap: { ding: "bananen", emoji: "🍌", doel: "🐵", naam: "Aap", lucht: "#dcedc8", vloer: "#8bc34a",
    zin: "Geef de aap de goede banaan!", hoera: ["Oe oe aa aa!", "Smikkel!", "Lekker!"], woorden: ["aap", "apen", "aapje", "banaan", "jungle", "oerwoud"] },
  kasteel: { ding: "kronen", emoji: "👑", doel: "🏰", naam: "Kasteel", lucht: "#e8eaf6", vloer: "#9fa8da",
    zin: "Breng de goede kroon naar het kasteel!", hoera: ["Koninklijk!", "Hoera voor de koning!", "Prachtig!"], woorden: ["kasteel", "prinses", "prins", "koning", "koningin", "kroon", "ridder"] },
  brand: { ding: "druppels", emoji: "💧", doel: "🔥", naam: "Brandweer", lucht: "#ffccbc", vloer: "#8d6e63",
    zin: "Blus het vuur met de goede druppel!", hoera: ["Sssst! Vuur uit!", "Geblust!", "Held!"], woorden: ["brandweer", "vuur", "brand", "blussen", "water"] },
};
// Wat doe je in het spel? Elk soort spel oefent spelling.
const SOORTEN = {
  doel: { emoji: "🎯", naam: "Raak het doel", woorden: ["gooi", "gooien", "schiet", "schieten", "scoor", "scoren", "doel", "voer", "voeren", "geef", "geven"] },
  vangen: { emoji: "🧺", naam: "Vangen", woorden: ["vang", "vangen", "vangt", "valt", "vallen", "pak", "pakken"] },
  knallen: { emoji: "💥", naam: "Knallen", woorden: ["knal", "knallen", "ballon", "ballonnen", "prik", "prikken", "pang", "kapot"] },
  doolhof: { emoji: "🧭", naam: "Doolhof", woorden: ["doolhof", "verdwaal", "verdwalen", "uitgang", "dobbel", "dobbelsteen"] },
};
// Zo wordt het spel: dit zegt Eva in de spelletjesmaker en voor het spelen.
function spelPlan(s) {
  const W = WERELDEN[s.wereld];
  const wat = {
    doel: `${W.zin} Kies ${s.op === "woord" ? "het goed geschreven woord" : "het goede stukje voor het gaatje"}.`,
    vangen: `Er vallen ${W.ding} naar beneden. Vang de ${W.ding} met het stukje dat in het gaatje past!`,
    knallen: `Er vliegen ${W.ding} omhoog. Tik alleen op de goed geschreven woorden!`,
    doolhof: `Gooi de dobbelsteen en loop door het doolhof naar de uitgang. Kies bij elke splitsing het goede woord!`,
  }[s.soort || "doel"];
  return `${wat} Zo oefen je ook spelling!`;
}
// Lees wat het kind over het spel schrijft en zoek een thema en een soort spel.
function leesVerhaal(tekst) {
  const woorden = tekst.toLowerCase().replace(/[^a-zà-ÿ'\s-]/g, " ").split(/[\s-]+/).filter(Boolean);
  const past = (lijst) => lijst.some((t) => woorden.some((w) => w === t || (t.length >= 4 && w.startsWith(t))));
  const wereld = Object.keys(WERELDEN).find((id) => WERELDEN[id].woorden && past(WERELDEN[id].woorden));
  const soort = ["doolhof", "vangen", "knallen", "doel"].find((id) => past(SOORTEN[id].woorden));
  return { wereld, soort };
}
// Spelletjes die er al zijn (bedacht door Eva). Eigen spelletjes komen erbij.
const KANT_EN_KLAAR = [
  { id: "k-basket", naam: "Basketbal", wereld: "basketbal", op: "stukje", aantal: 2 },
  { id: "k-voetbal", naam: "Voetbal", wereld: "voetbal", op: "woord", aantal: 2 },
  { id: "k-ruimte", naam: "Naar de maan", wereld: "ruimte", op: "stukje", aantal: 3 },
  { id: "k-pinguin", naam: "Pinguïn voeren", wereld: "pinguin", op: "woord", aantal: 3 },
];
const mijnSpellen = () => JSON.parse(localStorage.getItem("mijnSpellen") || "[]")
  .filter((s) => WERELDEN[s.wereld]);
const alleWereldSpellen = () => [...KANT_EN_KLAAR, ...mijnSpellen()];
const spelEmoji = (s) => (s.soort === "doolhof" ? "🧭" : WERELDEN[s.wereld].emoji);

// Knoppen onder de weg: meer spelletjes, eigen spelletjes en "maak je eigen spel".
function tekenMeerSpellen(cat) {
  const k = catSleutel(cat);
  const tegel = (s, eigen) => `
    <a class="spel-tegel ${eigen ? "eigen" : ""}" href="#wereld/${k}/${s.id}">
      <span>${spelEmoji(s)}</span>${s.naam}</a>`;
  return `
    <h3 class="spel-kop">🎮 Nog meer spelletjes</h3>
    <div class="spel-lijst">
      <a class="spel-tegel bordspel-tegel" href="#doolhof/${k}"><span>🧭</span>Doolhof</a>
      ${KANT_EN_KLAAR.map((s, i) => tegel(metFeest(s, i))).join("")}</div>
    <h3 class="spel-kop">⭐ Mijn eigen spelletjes</h3>
    <div class="spel-lijst">
      ${mijnSpellen().map((s) => tegel(s, true)).join("")}
      <a class="spel-tegel maak" href="#maak/${k}"><span>🛠️</span>Maak je eigen spel!</a>
    </div>`;
}

function wereldSpel(cat, spelId) {
  const i = KANT_EN_KLAAR.findIndex((s) => s.id === spelId);
  const spel = i >= 0 ? metFeest(KANT_EN_KLAAR[i], i) : mijnSpellen().find((s) => s.id === spelId);
  if (!spel) return categorie(cat);
  const W = WERELDEN[spel.wereld];
  const titel = `${spelEmoji(spel)} ${spel.naam}`;
  const speel = () => {
    const soort = spel.soort || "doel";
    if (soort === "doolhof") return doolhof(cat, spel);
    if (soort === "vangen" && cat.woorden.some((x) => maakGat(cat, x))) return eikels(cat, W, titel);
    if (soort === "knallen" && cat.woorden.some((x) => foutWoord(cat, x, true))) return ballonnen(cat, W, titel);
    // raak het doel (of als dit soort spel niet past bij deze categorie)
    wereldDoel(cat, { ...spel, op: soort === "doel" ? spel.op : "woord", aantal: spel.aantal || 2 }, titel);
  };
  if (!spel.id.startsWith("m-")) return speel();
  // Een eigen spel: eerst het verhaal en Eva's plan, dan spelen.
  const plan = spelPlan(spel);
  zegEekhoorn(plan);
  zeg(`${spel.naam}! ${plan}`);
  scherm.innerHTML = `
    <div class="kaart maker spel-intro" style="background:${W.lucht === "#283593" ? "#e8eaf6" : W.lucht}">
      <div class="intro-plaatje">${spelEmoji(spel)}${W.doel}</div>
      <h2>${spel.naam}</h2>
      ${spel.verhaal ? `<p class="verhaal">📖 ${spel.verhaal.replace(/</g, "&lt;")}</p>` : ""}
      <p class="eva-plan">🐿️ ${plan}</p>
      <div class="knoppen">
        <button class="grote-knop" id="speel">▶️ Spelen!</button>
        <a class="grote-knop grijs" href="#cat/${catSleutel(cat)}">Terug</a>
      </div>
      <button class="weggooien" id="weg">🗑️ Spel weggooien</button>
    </div>`;
  scherm.querySelector("#speel").onclick = speel;
  const weg = scherm.querySelector("#weg");
  weg.onclick = () => {
    if (!weg.classList.contains("zeker")) { weg.classList.add("zeker"); weg.textContent = "🗑️ Zeker weten? Tik nog een keer"; return; }
    const alle = JSON.parse(localStorage.getItem("mijnSpellen") || "[]");
    localStorage.setItem("mijnSpellen", JSON.stringify(alle.filter((s) => s.id !== spel.id)));
    location.hash = `#cat/${catSleutel(cat)}`;
  };
}

// 🎯 Raak het doel: Eva zegt een woord; op de ballen (of vissen, raketten, ...) staan stukjes of woorden.
// Tik de goede en hij vliegt naar het doel.
function wereldDoel(cat, spel, titel) {
  const W = WERELDEN[spel.wereld];
  const lijst = cat.woorden.filter((x) => foutWoord(cat, x));
  speelRonde({
    titel, cat, terug: `#cat/${catSleutel(cat)}`,
    maakVraag: (doos, antwoord) => {
      const x = schud(lijst)[0];
      const w = woord(x), g = maakGat(cat, x);
      const fouten = schud([...new Set(g.fout)]).slice(0, spel.aantal - 1);
      const goed = spel.op === "woord" ? w : g.deel;
      const opties = schud([goed, ...fouten.map((f) => (spel.op === "woord" ? g.voor + f + g.na : f))]);
      zegEekhoorn(W.zin);
      doos.innerHTML = `
        <button class="luister" title="Luister">🔊</button>
        ${tipHtml(cat)}
        ${betekenisHtml(w)}
        ${spel.op === "stukje" ? `<div class="woord-groot">${g.voor}<span class="gat">?</span>${g.na}</div>` : ""}
        <div class="veld" style="--lucht:${W.lucht};--vloer:${W.vloer}">
          <div class="doel">${W.doel}</div>
          <div class="ballen">${opties.map((o) => `
            <button class="bal ${spel.op}" data-o="${o}">
              <span class="bal-emoji">${W.emoji}</span><span class="bal-tekst">${o}</span></button>`).join("")}
          </div>
        </div>`;
      doos.querySelector(".luister").onclick = () => zeg(metZin(w));
      zeg(metZin(w));
      const doel = doos.querySelector(".doel");
      doos.querySelectorAll(".bal").forEach((b) => (b.onclick = () => {
        doos.querySelectorAll(".bal").forEach((x) => (x.disabled = true));
        const isGoed = b.dataset.o === goed;
        const gat = doos.querySelector(".gat");
        if (gat) { gat.textContent = g.deel; gat.classList.add("ingevuld"); }
        if (isGoed) {
          // de bal vliegt naar het doel
          const a = b.getBoundingClientRect(), d = doel.getBoundingClientRect();
          b.style.transform = `translate(${d.left + d.width / 2 - (a.left + a.width / 2)}px, ${d.top + d.height / 2 - (a.top + a.height / 2)}px) scale(.6) rotate(360deg)`;
          b.classList.add("vlieg");
          setTimeout(() => { doel.classList.add("raak"); zegEekhoorn(schud(W.hoera)[0]); }, 550);
        } else {
          b.classList.add("mis");
        }
        antwoord(isGoed, `Bijna! Het is ${w}. ${tip(cat)}`);
      }));
    },
  });
}

// ---------- 🛠️ maak je eigen spel ----------
function maakSpel(cat) {
  const k = catSleutel(cat);
  const keuze = { soort: "doel", wereld: "basketbal", op: "stukje", aantal: 2 };
  zegEekhoorn("Jij bent de baas! Vertel over je spel, of kies zelf wat je doet en welk thema.");
  zeg("Jij bent de baas! Vertel over je spel.");
  const knop = (id, span, naam) => `<button class="kies-knop" data-w="${id}"><span>${span}</span>${naam}</button>`;
  scherm.innerHTML = `
    <div class="kaart maker">
      <h2>🛠️ Maak je eigen spel</h2>
      <h3>✏️ Vertel over je spel</h3>
      <textarea class="spel-verhaal" maxlength="200" rows="3" placeholder="Ik wil een spel waarin een poes bolletjes wol vangt..."></textarea>
      <button class="grote-knop eva-maak" id="eva-maak">🐿️ Eva, maak het!</button>
      <h3>1. Wat doe je in het spel?</h3>
      <div class="kies-rij" data-veld="soort">${Object.entries(SOORTEN).map(([id, S]) => knop(id, S.emoji, S.naam)).join("")}</div>
      <h3>2. Kies een thema</h3>
      <div class="kies-rij" data-veld="wereld">${Object.entries(WERELDEN).filter(([, W]) => !W.feest).map(([id, W]) => knop(id, W.emoji + W.doel, W.naam)).join("")}</div>
      <div class="alleen-doel">
        <h3>3. Wat staat erop?</h3>
        <div class="kies-rij" data-veld="op">${knop("stukje", "b · p", "Een stukje")}${knop("woord", "krab · krap", "Een heel woord")}</div>
        <h3>4. Hoeveel om uit te kiezen?</h3>
        <div class="kies-rij" data-veld="aantal">${knop("2", "⚪⚪", "2")}${knop("3", "⚪⚪⚪", "3")}</div>
      </div>
      <h3 class="naam-kop">3. Hoe heet jouw spel?</h3>
      <input class="spel-naam" maxlength="24" autocomplete="off">
      <p class="eva-plan"></p>
      <div class="knoppen">
        <button class="grote-knop" id="bewaar">✅ Klaar, spelen!</button>
        <a class="grote-knop grijs" href="#cat/${k}">Terug</a>
      </div>
    </div>`;
  const naamVeld = scherm.querySelector(".spel-naam");
  const verhaalVeld = scherm.querySelector(".spel-verhaal");
  const plan = scherm.querySelector(".eva-plan");
  const toon = () => {
    scherm.querySelectorAll(".kies-rij").forEach((rij) => rij.querySelectorAll(".kies-knop").forEach((b) =>
      b.classList.toggle("gekozen", String(keuze[rij.dataset.veld]) === b.dataset.w)));
    const doel = keuze.soort === "doel";
    scherm.querySelector(".alleen-doel").hidden = !doel;
    scherm.querySelector(".naam-kop").textContent = `${doel ? 5 : 3}. Hoe heet jouw spel?`;
    naamVeld.placeholder = `Mijn ${WERELDEN[keuze.wereld].naam.toLowerCase()}spel`;
    plan.textContent = `🐿️ Zo wordt jouw spel: ${spelPlan(keuze)}`;
  };
  scherm.querySelectorAll(".kies-rij").forEach((rij) => rij.querySelectorAll(".kies-knop").forEach((b) => (b.onclick = () => {
    const v = rij.dataset.veld;
    keuze[v] = v === "aantal" ? Number(b.dataset.w) : b.dataset.w;
    geluid("eikel"); toon();
  })));
  // Eva leest wat je schreef en kiest een thema en wat je doet. Ze maakt het altijd een spellingspel.
  scherm.querySelector("#eva-maak").onclick = () => {
    const tekst = verhaalVeld.value.trim();
    if (!tekst) { zegEekhoorn("Schrijf eerst wat voor spel je wilt. Bijvoorbeeld: Ik wil een spel met een dino!"); return zeg("Schrijf eerst wat voor spel je wilt."); }
    const { wereld, soort } = leesVerhaal(tekst);
    if (wereld) keuze.wereld = wereld;
    if (soort) keuze.soort = soort;
    toon(); geluid("feest");
    const zin = wereld || soort
      ? `Leuk idee! Ik maak er een spellingspel van. ${spelPlan(keuze)}`
      : `Leuk idee! Kies hieronder nog een thema en wat je doet. ${spelPlan(keuze)}`;
    zegEekhoorn(zin); zeg(zin);
    plan.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  toon();
  scherm.querySelector("#bewaar").onclick = () => {
    const spel = { id: "m-" + Date.now(), naam: naamVeld.value.trim() || naamVeld.placeholder, ...keuze, verhaal: verhaalVeld.value.trim() };
    localStorage.setItem("mijnSpellen", JSON.stringify([...mijnSpellen(), spel]));
    feest();
    location.hash = `#wereld/${k}/${spel.id}`;
  };
}

// ---------- 🎨 zelf stickers tekenen ----------
// Teken je eigen sticker. Hij komt in de winkel; daar koop je hem met walnoten en plak je hem in je boek.
const STICKER_PRIJS = 2; // walnoten
const RUIL_EIKELS = 10; // 10 eikels = 1 walnoot
const mijnStickers = () => JSON.parse(localStorage.getItem("mijnStickers") || "[]");
const KLEUREN = ["#e53935", "#fb8c00", "#fdd835", "#43a047", "#1e88e5", "#8e24aa", "#ec407a", "#6d4c41", "#212121", "#ffffff"];
const STEMPELS = ["⭐", "❤️", "🌸", "🌈", "👀", "👄", "🎀", "👑", "✨", "🐾", "☀️", "🌙"];
// Een sticker als HTML: een emoji, of een eigen tekening ("m:<id>").
function stickerInhoud(e) {
  if (!String(e).startsWith("m:")) return e;
  const s = mijnStickers().find((x) => x.id === e.slice(2));
  return s ? `<img src="${s.src}" alt="Mijn sticker">` : "";
}

function stickermaker() {
  zegEekhoorn("Teken je eigen sticker! Kies een kleur of een stempel.");
  zeg("Teken je eigen sticker!");
  scherm.innerHTML = `
    <div class="kaart sticker-maker">
      <h2>🎨 Maak je eigen sticker</h2>
      <canvas class="teken-vel" width="480" height="480"></canvas>
      <div class="teken-rij kleuren">${KLEUREN.map((k) => `<button class="kleur-knop" data-k="${k}" style="background:${k}" aria-label="Kleur"></button>`).join("")}</div>
      <div class="teken-rij">
        <button class="dikte-knop" data-d="10" aria-label="Dun"><span style="width:.5rem;height:.5rem"></span></button>
        <button class="dikte-knop" data-d="22" aria-label="Middel"><span style="width:1rem;height:1rem"></span></button>
        <button class="dikte-knop" data-d="44" aria-label="Dik"><span style="width:1.7rem;height:1.7rem"></span></button>
        <button class="dikte-knop gum" data-gum="1">🧽 Gum</button>
        <button class="dikte-knop" id="leeg">🗑️ Opnieuw</button>
      </div>
      <div class="teken-rij stempels">${STEMPELS.map((s) => `<button class="stempel-knop" data-s="${s}">${s}</button>`).join("")}</div>
      <div class="knoppen">
        <button class="grote-knop" id="klaar">✅ Klaar!</button>
        <a class="grote-knop grijs" href="#prijzen">Terug</a>
      </div>
    </div>`;
  const vel = scherm.querySelector(".teken-vel");
  const ctx = vel.getContext("2d");
  const pen = { kleur: KLEUREN[4], dikte: 22, gum: false, stempel: null };
  const toon = () => {
    scherm.querySelectorAll(".kleur-knop").forEach((b) => b.classList.toggle("gekozen", !pen.gum && !pen.stempel && b.dataset.k === pen.kleur));
    scherm.querySelectorAll(".dikte-knop[data-d]").forEach((b) => b.classList.toggle("gekozen", !pen.stempel && Number(b.dataset.d) === pen.dikte));
    scherm.querySelector(".gum").classList.toggle("gekozen", pen.gum);
    scherm.querySelectorAll(".stempel-knop").forEach((b) => b.classList.toggle("gekozen", b.dataset.s === pen.stempel));
  };
  scherm.querySelectorAll(".kleur-knop").forEach((b) => (b.onclick = () => { pen.kleur = b.dataset.k; pen.gum = false; pen.stempel = null; toon(); }));
  scherm.querySelectorAll(".dikte-knop[data-d]").forEach((b) => (b.onclick = () => { pen.dikte = Number(b.dataset.d); pen.stempel = null; toon(); }));
  scherm.querySelector(".gum").onclick = () => { pen.gum = !pen.gum; pen.stempel = null; toon(); };
  scherm.querySelectorAll(".stempel-knop").forEach((b) => (b.onclick = () => { pen.stempel = b.dataset.s; pen.gum = false; toon(); zegEekhoorn("Tik op je tekening om te stempelen!"); }));
  scherm.querySelector("#leeg").onclick = () => { ctx.clearRect(0, 0, vel.width, vel.height); geluid("knal"); };
  toon();

  const punt = (e) => {
    const r = vel.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * vel.width, ((e.clientY - r.top) / r.height) * vel.height];
  };
  let vorige = null;
  vel.onpointerdown = (e) => {
    e.preventDefault();
    const [x, y] = punt(e);
    if (pen.stempel) {
      ctx.globalCompositeOperation = "source-over";
      ctx.font = "96px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(pen.stempel, x, y);
      geluid("eikel");
      return;
    }
    vel.setPointerCapture(e.pointerId);
    vorige = [x, y];
    lijn(x, y);
  };
  const lijn = (x, y) => {
    ctx.globalCompositeOperation = pen.gum ? "destination-out" : "source-over";
    ctx.strokeStyle = pen.kleur; ctx.lineWidth = pen.gum ? pen.dikte * 1.6 : pen.dikte;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(...vorige); ctx.lineTo(x + 0.01, y); ctx.stroke();
    vorige = [x, y];
  };
  vel.onpointermove = (e) => { if (vorige) lijn(...punt(e)); };
  vel.onpointerup = vel.onpointercancel = () => { vorige = null; };

  scherm.querySelector("#klaar").onclick = () => {
    // is er wel iets getekend?
    const pixels = ctx.getImageData(0, 0, vel.width, vel.height).data;
    let iets = false;
    for (let i = 3; i < pixels.length; i += 16) if (pixels[i] > 0) { iets = true; break; }
    if (!iets) { geluid("fout"); return zegEekhoorn("Je vel is nog leeg! Teken eerst iets moois."); }
    const klein = document.createElement("canvas"); klein.width = klein.height = 160;
    klein.getContext("2d").drawImage(vel, 0, 0, 160, 160);
    const lijst = [{ id: "s" + Date.now(), src: klein.toDataURL("image/png") }, ...mijnStickers()].slice(0, 30);
    try { localStorage.setItem("mijnStickers", JSON.stringify(lijst)); } catch (e) { return zegEekhoorn("Oei, er is geen plek meer voor stickers."); }
    feest();
    localStorage.setItem("winkelNaar", "eigen-stickers");
    location.hash = "#prijzen";
  };
}

// ---------- 📒 stickerboek ----------
const STICKERS = ("🦄 🐶 🐱 🐼 🦊 🐸 🐵 🦁 🐯 🐨 🐷 🐙 🦋 🐞 🐢 🐬 🦖 🐳 🦜 🦩 " +
  "🌈 ⭐ 🌻 🌸 🍓 🍉 🍦 🧁 🍭 🎈 🚗 🚂 ✈️ ⚽ 🏀 🎸 👑 💎 🎀 🌙").split(" ");
const geplakt = () => JSON.parse(localStorage.getItem("stickers") || "[]");
function nieuweSticker() {
  const heb = new Set(geplakt().map((s) => s.e));
  const nieuw = STICKERS.filter((e) => !heb.has(e));
  return schud(nieuw.length ? nieuw : STICKERS)[0];
}
function stickerboek() {
  const plakken = localStorage.getItem("stickerPlakken");
  zegEekhoorn(plakken
    ? "Je krijgt een sticker! Tik in je boek waar je hem wilt plakken."
    : geplakt().length ? `Je hebt al ${geplakt().length} stickers!` : "Je stickerboek is nog leeg. Kies een sticker na een spelletje!");
  if (plakken) zeg("Tik waar je je sticker wilt plakken!");
  scherm.innerHTML = `
    <div class="kaart">
      <h2>📒 Mijn stickerboek</h2>
      ${plakken ? `<div class="nieuwe-sticker">Jouw nieuwe sticker: <span>${stickerInhoud(plakken)}</span></div>` : ""}
      <div class="boek ${plakken ? "plak-modus" : ""}">${geplakt().map((s) => `
        <span class="sticker" style="left:${s.x}%;top:${s.y}%;transform:translate(-50%,-50%) rotate(${s.r || 0}deg)">${stickerInhoud(s.e)}</span>`).join("")}
      </div>
      ${plakken ? "" : `<a class="grote-knop teken-knop" href="#stickermaker">🎨 Zelf een sticker tekenen</a>`}
      <a class="grote-knop" href="#">Verder spelen</a>
    </div>`;
  if (!plakken) return;
  const boek = scherm.querySelector(".boek");
  boek.onclick = (e) => {
    const r = boek.getBoundingClientRect();
    const s = { e: plakken, x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100), r: Math.round(Math.random() * 30 - 15) };
    localStorage.setItem("stickers", JSON.stringify([...geplakt(), s]));
    localStorage.removeItem("stickerPlakken");
    geluid("knal"); feest();
    zegEekhoorn("Geplakt! Wat staat die mooi!");
    stickerboek();
    zegEekhoorn("Geplakt! Wat staat die mooi!");
  };
}

// ---------- 🎲 Eva's bordspel ----------
// Een bord met vakjes; Eva is de pion. Bij elke beurt is er een zinnetje met twee
// weggetjes (bv. ligt of licht). Kies het goede weggetje, gooi de dobbelsteen en loop vooruit.
// Vooral voor de lastige, speciale woorden.
const BORD_VRAGEN = [
  { cat: "3", zin: "Hij … in zijn bed.", plaatje: "🛌", goed: "ligt", fout: "licht", uitz: true },
  { cat: "3", zin: "Het … is aan.", plaatje: "💡", goed: "licht", fout: "ligt" },
  { cat: "3", zin: "De kip … een ei.", plaatje: "🐔🥚", goed: "legt", fout: "lecht", uitz: true },
  { cat: "3", zin: "Hij … hallo.", plaatje: "🧒💬👋", goed: "zegt", fout: "zecht", uitz: true },
  { cat: "3", zin: "Het is … buiten.", plaatje: "🌙⭐", goed: "nacht", fout: "nagt" },
  { cat: "1s", zin: "Ik drink een glas … .", plaatje: "🥛", goed: "melk", fout: "meluk" },
  { cat: "1s", zin: "We kijken een … .", plaatje: "🎬", goed: "film", fout: "filum" },
  { cat: "1s", zin: "Papa gaat naar zijn … .", plaatje: "👨‍💼💼", goed: "werk", fout: "weruk" },
  { cat: "1s", zin: "Er is een … in de lucht.", plaatje: "☁️", goed: "wolk", fout: "woluk" },
  { cat: "1s", zin: "Het is … in de zon.", plaatje: "☀️", goed: "warm", fout: "warum" },
  { cat: "1s", zin: "Ik heb … nodig!", plaatje: "🙋🆘", goed: "hulp", fout: "hulup" },
  { cat: "1s", zin: "De bel van de … luidt.", plaatje: "⛪🔔", goed: "kerk", fout: "keruk" },
  { cat: "8", zin: "De … blaft.", plaatje: "🐶💬", goed: "hond", fout: "hont" },
  { cat: "8", zin: "Ik slaap in mijn … .", plaatje: "🛏️", goed: "bed", fout: "bet" },
  { cat: "8", zin: "Het … rent in de wei.", plaatje: "🐴", goed: "paard", fout: "paart" },
  { cat: "8", zin: "… eens wat ik heb!", plaatje: "🤔❓", goed: "Raad", fout: "Raat" },
  { cat: "2", zin: "De … sist.", plaatje: "🐍", goed: "slang", fout: "slank" },
  { cat: "4", zin: "Ik zit op de … .", plaatje: "🧒🛋️", goed: "bank", fout: "bangk" },
];
// Alleen vragen van categorieën die al open zijn (als de slotjes er zijn).
function bordVragen() {
  return BORD_VRAGEN.filter((v) => {
    const c = CATEGORIEEN.find((c) => String(catSleutel(c)) === v.cat);
    if (!c) return true; // categorie (nog) niet apart, zoals speciaal hakwoord: gewoon meedoen
    return typeof isOpen !== "function" || isOpen(c);
  });
}
// Categorieën die je al mag doen: open (slotjes), of binnen je groep, of anders groep 4.
function bordCategorieen() {
  const mag = typeof isOpen === "function" ? isOpen
    : typeof binnenMijnGroep === "function" ? binnenMijnGroep
    : (c) => (c.groep || 4) <= 4;
  return CATEGORIEEN.filter((c) => mag(c) && c.woorden.some((x) => foutWoord(c, x)));
}
// Een beurt: meestal een woord dat Eva zegt (mooi of mooj?), soms een zinnetje met plaatje.
function bordVraag(stapel) {
  const cats = bordCategorieen();
  if (stapel.length && (Math.random() < 0.3 || !cats.length)) {
    const v = stapel.pop();
    return { goed: v.goed, fout: v.fout, plaatje: v.plaatje, hoor: v.zin.replace("…", v.goed), uitz: v.uitz };
  }
  const cat = schud(cats)[0];
  const x = schud(cat.woorden.filter((x) => foutWoord(cat, x)))[0];
  const w = woord(x);
  return { goed: w, fout: foutWoord(cat, x), plaatje: BETEKENIS[w] ? BETEKENIS[w].plaatje : "", hoor: metZin(w), cat };
}

// ---------- 🧭 Doolhof ----------
// Gooi de dobbelsteen en loop door het doolhof. Bij elke splitsing staan twee woorden:
// één goed geschreven, één fout. Kies de goede kant! Fout = doodlopend en 15 seconden kwijt.
// Kom je binnen 3 minuten bij de uitgang?
const DOOLHOF_B = 6, DOOLHOF_H = 5, DOOLHOF_TIJD = 180, DOOLHOF_STRAF = 15;
const DOBBEL6 = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const PIJL = { "1,0": "➡️", "-1,0": "⬅️", "0,1": "⬇️", "0,-1": "⬆️" };
const tijdTekst = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// Een willekeurig doolhof: een lange kronkelweg van linksboven naar rechtsonder,
// met hier en daar een zijpaadje dat doodloopt (daar staat het foute woord).
function maakDoolhof(poging = 0) {
  const B = DOOLHOF_B, H = DOOLHOF_H, sleutelVan = (x, y) => `${x},${y}`;
  let pad = [];
  for (let p = 0; p < 300; p++) {
    // een "perfect" doolhof met diepte-eerst graven; daarin is maar één weg naar de uitgang
    const ouder = { "0,0": null }, stapel = [[0, 0]];
    while (stapel.length) {
      const [x, y] = stapel[stapel.length - 1];
      const buren = schud([[1, 0], [-1, 0], [0, 1], [0, -1]])
        .map(([dx, dy]) => [x + dx, y + dy])
        .filter(([a, b]) => a >= 0 && b >= 0 && a < B && b < H && !(sleutelVan(a, b) in ouder));
      if (!buren.length) { stapel.pop(); continue; }
      const [a, b] = buren[0];
      ouder[sleutelVan(a, b)] = [x, y];
      stapel.push([a, b]);
    }
    pad = [];
    for (let c = [B - 1, H - 1]; c; c = ouder[sleutelVan(...c)]) pad.unshift(c);
    if (pad.length >= 14 && pad.length <= 19) break;
  }
  const opPad = new Set(pad.map((c) => sleutelVan(...c)));
  const zij = {}; // plek op het pad → doodlopend zijpaadje
  const bezet = new Set();
  let sinds = 2;
  for (let i = 1; i < pad.length - 1; i++) {
    sinds++;
    if (sinds < 1) continue;
    const [x, y] = pad[i];
    const vrij = schud([[1, 0], [-1, 0], [0, 1], [0, -1]])
      .map(([dx, dy]) => [x + dx, y + dy])
      .filter(([a, b]) => a >= 0 && b >= 0 && a < B && b < H && !opPad.has(sleutelVan(a, b)) && !bezet.has(sleutelVan(a, b)));
    if (!vrij.length) continue;
    zij[i] = vrij[0]; bezet.add(sleutelVan(...vrij[0])); sinds = 0;
  }
  // genoeg splitsingen? Anders nog een keer
  if (Object.keys(zij).length < 6 && poging < 30) return maakDoolhof(poging + 1);
  return { pad, zij };
}

// De woorden voor de splitsingen: van één categorie, of een mix van wat je al mag.
function doolhofWoorden(cat) {
  if (!cat) {
    let stapel = schud(bordVragen());
    return () => { if (!stapel.length) stapel = schud(bordVragen()); return bordVraag(stapel); };
  }
  const lijst = cat.woorden.filter((x) => foutWoord(cat, x));
  let rij = [];
  return () => {
    if (!rij.length) rij = schud(lijst);
    const x = rij.pop(), w = woord(x);
    return { goed: w, fout: foutWoord(cat, x), plaatje: BETEKENIS[w] ? BETEKENIS[w].plaatje : "", hoor: metZin(w), cat };
  };
}

function doolhof(cat, spel) {
  const hier = location.hash;
  const W = spel ? WERELDEN[spel.wereld] : null;
  const uitgang = W ? W.doel : "🚪";
  const titel = spel ? `🧭 ${spel.naam}` : "🧭 Doolhof";
  const terug = cat ? `#cat/${catSleutel(cat)}` : "#";
  const opnieuw = () => doolhof(cat, spel);
  const volgendWoord = doolhofWoorden(cat);
  const { pad, zij } = maakDoolhof();
  const L = pad.length;
  let plek = 0, tijd = DOOLHOF_TIJD, klok = null, goed = 0, fout = 0, bezig = false, over = false;
  let vraag = null; // { v, rest } als je bij een splitsing staat
  let opZij = null; // even in het doodlopende paadje
  const opgelost = {}; // splitsing i → "goed" of "fout"
  const woordOp = {}; // "x,y" → { tekst, soort }

  zegEekhoorn(`Kom jij het doolhof uit? Gooi de dobbelsteen! Bij een splitsing kies je het goede woord. Je hebt 3 minuten.`);
  zeg("Kom jij het doolhof uit? Gooi de dobbelsteen!");
  scherm.innerHTML = `
    <div class="kaart doolhof-kaart" ${cat ? `style="border-color:${cat.kleur}"` : ""}>
      <div class="voortgang">${titel}</div>
      <div class="levens-balk"><span class="klok">⏱️ ${tijdTekst(tijd)}</span><span class="pot">🌰 0</span></div>
      <div class="doolhof" style="grid-template-columns:repeat(${DOOLHOF_B - 1}, 1fr .28fr) 1fr"></div>
      <div id="beurt"></div>
      <a class="terug" href="${terug}">← Stoppen</a>
    </div>`;
  const veld = scherm.querySelector(".doolhof");
  const beurtDoos = scherm.querySelector("#beurt");
  const k = (c) => `${c[0]},${c[1]}`;
  const padIndex = new Map(pad.map((c, i) => [k(c), i]));
  const zijVan = new Map(Object.entries(zij).map(([i, c]) => [k(c), Number(i)]));

  const zichtbaar = (c) => {
    const i = padIndex.get(k(c));
    if (i !== undefined) return i <= plek || i === L - 1 || (vraag && i === plek + 1) || opgelost[i - 1];
    const j = zijVan.get(k(c));
    return j !== undefined && (opgelost[j] || (vraag && j === plek));
  };
  const verbonden = (a, b) => {
    const i = padIndex.get(k(a)), j = padIndex.get(k(b));
    if (i !== undefined && j !== undefined && Math.abs(i - j) === 1) return true;
    const za = zijVan.get(k(a)), zb = zijVan.get(k(b));
    return (za !== undefined && za === j) || (zb !== undefined && zb === i);
  };
  const teken = () => {
    const vakjes = [];
    for (let ty = 0; ty < DOOLHOF_H * 2 - 1; ty++) {
      for (let tx = 0; tx < DOOLHOF_B * 2 - 1; tx++) {
        let klasse = "heg", inhoud = "";
        if (tx % 2 === 0 && ty % 2 === 0) {
          const c = [tx / 2, ty / 2];
          if (zichtbaar(c)) {
            klasse = "gang";
            const i = padIndex.get(k(c)), j = zijVan.get(k(c));
            if (i === 0) inhoud = "🏁";
            if (i === L - 1) { klasse += " uitgang"; inhoud = uitgang; }
            if (j !== undefined && opgelost[j]) { klasse += " dood"; inhoud = "🧱"; }
            const w = woordOp[k(c)];
            if (w) inhoud += `<span class="gang-woord ${w.soort}">${w.tekst}</span>`;
            if ((opZij ? k(opZij) === k(c) : i === plek)) inhoud += figuurHtml("pion");
          }
        } else if (tx % 2 !== ty % 2) {
          // gangetje tussen twee vakjes
          const a = [Math.floor(tx / 2), Math.floor(ty / 2)];
          const b = tx % 2 ? [a[0] + 1, a[1]] : [a[0], a[1] + 1];
          if (zichtbaar(a) && zichtbaar(b) && verbonden(a, b)) klasse = "gang tussen";
        }
        vakjes.push(`<div class="dh ${klasse} ${tx % 2 || ty % 2 ? "" : "cel"}">${inhoud}</div>`);
      }
    }
    veld.innerHTML = vakjes.join("");
  };

  const startKlok = () => {
    if (klok) return;
    klok = setInterval(() => {
      if (location.hash !== hier || over) return clearInterval(klok);
      tijd = Math.max(0, tijd - 1);
      toonKlok();
      if (tijd === 0) tijdOp();
    }, 1000);
  };
  const toonKlok = () => {
    const kl = scherm.querySelector(".klok");
    if (!kl) return;
    kl.textContent = `⏱️ ${tijdTekst(tijd)}`;
    kl.classList.toggle("bijna", tijd <= 30);
  };

  const gooiKnop = () => {
    vraag = null;
    beurtDoos.innerHTML = `<button class="grote-knop gooi">🎲 Gooi!</button>`;
    beurtDoos.querySelector(".gooi").onclick = gooi;
  };
  const gooi = async () => {
    if (bezig || over) return; bezig = true;
    startKlok();
    const knop = beurtDoos.querySelector(".gooi");
    knop.disabled = true;
    const worp = 1 + Math.floor(Math.random() * 6);
    for (let r = 0; r < 6; r++) { knop.textContent = DOBBEL6[Math.floor(Math.random() * 6)]; await wacht(80); }
    beurtDoos.innerHTML = `<div class="dobbel">${DOBBEL6[worp - 1]}</div>`;
    zegEekhoorn(`Je gooit ${worp}!`);
    geluid("eikel");
    await wacht(600);
    loop(worp);
  };
  const loop = async (stappen) => {
    bezig = true;
    for (let s = 0; s < stappen; s++) {
      if (over || location.hash !== hier) return;
      if (zij[plek] && !opgelost[plek]) return stelVraag(stappen - s);
      plek++; teken(); geluid("eikel");
      await wacht(330);
      if (plek === L - 1) return uit();
    }
    bezig = false;
    gooiKnop();
  };

  const stelVraag = (rest) => {
    const v = volgendWoord();
    // het goede woord staat altijd op de echte weg, het foute op het doodlopende paadje
    const echt = pad[plek + 1], nep = zij[plek];
    woordOp[k(echt)] = { tekst: v.goed, soort: "" };
    woordOp[k(nep)] = { tekst: v.fout, soort: "" };
    vraag = { v, rest };
    teken();
    const hierC = pad[plek];
    const pijl = (c) => PIJL[`${c[0] - hierC[0]},${c[1] - hierC[1]}`];
    const opties = schud([{ c: echt, w: v.goed, goed: true }, { c: nep, w: v.fout, goed: false }]);
    beurtDoos.innerHTML = `
      <div class="splits-vraag">
        <button class="luister" title="Luister">🔊</button>
        ${v.plaatje ? `<button class="betekenis klein" aria-label="Plaatje">${v.plaatje}</button>` : ""}
        <div class="splits-knoppen">${opties.map((o, n) => `
          <button class="splits-knop" data-n="${n}"><span>${pijl(o.c)}</span>${o.w}</button>`).join("")}</div>
      </div>`;
    zegEekhoorn("Een splitsing! Welke kant is goed geschreven?");
    zeg(v.hoor);
    beurtDoos.querySelectorAll(".luister, .betekenis").forEach((b) => (b.onclick = () => zeg(v.hoor)));
    beurtDoos.querySelectorAll(".splits-knop").forEach((b) => (b.onclick = () => kies(opties[b.dataset.n], b)));
  };

  const kies = async (o, knop) => {
    if (!vraag || vraag.bezig) return;
    vraag.bezig = true;
    const { v, rest } = vraag;
    beurtDoos.querySelectorAll(".splits-knop").forEach((b) => (b.disabled = true));
    if (o.goed) {
      goed++; knop.classList.add("goed"); geluid("goed"); eikelVlieg();
      scherm.querySelector(".pot").textContent = `🌰 ${goed}`;
      zegEekhoorn(schud(["Goed zo! Die kant op!", "Super! Goed geschreven!", "Ja! Verder maar!"])[0]);
      opgelost[plek] = "goed";
      woordOp[k(pad[plek + 1])].soort = "goed";
      delete woordOp[k(zij[plek])];
      vraag = null;
      await wacht(700);
      beurtDoos.innerHTML = "";
      loop(rest);
    } else {
      fout++; knop.classList.add("fout"); geluid("fout");
      tijd = Math.max(0, tijd - DOOLHOF_STRAF); toonKlok();
      const kl = scherm.querySelector(".klok"); kl.classList.remove("au"); void kl.offsetWidth; kl.classList.add("au");
      // je loopt het doodlopende paadje in en botst tegen de muur
      opZij = zij[plek]; teken();
      await wacht(500);
      opgelost[plek] = "fout";
      woordOp[k(zij[plek])].soort = "fout";
      woordOp[k(pad[plek + 1])].soort = "goed";
      teken();
      zegEekhoorn(`Oei, doodlopend! Zo schrijf je het: ${v.goed}. Dat kost ${DOOLHOF_STRAF} seconden.`);
      zeg(`Oei, doodlopend! Kijk goed, zo schrijf je het.`);
      beurtDoos.querySelector(`.splits-knop:not(.fout)`).classList.add("goed");
      await wacht(2000);
      if (over || location.hash !== hier) return;
      opZij = null; vraag = null; teken();
      if (tijd === 0) return tijdOp();
      bezig = false;
      gooiKnop();
    }
  };

  const tijdOp = () => {
    if (over) return;
    over = true; clearInterval(klok);
    geluid("fout");
    zegEekhoorn("Oei, de tijd is op! Geen punten deze keer. Probeer het nog een keer!");
    zeg("Oei, de tijd is op! Probeer het nog een keer!");
    scherm.innerHTML = `
      <div class="kaart eind">
        <div class="groot-sterren">⏰</div>
        <p>De tijd is op. Deze keer geen punten.</p>
        <p class="regel">${cat ? tip(cat) : "Kijk goed naar elk woord!"}</p>
        <div class="knoppen">
          <button class="grote-knop" id="nog">🔁 Nog een keer</button>
          <a class="grote-knop" href="${terug}">Terug</a>
        </div>
      </div>`;
    scherm.querySelector("#nog").onclick = opnieuw;
  };
  const uit = async () => {
    over = true; clearInterval(klok);
    geluid("feest");
    zeg("Hoera! Je bent het doolhof uit!");
    await wacht(900);
    if (location.hash !== hier) return;
    const n = fout === 0 && tijd >= 60 ? 3 : fout <= 2 ? 2 : 1;
    eindScherm({ cat, n, tekst: `${uitgang} Je bent eruit, met nog ${tijdTekst(tijd)} op de klok! Je had ${goed} goed en ${fout} fout.`, verdiend: goed, opnieuw, terug });
  };

  teken();
  gooiKnop();
}
