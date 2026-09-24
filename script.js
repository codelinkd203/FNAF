(() => {
  // Folders are relative to the page this index.html lives in.
  // If you put the picker somewhere other than the site root, change BASE (e.g. "../").
  const BASE = "";

  const GAMES = [
    { dir: "fnaf-1",                  name: "Five Nights at Freddy's" },
    { dir: "fnaf-2",                  name: "Five Nights at Freddy's 2" },
    { dir: "fnaf-3",                  name: "Five Nights at Freddy's 3" },
    { dir: "fnaf-4",                  name: "Five Nights at Freddy's 4" },
    { dir: "fnaf-sister-location",    name: "Sister Location" },
    { dir: "fnaf-pizzeria-simulator", name: "Pizzeria Simulator" },
    { dir: "fnaf-ucn",                name: "Ultimate Custom Night" },
    { dir: "fnaf-world",              name: "FNaF World" }
  ];

  const stage  = document.getElementById("stage");
  const menu   = document.getElementById("menu");
  const prompt = document.getElementById("prompt");
  const footer = document.getElementById("footerImg");

  const scenes = [];
  const links  = [];
  let current = -1;
  let leaving = false;

  function makeImg(cls, src, onFail) {
    const img = new Image();
    img.className = cls;
    img.alt = "";
    img.decoding = "async";
    img.addEventListener("error", () => { img.remove(); if (onFail) onFail(); });
    img.dataset.src = src;
    return img;
  }

  GAMES.forEach((game, i) => {
    const path = `${BASE}${game.dir}/`;
    const res  = `${path}resources/`;

    // --- scene (built now, images loaded on first use) ---
    const scene = document.createElement("div");
    scene.className = "scene";

    const titleText = document.createElement("div");
    titleText.className = "scene-title-text";
    titleText.textContent = game.name;
    titleText.hidden = true;

    scene.append(
      makeImg("scene-office",      `${res}office.png`),
      makeImg("scene-gif",         `${res}background.gif`),
      makeImg("scene-vignette",    `${res}vignette.png`),
      Object.assign(document.createElement("div"), { className: "scene-shade" }),
      makeImg("scene-animatronic", `${res}animatronic.png`),
      makeImg("scene-title",       `${res}title.png`, () => { titleText.hidden = false; }),
      titleText
    );
    stage.append(scene);
    scenes.push(scene);

    // --- menu link ---
    const a = document.createElement("a");
    a.href = path;
    a.textContent = game.name;
    a.addEventListener("mouseenter", () => select(i));
    a.addEventListener("focus",      () => select(i));
    a.addEventListener("click", (e) => { e.preventDefault(); go(i); });
    menu.append(a);
    links.push(a);
  });

  function load(scene) {
    if (scene.dataset.loaded) return;
    scene.dataset.loaded = "1";
    scene.querySelectorAll("img[data-src]").forEach((img) => { img.src = img.dataset.src; });
  }

  function select(i) {
    if (leaving || i === current) return;
    current = i;
    scenes.forEach((s, n) => {
      if (n === i) load(s);
      s.classList.toggle("is-active", n === i);
    });
    links.forEach((l, n) => l.classList.toggle("is-active", n === i));
    try { localStorage.setItem("fnaf-picker-last", String(i)); } catch (_) {}
  }

  function go(i) {
    if (leaving) return;
    select(i);
    leaving = true;
    prompt.textContent = "BOOTING UP ARCHIVE...";
    document.body.classList.add("is-leaving");
    setTimeout(() => { window.location.href = links[i].href; }, 650);
  }

  // Keyboard: up/down to move, Enter to launch
  document.addEventListener("keydown", (e) => {
    if (leaving) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault(); links[(current + 1) % GAMES.length].focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault(); links[(current - 1 + GAMES.length) % GAMES.length].focus();
    } else if (e.key === "Enter" && current >= 0 && document.activeElement.tagName !== "A") {
      go(current);
    }
  });

  // Footer image is optional — hide it cleanly if it's missing
  footer.addEventListener("error", () => { footer.style.display = "none"; });

  // Restore last pick, or start on the first game
  let start = 0;
  try {
    const saved = parseInt(localStorage.getItem("fnaf-picker-last"), 10);
    if (saved >= 0 && saved < GAMES.length) start = saved;
  } catch (_) {}
  select(start);

  // Warm the other scenes' art after the first one settles
  setTimeout(() => scenes.forEach(load), 1500);

  // Back/forward cache: reset the leave state
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      leaving = false;
      document.body.classList.remove("is-leaving");
      prompt.textContent = "SELECT AN ARCHIVE";
    }
  });
})();