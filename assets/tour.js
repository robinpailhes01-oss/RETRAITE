/* ============================================================
   NATURE — Visite virtuelle 360° du camp
   Moteur : Pannellum (multi-scènes) + navigation + fiches zones
   ============================================================ */

const ZONES = {
  entree: {
    icon: "⛩",
    eyebrow: "Le seuil",
    title: "L'Arrivée",
    pitch: "On laisse la voiture à l'entrée. Dès les premiers pas, le bruit du monde s'éteint : gravier, odeur de résine, le camp se dévoile au bout du sentier.",
    features: [
      "Parking discret en lisière, hors de vue du camp",
      "Accueil en cabane bois — check-in sans comptoir, autour d'un thé",
      "Casier à chaussures de trail & prêt de matériel",
      "Premier point de vue sur la vallée"
    ],
    mood: "Transition. Le passage du quotidien au lieu. On ralentit, on respire, on coupe les notifications. Le ton est donné avant même d'avoir posé son sac.",
    // Prompt 360° équirectangulaire pour Blockade Labs Skybox AI
    prompt: "360 equirectangular panorama, wooden welcome cabin at the entrance of a luxury nature retreat, gravel path leading into a misty pine forest, mountain valley in the distance, warm soft morning light, minimalist Scandinavian design, photorealistic, seamless"
  },
  commun: {
    icon: "🍃",
    eyebrow: "Le point social",
    title: "Le Cœur — Restaurant & Coworking",
    pitch: "Le centre névralgique du camp. Cuisine ouverte, grande table commune, terrasse panoramique. C'est ici que tout le monde se croise : on mange ensemble, on bosse, on échange.",
    features: [
      "Cuisine ouverte — produits locaux, nutrition adaptée aux sportifs",
      "Grande table d'hôtes + petites tables pour l'intimité",
      "Coin coworking lumineux, wifi fibre, prises partout",
      "Terrasse panoramique plein sud, lounge avec cheminée",
      "Bar à jus / café de spécialité"
    ],
    mood: "Chaleureux et vivant, sans être bruyant. L'odeur du café le matin, le crépitement du feu le soir. Le lieu où naissent les conversations entre entrepreneurs.",
    prompt: "360 equirectangular panorama, interior of an open-plan mountain lodge restaurant with floor-to-ceiling windows, communal wooden table, open kitchen, panoramic alpine view, plants, warm pendant lighting, coworking nooks, premium rustic-modern, photorealistic, seamless"
  },
  sport: {
    icon: "🏋",
    eyebrow: "Le terrain de jeu",
    title: "La Zone Sport",
    pitch: "À 2 minutes à pied du Cœur, à l'écart pour le bruit et l'énergie. Une box CrossFit semi-couverte ouverte sur la montagne, un rig outdoor, et le départ des sentiers de trail.",
    features: [
      "Box CrossFit semi-couverte ~150 m², sol fonctionnel",
      "Rig outdoor : pull-up bars, anneaux, cordes",
      "Zone haltéro & functional fitness équipée",
      "Départ de boucles trail balisées (5/10/15 km)",
      "Parcours d'obstacles naturel si le terrain le permet"
    ],
    mood: "Brut et motivant. On s'entraîne face au paysage, au grand air. L'effort partagé crée du lien. Ni salle aseptisée, ni camp militaire — performance et plaisir.",
    prompt: "360 equirectangular panorama, semi-covered outdoor CrossFit box in the mountains, open wooden structure, functional training rig with barbells and rings, dramatic peaks all around, raw premium aesthetic, sunrise light, photorealistic, seamless"
  },
  wellness: {
    icon: "♨",
    eyebrow: "Le point calme",
    title: "La Zone Wellness",
    pitch: "Le sanctuaire du camp, posé sur le point le plus calme avec la plus belle vue. Le contraste chaud-froid : sauna finlandais puis bain nordique glacé face aux sommets.",
    features: [
      "Sauna finlandais panoramique en bois",
      "Hammam & douches extérieures",
      "Bain nordique (eau froide) face à la vue",
      "Piscine naturelle / bassin de baignade biologique",
      "Deck yoga & méditation au lever du soleil"
    ],
    mood: "Silence et lenteur. La récupération comme un rituel. Vapeur, eau froide, respiration. C'est le contre-poids du sport : ici on répare le corps et on apaise la tête.",
    prompt: "360 equirectangular panorama, outdoor wellness deck on a mountainside, Finnish wooden sauna with glass wall, cold plunge nordic bath, natural swimming pond, steam rising, misty peaks, serene golden hour, photorealistic, seamless"
  },
  logements: {
    icon: "🛖",
    eyebrow: "Le refuge",
    title: "Les Logements Insolites",
    pitch: "Pas un hôtel. 5 à 10 unités dispersées dans la nature — dômes géodésiques, cabanes design, treehouses — chacune avec son intimité, sa vue, son silence. On se sent seul au monde.",
    features: [
      "Dômes géodésiques avec toit transparent (ciel étoilé)",
      "Cabanes bois design & treehouses perchées",
      "Chacune isolée des autres — pas d'alignement, pas de vis-à-vis",
      "Vue dégagée, terrasse privative, parfois bain privé",
      "Confort premium : literie haut de gamme, matériaux nobles, énergie autonome"
    ],
    mood: "Intime et spectaculaire. S'endormir sous les étoiles, se réveiller avec la brume sur la vallée. Le luxe, ici, c'est l'espace, le silence et la nature à portée de main.",
    prompt: "360 equirectangular panorama, luxury geodesic dome and design wooden cabin scattered in a pine forest on a mountainside, transparent roof, private deck, warm interior glow at dusk, no other buildings in sight, secluded, photorealistic, seamless"
  }
};

