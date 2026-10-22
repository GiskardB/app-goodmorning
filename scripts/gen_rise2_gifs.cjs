// Genera GIF animate (360x360, 12 frame) in stile silhouette per gli esercizi senza
// animazione fotografica. Pipeline: pose A/B (giunti) -> interpolazione ping-pong -> SVG -> PNG (sharp) -> GIF.
// Uso: node scripts/gen_rise2_gifs.cjs <cartella-frame-temporanei> <public/assets/rise2>
const sharp = require('sharp');
const fs = require('fs');
const { execSync } = require('child_process');

const OUT = process.argv[2];
const DEST = process.argv[3];
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(DEST, { recursive: true });

const C = { bg: '#FBF7F1', fig: '#C46A43', fig2: '#D98C63', prop: '#D9CBB8', ground: '#E3D5C3', head: '#B5623C', mat: '#EFE3D3', arrow: '#8A4428' };
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const ip = (A, B, t) => { const o = {}; for (const k in A) o[k] = [lerp(A[k][0], B[k][0], t), lerp(A[k][1], B[k][1], t)]; return o; };

function render(pose, def) {
  const L = (a, b, col, w = 14) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360"><rect width="360" height="360" fill="${C.bg}"/>`;
  if (def.props) s += def.props(pose);
  for (const [a, b] of (def.far || [])) s += L(pose[a], pose[b], C.fig2, 12);
  for (const [a, b] of def.bones) s += L(pose[a], pose[b], C.fig, 14);
  if (pose.head) s += `<circle cx="${pose.head[0].toFixed(1)}" cy="${pose.head[1].toFixed(1)}" r="${def.headR || 20}" fill="${C.head}"/>`;
  if (def.arrow) { // freccia statica che indica il movimento principale
    const [[x1, y1], [x2, y2]] = def.arrow; const ang = Math.atan2(y2 - y1, x2 - x1);
    const hx = x2 - 14 * Math.cos(ang), hy = y2 - 14 * Math.sin(ang);
    s += `<line x1="${x1}" y1="${y1}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="${C.arrow}" stroke-width="5" stroke-linecap="round" stroke-dasharray="9 7" opacity="0.85"/>`;
    const p = a => `${(x2 - 16 * Math.cos(ang - a)).toFixed(1)},${(y2 - 16 * Math.sin(ang - a)).toFixed(1)}`;
    s += `<polygon points="${x2},${y2} ${p(0.5)} ${p(-0.5)}" fill="${C.arrow}" opacity="0.85"/>`;
  }
  return s + `</svg>`;
}

