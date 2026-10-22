// Genera GIF animate (360x360, 12 frame) in stile silhouette per i nuovi esercizi.
// Pipeline: pose A/B (giunti) -> interpolazione ping-pong -> SVG -> PNG (sharp) -> GIF (ImageMagick).
const sharp = require('sharp');
const fs = require('fs');
const { execSync } = require('child_process');

const OUT = process.argv[2]; // cartella frame temporanei
const DEST = process.argv[3]; // public/assets/rise2
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(DEST, { recursive: true });

const C = { bg: '#FBF7F1', fig: '#C46A43', fig2: '#D98C63', prop: '#D9CBB8', ground: '#E3D5C3', head: '#B5623C' };
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const ip = (A, B, t) => { const o = {}; for (const k in A) o[k] = [lerp(A[k][0], B[k][0], t), lerp(A[k][1], B[k][1], t)]; return o; };

// bones: coppie di giunti; props: funzione -> svg; view: 'side'|'front'|'top'
function render(pose, def) {
  const L = (a, b, col, w = 14) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360"><rect width="360" height="360" fill="${C.bg}"/>`;
  if (def.props) s += def.props(pose);
  // arti "lontani" (sfumati) prima
  for (const [a, b] of (def.far || [])) s += L(pose[a], pose[b], C.fig2, 12);
  for (const [a, b] of def.bones) s += L(pose[a], pose[b], C.fig, 14);
  if (pose.head) s += `<circle cx="${pose.head[0].toFixed(1)}" cy="${pose.head[1].toFixed(1)}" r="${def.headR || 20}" fill="${C.head}"/>`;
  return s + `</svg>`;
}

const ground = y => `<line x1="20" y1="${y}" x2="340" y2="${y}" stroke="${C.ground}" stroke-width="6" stroke-linecap="round"/>`;
const wallLeft = `<rect x="38" y="40" width="14" height="300" rx="4" fill="${C.prop}"/>` + ground(340);
const table = `<rect x="30" y="212" width="110" height="12" rx="4" fill="${C.prop}"/><rect x="40" y="224" width="10" height="116" fill="${C.prop}"/><rect x="120" y="224" width="10" height="116" fill="${C.prop}"/>` + ground(340);
const chair = `<rect x="250" y="238" width="80" height="12" rx="4" fill="${C.prop}"/><rect x="258" y="250" width="10" height="90" fill="${C.prop}"/><rect x="312" y="250" width="10" height="90" fill="${C.prop}"/>` + ground(340);
const wallBack = `<rect x="20" y="30" width="320" height="310" rx="6" fill="#F4ECE1"/>` + ground(340);
const sideBones = [['head','sh'],['sh','hip'],['sh','el'],['el','wr'],['hip','knee'],['knee','ankle']];
const sideFar = [['sh','el2'],['el2','wr2'],['hip','knee2'],['knee2','ankle2']];