const ORDER = ["entree", "commun", "sport", "wellness", "logements"];

/* Connexions entre zones (d'après le masterplan) + position du point au sol */
const LINKS = {
  entree:    [{ to: "commun",   yaw:   0, label: "Vers Le Cœur" }],
  commun:    [
    { to: "entree",    yaw: 170, label: "Retour Arrivée" },
    { to: "sport",     yaw: -80, label: "Vers le Sport" },
    { to: "wellness",  yaw:  80, label: "Vers le Wellness" },
    { to: "logements", yaw:  10, label: "Vers les Logements" }
  ],
  sport:     [
    { to: "commun",   yaw:   0, label: "Retour au Cœur" },
    { to: "wellness", yaw:  70, label: "Vers le Wellness" }
  ],
  wellness:  [
    { to: "commun",    yaw:   0, label: "Retour au Cœur" },
    { to: "sport",     yaw: -70, label: "Vers le Sport" },
    { to: "logements", yaw: 120, label: "Vers les Logements" }
  ],
  logements: [
    { to: "commun",   yaw:    0, label: "Retour au Cœur" },
    { to: "wellness", yaw: -120, label: "Vers le Wellness" }
  ]
};

const DAY = [
  { time: "07:00", title: "Réveil en douceur", desc: "Lever du soleil sur la vallée depuis sa cabane. Café de spécialité sur la terrasse du Cœur." },
  { time: "07:30", title: "Mobilité & méditation", desc: "Session courte sur le deck yoga face aux sommets, pour réveiller le corps en douceur." },
  { time: "08:30", title: "Petit-déjeuner sportif", desc: "Buffet nutrition de qualité — produits locaux, protéines, fruits, jus pressés." },
  { time: "10:00", title: "Entraînement du matin", desc: "WOD CrossFit dans la box outdoor ou boucle trail balisée. Encadré ou libre, au choix." },
  { time: "12:30", title: "Récupération wellness", desc: "Sauna, bain nordique, hammam. Le rituel chaud-froid qui répare le corps." },
  { time: "13:30", title: "Déjeuner à la table commune", desc: "On mange ensemble. C'est là que les conversations entre entrepreneurs démarrent." },
  { time: "15:00", title: "Deep work ou sieste", desc: "Coworking pour ceux qui bossent, hamac et lecture pour ceux qui décrochent." },
  { time: "18:00", title: "Activité libre", desc: "Rando, baignade dans le bassin naturel, seconde session sport légère, ou rien du tout." },
  { time: "20:00", title: "Dîner & feu de camp", desc: "Cuisine du chef autour du feu, échanges, parfois un talk d'un invité. On se couche tôt, bien." }
];

/* ---------- Timeline ---------- */
const tl = document.getElementById("timeline");
DAY.forEach(d => {
  const li = document.createElement("li");
  li.className = "t-item";
  li.innerHTML = `<div class="t-time">${d.time}</div>
    <div class="t-title">${d.title}</div>
    <p class="t-desc">${d.desc}</p>`;
  tl.appendChild(li);
});

/* ============================================================
   MOTEUR 360°
   ============================================================ */
let viewer = null;
let current = "entree";