const ground = y => `<line x1="20" y1="${y}" x2="340" y2="${y}" stroke="${C.ground}" stroke-width="6" stroke-linecap="round"/>`;
const mat = `<rect x="110" y="18" width="140" height="330" rx="18" fill="${C.mat}"/>`;              // tappetino vista dall'alto
const matSide = `<rect x="24" y="318" width="312" height="14" rx="7" fill="${C.mat}"/>` + ground(340); // tappetino vista laterale
const wallLeft = `<rect x="38" y="40" width="14" height="300" rx="4" fill="${C.prop}"/>` + ground(340);
const table = `<rect x="30" y="212" width="110" height="12" rx="4" fill="${C.prop}"/><rect x="40" y="224" width="10" height="116" fill="${C.prop}"/><rect x="120" y="224" width="10" height="116" fill="${C.prop}"/>` + ground(340);
const chair = `<rect x="250" y="238" width="80" height="12" rx="4" fill="${C.prop}"/><rect x="258" y="250" width="10" height="90" fill="${C.prop}"/><rect x="312" y="250" width="10" height="90" fill="${C.prop}"/>` + ground(340);
const wallBack = `<rect x="20" y="30" width="320" height="310" rx="6" fill="#F4ECE1"/>` + ground(340);
const spots = `<ellipse cx="110" cy="334" rx="34" ry="8" fill="${C.prop}"/><ellipse cx="250" cy="334" rx="34" ry="8" fill="${C.prop}"/><ellipse cx="180" cy="300" rx="26" ry="6" fill="${C.prop}" opacity="0.6"/><ellipse cx="180" cy="350" rx="34" ry="8" fill="${C.prop}" opacity="0.6"/>`;
const sideBones = [['head', 'sh'], ['sh', 'hip'], ['sh', 'el'], ['el', 'wr'], ['hip', 'knee'], ['knee', 'ankle']];
const sideFar = [['sh', 'el2'], ['el2', 'wr2'], ['hip', 'knee2'], ['knee2', 'ankle2']];
const topBones = [['neck', 'hip'], ['hip', 'kneeL'], ['hip', 'kneeR'], ['kneeL', 'ankL'], ['kneeR', 'ankR'], ['shL', 'elL'], ['elL', 'wrL'], ['shR', 'elR'], ['elR', 'wrR']];
const topBase = { head: [180, 62], neck: [180, 88], hip: [180, 230], kneeL: [166, 290], kneeR: [194, 290], ankL: [160, 338], ankR: [200, 338], shL: [160, 104], shR: [200, 104] };
const frontBase = { head: [180, 72], neck: [180, 100], hip: [180, 215], kneeL: [166, 275], kneeR: [194, 275], ankL: [162, 338], ankR: [198, 338], shL: [152, 112], shR: [208, 112] };
const mirror = (p) => { const o = {}; for (const k in p) o[k] = [360 - p[k][0], p[k][1]]; return o; };

