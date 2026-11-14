// ---------- 📖 Verhaaltjes: wat mist er? ----------
// Eva leest een kort verhaal voor. Soms mist er een stukje van een woord, soms een
// heel woord. Het kind kiest wat er mist. Alleen woorden van categorieën die al
// open zijn worden een gaatje; de andere woorden staan er gewoon.
//
// In een zin staat een gaatje zo: [woord:nr] of [woord:nr:ander].
//   nr    = de Staal-categorie van het woord.
//   ander = een goed geschreven woord dat NIET in het verhaal past. Dan kan het gaatje
//           ook een heel woord zijn: kies het woord dat past en goed geschreven is.
// Zonder "ander" mist er altijd een stukje van het woord (en zegt Eva het woord).
const VERHALEN = [
  // ---------- groep 4 ----------
  {
    id: "nacht", emoji: "🌙", titel: "Een nacht in het bos",
    zinnen: [
      "Het is [nacht:3:lucht] in het bos.",
      "Eva Eekhoorn zit in haar [boom:1].",
      "Ze kijkt naar de [maan:1].",
      "Ze hoort een [kraai:6:haai] in de boom.",
      "De wind is [zacht:3:recht].",
      "Dan ziet ze een [licht:3] tussen de bomen.",
      "Het is een [beer:5:peer] met een lamp!",
      "Eva is niet [bang:2] meer.",
      "Samen zingen ze een [mooi:6:kooi] liedje.",
    ],
  },
  {
    id: "sneeuw", emoji: "❄️", titel: "De leeuw in de sneeuw",
    zinnen: [
      "Het is winter en er ligt veel [sneeuw:7:meeuw].",
      "Eva ziet een [leeuw:7:eeuw] onder een boom.",
      "De leeuw heeft het koud aan zijn [oor:5:deur].",
      "Eva geeft hem een warme [hoed:8:voet].",
      "Ook krijgt hij een sjaal. Die is helemaal [nieuw:7]!",
      "De leeuw is nu heel [vrolijk:12:moeilijk].",
      "Ze zitten samen op een [bank:4:pink].",
    ],
  },
  {
    id: "feest", emoji: "🎂", titel: "Eva is jarig",
    zinnen: [
      "Eva is jarig. Ze bakt een grote [taart:8:paard].",
      "Haar vriendjes komen binnen door de [deur:5:geur].",
      "Muis heeft een klein [stoeltje:11] voor haar gemaakt.",
      "Er is [veel:5] limonade en een pan [soep:1:boot].",
      "De [koei:6:kooi] komt ook en zegt: boe!",
      "Het is een heel [gezellig:12:lastig] feest!",
    ],
  },
  {
    id: "zee", emoji: "🦀", titel: "Bij opa aan zee",
    zinnen: [
      "Eva gaat op [bezoek:9:verdriet] bij opa.",
      "Opa woont aan zee in een huis met grote [ramen:10].",
      "Op het strand ligt een gouden [ring:2:tong].",
      "Opa vangt een [krab:8] en een [vis:1].",
      "De krab knijpt opa in zijn [pink:4:bank].",
      "Eva moet hard lachen. Wat een [verhaal:9:gebak]!",
    ],
  },
  // ---------- groep 5 ----------
  {
    id: "circus", emoji: "🎪", titel: "Naar het circus",
    zinnen: [
      "Eva gaat ['s avonds:14] naar het [circus:15:cijfer].",
      "Er is een [clown:18:cactus] met een rode neus.",
      "Hij gooit met drie [pizza's:16:baby's]!",
      "Dan komt er een [piloot:13:liter] met een vliegtuigje.",
      "In de pauze drinkt Eva een glas [cola:18:clown].",
      "Het was [fantastisch:19:logisch]!",
    ],
  },
  {
    id: "vakantie", emoji: "🏕️", titel: "Op vakantie",
    zinnen: [
      "Eva gaat op [vakantie:17:politie] naar een warm land.",
      "Ze slapen op een [camping:18:computer].",
      "Daar is het weer heel [tropisch:19:komisch].",
      "Opa maakt veel [foto's:16:opa's].",
      "Eva eet een groene [kiwi:13:radio].",
      "Een ijsje kost vijftig [cent:15:cel].",
      "Ze slapen ['s nachts:14] in een tent.",
    ],
  },
  // ---------- groep 6 ----------
  {
    id: "chef", emoji: "🧑‍🍳", titel: "Chef Eva",
    zinnen: [
      "Eva wil later [chef:21:taxi] worden.",
      "Ze maakt een taart van [chocola:21:thermometer].",
      "Ze drinkt er een kopje [thee:22:thema] bij.",
      "De taart is een [cadeau:24:bureau] voor oma.",
      "Eva brengt de taart met een [taxi:20:mixer].",
      "Oma woont op de derde [etage:26:garage].",
      "Ook de [pony:27:lolly] van oma krijgt een stukje!",
    ],
  },
  // ---------- groep 7 en 8 ----------
  {
    id: "film", emoji: "🎬", titel: "Eva maakt een film",
    zinnen: [
      "Eva zit lekker in de [zonneschijn:32:zonnebloem].",
      "Ze kijkt door een [verrekijker:32] naar de zee.",
      "In het water ziet ze een [zee-egel:30:tv-gids].",
      "Eva heeft veel [ideeën:33:feeën].",
      "Ze maakt een [documentaire:29:militair] over de zee.",
      "De film wordt heel [populair:29:solitair].",
      "Iedereen vindt hem [absoluut:34:abnormaal] geweldig!",
    ],
  },
];