function buildScenes() {
  const scenes = {};
  ORDER.forEach(key => {
    scenes[key] = {
      type: "equirectangular",
      panorama: `assets/pano/${key}.jpg`,
      autoLoad: true,
      showControls: true,
      hfov: 110,
      hotSpots: LINKS[key].map(l => ({
        pitch: -8,
        yaw: l.yaw,
        type: "scene",
        sceneId: l.to,
        cssClass: "nav-hotspot",
        createTooltipFunc: navHotspot,
        createTooltipArgs: l.label
      }))
    };
  });
  return scenes;
}

/* point de navigation personnalisé (pastille "marcher ici") */
function navHotspot(div, label) {
  div.classList.add("nav-hotspot");
  div.innerHTML = `<span class="nav-hotspot__ring"></span><span class="nav-hotspot__lbl">${label}</span>`;
}

function initViewer() {
  if (!window.pannellum) { setTimeout(initViewer, 120); return; }
  viewer = window.pannellum.viewer("pano", {
    default: {
      firstScene: "entree",
      sceneFadeDuration: 900,
      autoLoad: true,
      compass: false,
      showZoomCtrl: true,
      keyboardZoom: true,
      hotSpotDebug: false
    },
    scenes: buildScenes()
  });
  viewer.on("scenechange", id => { current = id; syncHud(id); });
  syncHud("entree");
}

function syncHud(key) {
  const z = ZONES[key];
  if (!z) return;
  document.getElementById("tour-eyebrow").textContent = z.eyebrow;
  document.getElementById("tour-title").textContent = z.title;
  document.querySelectorAll("#tour-menu button").forEach(b =>
    b.classList.toggle("is-active", b.dataset.scene === key));
}

function goScene(key) {
  current = key;
  if (viewer) viewer.loadScene(key);
  else syncHud(key);
}

/* ---------- Menu des zones ---------- */
document.querySelectorAll("#tour-menu button").forEach(b => {
  b.addEventListener("click", () => goScene(b.dataset.scene));
});

/* ============================================================
   FICHE DE ZONE (modale)
   ============================================================ */
const overlay   = document.getElementById("overlay");
const elMedia   = document.getElementById("panel-media");
const elEyebrow = document.getElementById("panel-eyebrow");
const elTitle   = document.getElementById("panel-title");
const elPitch   = document.getElementById("panel-pitch");
const elFeat    = document.getElementById("panel-features");
const elMood    = document.getElementById("panel-mood");
const elPrompt  = document.getElementById("panel-prompt");
let lastFocus = null;

function openZone(key) {
  const z = ZONES[key];
  if (!z) return;
  overlay.dataset.zone = key;
  elMedia.className = "panel__media media--" + key;
  elMedia.textContent = z.icon;
  elEyebrow.textContent = z.eyebrow;
  elTitle.textContent = z.title;
  elPitch.textContent = z.pitch;
  elFeat.innerHTML = z.features.map(f => `<li>${f}</li>`).join("");
  elMood.textContent = z.mood;
  elPrompt.textContent = z.prompt;
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("panel-close").focus();
}
function closeZone() {
  overlay.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}

document.getElementById("tour-info").addEventListener("click", () => {
  lastFocus = document.getElementById("tour-info");
  openZone(current);
});
document.getElementById("panel-close").addEventListener("click", closeZone);
document.getElementById("panel-visit").addEventListener("click", () => {
  const key = overlay.dataset.zone;
  closeZone();
  goScene(key);
  document.getElementById("tour").scrollIntoView({ behavior: "smooth" });
});
overlay.addEventListener("click", e => { if (e.target === overlay) closeZone(); });
document.addEventListener("keydown", e => {
  if (!overlay.hidden && e.key === "Escape") closeZone();
});

/* ---------- Masterplan : cliquer une zone => s'y téléporter en 360 ---------- */
document.querySelectorAll(".zone[data-zone]").forEach(el => {
  const fire = () => {
    goScene(el.dataset.zone);
    document.getElementById("tour").scrollIntoView({ behavior: "smooth" });
  };
  el.addEventListener("click", fire);
  el.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fire(); }
  });
});

/* ---------- Hero -> scroll ---------- */
document.querySelectorAll("[data-goto]").forEach(b => {
  b.addEventListener("click", () =>
    document.getElementById(b.dataset.goto).scrollIntoView({ behavior: "smooth" }));
});

/* ---------- Go ---------- */
initViewer();