const EX = {
  push_up_wall: { props: () => wallLeft, bones: sideBones, far: sideFar, alt: false,
    A: { head:[205,98], sh:[205,135], el:[140,140], wr:[62,150], hip:[218,218], knee:[222,278], ankle:[226,338], el2:[146,146], wr2:[66,156], knee2:[230,280], ankle2:[234,338] },
    B: { head:[178,100], sh:[180,137], el:[116,164], wr:[62,150], hip:[204,220], knee:[214,279], ankle:[226,338], el2:[122,170], wr2:[66,156], knee2:[222,281], ankle2:[234,338] } },
  push_up_incline: { props: () => table, bones: sideBones, far: sideFar,
    A: { wr:[85,212], el:[128,198], sh:[170,178], head:[186,146], hip:[246,240], knee:[292,286], ankle:[332,336], el2:[134,204], wr2:[92,216], knee2:[298,290], ankle2:[338,336] },
    B: { wr:[85,212], el:[112,222], sh:[140,206], head:[150,176], hip:[224,256], knee:[280,294], ankle:[332,336], el2:[118,228], wr2:[92,216], knee2:[286,298], ankle2:[338,336] } },
  prone_y: { view: 'top', props: () => ground(345), headR: 18,
    bones: [['neck','hip'],['hip','kneeL'],['hip','kneeR'],['kneeL','ankL'],['kneeR','ankR'],['shL','elL'],['elL','wrL'],['shR','elR'],['elR','wrR']],
    A: { head:[180,62], neck:[180,88], hip:[180,230], kneeL:[166,290], kneeR:[194,290], ankL:[160,338], ankR:[200,338], shL:[160,100], shR:[200,100], elL:[138,90], elR:[222,90], wrL:[118,78], wrR:[242,78] },
    B: { head:[180,58], neck:[180,86], hip:[180,230], kneeL:[166,290], kneeR:[194,290], ankL:[160,338], ankR:[200,338], shL:[160,100], shR:[200,100], elL:[128,66], elR:[232,66], wrL:[100,34], wrR:[260,34] } },
  prone_t: { view: 'top', props: () => ground(345), headR: 18,
    bones: [['neck','hip'],['hip','kneeL'],['hip','kneeR'],['kneeL','ankL'],['kneeR','ankR'],['shL','elL'],['elL','wrL'],['shR','elR'],['elR','wrR']],
    A: { head:[180,62], neck:[180,88], hip:[180,230], kneeL:[166,290], kneeR:[194,290], ankL:[160,338], ankR:[200,338], shL:[160,104], shR:[200,104], elL:[132,112], elR:[228,112], wrL:[108,120], wrR:[252,120] },
    B: { head:[180,58], neck:[180,86], hip:[180,230], kneeL:[166,290], kneeR:[194,290], ankL:[160,338], ankR:[200,338], shL:[160,104], shR:[200,104], elL:[118,102], elR:[242,102], wrL:[72,100], wrR:[288,100] } },
  prone_w: { view: 'top', props: () => ground(345), headR: 18,
    bones: [['neck','hip'],['hip','kneeL'],['hip','kneeR'],['kneeL','ankL'],['kneeR','ankR'],['shL','elL'],['elL','wrL'],['shR','elR'],['elR','wrR']],
    A: { head:[180,62], neck:[180,88], hip:[180,230], kneeL:[166,290], kneeR:[194,290], ankL:[160,338], ankR:[200,338], shL:[160,104], shR:[200,104], elL:[136,124], elR:[224,124], wrL:[128,88], wrR:[232,88] },
    B: { head:[180,58], neck:[180,86], hip:[180,230], kneeL:[166,290], kneeR:[194,290], ankL:[160,338], ankR:[200,338], shL:[160,104], shR:[200,104], elL:[118,130], elR:[242,130], wrL:[104,82], wrR:[256,82] } },
  reverse_snow_angel: { view: 'top', props: () => ground(345), headR: 18,
    bones: [['neck','hip'],['hip','kneeL'],['hip','kneeR'],['kneeL','ankL'],['kneeR','ankR'],['shL','elL'],['elL','wrL'],['shR','elR'],['elR','wrR']],
    A: { head:[180,62], neck:[180,88], hip:[180,230], kneeL:[166,290], kneeR:[194,290], ankL:[160,338], ankR:[200,338], shL:[160,104], shR:[200,104], elL:[150,160], elR:[210,160], wrL:[146,218], wrR:[214,218] },
    B: { head:[180,58], neck:[180,86], hip:[180,230], kneeL:[166,290], kneeR:[194,290], ankL:[160,338], ankR:[200,338], shL:[160,104], shR:[200,104], elL:[132,66], elR:[228,66], wrL:[108,30], wrR:[252,30] } },
  wall_slide: { view: 'front', props: () => wallBack, headR: 20,
    bones: [['neck','hip'],['hip','kneeL'],['hip','kneeR'],['kneeL','ankL'],['kneeR','ankR'],['shL','elL'],['elL','wrL'],['shR','elR'],['elR','wrR']],
    A: { head:[180,72], neck:[180,100], hip:[180,215], kneeL:[166,275], kneeR:[194,275], ankL:[162,338], ankR:[198,338], shL:[152,112], shR:[208,112], elL:[118,112], elR:[242,112], wrL:[118,62], wrR:[242,62] },
    B: { head:[180,72], neck:[180,100], hip:[180,215], kneeL:[166,275], kneeR:[194,275], ankL:[162,338], ankR:[198,338], shL:[152,112], shR:[208,112], elL:[136,66], elR:[224,66], wrL:[160,22], wrR:[200,22] } },
  hip_hinge: { props: () => ground(340), bones: sideBones, far: sideFar,
    A: { head:[200,95], sh:[200,132], el:[204,172], wr:[206,208], hip:[200,212], knee:[200,276], ankle:[200,338], el2:[210,172], wr2:[212,208], knee2:[208,276], ankle2:[208,338] },
    B: { head:[118,160], sh:[134,170], el:[150,206], wr:[166,244], hip:[214,216], knee:[210,278], ankle:[205,338], el2:[156,210], wr2:[172,248], knee2:[218,278], ankle2:[213,338] } },
  single_leg_glute_bridge: { props: () => ground(340), headR: 18,
    bones: [['head','sh'],['sh','hip'],['sh','el'],['el','wr'],['hip','knee'],['knee','ankle'],['hip','knee2'],['knee2','ankle2']],
    A: { head:[300,300], sh:[266,302], el:[240,320], wr:[214,334], hip:[176,308], knee:[132,254], ankle:[112,326], knee2:[122,280], ankle2:[62,258] },
    B: { head:[300,300], sh:[266,302], el:[240,320], wr:[214,334], hip:[178,258], knee:[132,246], ankle:[112,326], knee2:[122,222], ankle2:[62,196] } },
  single_leg_rdl: { props: () => ground(340), bones: sideBones.concat([['hip','knee2'],['knee2','ankle2']]),
    A: { head:[200,95], sh:[200,132], el:[204,172], wr:[206,208], hip:[200,212], knee:[200,276], ankle:[200,338], knee2:[206,276], ankle2:[206,338] },
    B: { head:[100,186], sh:[118,192], el:[140,222], wr:[150,258], hip:[205,206], knee:[208,272], ankle:[205,338], knee2:[266,192], ankle2:[330,182] } },
  bulgarian_split_squat: { props: () => chair, bones: sideBones.concat([['hip','knee2'],['knee2','ankle2']]),
    A: { head:[170,80], sh:[170,120], el:[160,160], wr:[150,196], hip:[175,205], knee:[178,270], ankle:[175,338], knee2:[232,246], ankle2:[286,240] },
    B: { head:[165,120], sh:[165,160], el:[156,198], wr:[150,232], hip:[168,246], knee:[186,292], ankle:[175,338], knee2:[226,282], ankle2:[286,240] } },
  prone_pull: { props: () => ground(300), headR: 18,
    bones: [['head','sh'],['sh','hip'],['sh','el'],['el','wr'],['hip','knee'],['knee','ankle']],
    A: { head:[76,250], sh:[112,258], el:[70,256], wr:[30,250], hip:[232,262], knee:[292,264], ankle:[346,266] },
    B: { head:[74,236], sh:[112,254], el:[118,230], wr:[96,268], hip:[232,262], knee:[292,264], ankle:[346,266] } },
  butt_kicks: { props: () => ground(340), bones: sideBones, far: sideFar, alt: true,
    A: { head:[200,92], sh:[200,130], el:[176,166], wr:[204,186], hip:[200,210], knee:[204,274], ankle:[206,338], el2:[226,160], wr2:[236,196], knee2:[200,270], ankle2:[240,250] },
    B: { head:[200,92], sh:[200,130], el:[226,160], wr:[236,196], hip:[200,210], knee:[200,270], ankle:[240,250], el2:[176,166], wr2:[204,186], knee2:[204,274], ankle2:[206,338] } },
  shadow_boxing: { view: 'front', props: () => ground(340), headR: 20, alt: true,
    bones: [['neck','hip'],['hip','kneeL'],['hip','kneeR'],['kneeL','ankL'],['kneeR','ankR'],['shL','elL'],['elL','wrL'],['shR','elR'],['elR','wrR']],
    A: { head:[180,72], neck:[180,100], hip:[180,215], kneeL:[162,275], kneeR:[198,275], ankL:[156,338], ankR:[204,338], shL:[150,112], shR:[210,112], elL:[112,122], elR:[238,138], wrL:[66,96], wrR:[214,104] },
    B: { head:[180,72], neck:[180,100], hip:[180,215], kneeL:[162,275], kneeR:[198,275], ankL:[156,338], ankR:[204,338], shL:[150,112], shR:[210,112], elL:[122,138], elR:[248,122], wrL:[146,104], wrR:[294,96] } },
};

(async () => {
  const N = 12;
  for (const [key, def] of Object.entries(EX)) {
    const files = [];
    for (let i = 0; i < N; i++) {
      // ping-pong 0..1..0
      const t = ease(i < N / 2 ? i / (N / 2 - 1) : (N - 1 - i) / (N / 2 - 1));
      const pose = ip(def.A, def.B, t);
      const f = `${OUT}/${key}_${String(i).padStart(2, '0')}.png`;
      await sharp(Buffer.from(render(pose, def))).png().toFile(f);
      files.push(f);
    }
    // primo frame tenuto 0.6s, gli altri 0.1s (stile delle GIF esistenti)
    const args = files.map((f, i) => `-delay ${i === 0 ? 60 : 10} ${f}`).join(' ');
    execSync(`convert -loop 0 ${args} ${DEST}/${key}.gif`);
    console.log('gif', key);
  }
})();
