const lijst = document.getElementById("categorieen");
const uki = document.querySelector(".speech");

for (const cat of CATEGORIEEN) {
  const li = document.createElement("li");
  const knop = document.createElement("button");
  knop.className = "tegel";
  knop.style.background = cat.kleur;
  knop.innerHTML = `<span class="nr">${cat.nr}</span><span class="naam">${cat.naam}</span>`;
  knop.addEventListener("click", () => {
    uki.textContent = `${cat.naam}! Die gaan we binnenkort samen oefenen.`;
  });
  li.appendChild(knop);
  lijst.appendChild(li);
}