const EX = {
  push_up_wall: { props: () => wallLeft, bones: sideBones, far: sideFar, arrow: [[150, 60], [78, 60]],
    A: { head: [205, 98], sh: [205, 135], el: [140, 140], wr: [62, 150], hip: [218, 218], knee: [222, 278], ankle: [226, 338], el2: [146, 146], wr2: [66, 156], knee2: [230, 280], ankle2: [234, 338] },
    B: { head: [178, 100], sh: [180, 137], el: [116, 164], wr: [62, 150], hip: [204, 220], knee: [214, 279], ankle: [226, 338], el2: [122, 170], wr2: [66, 156], knee2: [222, 281], ankle2: [234, 338] } },
  push_up_incline: { props: () => table, bones: sideBones, far: sideFar, arrow: [[200, 120], [170, 150]],
    A: { wr: [85, 212], el: [128, 198], sh: [170, 178], head: [186, 146], hip: [246, 240], knee: [292, 286], ankle: [332, 336], el2: [134, 204], wr2: [92, 216], knee2: [298, 290], ankle2: [338, 336] },
    B: { wr: [85, 212], el: [112, 222], sh: [140, 206], head: [150, 176], hip: [224, 256], knee: [280, 294], ankle: [332, 336], el2: [118, 228], wr2: [92, 216], knee2: [286, 298], ankle2: [338, 336] } },
  prone_y: { props: () => mat, bones: topBones, headR: 18, arrow: [[300, 120], [300, 60]],
    A: { ...topBase, elL: [138, 90], elR: [222, 90], wrL: [118, 78], wrR: [242, 78] },
    B: { ...topBase, head: [180, 58], elL: [128, 66], elR: [232, 66], wrL: [100, 34], wrR: [260, 34] } },
  prone_t: { props: () => mat, bones: topBones, headR: 18, arrow: [[300, 150], [330, 100]],
    A: { ...topBase, elL: [132, 112], elR: [228, 112], wrL: [108, 120], wrR: [252, 120] },
    B: { ...topBase, head: [180, 58], elL: [118, 102], elR: [242, 102], wrL: [72, 100], wrR: [288, 100] } },
  prone_w: { props: () => mat, bones: topBones, headR: 18, arrow: [[300, 150], [300, 90]],
    A: { ...topBase, elL: [136, 124], elR: [224, 124], wrL: [128, 88], wrR: [232, 88] },
    B: { ...topBase, head: [180, 58], elL: [118, 130], elR: [242, 130], wrL: [104, 82], wrR: [256, 82] } },
  reverse_snow_angel: { props: () => mat, bones: topBones, headR: 18, arrow: [[300, 190], [300, 60]],
    A: { ...topBase, elL: [150, 160], elR: [210, 160], wrL: [146, 218], wrR: [214, 218] },
    B: { ...topBase, head: [180, 58], elL: [132, 66], elR: [228, 66], wrL: [108, 30], wrR: [252, 30] } },
  prone_pull: { props: () => mat, bones: topBones, headR: 18, arrow: [[300, 60], [300, 170]],
    A: { ...topBase, head: [180, 56], elL: [136, 60], elR: [224, 60], wrL: [118, 28], wrR: [242, 28] },
    B: { ...topBase, head: [180, 56], elL: [136, 160], elR: [224, 160], wrL: [148, 212], wrR: [212, 212] } },
  plank_jack: { props: () => mat, bones: topBones, headR: 18, arrow: [[300, 290], [340, 330]],
    A: { ...topBase, head: [180, 50], neck: [180, 78], shL: [160, 92], shR: [200, 92], elL: [150, 50], elR: [210, 50], wrL: [146, 22], wrR: [214, 22], kneeL: [172, 286], kneeR: [188, 286], ankL: [170, 340], ankR: [190, 340] },
    B: { ...topBase, head: [180, 50], neck: [180, 78], shL: [160, 92], shR: [200, 92], elL: [150, 50], elR: [210, 50], wrL: [146, 22], wrR: [214, 22], kneeL: [148, 286], kneeR: [212, 286], ankL: [122, 340], ankR: [238, 340] } },
  wall_slide: { props: () => wallBack, bones: topBones, headR: 20, arrow: [[300, 150], [300, 70]],
    A: { ...frontBase, elL: [118, 112], elR: [242, 112], wrL: [118, 62], wrR: [242, 62] },
    B: { ...frontBase, elL: [136, 66], elR: [224, 66], wrL: [160, 22], wrR: [200, 22] } },
  hip_hinge: { props: () => ground(340), bones: sideBones, far: sideFar, arrow: [[150, 110], [112, 160]],
    A: { head: [200, 95], sh: [200, 132], el: [204, 172], wr: [206, 208], hip: [200, 212], knee: [200, 276], ankle: [200, 338], el2: [210, 172], wr2: [212, 208], knee2: [208, 276], ankle2: [208, 338] },
    B: { head: [118, 160], sh: [134, 170], el: [150, 206], wr: [166, 244], hip: [214, 216], knee: [210, 278], ankle: [205, 338], el2: [156, 210], wr2: [172, 248], knee2: [218, 278], ankle2: [213, 338] } },
  single_leg_glute_bridge: { props: () => matSide, headR: 18, arrow: [[190, 300], [190, 236]],
    bones: [['head', 'sh'], ['sh', 'hip'], ['sh', 'el'], ['el', 'wr'], ['hip', 'knee'], ['knee', 'ankle'], ['hip', 'knee2'], ['knee2', 'ankle2']],
    A: { head: [305, 300], sh: [268, 306], el: [236, 318], wr: [206, 326], hip: [182, 312], knee: [136, 262], ankle: [116, 330], knee2: [150, 258], ankle2: [96, 214] },
    B: { head: [305, 300], sh: [268, 306], el: [236, 318], wr: [206, 326], hip: [192, 250], knee: [136, 250], ankle: [116, 330], knee2: [150, 200], ankle2: [90, 150] } },
  single_leg_rdl: { props: () => ground(340), bones: sideBones.concat([['hip', 'knee2'], ['knee2', 'ankle2']]), arrow: [[250, 215], [310, 190]],
    A: { head: [200, 95], sh: [200, 132], el: [204, 172], wr: [206, 208], hip: [200, 212], knee: [200, 276], ankle: [200, 338], knee2: [206, 276], ankle2: [206, 338] },
    B: { head: [100, 186], sh: [118, 192], el: [140, 222], wr: [150, 258], hip: [205, 206], knee: [208, 272], ankle: [205, 338], knee2: [266, 192], ankle2: [330, 182] } },
  bulgarian_split_squat: { props: () => chair, bones: sideBones.concat([['hip', 'knee2'], ['knee2', 'ankle2']]), arrow: [[120, 200], [120, 250]],
    A: { head: [170, 80], sh: [170, 120], el: [160, 160], wr: [150, 196], hip: [175, 205], knee: [178, 270], ankle: [175, 338], knee2: [232, 246], ankle2: [286, 240] },
    B: { head: [165, 120], sh: [165, 160], el: [156, 198], wr: [150, 232], hip: [168, 246], knee: [186, 292], ankle: [175, 338], knee2: [226, 282], ankle2: [286, 240] } },
  butt_kicks: { props: () => ground(340), bones: sideBones, far: sideFar, arrow: [[250, 300], [222, 262]],
    A: { head: [200, 92], sh: [200, 130], el: [176, 166], wr: [204, 186], hip: [200, 210], knee: [204, 274], ankle: [206, 338], el2: [226, 160], wr2: [236, 196], knee2: [200, 270], ankle2: [240, 250] },
    B: { head: [200, 92], sh: [200, 130], el: [226, 160], wr: [236, 196], hip: [200, 210], knee: [200, 270], ankle: [240, 250], el2: [176, 166], wr2: [204, 186], knee2: [204, 274], ankle2: [206, 338] } },
  shadow_boxing: { props: () => ground(340), bones: sideBones, far: sideFar, arrow: [[250, 108], [320, 108]],
    A: { head: [170, 92], sh: [174, 130], el: [196, 158], wr: [188, 122], hip: [180, 212], knee: [196, 276], ankle: [212, 338], el2: [184, 160], wr2: [176, 124], knee2: [160, 276], ankle2: [150, 338] },
    B: { head: [178, 92], sh: [182, 130], el: [236, 134], wr: [296, 128], hip: [184, 212], knee: [200, 276], ankle: [214, 338], el2: [190, 160], wr2: [182, 124], knee2: [162, 276], ankle2: [150, 338] } },
  cat_cow_stretch: { props: () => matSide, headR: 18, arrow: [[196, 150], [196, 110]],
    bones: [['head', 'sh'], ['sh', 'mid'], ['mid', 'hip'], ['sh', 'wr'], ['hip', 'knee'], ['knee', 'ankle']],
    A: { head: [112, 196], sh: [142, 206], mid: [196, 222], hip: [250, 206], wr: [142, 316], knee: [252, 316], ankle: [320, 318] },
    B: { head: [128, 236], sh: [142, 206], mid: [196, 168], hip: [250, 206], wr: [142, 316], knee: [252, 316], ankle: [320, 318] } },
  side_crunch_standing_left: { props: () => ground(340), bones: topBones, headR: 20, arrow: [[120, 250], [128, 200]],
    A: { ...frontBase, elL: [120, 100], elR: [240, 100], wrL: [160, 70], wrR: [200, 70] },
    B: { ...frontBase, head: [166, 76], neck: [168, 104], hip: [180, 215], elL: [112, 150], elR: [242, 96], wrL: [152, 86], wrR: [204, 68], kneeL: [148, 190], ankL: [150, 246] } },
  squat_kickback: { props: () => ground(340), bones: sideBones, far: sideFar, arrow: [[110, 250], [70, 236]],
    A: { head: [206, 134], sh: [206, 170], el: [240, 196], wr: [270, 190], hip: [196, 252], knee: [234, 292], ankle: [218, 338], el2: [244, 200], wr2: [274, 194], knee2: [240, 294], ankle2: [226, 338] },
    B: { head: [200, 92], sh: [200, 130], el: [226, 160], wr: [250, 150], hip: [196, 212], knee: [198, 276], ankle: [200, 338], el2: [230, 164], wr2: [254, 154], knee2: [152, 236], ankle2: [96, 250] } },
  squat_heel_raise: { props: () => ground(340), bones: sideBones.concat([['ankle', 'toe']]), far: sideFar.concat([['ankle2', 'toe2']]), arrow: [[260, 330], [260, 290]],
    A: { head: [206, 134], sh: [206, 170], el: [240, 196], wr: [270, 190], hip: [196, 252], knee: [234, 292], ankle: [218, 334], toe: [244, 336], el2: [244, 200], wr2: [274, 194], knee2: [240, 294], ankle2: [226, 334], toe2: [252, 336] },
    B: { head: [200, 86], sh: [200, 124], el: [204, 164], wr: [206, 200], hip: [200, 206], knee: [200, 268], ankle: [202, 314], toe: [222, 334], el2: [210, 166], wr2: [212, 202], knee2: [208, 268], ankle2: [210, 314], toe2: [230, 334] } },
  box_jump_4point: { props: () => spots, bones: topBones, headR: 20, arrow: [[150, 60], [230, 60]],
    A: { head: [110, 140], neck: [110, 168], hip: [110, 250], kneeL: [92, 292], kneeR: [128, 292], ankL: [96, 332], ankR: [124, 332], shL: [84, 180], shR: [136, 180], elL: [70, 220], elR: [150, 220], wrL: [78, 256], wrR: [142, 256] },
    B: { head: [250, 60], neck: [250, 88], hip: [250, 172], kneeL: [232, 220], kneeR: [268, 220], ankL: [226, 262], ankR: [274, 262], shL: [224, 100], shR: [276, 100], elL: [204, 80], elR: [296, 80], wrL: [198, 44], wrR: [302, 44] } },
  glute_bridge_abduction: { props: () => mat, bones: topBones, headR: 18, arrow: [[300, 250], [340, 250]],
    A: { ...topBase, elL: [136, 160], elR: [224, 160], wrL: [132, 220], wrR: [228, 220], kneeL: [168, 290], kneeR: [192, 290], ankL: [166, 338], ankR: [194, 338] },
    B: { ...topBase, elL: [136, 160], elR: [224, 160], wrL: [132, 220], wrR: [228, 220], kneeL: [118, 282], kneeR: [242, 282], ankL: [166, 338], ankR: [194, 338] } },
  plank_commando: { props: () => matSide, bones: sideBones, far: sideFar, arrow: [[70, 300], [70, 250]],
    A: { head: [66, 250], sh: [104, 262], el: [70, 318], wr: [30, 318], hip: [210, 282], knee: [266, 300], ankle: [326, 322], el2: [78, 322], wr2: [38, 322], knee2: [272, 304], ankle2: [332, 326] },
    B: { head: [60, 220], sh: [104, 238], el: [84, 280], wr: [66, 318], hip: [210, 270], knee: [266, 294], ankle: [326, 322], el2: [92, 284], wr2: [74, 322], knee2: [272, 298], ankle2: [332, 326] } },
};
EX.side_crunch_standing_right = { ...EX.side_crunch_standing_left, A: mirror(EX.side_crunch_standing_left.A), B: mirror(EX.side_crunch_standing_left.B), arrow: [[240, 250], [232, 200]] };

const only = process.argv[4] ? process.argv[4].split(',') : null;
(async () => {
  const N = 12;
  for (const [key, def] of Object.entries(EX)) {
    if (only && !only.includes(key)) continue;
    const files = [];
    for (let i = 0; i < N; i++) {
      const t = ease(i < N / 2 ? i / (N / 2 - 1) : (N - 1 - i) / (N / 2 - 1)); // ping-pong 0..1..0
      const f = `${OUT}/${key}_${String(i).padStart(2, '0')}.png`;
      await sharp(Buffer.from(render(ip(def.A, def.B, t), def))).png().toFile(f);
      files.push(f);
    }
    const args = files.map((f, i) => `-delay ${i === 0 ? 60 : 10} ${f}`).join(' ');
    execSync(`convert -loop 0 ${args} ${DEST}/${key}.gif`);
    console.log('gif', key);
  }
})();