const GAATJE = /\[([^:\]]+):(\w+)(?::([^\]]+))?\]/g;

// Het woord zoals het in de categorie staat (soms een object met een eigen lastig stukje).
function verhaalWoord(cat, w) {
  return cat.woorden.find((x) => woord(x) === w) || w;
}

// Maak van een verhaal een lijst met stukjes tekst en gaatjes.
// Alleen woorden van open categorieën worden een gaatje.
function leesVerhaalZinnen(v) {
  const mag = typeof isOpen === "function" ? isOpen : () => true;
  let n = 0;
  const zinnen = v.zinnen.map((zin) => {
    const delen = [];
    let laatst = 0;
    zin.replace(GAATJE, (heel, w, nr, ander, plek) => {
      delen.push({ tekst: zin.slice(laatst, plek) });
      laatst = plek + heel.length;
      const cat = vindCat(nr);
      const x = cat && verhaalWoord(cat, w);
      const g = cat && mag(cat) && maakGat(cat, x);
      if (!g) { delen.push({ tekst: w }); return heel; }
      // Een heel woord missen kan alleen met een ander woord, en een fout woord dat geen echt woord is.
      const fout = ander && foutWoord(cat, x, true);
      const heelWoord = !!fout && Math.random() < 0.5;
      delen.push({ gat: n++, w, cat, x, g, heelWoord, ander, fout });
      return heel;
    });
    delen.push({ tekst: zin.slice(laatst) });
    return delen;
  });
  return { zinnen, aantal: n };
}
const aantalGaatjes = (v) => leesVerhaalZinnen(v).aantal;
const zinTekst = (delen, gatTekst) => delen.map((d) => (d.gat === undefined ? d.tekst : gatTekst(d))).join("");

// ---------- de lijst met verhaaltjes ----------
function verhalenLijst() {
  zegEekhoorn("Kies een verhaaltje! Ik lees het voor. Kun jij vinden wat er mist?");
  zeg("Kies een verhaaltje! Kun jij vinden wat er mist?");
  const best = JSON.parse(localStorage.getItem("verhaalSterren") || "{}");
  scherm.innerHTML = `
    <div class="kaart verhalen-lijst">
      <h2>📖 Verhaaltjes</h2>
      <p class="regel">Eva leest een verhaal voor. Soms mist er een stukje, soms een heel woord. Wat mist er?</p>
      <div class="spel-lijst">${VERHALEN.map((v) => {
        const open = aantalGaatjes(v) >= 2;
        return open
          ? `<a class="spel-tegel verhaal-tegel" href="#verhaal/${v.id}"><span>${v.emoji}</span>${v.titel}
              <small class="steen-sterren">${sterTekst(best[v.id] || 0)}</small></a>`
          : `<div class="spel-tegel verhaal-tegel dicht"><span>🔒</span>${v.titel}
              <small>Maak eerst meer categorieën open</small></div>`;
      }).join("")}</div>
      <a class="terug" href="#">← Terug</a>
    </div>`;
}

// ---------- een verhaaltje spelen ----------
function verhaaltje(id) {
  const v = VERHALEN.find((x) => x.id === id);
  if (!v) return verhalenLijst();
  const { zinnen, aantal } = leesVerhaalZinnen(v);
  if (aantal < 2) return verhalenLijst();
  const hier = location.hash;
  const opnieuw = () => verhaaltje(id);
  const gaatjes = zinnen.flat().filter((d) => d.gat !== undefined);
  let nu = 0, goed = 0, levens = LEVENS;

  scherm.innerHTML = `
    <div class="kaart verhaal-spel">
      <div class="voortgang">📖 ${v.titel}</div>
      <div class="levens-balk"><span class="levens">${hartjes(levens)}</span><span class="pot">🌰 ${goed}</span></div>
      <div class="verhaal-boek">${zinnen.map((delen, z) => `<span class="zin" data-z="${z}">${delen.map((d) =>
        d.gat === undefined ? d.tekst.replace(/</g, "&lt;") : `<span class="vgat" data-gat="${d.gat}"></span>`).join("")}</span>`).join(" ")}
      </div>
      <div id="vraag"></div>
      <a class="terug" href="#verhaal">← Stoppen</a>
    </div>`;
  const vraag = scherm.querySelector("#vraag");
  const gatEl = (i) => scherm.querySelector(`.vgat[data-gat="${i}"]`);
  const zinVan = (d) => zinnen.findIndex((delen) => delen.includes(d));
  // Zo staat een gaatje in het verhaal: nog leeg, of al ingevuld.
  const tekenGat = (d, ingevuld) => {
    const e = gatEl(d.gat);
    e.className = `vgat ${ingevuld ? "af" : ""} ${d.gat === nu && !ingevuld ? "nu" : ""}`;
    e.innerHTML = ingevuld ? gekleurd(d.cat, d.x)
      : d.heelWoord ? `<span class="gat heel">${"?".repeat(Math.min(d.w.length, 6))}</span>`
      : `${d.g.voor}<span class="gat">?</span>${d.g.na}`;
  };
  gaatjes.forEach((d) => tekenGat(d, false));
  // Wat Eva zegt: de zin met het woord, of bij een heel woord "hmm" op die plek.
  const hoorZin = (d) => zinTekst(zinnen[zinVan(d)], (e) => (e === d && d.heelWoord ? "hmm" : e.w));

  const volgende = () => {
    if (nu === gaatjes.length) return klaar();
    const d = gaatjes[nu];
    tekenGat(d, false);
    scherm.querySelectorAll(".zin").forEach((z) => z.classList.toggle("nu", Number(z.dataset.z) === zinVan(d)));
    gatEl(nu).scrollIntoView({ behavior: "smooth", block: "center" });
    const opties = d.heelWoord ? schud([d.w, d.fout, d.ander]) : schud([d.g.deel, ...d.g.fout]);
    const vraagTekst = d.heelWoord ? "Er mist een woord. Welk woord past, en is goed geschreven?" : "Er mist een stukje. Welk stukje past?";
    zegEekhoorn(vraagTekst);
    vraag.innerHTML = `
      <div class="verhaal-vraag">
        <button class="luister" title="Luister nog een keer">🔊</button>
        <span class="verhaal-cat" style="background:${d.cat.kleur}">${d.cat.figuur} ${d.cat.nr} ${d.cat.naam}</span>
      </div>
      <p class="verhaal-wat">${d.heelWoord ? "🧐 Welk woord mist er?" : "🧩 Welk stukje mist er?"}</p>
      <div class="${d.heelWoord ? "twee-keuzes" : "keuzes"}">${opties.map((o) =>
        `<button class="${d.heelWoord ? "woordkaart" : "keuze"}" data-o="${o}">${o}</button>`).join("")}</div>`;
    const lees = () => zeg(hoorZin(d));
    vraag.querySelector(".luister").onclick = lees;
    lees();
    vraag.querySelectorAll("[data-o]").forEach((k) => (k.onclick = async () => {
      vraag.querySelectorAll("[data-o]").forEach((b) => (b.disabled = true));
      const juist = d.heelWoord ? d.w : d.g.deel;
      const isGoed = k.dataset.o === juist;
      k.classList.add(isGoed ? "goed" : "fout");
      vraag.querySelector(`[data-o="${CSS.escape(juist)}"]`).classList.add("goed");
      tekenGat(d, true);
      if (isGoed) {
        goed++; geluid("goed"); eikelVlieg();
        scherm.querySelector(".pot").textContent = `🌰 ${goed}`;
        zegEekhoorn(schud(["Goed zo!", "Super!", "Top!", "Knap gevonden!"])[0]); zeg("Goed zo!");
      } else {
        levens--; geluid("fout");
        const uitleg = d.heelWoord && k.dataset.o === d.ander
          ? `Dat woord past niet in het verhaal. Het is ${d.w}.`
          : `Bijna! Het is ${d.w}. ${tip(d.cat)}`;
        zegEekhoorn(uitleg); zeg(uitleg);
        const l = scherm.querySelector(".levens");
        l.textContent = hartjes(levens); l.classList.add("au");
      }
      nu++;
      await wacht(isGoed ? 1000 : 2800);
      if (location.hash !== hier) return;
      if (levens === 0) return levensOp({ cat: null, opnieuw, terug: "#verhaal" });
      volgende();
    }));
  };

  // Het verhaal is af: lees het nog een keer helemaal voor, en dan de sterren.
  const klaar = () => {
    scherm.querySelectorAll(".zin").forEach((z) => z.classList.remove("nu"));
    const heel = zinnen.map((delen) => zinTekst(delen, (d) => d.w)).join(" ");
    zegEekhoorn("Het verhaal is af! Luister maar.");
    vraag.innerHTML = `
      <p class="verhaal-wat">🎉 Het verhaal is af!</p>
      <div class="knoppen">
        <button class="grote-knop" id="voorlezen">🔊 Lees voor</button>
        <button class="grote-knop" id="verder">⭐ Verder</button>
      </div>`;
    vraag.querySelector("#voorlezen").onclick = () => zeg(heel);
    vraag.querySelector("#verder").onclick = () => {
      const n = goed === aantal ? 3 : goed >= aantal * 0.6 ? 2 : goed >= 1 ? 1 : 0;
      const best = JSON.parse(localStorage.getItem("verhaalSterren") || "{}");
      best[v.id] = Math.max(best[v.id] || 0, n);
      localStorage.setItem("verhaalSterren", JSON.stringify(best));
      eindScherm({ cat: null, n, tekst: `Je vond ${goed} van de ${aantal} gaatjes.`, verdiend: goed, opnieuw, terug: "#verhaal" });
    };
    zeg(heel);
  };
  volgende();
}
