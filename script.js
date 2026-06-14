/* ═══════════════════════════════════════════════════════
   ORGANIC CHEMISTRY STUDIO — script.js
   Full Logic Engine: ChemEngine · IUPAC · SVGRenderer
   QuizEngine · GameSystem · AdminPanel
═══════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════
   SECTION 1: CHEMISTRY DATA & CONSTANTS
══════════════════════════════════════ */
const CHEM = {
  // Carbon chain prefixes (IUPAC)
  chainPrefix: ['','meth','eth','prop','but','pent','hex','hept','oct','non','dec',
    'undec','dodec','tridec','tetradec','pentadec','hexadec','heptadec','octadec','nonadec','icos'],

  // Multiplier prefixes for substituents
  multiPrefix: ['','','di','tri','tetra','penta','hexa','hepta','octa','nona','deca'],

  // Functional groups data
  functionalGroups: [
    { id:'alkane',  name:'Alkane',         symbol:'C–C',    suffix:'-ane',   color:'#8cb4d8', formula:'CₙH₂ₙ₊₂', example:'Methane (CH₄)', use:'เชื้อเพลิง LPG' },
    { id:'alkene',  name:'Alkene',         symbol:'C=C',    suffix:'-ene',   color:'#22d3ee', formula:'CₙH₂ₙ',   example:'Ethylene (C₂H₄)', use:'พลาสติก PE' },
    { id:'alkyne',  name:'Alkyne',         symbol:'C≡C',    suffix:'-yne',   color:'#a78bfa', formula:'CₙH₂ₙ₋₂', example:'Acetylene (C₂H₂)', use:'เชื่อมโลหะ' },
    { id:'alcohol', name:'Alcohol',        symbol:'–OH',    suffix:'-ol',    color:'#6ee7b7', formula:'C–OH',     example:'Ethanol (C₂H₅OH)', use:'เครื่องดื่ม ฆ่าเชื้อ' },
    { id:'ether',   name:'Ether',          symbol:'C–O–C',  suffix:'ether',  color:'#5eead4', formula:'C–O–C',    example:'Diethyl ether', use:'ยาสลบ ตัวทำละลาย' },
    { id:'aldehyde',name:'Aldehyde',       symbol:'–CHO',   suffix:'-al',    color:'#fde68a', formula:'–CHO',     example:'Methanal (HCHO)', use:'ฟอร์มาลิน' },
    { id:'ketone',  name:'Ketone',         symbol:'C=O',    suffix:'-one',   color:'#fbbf24', formula:'C=O',      example:'Propanone', use:'น้ำยาล้างเล็บ' },
    { id:'acid',    name:'Carboxylic Acid',symbol:'–COOH',  suffix:'-oic acid',color:'#f87171',formula:'–COOH', example:'Ethanoic acid (CH₃COOH)', use:'น้ำส้มสายชู' },
    { id:'ester',   name:'Ester',          symbol:'–COO–',  suffix:'-anoate',color:'#fb923c', formula:'–COO–',    example:'Methyl ethanoate', use:'กลิ่นหอม' },
    { id:'amine',   name:'Amine',          symbol:'–NH₂',   suffix:'-amine', color:'#86efac', formula:'–NH₂',     example:'Methanamine', use:'สีย้อม ยา' },
    { id:'amide',   name:'Amide',          symbol:'–CONH₂', suffix:'-amide', color:'#a7f3d0', formula:'–CONH₂',   example:'Methanamide', use:'เส้นใย ยา' },
    { id:'haloalkane',name:'Haloalkane',   symbol:'–X',     suffix:'-o',     color:'#d4d4d4', formula:'C–X',      example:'Chloromethane (CH₃Cl)', use:'สารทำความเย็น' },
    { id:'nitrile', name:'Nitrile',        symbol:'–C≡N',   suffix:'-nitrile',color:'#c4b5fd',formula:'–CN',     example:'Methanenitrile', use:'พลาสติก ยาง' },
    { id:'phenol',  name:'Phenol',         symbol:'Ar–OH',  suffix:'phenol', color:'#fca5a5', formula:'C₆H₅OH',   example:'Phenol', use:'ฆ่าเชื้อ พลาสติก' }
  ],

  // Alkane series
  alkanes: [
    null,
    { name:'Methane',  formula:'CH₄',        condensed:'CH₄',              carbon:1, hydrogen:4  },
    { name:'Ethane',   formula:'C₂H₆',       condensed:'CH₃CH₃',           carbon:2, hydrogen:6  },
    { name:'Propane',  formula:'C₃H₈',       condensed:'CH₃CH₂CH₃',        carbon:3, hydrogen:8  },
    { name:'Butane',   formula:'C₄H₁₀',      condensed:'CH₃(CH₂)₂CH₃',     carbon:4, hydrogen:10 },
    { name:'Pentane',  formula:'C₅H₁₂',      condensed:'CH₃(CH₂)₃CH₃',     carbon:5, hydrogen:12 },
    { name:'Hexane',   formula:'C₆H₁₄',      condensed:'CH₃(CH₂)₄CH₃',     carbon:6, hydrogen:14 },
    { name:'Heptane',  formula:'C₇H₁₆',      condensed:'CH₃(CH₂)₅CH₃',     carbon:7, hydrogen:16 },
    { name:'Octane',   formula:'C₈H₁₈',      condensed:'CH₃(CH₂)₆CH₃',     carbon:8, hydrogen:18 },
    { name:'Nonane',   formula:'C₉H₂₀',      condensed:'CH₃(CH₂)₇CH₃',     carbon:9, hydrogen:20 },
    { name:'Decane',   formula:'C₁₀H₂₂',     condensed:'CH₃(CH₂)₈CH₃',     carbon:10,hydrogen:22 }
  ],
};

/* ══════════════════════════════════════
   SECTION 2: IUPAC NAME GENERATOR ENGINE
══════════════════════════════════════ */
const ChemEngine = {

  /** Calculate molecular formula from carbon count, bond type, functional group */
  calcFormula(carbons, bondType='single', fg='alkane', position=1) {
    let H = 2*carbons + 2;   // start as alkane
    let suffix = '';
    let prefix = '';

    if (bondType === 'double') { H -= 2; }
    if (bondType === 'triple') { H -= 4; }

    let extra = '';
    switch(fg) {
      case 'alkane':   suffix = 'ane'; break;
      case 'alkene':   suffix = 'ene'; if(bondType!=='double') H-=2; break;
      case 'alkyne':   suffix = 'yne'; if(bondType!=='triple') H-=4; break;
      case 'alcohol':  suffix = 'ol';  extra = '–OH'; break;
      case 'aldehyde': suffix = 'al';  H-=1; extra='–CHO'; break;
      case 'ketone':   suffix = 'one'; H-=2; extra='C=O'; break;
      case 'acid':     suffix = 'oic acid'; H-=2; extra='–COOH'; break;
      case 'ester':    suffix = 'anoate'; H-=2; extra='–COO–'; break;
      case 'amine':    suffix = 'amine'; extra='–NH₂'; break;
      case 'amide':    suffix = 'amide'; H-=1; extra='–CONH₂'; break;
      case 'haloalkane': suffix = 'yl chloride'; H-=1; extra='–Cl'; break;
      case 'nitrile':  suffix = 'nitrile'; H-=1; extra='–CN'; break;
      default:         suffix = 'ane';
    }

    H = Math.max(H, 1);
    const chainName = CHEM.chainPrefix[carbons] || ('C'+carbons);
    return {
      molecular: this.buildMolecularFormula(carbons, H, fg),
      condensed: this.buildCondensed(carbons, fg),
      iupac: this.buildIUPACName(carbons, bondType, fg, position),
      chainName, suffix, extra,
      carbons, hydrogens: H
    };
  },

  buildMolecularFormula(n, h, fg) {
    let c = n, hyd = h, o = 0, nitrogen = 0, cl = 0;
    if (fg === 'alcohol') { o=1; }
    if (fg === 'aldehyde') { o=1; hyd+=1; }
    if (fg === 'ketone') { o=1; hyd+=2; }
    if (fg === 'acid') { o=2; hyd+=2; }
    if (fg === 'ester') { o=2; hyd+=2; }
    if (fg === 'amine') { nitrogen=1; hyd+=2; }
    if (fg === 'amide') { o=1; nitrogen=1; hyd+=1; }
    if (fg === 'haloalkane') { cl=1; }
    if (fg === 'nitrile') { c+=1; nitrogen=1; hyd+=1; }

    let f = 'C';
    if (c > 1) f += sub(c);
    f += 'H';
    if (hyd > 1) f += sub(hyd);
    if (o > 0) { f += 'O'; if(o>1) f+=sub(o); }
    if (nitrogen > 0) f += 'N';
    if (cl > 0) f += 'Cl';
    return f;
  },

  buildCondensed(n, fg) {
    if (n === 1) {
      const map = {
        alkane:'CH₄', alkene:'CH₂', alkyne:'CH', alcohol:'CH₃OH',
        aldehyde:'HCHO', acid:'HCOOH', amine:'CH₃NH₂', amide:'HCONH₂',
        haloalkane:'CH₃Cl', nitrile:'CH₃CN'
      };
      return map[fg] || 'CH₄';
    }
    const mid = n - 2;
    let chain = 'CH₃';
    if (mid > 0) chain += mid === 1 ? 'CH₂' : `(CH₂)${sub(mid)}`;
    switch(fg) {
      case 'alcohol':   return chain + 'CH₂OH';
      case 'aldehyde':  return chain + 'CHO';
      case 'ketone':    return n===3 ? 'CH₃COCH₃' : chain + 'COCH₃';
      case 'acid':      return chain + 'COOH';
      case 'ester':     return chain + 'COOCH₃';
      case 'amine':     return chain + 'CH₂NH₂';
      case 'amide':     return chain + 'CONH₂';
      case 'haloalkane':return chain + 'CH₂Cl';
      case 'nitrile':   return chain + 'CH₂CN';
      default:          return chain + 'CH₃';
    }
  },

  buildIUPACName(n, bondType, fg, position) {
    const p = CHEM.chainPrefix[n];
    if (!p) return `C${n} compound`;

    if (fg === 'alkane') return p + 'ane';
    if (fg === 'alkene') {
      const pos = n <= 2 ? '' : `-${position}-`;
      return p + pos + 'ene';
    }
    if (fg === 'alkyne') {
      const pos = n <= 2 ? '' : `-${position}-`;
      return p + pos + 'yne';
    }
    if (fg === 'alcohol') {
      const pos = n === 1 ? '' : `-${position}-`;
      return p + 'an' + pos + 'ol';
    }
    if (fg === 'aldehyde') return p + 'anal';
    if (fg === 'ketone') {
      if (n === 3) return 'propan-2-one';
      return p + `an-${position}-one`;
    }
    if (fg === 'acid') return p + 'anoic acid';
    if (fg === 'ester') return `methyl ${p}anoate`;
    if (fg === 'amine') return p + 'an-1-amine';
    if (fg === 'amide') return p + 'anamide';
    if (fg === 'haloalkane') return `${position}-chloro${p}ane`;
    if (fg === 'nitrile') return p + 'anenitrile';
    return p + 'ane';
  },

  /** Get hydrogen count for display */
  getHydrogens(carbons, fg='alkane') {
    const base = 2*carbons + 2;
    const sub = { alkane:0, alkene:2, alkyne:4, alcohol:0, aldehyde:1,
                  ketone:2, acid:2, ester:2, amine:0, amide:1, haloalkane:1, nitrile:1 };
    return Math.max(base - (sub[fg] || 0), 1);
  },
};

/* helper: subscript digits */
function sub(n) {
  const map = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'};
  return String(n).split('').map(c=>map[c]||c).join('');
}

/* ══════════════════════════════════════
   SECTION 3: SVG STRUCTURE RENDERER
══════════════════════════════════════ */
const SVGRenderer = {

  /** Draw zigzag alkane chain (line-angle style) */
  drawLineAngle(carbons, fg='alkane', bondType='single', w=400, h=120) {
    if (carbons < 1) return '<svg></svg>';
    const step = Math.min(50, (w-40) / Math.max(carbons,2));
    const cx = (w - step*(carbons-1)) / 2;
    const cy = h/2;
    const amp = 22;

    let pts = [];
    for (let i=0; i<carbons; i++) {
      pts.push({ x: cx + i*step, y: cy + (i%2===0 ? 0 : amp) });
    }

    let bonds = '';
    const bType = (fg==='alkene'||bondType==='double') ? 'double' :
                  (fg==='alkyne'||bondType==='triple') ? 'triple' : 'single';

    for (let i=0; i<pts.length-1; i++) {
      const {x:x1,y:y1} = pts[i], {x:x2,y:y2} = pts[i+1];
      bonds += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8cb4d8" stroke-width="2" stroke-linecap="round"/>`;
      if (bType==='double' && i===0) {
        const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy), nx=-dy/len*4, ny=dx/len*4;
        bonds += `<line x1="${x1+nx}" y1="${y1+ny}" x2="${x2+nx}" y2="${y2+ny}" stroke="#22d3ee" stroke-width="1.5" stroke-linecap="round"/>`;
      }
      if (bType==='triple' && i===0) {
        const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy), nx=-dy/len*5, ny=dx/len*5;
        bonds += `<line x1="${x1+nx}" y1="${y1+ny}" x2="${x2+nx}" y2="${y2+ny}" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round"/>`;
        bonds += `<line x1="${x1-nx}" y1="${y1-ny}" x2="${x2-nx}" y2="${y2-ny}" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round"/>`;
      }
    }

    // Functional group at last carbon
    let fgLabel = '';
    const last = pts[pts.length-1];
    const fgMap = { alcohol:'OH', aldehyde:'CHO', acid:'COOH', ester:'COO⁻', amine:'NH₂', amide:'CONH₂', haloalkane:'Cl', nitrile:'CN' };
    if (fgMap[fg]) {
      fgLabel = `<text x="${last.x+8}" y="${last.y+5}" fill="#fb923c" font-size="11" font-family="monospace" font-weight="bold">–${fgMap[fg]}</text>`;
    }

    // Endpoint dots
    let dots = pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="3" fill="#1e3a5f" stroke="#38bdf8" stroke-width="1.5"/>`).join('');

    return `<svg class="mol-svg" viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px">${bonds}${dots}${fgLabel}</svg>`;
  },

  /** Draw structural formula (Lewis-style) */
  drawStructural(carbons, fg='alkane', w=560, h=140) {
    if (carbons < 1) return '';
    const perRow = Math.min(carbons, 6);
    const startX = 30, gapX = (w-60)/Math.max(perRow-1,1);
    const atomR = 16;

    let atoms='', bonds='', labels='';

    for (let i=0; i<carbons; i++) {
      const x = startX + i*gapX;
      const y = h/2;
      atoms += `<circle cx="${x}" cy="${y}" r="${atomR}" fill="#1a2a4a" stroke="#38bdf8" stroke-width="1.5"/>`;
      atoms += `<text x="${x}" y="${y+5}" text-anchor="middle" fill="#e2f0ff" font-size="12" font-weight="700" font-family="monospace">C</text>`;

      // H atoms above/below
      const hCount = i===0||i===carbons-1 ? 3 : 2;
      const hOff = [-18, 18];
      for (let j=0; j<Math.min(hCount, hOff.length); j++) {
        const hx = x + hOff[j];
        atoms += `<circle cx="${hx}" cy="${y}" r="9" fill="#0f2540" stroke="#63b3ed" stroke-width="1"/>`;
        atoms += `<text x="${hx}" y="${y+4}" text-anchor="middle" fill="#bee3f8" font-size="9" font-weight="600" font-family="monospace">H</text>`;
        bonds += `<line x1="${x+(hOff[j]>0?atomR:-atomR)}" y1="${y}" x2="${hx+(hOff[j]>0?-9:9)}" y2="${y}" stroke="#8cb4d8" stroke-width="1.2"/>`;
      }

      // Bond to next carbon
      if (i < carbons-1) {
        const nx = startX + (i+1)*gapX;
        bonds += `<line x1="${x+atomR}" y1="${y}" x2="${nx-atomR}" y2="${y}" stroke="#8cb4d8" stroke-width="2"/>`;
      }
    }

    // Functional group label at end
    if (['alcohol','aldehyde','ketone','acid','ester','amine','amide','haloalkane'].includes(fg)) {
      const last = startX + (carbons-1)*gapX;
      const fgTxt = {alcohol:'OH',aldehyde:'CHO',ketone:'=O',acid:'COOH',ester:'COO⁻',amine:'NH₂',amide:'CONH₂',haloalkane:'Cl'};
      const fgColor = {alcohol:'#6ee7b7',aldehyde:'#fde68a',ketone:'#fbbf24',acid:'#f87171',ester:'#fb923c',amine:'#86efac',amide:'#a7f3d0',haloalkane:'#d4d4d4'};
      labels += `<text x="${last+28}" y="${h/2+5}" fill="${fgColor[fg]||'#fb923c'}" font-size="13" font-weight="bold" font-family="monospace">${fgTxt[fg]||''}</text>`;
    }

    return `<svg class="mol-svg" viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px">${bonds}${atoms}${labels}</svg>`;
  },

  /** Draw bond (sigma/pi visualization) */
  drawBond(type='single', w=300, h=100) {
    const cx=150, cy=50, r=18;
    const atomA = `<circle cx="${cx-70}" cy="${cy}" r="${r}" fill="#1a2a4a" stroke="#38bdf8" stroke-width="2"/>
      <text x="${cx-70}" y="${cy+5}" text-anchor="middle" fill="#e2f0ff" font-size="13" font-weight="700" font-family="monospace">C</text>`;
    const atomB = `<circle cx="${cx+70}" cy="${cy}" r="${r}" fill="#1a2a4a" stroke="#38bdf8" stroke-width="2"/>
      <text x="${cx+70}" y="${cy+5}" text-anchor="middle" fill="#e2f0ff" font-size="13" font-weight="700" font-family="monospace">C</text>`;

    let bondLines = '';
    if (type==='single') {
      bondLines = `<line x1="${cx-52}" y1="${cy}" x2="${cx+52}" y2="${cy}" stroke="#8cb4d8" stroke-width="3" stroke-linecap="round"/>`;
    } else if (type==='double') {
      bondLines = `<line x1="${cx-52}" y1="${cy-5}" x2="${cx+52}" y2="${cy-5}" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="${cx-52}" y1="${cy+5}" x2="${cx+52}" y2="${cy+5}" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round"/>`;
    } else {
      bondLines = `<line x1="${cx-52}" y1="${cy}" x2="${cx+52}" y2="${cy}" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/>
        <line x1="${cx-52}" y1="${cy-7}" x2="${cx+52}" y2="${cy-7}" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/>
        <line x1="${cx-52}" y1="${cy+7}" x2="${cx+52}" y2="${cy+7}" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/>`;
    }
    return `<svg class="mol-svg" viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px">${bondLines}${atomA}${atomB}</svg>`;
  },
};

/* ══════════════════════════════════════
   SECTION 4: QUESTION BANK (100+ Qs)
══════════════════════════════════════ */
const QuestionBank = {
  all: [
    // CARBON & BONDING
    { q:'ธาตุใดเป็นองค์ประกอบหลักของสารอินทรีย์ทุกชนิด?', a:'คาร์บอน (C)', opts:['ออกซิเจน (O)','คาร์บอน (C)','ไฮโดรเจน (H)','ไนโตรเจน (N)'], hint:'ธาตุที่สามารถสร้างพันธะได้ 4 พันธะ', topic:'carbon' },
    { q:'คาร์บอนสามารถสร้างพันธะโควาเลนต์ได้กี่พันธะ?', a:'4', opts:['2','3','4','6'], hint:'ดูจากจำนวน valence electrons ของ C', topic:'carbon' },
    { q:'พันธะใดที่ประกอบด้วย sigma 1 พันธะ และ pi 1 พันธะ?', a:'พันธะคู่ (Double bond)', opts:['พันธะเดี่ยว','พันธะคู่ (Double bond)','พันธะสาม','พันธะไอออนิก'], hint:'นับ sigma + pi', topic:'bond' },
    { q:'พันธะ Triple Bond มี sigma กี่พันธะ?', a:'1', opts:['1','2','3','0'], hint:'ทุกพันธะมี sigma 1 เสมอ', topic:'bond' },
    { q:'สูตรทั่วไปของ Alkane คือข้อใด?', a:'CₙH₂ₙ₊₂', opts:['CₙH₂ₙ','CₙH₂ₙ₋₂','CₙH₂ₙ₊₂','CₙH₂ₙ₊₁'], hint:'Alkane ไม่มีพันธะคู่/สาม', topic:'hydrocarbon' },
    { q:'สูตรทั่วไปของ Alkene คือข้อใด?', a:'CₙH₂ₙ', opts:['CₙH₂ₙ₊₂','CₙH₂ₙ','CₙH₂ₙ₋₂','CₙH₂ₙ₋₄'], hint:'มีพันธะคู่ 1 พันธะ ลด H ไป 2', topic:'hydrocarbon' },
    { q:'สูตรทั่วไปของ Alkyne คือข้อใด?', a:'CₙH₂ₙ₋₂', opts:['CₙH₂ₙ₊₂','CₙH₂ₙ','CₙH₂ₙ₋₂','CₙH₂ₙ₋₄'], hint:'มีพันธะสาม 1 พันธะ ลด H ไป 4', topic:'hydrocarbon' },
    // IUPAC NAMING
    { q:'ชื่อ IUPAC ของ CH₄ คือข้อใด?', a:'Methane', opts:['Methane','Ethane','Propane','Butane'], hint:'C=1 → meth-', topic:'iupac' },
    { q:'ชื่อ IUPAC ของ C₂H₆ คือข้อใด?', a:'Ethane', opts:['Methane','Ethane','Propane','Butane'], hint:'C=2 → eth-', topic:'iupac' },
    { q:'ชื่อ IUPAC ของ C₃H₈ คือข้อใด?', a:'Propane', opts:['Ethane','Propane','Butane','Pentane'], hint:'C=3 → prop-', topic:'iupac' },
    { q:'ชื่อ IUPAC ของ C₄H₁₀ คือข้อใด?', a:'Butane', opts:['Propane','Butane','Pentane','Hexane'], hint:'C=4 → but-', topic:'iupac' },
    { q:'ชื่อ IUPAC ของ C₅H₁₂ คือข้อใด?', a:'Pentane', opts:['Butane','Pentane','Hexane','Heptane'], hint:'C=5 → pent-', topic:'iupac' },
    { q:'ชื่อ IUPAC ของ C₆H₁₄ คือข้อใด?', a:'Hexane', opts:['Pentane','Hexane','Heptane','Octane'], hint:'C=6 → hex-', topic:'iupac' },
    { q:'ชื่อ IUPAC ของ C₇H₁₆ คือข้อใด?', a:'Heptane', opts:['Hexane','Heptane','Octane','Nonane'], hint:'C=7 → hept-', topic:'iupac' },
    { q:'ชื่อ IUPAC ของ C₈H₁₈ คือข้อใด?', a:'Octane', opts:['Heptane','Octane','Nonane','Decane'], hint:'C=8 → oct-', topic:'iupac' },
    { q:'ชื่อ IUPAC ของ C₉H₂₀ คือข้อใด?', a:'Nonane', opts:['Octane','Nonane','Decane','Undecane'], hint:'C=9 → non-', topic:'iupac' },
    { q:'ชื่อ IUPAC ของ C₁₀H₂₂ คือข้อใด?', a:'Decane', opts:['Nonane','Decane','Undecane','Dodecane'], hint:'C=10 → dec-', topic:'iupac' },
    // FUNCTIONAL GROUPS
    { q:'หมู่ฟังก์ชัน –OH เมื่ออยู่กับ Alkyl group จะได้สารประเภทใด?', a:'Alcohol', opts:['Ether','Alcohol','Phenol','Aldehyde'], hint:'R–OH = Alcohol', topic:'fg' },
    { q:'หมู่ฟังก์ชัน –CHO เป็นหมู่ฟังก์ชันของสารประเภทใด?', a:'Aldehyde', opts:['Ketone','Aldehyde','Alcohol','Ester'], hint:'Aldehyde มี H ต่อกับ C=O', topic:'fg' },
    { q:'หมู่ฟังก์ชัน –COOH เป็นของสารประเภทใด?', a:'Carboxylic Acid', opts:['Ester','Ketone','Carboxylic Acid','Amide'], hint:'กรดอินทรีย์มี –COOH', topic:'fg' },
    { q:'หมู่ฟังก์ชัน –COO– เป็นของสารประเภทใด?', a:'Ester', opts:['Acid','Ether','Ester','Alcohol'], hint:'Ester เกิดจากการรวมกันของ Acid + Alcohol', topic:'fg' },
    { q:'หมู่ฟังก์ชัน –NH₂ เป็นของสารประเภทใด?', a:'Amine', opts:['Amide','Amine','Nitrile','Ether'], hint:'Amine มีไนโตรเจนและไฮโดรเจน', topic:'fg' },
    { q:'Ethanol มีสูตรโมเลกุลอะไร?', a:'C₂H₅OH', opts:['CH₃OH','C₂H₅OH','C₃H₇OH','C₄H₉OH'], hint:'Eth = C2, Alcohol = -ol', topic:'fg' },
    { q:'Methanol มีชื่อสามัญว่าอะไร?', a:'Wood alcohol', opts:['Grain alcohol','Wood alcohol','Rubbing alcohol','Drinking alcohol'], hint:'Methanol สกัดจากไม้', topic:'fg' },
    { q:'Ethanol มีชื่อสามัญว่าอะไร?', a:'Grain alcohol', opts:['Wood alcohol','Grain alcohol','Rubbing alcohol','Propanol'], hint:'เอทานอลในเครื่องดื่มแอลกอฮอล์', topic:'fg' },
    // ALKENES
    { q:'ชื่อ IUPAC ของ C₂H₄ คือข้อใด?', a:'Ethene', opts:['Ethane','Ethene','Ethyne','Propene'], hint:'C=2, มีพันธะคู่ → -ene', topic:'alkene' },
    { q:'ชื่อ IUPAC ของ C₃H₆ (พันธะคู่ตำแหน่ง 1) คือข้อใด?', a:'Prop-1-ene', opts:['Prop-1-ene','Propene','Propane','Propyne'], hint:'C=3, double bond ที่ C1', topic:'alkene' },
    { q:'Ethene ใช้ผลิตสิ่งใด?', a:'พลาสติก PE (Polyethylene)', opts:['เชื้อเพลิง','พลาสติก PE (Polyethylene)','น้ำส้มสายชู','ยาสลบ'], hint:'เอทิลีนเป็นมอนอเมอร์ของ PE', topic:'alkene' },
    // ALKYNES
    { q:'ชื่อ IUPAC ของ C₂H₂ คือข้อใด?', a:'Ethyne', opts:['Ethane','Ethene','Ethyne','Propyne'], hint:'C=2, มีพันธะสาม → -yne', topic:'alkyne' },
    { q:'Acetylene คือชื่อสามัญของสารใด?', a:'Ethyne', opts:['Ethene','Ethyne','Propyne','Butyne'], hint:'Acetylene = Ethyne', topic:'alkyne' },
    { q:'Ethyne ใช้ในการเชื่อมโลหะเพราะเหตุใด?', a:'ให้ความร้อนสูงมากเมื่อเผาไหม้', opts:['ราคาถูก','ให้ความร้อนสูงมากเมื่อเผาไหม้','ไม่เป็นพิษ','ละลายน้ำได้ดี'], hint:'เปลวไฟออกซีอะเซทิลีน', topic:'alkyne' },
    // ALCOHOL
    { q:'Butan-2-ol หมายความว่าอย่างไร?', a:'Butanol ที่มี OH ที่ C ตำแหน่งที่ 2', opts:['Butanol ที่มี OH ที่ C ตำแหน่งที่ 1','Butanol ที่มี OH ที่ C ตำแหน่งที่ 2','Butanol ที่มี OH ที่ C ตำแหน่งที่ 3','Butanol ที่มี OH ที่ C ตำแหน่งที่ 4'], hint:'ตัวเลขหน้า -ol บอกตำแหน่ง OH', topic:'alcohol' },
    { q:'เอทานอล (Ethanol) ใช้เป็นยาฆ่าเชื้อที่ความเข้มข้นเท่าใด?', a:'70%', opts:['40%','50%','70%','95%'], hint:'ความเข้มข้น 70% ฆ่าเชื้อโรคได้ดีที่สุด', topic:'alcohol' },
    // ALDEHYDE & KETONE
    { q:'Methanal (Formaldehyde) ใช้ทำอะไร?', a:'ฟอร์มาลิน (สารดองศพ)', opts:['น้ำส้มสายชู','ฟอร์มาลิน (สารดองศพ)','น้ำยาล้างเล็บ','เชื้อเพลิง'], hint:'Methanal = Formaldehyde', topic:'aldehyde' },
    { q:'Propan-2-one คือสารใด?', a:'Acetone', opts:['Propanol','Propanoic acid','Acetone','Propanal'], hint:'Propan-2-one มีชื่อสามัญว่า Acetone', topic:'ketone' },
    { q:'Acetone ใช้ทำอะไรในชีวิตประจำวัน?', a:'น้ำยาล้างเล็บ', opts:['เครื่องดื่ม','น้ำยาล้างเล็บ','ยาสีฟัน','น้ำหอม'], hint:'Acetone ละลายสี nail polish', topic:'ketone' },
    // CARBOXYLIC ACID
    { q:'Ethanoic acid มีชื่อสามัญว่าอะไร?', a:'Acetic acid (กรดน้ำส้ม)', opts:['Formic acid','Acetic acid (กรดน้ำส้ม)','Citric acid','Lactic acid'], hint:'Ethanoic acid อยู่ในน้ำส้มสายชู', topic:'acid' },
    { q:'กรด Methanoic มีอีกชื่อว่าอะไร?', a:'Formic acid', opts:['Formic acid','Acetic acid','Propionic acid','Butyric acid'], hint:'กรดในมดแดง', topic:'acid' },
    { q:'Methanoic acid มีสูตรโมเลกุลอะไร?', a:'HCOOH', opts:['CH₃COOH','HCOOH','C₂H₅COOH','CH₃CH₂COOH'], hint:'Meth = C1, acid = COOH', topic:'acid' },
    // ESTER
    { q:'Ester เกิดจากปฏิกิริยาระหว่างสารใด 2 ชนิด?', a:'Carboxylic acid + Alcohol', opts:['Alcohol + Ether','Carboxylic acid + Alcohol','Aldehyde + Ketone','Amine + Acid'], hint:'ปฏิกิริยา Esterification', topic:'ester' },
    { q:'Methyl ethanoate มีกลิ่นคล้ายใด?', a:'กลิ่นกาว', opts:['กลิ่นกล้วย','กลิ่นกาว','กลิ่นสตรอเบอรี่','กลิ่นแอปเปิ้ล'], hint:'Methyl ethanoate ใช้เป็นตัวทำละลายกาว', topic:'ester' },
    { q:'Ethyl ethanoate ใช้ทำอะไร?', a:'ตัวทำละลาย เช่น ทินเนอร์', opts:['น้ำส้มสายชู','ตัวทำละลาย เช่น ทินเนอร์','เครื่องดื่มแอลกอฮอล์','ยาระงับปวด'], hint:'Ester มักใช้เป็นตัวทำละลาย', topic:'ester' },
    // AMINE
    { q:'Amine เกิดจากการที่ NH₃ มีการแทนที่โดยอะไร?', a:'Alkyl group (R)', opts:['Oxygen','Alkyl group (R)','Halogen','Carboxyl'], hint:'R–NH₂ = Primary amine', topic:'amine' },
    { q:'กลิ่นของ Amine คล้ายกับสิ่งใด?', a:'กลิ่นปลาเน่า', opts:['กลิ่นดอกไม้','กลิ่นปลาเน่า','กลิ่นน้ำตาล','กลิ่นอาหาร'], hint:'ทรีเมทิลลามีน (TMA) ทำให้ปลาเหม็น', topic:'amine' },
    // AMIDE
    { q:'Amide เกิดจากการรวมกันของสารใด?', a:'Carboxylic acid + Amine', opts:['Alcohol + Amine','Carboxylic acid + Amine','Ketone + Amine','Ester + Amine'], hint:'Amide มีหมู่ –CONH₂', topic:'amide' },
    { q:'Nylon เป็นพอลิเมอร์ที่มีพันธะ Amide ต่อสายโซ่หรือไม่?', a:'ใช่ เรียกว่าพันธะเพปไทด์ในโปรตีน', opts:['ไม่ใช่','ใช่ เรียกว่าพันธะเพปไทด์ในโปรตีน','ใช่ เรียกว่าพันธะ Ester','ไม่แน่ใจ'], hint:'Nylon มีพันธะ Amide', topic:'amide' },
    // HALOALKANE
    { q:'Chloromethane (CH₃Cl) จัดเป็นสารประเภทใด?', a:'Haloalkane', opts:['Alcohol','Ether','Haloalkane','Amine'], hint:'มีอะตอม Cl แทนที่ H', topic:'haloalkane' },
    { q:'หมู่ฟังก์ชัน –X (X = Halogen) ในสารอินทรีย์เรียกว่าอะไร?', a:'Haloalkane / Alkyl halide', opts:['Ether','Amine','Haloalkane / Alkyl halide','Phenol'], hint:'X แทน F, Cl, Br, I', topic:'haloalkane' },
    // STRUCTURAL FORMULAS
    { q:'สูตรย่อ CH₃CH₂CH₃ แทนสารอะไร?', a:'Propane', opts:['Ethane','Propane','Butane','Methane'], hint:'CH₃ + CH₂ + CH₃ = 3 carbons', topic:'structure' },
    { q:'สูตรย่อ CH₃OH แทนสารอะไร?', a:'Methanol', opts:['Methanol','Ethanol','Propanol','Methanal'], hint:'CH₃ + OH = Methanol', topic:'structure' },
    { q:'สูตรย่อ CH₃CHO แทนสารอะไร?', a:'Ethanal', opts:['Ethanol','Ethanal','Propanol','Ethanone'], hint:'CHO = Aldehyde group, C=2', topic:'structure' },
    { q:'สูตร CH₃COCH₃ แทนสารอะไร?', a:'Propan-2-one (Acetone)', opts:['Propanal','Propanol','Propan-2-one (Acetone)','Propanoic acid'], hint:'C=O ตรงกลาง = Ketone', topic:'structure' },
    { q:'Hexane มีจำนวน Carbon และ Hydrogen เท่าใด?', a:'C=6, H=14', opts:['C=6, H=12','C=6, H=14','C=6, H=16','C=6, H=10'], hint:'Alkane: H = 2n+2, n=6', topic:'structure' },
    { q:'สูตร C₄H₈ อาจเป็นสารประเภทใดได้บ้าง?', a:'Alkene หรือ Cycloalkane', opts:['Alkane เท่านั้น','Alkene หรือ Cycloalkane','Alkyne เท่านั้น','Alcohol'], hint:'CₙH₂ₙ = Alkene หรือ Cycloalkane', topic:'structure' },
    // AROMATIC
    { q:'Benzene มีสูตรโมเลกุลอะไร?', a:'C₆H₆', opts:['C₆H₁₂','C₆H₆','C₆H₁₄','C₆H₈'], hint:'Benzene มี ring 6 คาร์บอน', topic:'aromatic' },
    { q:'Benzene ring มีพันธะแบบใด?', a:'พันธะ delocalized (แบบพิเศษ)', opts:['Single bond ทั้งหมด','Double bond ทั้งหมด','Triple bond','พันธะ delocalized (แบบพิเศษ)'], hint:'Benzene มีการ resonance', topic:'aromatic' },
    { q:'Toluene คือ Benzene ที่มีหมู่ใดแทนที่ H?', a:'Methyl (–CH₃)', opts:['Ethyl (–C₂H₅)','Methyl (–CH₃)','Hydroxyl (–OH)','Amino (–NH₂)'], hint:'Toluene = Methylbenzene', topic:'aromatic' },
    // ISOMERS
    { q:'Butane (C₄H₁₀) มีจำนวน Structural isomers กี่ชนิด?', a:'2 ชนิด', opts:['1 ชนิด','2 ชนิด','3 ชนิด','4 ชนิด'], hint:'n-Butane และ iso-Butane', topic:'isomer' },
    { q:'Isomers หมายถึงสารที่มีคุณสมบัติอะไรเหมือนกัน?', a:'สูตรโมเลกุลเหมือนกัน แต่สูตรโครงสร้างต่างกัน', opts:['สูตรโครงสร้างเหมือนกัน','สูตรโมเลกุลเหมือนกัน แต่สูตรโครงสร้างต่างกัน','ชื่อเหมือนกัน','คุณสมบัติทางกายภาพเหมือนกัน'], hint:'สูตรเหมือน โครงสร้างต่าง = isomer', topic:'isomer' },
    { q:'Pentane มีจำนวน Structural isomers กี่ชนิด?', a:'3 ชนิด', opts:['2 ชนิด','3 ชนิด','4 ชนิด','5 ชนิด'], hint:'n-pentane, iso-pentane, neo-pentane', topic:'isomer' },
    // REACTIONS
    { q:'Alkene ทำปฏิกิริยา Addition กับ Br₂ ได้ผลิตภัณฑ์อะไร?', a:'Dibromoalkane', opts:['Alcohol','Dibromoalkane','Bromoalkane','Alkane'], hint:'Br₂ เติมที่พันธะคู่', topic:'reaction' },
    { q:'ปฏิกิริยา Combustion ของ Alkane ได้ผลิตภัณฑ์อะไร?', a:'CO₂ + H₂O', opts:['CO + H₂','CO₂ + H₂O','CH₄ + O₂','C + H₂'], hint:'การเผาไหม้สมบูรณ์', topic:'reaction' },
    { q:'ปฏิกิริยา Saponification คือปฏิกิริยาใด?', a:'Ester + NaOH → Soap + Alcohol', opts:['Acid + Alcohol → Ester','Ester + NaOH → Soap + Alcohol','Amine + Acid → Amide','Alkene + H₂ → Alkane'], hint:'Saponification ใช้ผลิตสบู่', topic:'reaction' },
    { q:'Test ใดใช้แยก Alkene จาก Alkane?', a:'Bromine water test (สีน้ำตาลจาง)', opts:['Fehling test','Bromine water test (สีน้ำตาลจาง)','Litmus test','Tollens test'], hint:'Alkene ทำให้น้ำโบรมีนจาง', topic:'reaction' },
    { q:'Tollens test ใช้แยกสารประเภทใด?', a:'Aldehyde (เกิด Silver mirror)', opts:['Ketone','Aldehyde (เกิด Silver mirror)','Alcohol','Ester'], hint:'Ag+ → Ag (กระจกเงิน)', topic:'reaction' },
    // PROPERTIES
    { q:'สารอินทรีย์ส่วนใหญ่ละลายในตัวทำละลายใด?', a:'ตัวทำละลายอินทรีย์ (Organic solvent)', opts:['น้ำ','ตัวทำละลายอินทรีย์ (Organic solvent)','กรด','เบส'], hint:'Like dissolves like', topic:'property' },
    { q:'สารประเภทใดมีจุดเดือดสูงที่สุดเนื่องจาก H-bond?', a:'Alcohol', opts:['Alkane','Ether','Alcohol','Aldehyde'], hint:'OH สร้าง H-bond ได้แข็งแรง', topic:'property' },
    { q:'Alkane มีขั้วหรือไม่?', a:'ไม่มีขั้ว (Non-polar)', opts:['มีขั้วสูง','มีขั้วต่ำ','ไม่มีขั้ว (Non-polar)','ขึ้นกับขนาด'], hint:'C–H bond มี electronegativity ใกล้กัน', topic:'property' },
    { q:'จุดเดือดของ Alkane เพิ่มขึ้นตามจำนวน Carbon เพราะเหตุใด?', a:'แรง van der Waals เพิ่มขึ้น', opts:['H-bond เพิ่มขึ้น','แรง van der Waals เพิ่มขึ้น','น้ำหนักโมเลกุลลดลง','ขั้วโมเลกุลเพิ่มขึ้น'], hint:'โมเลกุลใหญ่ → London dispersion force', topic:'property' },
    // POLYMERS
    { q:'Polyethylene (PE) เกิดจาก Monomer อะไร?', a:'Ethylene (Ethene, C₂H₄)', opts:['Propylene','Ethylene (Ethene, C₂H₄)','Acetylene','Butylene'], hint:'Poly + ethylene', topic:'polymer' },
    { q:'Polypropylene (PP) เกิดจาก Monomer อะไร?', a:'Propylene (C₃H₆)', opts:['Ethylene','Propylene (C₃H₆)','Butylene','Styrene'], hint:'Poly + propylene', topic:'polymer' },
    { q:'ปฏิกิริยาพอลิเมอไรเซชันของ Alkene เรียกว่าอะไร?', a:'Addition polymerization', opts:['Condensation polymerization','Addition polymerization','Ring-opening polymerization','Chain polymerization'], hint:'Alkene เปิดพันธะคู่', topic:'polymer' },
    // ADDITIONAL STRUCTURAL / NAMING
    { q:'Hex-1-ene หมายความว่าอย่างไร?', a:'Hexene ที่มีพันธะคู่ที่ C1', opts:['Hexene ที่มีพันธะคู่ที่ C1','Hexene ที่มีพันธะคู่ที่ C2','Hexane ที่มีพันธะสาม','Hexanol'], hint:'ตัวเลขบอกตำแหน่งพันธะคู่', topic:'iupac' },
    { q:'สาร 2-methylpropane มีคาร์บอนกี่อะตอม?', a:'4', opts:['3','4','5','6'], hint:'propane=3C + methyl=1C', topic:'iupac' },
    { q:'Cyclopropane มีสูตรโมเลกุลอะไร?', a:'C₃H₆', opts:['C₃H₈','C₃H₆','C₃H₄','C₃H₁₀'], hint:'Cycloalkane: CₙH₂ₙ, n=3', topic:'hydrocarbon' },
    { q:'สารใดเป็น Primary alcohol?', a:'1-butanol', opts:['2-butanol','1-butanol','2-methyl-2-propanol','Cyclohexanol'], hint:'Primary: OH ที่ C ปลายสาย', topic:'alcohol' },
    { q:'Diethyl ether มีสูตรโมเลกุลอะไร?', a:'C₄H₁₀O', opts:['C₂H₆O','C₄H₁₀O','C₃H₈O','C₆H₁₄O'], hint:'Ethyl=C2, Di=2 ethyl + O', topic:'ether' },
    // EXTRA CHALLENGING
    { q:'Organic compound ที่มีสูตร C₃H₆O อาจเป็นสารประเภทใดได้บ้าง?', a:'Aldehyde หรือ Ketone หรือ Cyclic ether', opts:['Alkane เท่านั้น','Alcohol เท่านั้น','Aldehyde หรือ Ketone หรือ Cyclic ether','Alkene เท่านั้น'], hint:'มี Oxygen 1 อะตอม', topic:'structure' },
    { q:'ปฏิกิริยา Hydrogenation ของ Alkene ได้ผลิตภัณฑ์อะไร?', a:'Alkane', opts:['Alcohol','Alkane','Alkyne','Aldehyde'], hint:'H₂ เติมที่พันธะคู่', topic:'reaction' },
    { q:'Biodiesel คือ Ester ที่ผลิตจากอะไร?', a:'น้ำมันพืช + Methanol', opts:['น้ำมันปิโตรเลียม','น้ำมันพืช + Methanol','ก๊าซธรรมชาติ','ถ่านหิน'], hint:'Esterification ของ Fatty acid', topic:'fg' },
    { q:'กรดอะมิโน (Amino acid) มีทั้งหมู่ฟังก์ชันใดบ้าง?', a:'–COOH และ –NH₂', opts:['–OH และ –CHO','–COOH และ –NH₂','–COOH เท่านั้น','–NH₂ เท่านั้น'], hint:'กรดอะมิโน = amine + acid', topic:'fg' },
    { q:'DNA/RNA มีพันธะ Phosphodiester ซึ่งคล้ายกับสารประเภทใด?', a:'Ester', opts:['Ether','Ester','Amine','Amide'], hint:'Diester = Ester 2 พันธะ', topic:'polymer' },
  ],

  getByTopic(topic, n=10) {
    const pool = this.all.filter(q => q.topic === topic);
    return shuffle(pool).slice(0, n);
  },

  getRandom(n=10) {
    return shuffle([...this.all]).slice(0, n);
  },

  get50() {
    const topics = ['carbon','bond','iupac','hydrocarbon','fg','alcohol','aldehyde','ketone','acid','ester','amine','amide','haloalkane','structure','reaction','property','polymer','aromatic','isomer','alkene','alkyne'];
    let pool = [];
    topics.forEach(t => {
      const qs = this.all.filter(q=>q.topic===t);
      pool.push(...shuffle(qs).slice(0, Math.max(1, Math.floor(50/topics.length)+1)));
    });
    return shuffle(pool).slice(0, 50);
  }
};

function shuffle(arr) {
  const a = [...arr];
  for (let i=a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

/* ══════════════════════════════════════
   SECTION 5: USER / GAME STATE
══════════════════════════════════════ */
const State = {
  user: null,
  xp: 0,
  level: 1,
  hearts: 3,
  badges: [],
  planetsDone: {},
  startTime: null,
  examStartTime: null,
  examTimer: null,
  examSeconds: 0,
  quiz: { questions:[], idx:0, score:0, topic:'' },
  exam: { questions:[], idx:0, score:0, wrong:[] },
  adminPin: '1234',
};

const XP_PER_LEVEL = 100;
const BADGE_MAP = {
  p1:'🌍', p2:'⚗️', p3:'🔬', p4:'🧪', p5:'🏛️',
  p6:'🎓', p7:'🔧', p8:'🎮', p9:'🏆',
  perfect:'⭐', speed:'⚡', master:'👑'
};

function loadState() {
  try {
    const raw = localStorage.getItem('ochem_state');
    if (raw) {
      const s = JSON.parse(raw);
      State.user = s.user;
      State.xp   = s.xp || 0;
      State.level = s.level || 1;
      State.hearts = s.hearts || 3;
      State.badges = s.badges || [];
      State.planetsDone = s.planetsDone || {};
    }
  } catch(e) {}
}

function saveState() {
  const s = { user:State.user, xp:State.xp, level:State.level,
              hearts:State.hearts, badges:State.badges, planetsDone:State.planetsDone };
  localStorage.setItem('ochem_state', JSON.stringify(s));

  // Admin record
  if (State.user) {
    const key = 'ochem_records';
    let records = JSON.parse(localStorage.getItem(key)||'[]');
    const idx = records.findIndex(r=>r.name===State.user.name&&r.class===State.user.class);
    const rec = { name:State.user.name, class:State.user.class||'', number:State.user.number||'',
                  school:State.user.school||'', xp:State.xp, level:State.level,
                  planets:Object.keys(State.planetsDone).length,
                  badges:State.badges.length,
                  lastSeen: new Date().toLocaleString('th-TH'),
                  examScore: State.exam.score || 0 };
    if (idx>=0) records[idx]=rec; else records.push(rec);
    localStorage.setItem(key, JSON.stringify(records));
  }
}

function addXP(amount) {
  State.xp += amount;
  const newLevel = Math.floor(State.xp / XP_PER_LEVEL) + 1;
  if (newLevel > State.level) {
    State.level = newLevel;
    showToast(`🎉 Level Up! ขึ้น Level ${State.level}!`);
  }
  updateHUD();
  saveState();
}

function loseHeart() {
  if (State.hearts > 0) { State.hearts--; updateHUD(); updatePlanetHUD(); updateQuizHUD(); }
  saveState();
  if (State.hearts <= 0) return true;
  return false;
}

function awardBadge(id) {
  if (!State.badges.includes(id)) {
    State.badges.push(id);
    saveState();
    showToast(`🏅 ได้รับ Badge: ${BADGE_MAP[id]||id}!`);
  }
}

/* ══════════════════════════════════════
   SECTION 6: UI HELPERS
══════════════════════════════════════ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); el.scrollTop = 0; window.scrollTo(0,0); }
}

function showToast(msg, dur=2800) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), dur);
}

function updateHUD() {
  // Galaxy HUD
  const el = document.getElementById('gx-name');
  if (el && State.user) el.textContent = `👤 ${State.user.name}`;
  renderHearts('hud-hearts');
  const fill = document.getElementById('xp-fill');
  const xpText = document.getElementById('hud-xp-text');
  const lvText = document.getElementById('hud-level');
  if (fill) fill.style.width = ((State.xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100) + '%';
  if (xpText) xpText.textContent = `${State.xp} XP`;
  if (lvText) lvText.textContent = `Lv.${State.level}`;
}

function updatePlanetHUD() {
  renderHearts('planet-hearts');
  const lv = document.getElementById('planet-level-text');
  const xp = document.getElementById('planet-xp-text');
  if (lv) lv.textContent = `Lv.${State.level}`;
  if (xp) xp.textContent = `${State.xp} XP`;
}

function updateQuizHUD() {
  renderHearts('quiz-hearts');
  renderHearts('exam-hearts');
}

function renderHearts(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let html = '';
  for (let i=0; i<3; i++) html += `<span class="heart ${i<State.hearts?'':'empty'}">❤️</span>`;
  el.innerHTML = html;
}

function updatePlanetStatuses() {
  for (let i=1; i<=9; i++) {
    const el = document.getElementById(`pstatus-${i}`);
    const card = document.querySelector(`.planet-card[data-planet="${i}"]`);
    if (State.planetsDone[i]) {
      if (el) { el.textContent = '✅ ผ่านแล้ว'; el.className = 'planet-status done'; }
      if (card) card.classList.add('completed');
    }
  }
}

/* ══════════════════════════════════════
   SECTION 7: LOGIN / LOGOUT
══════════════════════════════════════ */
function doLogin() {
  const name   = document.getElementById('inp-name').value.trim();
  const cls    = document.getElementById('inp-class').value;
  const num    = document.getElementById('inp-number').value.trim();
  const school = document.getElementById('inp-school').value.trim();
  const err    = document.getElementById('login-error');

  if (!name)   { err.textContent='กรุณากรอกชื่อ-นามสกุล'; return; }
  if (!cls)    { err.textContent='กรุณาเลือกชั้นเรียน'; return; }
  if (!num)    { err.textContent='กรุณากรอกเลขที่'; return; }
  if (!school) { err.textContent='กรุณากรอกชื่อโรงเรียน'; return; }
  err.textContent = '';

  State.user = { name, class:cls, number:num, school };
  State.startTime = Date.now();
  if (!State.xp) State.hearts = 3;
  saveState();
  updateHUD();
  updatePlanetStatuses();
  showScreen('screen-galaxy');
  showToast(`ยินดีต้อนรับ ${name}! 🎉`);
}

function doLogout() {
  if (!confirm('ออกจากระบบ? ความคืบหน้าจะถูกบันทึก')) return;
  saveState();
  showScreen('screen-login');
}

/* ══════════════════════════════════════
   SECTION 8: GALAXY / NAVIGATION
══════════════════════════════════════ */
function goGalaxy() {
  updateHUD();
  updatePlanetStatuses();
  showScreen('screen-galaxy');
  setTimeout(showProgressToast, 400);
}

function enterPlanet(n) {
  State.hearts = Math.min(State.hearts+1, 3); // restore 1 heart per planet entry
  updateHUD();
  showScreen('screen-planet');
  updatePlanetHUD();
  renderPlanet(n);
}

/* ══════════════════════════════════════
   SECTION 9: PLANET RENDERERS
══════════════════════════════════════ */
function renderPlanet(n) {
  const area = document.getElementById('planet-content-area');
  area.innerHTML = '';
  area.classList.add('anim-fade');
  setTimeout(()=>area.classList.remove('anim-fade'), 400);

  switch(n) {
    case 1: renderPlanet1(area); break;
    case 2: renderPlanet2(area); break;
    case 3: renderPlanet3(area); break;
    case 4: renderPlanet4(area); break;
    case 5: renderPlanet5(area); break;
    case 6: renderPlanet6(area); break;
    case 7: renderPlanet7(area); break;
    case 8: renderPlanet8(area); break;
    case 9: renderPlanet9(area); break;
  }
}

/* ── PLANET 1: CARBON WORLD ── */
function renderPlanet1(area) {
  area.innerHTML = `
  <div class="planet-intro">
    <h2>🌍 Carbon World</h2>
    <p>เรียนรู้คุณสมบัติของคาร์บอนและการสร้างพันธะ</p>
  </div>
  <div class="content-card">
    <h3>💡 คุณสมบัติพิเศษของคาร์บอน (C)</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px">
      <div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2);border-radius:12px;padding:16px">
        <div style="font-size:1.5rem;margin-bottom:8px">⚛️</div>
        <div style="font-weight:600;color:var(--c-sky);margin-bottom:4px">Valence Electrons</div>
        <div style="color:var(--c-text-2);font-size:0.9rem">คาร์บอนมี 4 valence electrons สามารถสร้างพันธะได้ <strong style="color:var(--c-mint)">4 พันธะ</strong></div>
      </div>
      <div style="background:rgba(110,231,183,0.08);border:1px solid rgba(110,231,183,0.2);border-radius:12px;padding:16px">
        <div style="font-size:1.5rem;margin-bottom:8px">🔗</div>
        <div style="font-weight:600;color:var(--c-mint);margin-bottom:4px">Catenation</div>
        <div style="color:var(--c-text-2);font-size:0.9rem">คาร์บอนสามารถต่อกันเองได้ เป็นโซ่ยาว กิ่ง หรือวงแหวน</div>
      </div>
      <div style="background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:16px">
        <div style="font-size:1.5rem;margin-bottom:8px">🔀</div>
        <div style="font-weight:600;color:var(--c-violet);margin-bottom:4px">Hybridization</div>
        <div style="color:var(--c-text-2);font-size:0.9rem">sp³ (Alkane) · sp² (Alkene) · sp (Alkyne)</div>
      </div>
      <div style="background:rgba(251,146,60,0.08);border:1px solid rgba(251,146,60,0.2);border-radius:12px;padding:16px">
        <div style="font-size:1.5rem;margin-bottom:8px">📏</div>
        <div style="font-weight:600;color:var(--c-orange);margin-bottom:4px">Bond Length</div>
        <div style="color:var(--c-text-2);font-size:0.9rem">C–C (154pm) > C=C (134pm) > C≡C (120pm)</div>
      </div>
    </div>
  </div>

  <div class="content-card">
    <h3>🧱 ลากอะตอมมาสร้างโมเลกุล</h3>
    <div class="atom-palette">
      <div class="draggable-atom C" draggable="true" ondragstart="dragAtom(event,'C')">C</div>
      <div class="draggable-atom H" draggable="true" ondragstart="dragAtom(event,'H')">H</div>
      <div class="draggable-atom O" draggable="true" ondragstart="dragAtom(event,'O')">O</div>
      <div class="draggable-atom N" draggable="true" ondragstart="dragAtom(event,'N')">N</div>
      <div class="draggable-atom Cl" draggable="true" ondragstart="dragAtom(event,'Cl')">Cl</div>
    </div>
    <div class="drop-zone" id="mol-builder" ondragover="event.preventDefault()" ondrop="dropAtom(event)" ondragenter="this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')">
      <span class="drop-placeholder" id="drop-placeholder">ลากอะตอมมาวางที่นี่</span>
    </div>
    <div id="mol-result" style="margin-top:12px;font-size:0.9rem;color:var(--c-text-2)"></div>
    <button class="btn-ghost" onclick="clearMolBuilder()" style="width:auto;padding:8px 16px;margin-top:8px">🗑️ ล้าง</button>
  </div>

  <div class="content-card">
    <h3>📚 ประเภทโซ่คาร์บอน</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center">
      <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid var(--c-border)">
        <div style="font-size:2rem;margin-bottom:8px">➖</div>
        <div style="font-weight:600;color:var(--c-sky)">โซ่ตรง</div>
        <div style="font-size:0.8rem;color:var(--c-text-2);margin-top:4px">n-Butane<br>CH₃CH₂CH₂CH₃</div>
      </div>
      <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid var(--c-border)">
        <div style="font-size:2rem;margin-bottom:8px">🌿</div>
        <div style="font-weight:600;color:var(--c-mint)">โซ่กิ่ง</div>
        <div style="font-size:0.8rem;color:var(--c-text-2);margin-top:4px">Isobutane<br>2-methylpropane</div>
      </div>
      <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid var(--c-border)">
        <div style="font-size:2rem;margin-bottom:8px">⭕</div>
        <div style="font-weight:600;color:var(--c-violet)">วงแหวน</div>
        <div style="font-size:0.8rem;color:var(--c-text-2);margin-top:4px">Cyclopentane<br>Benzene</div>
      </div>
    </div>
  </div>

  <div style="text-align:center;margin-top:16px">
    <button class="btn-primary" onclick="startPlanetQuiz(1,'carbon','🌍 Carbon World')" style="width:auto;padding:12px 32px">
      🎯 ทำแบบทดสอบ Planet 1
    </button>
  </div>`;

  // init mol builder
  window._molAtoms = [];
}

/* ── PLANET 2: BOND LABORATORY ── */
function renderPlanet2(area) {
  area.innerHTML = `
  <div class="planet-intro">
    <h2>⚗️ Bond Laboratory</h2>
    <p>ทดลองและเปรียบเทียบ Single · Double · Triple Bond</p>
  </div>
  <div class="content-card">
    <h3>🔬 เลือกประเภทพันธะ</h3>
    <div class="tab-row">
      <button class="tab-btn active" onclick="selectBond('single',this)">Single Bond (—)</button>
      <button class="tab-btn" onclick="selectBond('double',this)">Double Bond (=)</button>
      <button class="tab-btn" onclick="selectBond('triple',this)">Triple Bond (≡)</button>
    </div>
    <div id="bond-viz" style="margin:12px 0">${SVGRenderer.drawBond('single')}</div>
    <div id="bond-info" class="content-card" style="margin-top:8px">
      ${bondInfo('single')}
    </div>
  </div>

  <div class="content-card">
    <h3>📊 เปรียบเทียบคุณสมบัติ</h3>
    <table style="width:100%;border-collapse:collapse;font-size:0.88rem">
      <tr style="background:rgba(56,189,248,0.1)">
        <th style="padding:10px;text-align:left;color:var(--c-sky)">คุณสมบัติ</th>
        <th style="padding:10px;text-align:center;color:var(--c-sky)">Single (C–C)</th>
        <th style="padding:10px;text-align:center;color:var(--c-cyan)">Double (C=C)</th>
        <th style="padding:10px;text-align:center;color:var(--c-violet)">Triple (C≡C)</th>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:10px;color:var(--c-text-2)">σ (Sigma)</td>
        <td style="padding:10px;text-align:center">1</td>
        <td style="padding:10px;text-align:center">1</td>
        <td style="padding:10px;text-align:center">1</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:10px;color:var(--c-text-2)">π (Pi)</td>
        <td style="padding:10px;text-align:center">0</td>
        <td style="padding:10px;text-align:center">1</td>
        <td style="padding:10px;text-align:center">2</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:10px;color:var(--c-text-2)">ความยาวพันธะ</td>
        <td style="padding:10px;text-align:center">154 pm</td>
        <td style="padding:10px;text-align:center">134 pm</td>
        <td style="padding:10px;text-align:center">120 pm</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:10px;color:var(--c-text-2)">พลังงานพันธะ</td>
        <td style="padding:10px;text-align:center">347 kJ/mol</td>
        <td style="padding:10px;text-align:center">614 kJ/mol</td>
        <td style="padding:10px;text-align:center">839 kJ/mol</td>
      </tr>
      <tr>
        <td style="padding:10px;color:var(--c-text-2)">ตัวอย่าง</td>
        <td style="padding:10px;text-align:center">Ethane</td>
        <td style="padding:10px;text-align:center">Ethene</td>
        <td style="padding:10px;text-align:center">Ethyne</td>
      </tr>
    </table>
  </div>

  <div style="text-align:center;margin-top:16px">
    <button class="btn-primary" onclick="startPlanetQuiz(2,'bond','⚗️ Bond Laboratory')" style="width:auto;padding:12px 32px">
      🎯 ทำแบบทดสอบ Planet 2
    </button>
  </div>`;
}

function bondInfo(type) {
  const info = {
    single: `<div style="display:flex;gap:20px;flex-wrap:wrap">
      <div><span style="color:var(--c-sky);font-weight:600">σ = 1, π = 0</span></div>
      <div style="color:var(--c-text-2)">หมุนได้อิสระ (Rotation) · พันธะแข็งแกร่งปานกลาง</div>
      <div style="color:var(--c-mint)">Hybridization: sp³ · มุม 109.5°</div>
      <div style="color:var(--c-text-2)">ตัวอย่าง: Ethane (CH₃–CH₃)</div>
    </div>`,
    double: `<div style="display:flex;gap:20px;flex-wrap:wrap">
      <div><span style="color:var(--c-cyan);font-weight:600">σ = 1, π = 1</span></div>
      <div style="color:var(--c-text-2)">หมุนไม่ได้ (No free rotation) · มีความแข็งแกร่งสูงกว่า</div>
      <div style="color:var(--c-mint)">Hybridization: sp² · มุม 120°</div>
      <div style="color:var(--c-text-2)">ตัวอย่าง: Ethene (CH₂=CH₂)</div>
    </div>`,
    triple: `<div style="display:flex;gap:20px;flex-wrap:wrap">
      <div><span style="color:var(--c-violet);font-weight:600">σ = 1, π = 2</span></div>
      <div style="color:var(--c-text-2)">เป็นเส้นตรง (Linear) · พันธะแข็งแกร่งที่สุด</div>
      <div style="color:var(--c-mint)">Hybridization: sp · มุม 180°</div>
      <div style="color:var(--c-text-2)">ตัวอย่าง: Ethyne (CH≡CH)</div>
    </div>`
  };
  return info[type] || info.single;
}

function selectBond(type, btn) {
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('bond-viz').innerHTML = SVGRenderer.drawBond(type);
  document.getElementById('bond-info').innerHTML = bondInfo(type);
}

/* ── PLANET 3: STRUCTURE STUDIO ── */
function renderPlanet3(area) {
  area.innerHTML = `
  <div class="planet-intro">
    <h2>🔬 Structure Studio</h2>
    <p>เลือกสาร และดูสูตรทุกรูปแบบพร้อมกัน</p>
  </div>
  <div class="content-card">
    <h3>🧪 เลือกสาร</h3>
    <div class="tab-row" id="p3-tabs" style="flex-wrap:wrap">
      ${CHEM.alkanes.slice(1,11).map((a,i)=>`<button class="tab-btn${i===0?' active':''}" onclick="showStructure(${i+1},this)">${a.name}</button>`).join('')}
    </div>
    <div id="p3-result">
      ${buildStructureDisplay(1)}
    </div>
  </div>
  <div style="text-align:center;margin-top:16px">
    <button class="btn-primary" onclick="startPlanetQuiz(3,'structure','🔬 Structure Studio')" style="width:auto;padding:12px 32px">
      🎯 ทำแบบทดสอบ Planet 3
    </button>
  </div>`;
}

function buildStructureDisplay(n) {
  const a = CHEM.alkanes[n];
  const d = ChemEngine.calcFormula(n,'single','alkane');
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px">
    <div class="result-cell">
      <div class="result-label">① สูตรโมเลกุล</div>
      <div class="result-value" style="font-size:1.3rem">${d.molecular}</div>
    </div>
    <div class="result-cell">
      <div class="result-label">② สูตรย่อ (Condensed)</div>
      <div class="result-value" style="font-size:0.95rem">${a.condensed}</div>
    </div>
    <div class="result-cell" style="grid-column:1/-1">
      <div class="result-label">③ สูตรเต็ม (Structural)</div>
      ${SVGRenderer.drawStructural(n,'alkane',520,100)}
    </div>
    <div class="result-cell" style="grid-column:1/-1">
      <div class="result-label">④ Line Angle Formula</div>
      ${SVGRenderer.drawLineAngle(n,'alkane','single',460,90)}
    </div>
  </div>
  <div style="text-align:center;margin-top:12px">
    <span style="color:var(--c-sky);font-weight:600;font-size:1.1rem">${a.name}</span>
    <span style="color:var(--c-text-3);margin:0 8px">|</span>
    <span style="color:var(--c-text-2)">${d.molecular} · MW ≈ ${12*n + a.hydrogen} g/mol</span>
  </div>`;
}

function showStructure(n, btn) {
  document.querySelectorAll('#p3-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('p3-result').innerHTML = buildStructureDisplay(n);
}

/* ── PLANET 4: HYDROCARBON PLANET ── */
function renderPlanet4(area) {
  area.innerHTML = `
  <div class="planet-intro">
    <h2>🧪 Hydrocarbon Planet</h2>
    <p>ปรับ Slider เพื่อดูสูตรและชื่อ Alkane · Alkene · Alkyne</p>
  </div>
  <div class="content-card">
    <h3>⚙️ Interactive Formula Generator</h3>
    <div class="slider-group">
      <label>จำนวน Carbon (n): <span id="p4-c-val">4</span></label>
      <input type="range" min="1" max="10" value="4" id="p4-c-slider" oninput="updateP4()">
    </div>
    <div class="tab-row">
      <button class="tab-btn active" data-htype="alkane" onclick="setHType('alkane',this)">Alkane</button>
      <button class="tab-btn" data-htype="alkene" onclick="setHType('alkene',this)">Alkene</button>
      <button class="tab-btn" data-htype="alkyne" onclick="setHType('alkyne',this)">Alkyne</button>
    </div>
    <div id="p4-result"></div>
  </div>
  <div style="text-align:center;margin-top:16px">
    <button class="btn-primary" onclick="startPlanetQuiz(4,'hydrocarbon','🧪 Hydrocarbon Planet')" style="width:auto;padding:12px 32px">
      🎯 ทำแบบทดสอบ Planet 4
    </button>
  </div>`;

  window._p4Type = 'alkane';
  updateP4();
}

function setHType(t, btn) {
  window._p4Type = t;
  document.querySelectorAll('[data-htype]').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  updateP4();
}

function updateP4() {
  const n = +document.getElementById('p4-c-slider').value;
  document.getElementById('p4-c-val').textContent = n;
  const t = window._p4Type || 'alkane';
  const d = ChemEngine.calcFormula(n, t==='alkyne'?'triple':t==='alkene'?'double':'single', t);
  const prefix = CHEM.chainPrefix[n] || `C${n}`;
  const suffixMap = {alkane:'ane', alkene:'ene', alkyne:'yne'};
  const name = prefix + suffixMap[t];
  const color = {alkane:'var(--c-sky)', alkene:'var(--c-cyan)', alkyne:'var(--c-violet)'}[t];
  const lineAngle = SVGRenderer.drawLineAngle(n, t, t==='alkyne'?'triple':t==='alkene'?'double':'single');
  document.getElementById('p4-result').innerHTML = `
  <div style="margin-top:16px">
    <div class="formula-display">${d.molecular}</div>
    <div class="formula-name" style="color:${color}">${name}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0">
      <div class="result-cell"><div class="result-label">ชื่อ IUPAC</div><div class="result-value">${name.charAt(0).toUpperCase()+name.slice(1)}</div></div>
      <div class="result-cell"><div class="result-label">สูตรย่อ</div><div class="result-value">${d.condensed}</div></div>
      <div class="result-cell"><div class="result-label">จำนวน C</div><div class="result-value">${n}</div></div>
      <div class="result-cell"><div class="result-label">จำนวน H</div><div class="result-value">${d.hydrogens}</div></div>
    </div>
    <div class="structure-viewer">${lineAngle}</div>
  </div>`;
}

/* ── PLANET 5: FUNCTIONAL GROUP MUSEUM ── */
function renderPlanet5(area) {
  const fgs = CHEM.functionalGroups;
  area.innerHTML = `
  <div class="planet-intro">
    <h2>🏛️ Functional Group Museum</h2>
    <p>เลือกหมู่ฟังก์ชันเพื่อดูรายละเอียดและโครงสร้าง</p>
  </div>
  <div class="content-card">
    <h3>🗂️ เลือกหมู่ฟังก์ชัน</h3>
    <div class="fg-gallery" id="fg-gallery">
      ${fgs.map(fg=>`
        <div class="fg-card" onclick="showFG('${fg.id}',this)" data-fgid="${fg.id}">
          <div class="fg-symbol" style="color:${fg.color}">${fg.symbol}</div>
          <div class="fg-name">${fg.name}</div>
          <div class="fg-suffix">${fg.suffix}</div>
        </div>`).join('')}
    </div>
  </div>
  <div class="content-card" id="fg-detail" style="display:none">
    <div id="fg-detail-content"></div>
  </div>
  <div style="text-align:center;margin-top:16px">
    <button class="btn-primary" onclick="startPlanetQuiz(5,'fg','🏛️ Functional Group Museum')" style="width:auto;padding:12px 32px">
      🎯 ทำแบบทดสอบ Planet 5
    </button>
  </div>`;
}

function showFG(id, card) {
  document.querySelectorAll('.fg-card').forEach(c=>c.classList.remove('active'));
  card.classList.add('active');
  const fg = CHEM.functionalGroups.find(f=>f.id===id);
  if (!fg) return;
  const n = 2; // show ethyl example
  const svgLine = SVGRenderer.drawLineAngle(n, id, 'single', 400, 100);
  const detail = document.getElementById('fg-detail');
  const content = document.getElementById('fg-detail-content');
  detail.style.display = 'block';
  content.innerHTML = `
  <h3 style="color:${fg.color}">● ${fg.name} (${fg.suffix})</h3>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0">
    <div class="result-cell"><div class="result-label">หมู่ฟังก์ชัน</div><div class="result-value" style="color:${fg.color}">${fg.symbol}</div></div>
    <div class="result-cell"><div class="result-label">สูตรทั่วไป</div><div class="result-value">${fg.formula}</div></div>
    <div class="result-cell"><div class="result-label">ตัวอย่าง</div><div class="result-value">${fg.example}</div></div>
    <div class="result-cell"><div class="result-label">การใช้งาน</div><div class="result-value">${fg.use}</div></div>
  </div>
  <div class="structure-viewer">${svgLine}</div>`;
  detail.scrollIntoView({behavior:'smooth',block:'nearest'});
}

/* ── PLANET 6: IUPAC ACADEMY ── */
function renderPlanet6(area) {
  area.innerHTML = `
  <div class="planet-intro">
    <h2>🎓 IUPAC Academy</h2>
    <p>เรียนรู้การตั้งชื่อสาร IUPAC ทีละขั้นตอน + Generator</p>
  </div>
  <div class="content-card">
    <h3>📋 6 ขั้นตอนการตั้งชื่อ IUPAC</h3>
    <div class="iupac-steps">
      ${[
        ['เลือกโซ่หลัก','เลือกโซ่คาร์บอนที่ยาวที่สุด (Longest chain) เป็นโซ่หลัก'],
        ['กำหนดตำแหน่ง C','เลขให้ C ตัวที่ใกล้หมู่แทนที่หรือหมู่ฟังก์ชันมากที่สุดได้เลขน้อย'],
        ['กำหนดพันธะคู่/สาม','ระบุตำแหน่งของ Double bond (-ene) หรือ Triple bond (-yne)'],
        ['กำหนดหมู่แทนที่','ระบุชื่อและตำแหน่งของ Alkyl group (methyl, ethyl, ...)'],
        ['กำหนดหมู่ฟังก์ชัน','Suffix ของหมู่ฟังก์ชัน: -ol, -al, -one, -oic acid, ...'],
        ['รวมเป็นชื่อเต็ม','[locant-substituent][chain]-[locant-bond][suffix-FG]'],
      ].map((s,i)=>`
        <div class="iupac-step">
          <div class="step-num">${i+1}</div>
          <div class="step-content">
            <h4>${s[0]}</h4>
            <p>${s[1]}</p>
          </div>
        </div>`).join('')}
    </div>
  </div>

  <div class="content-card">
    <h3>🔧 IUPAC Name Generator</h3>
    <div class="builder-controls">
      <div>
        <div class="slider-group">
          <label>จำนวน Carbon: <span id="p6-c-val">4</span></label>
          <input type="range" min="1" max="10" value="4" id="p6-c" oninput="updateP6()">
        </div>
        <div class="slider-group">
          <label>ตำแหน่งหมู่ฟังก์ชัน: <span id="p6-pos-val">1</span></label>
          <input type="range" min="1" max="10" value="1" id="p6-pos" oninput="updateP6()">
        </div>
      </div>
      <div>
        <div style="margin-bottom:8px;font-size:0.85rem;color:var(--c-text-2)">เลือกหมู่ฟังก์ชัน:</div>
        <select id="p6-fg" onchange="updateP6()" style="background:rgba(10,30,70,0.7);border:1px solid var(--c-border);color:var(--c-text);border-radius:8px;padding:8px 12px;width:100%;font-family:inherit">
          <option value="alkane">Alkane (–ane)</option>
          <option value="alkene">Alkene (–ene)</option>
          <option value="alkyne">Alkyne (–yne)</option>
          <option value="alcohol">Alcohol (–ol)</option>
          <option value="aldehyde">Aldehyde (–al)</option>
          <option value="ketone">Ketone (–one)</option>
          <option value="acid">Carboxylic Acid (–oic acid)</option>
          <option value="ester">Ester (–anoate)</option>
          <option value="amine">Amine (–amine)</option>
          <option value="amide">Amide (–amide)</option>
          <option value="haloalkane">Haloalkane (–yl halide)</option>
          <option value="nitrile">Nitrile (–nitrile)</option>
        </select>
      </div>
    </div>
    <div id="p6-result"></div>
  </div>
  <div style="text-align:center;margin-top:16px">
    <button class="btn-primary" onclick="startPlanetQuiz(6,'iupac','🎓 IUPAC Academy')" style="width:auto;padding:12px 32px">
      🎯 ทำแบบทดสอบ Planet 6
    </button>
  </div>`;
  updateP6();
}

function updateP6() {
  const n   = +document.getElementById('p6-c').value;
  const pos = Math.min(+document.getElementById('p6-pos').value, Math.max(1,n-1));
  const fg  = document.getElementById('p6-fg').value;
  document.getElementById('p6-c-val').textContent = n;
  document.getElementById('p6-pos-val').textContent = pos;
  const bond = fg==='alkene'?'double':fg==='alkyne'?'triple':'single';
  const d = ChemEngine.calcFormula(n, bond, fg, pos);
  document.getElementById('p6-result').innerHTML = `
  <div style="margin-top:12px">
    <div class="formula-display" style="font-size:1.2rem;letter-spacing:2px">${d.iupac}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:10px">
      <div class="result-cell"><div class="result-label">สูตรโมเลกุล</div><div class="result-value">${d.molecular}</div></div>
      <div class="result-cell"><div class="result-label">สูตรย่อ</div><div class="result-value" style="font-size:0.85rem">${d.condensed}</div></div>
      <div class="result-cell"><div class="result-label">Line Angle</div><div>${SVGRenderer.drawLineAngle(n,fg,bond,200,60)}</div></div>
    </div>
  </div>`;
}

/* ── PLANET 7: ORGANIC BUILDER ── */
function renderPlanet7(area) {
  area.innerHTML = `
  <div class="planet-intro">
    <h2>🔧 Organic Builder</h2>
    <p>สร้างโมเลกุลเอง — ระบบสร้างสูตรและชื่อ IUPAC อัตโนมัติ</p>
  </div>
  <div class="content-card">
    <h3>⚙️ ตั้งค่าโมเลกุล</h3>
    <div class="builder-controls">
      <div>
        <div class="slider-group">
          <label>จำนวน Carbon: <span id="b-c-val">3</span></label>
          <input type="range" min="1" max="15" value="3" id="b-c" oninput="buildMolecule()">
        </div>
        <div style="margin-bottom:8px;font-size:0.85rem;color:var(--c-text-2)">ประเภทพันธะ:</div>
        <div class="bond-selector">
          <button class="bond-type-btn active" data-bond="single" onclick="setBond('single',this)">Single</button>
          <button class="bond-type-btn" data-bond="double" onclick="setBond('double',this)">Double</button>
          <button class="bond-type-btn" data-bond="triple" onclick="setBond('triple',this)">Triple</button>
        </div>
      </div>
      <div>
        <div style="margin-bottom:8px;font-size:0.85rem;color:var(--c-text-2)">หมู่ฟังก์ชัน:</div>
        <select id="b-fg" onchange="buildMolecule()" style="background:rgba(10,30,70,0.7);border:1px solid var(--c-border);color:var(--c-text);border-radius:8px;padding:8px 12px;width:100%;font-family:inherit;margin-bottom:10px">
          <option value="alkane">ไม่มี (Alkane)</option>
          <option value="alkene">Alkene</option>
          <option value="alkyne">Alkyne</option>
          <option value="alcohol">Alcohol (–OH)</option>
          <option value="aldehyde">Aldehyde (–CHO)</option>
          <option value="ketone">Ketone (C=O)</option>
          <option value="acid">Carboxylic Acid (–COOH)</option>
          <option value="ester">Ester (–COO–)</option>
          <option value="amine">Amine (–NH₂)</option>
          <option value="amide">Amide (–CONH₂)</option>
          <option value="haloalkane">Haloalkane (–Cl)</option>
          <option value="nitrile">Nitrile (–CN)</option>
        </select>
        <div class="slider-group">
          <label>ตำแหน่งหมู่ฟังก์ชัน: <span id="b-pos-val">1</span></label>
          <input type="range" min="1" max="15" value="1" id="b-pos" oninput="buildMolecule()">
        </div>
      </div>
    </div>
    <div id="b-result"></div>
  </div>
  <div style="text-align:center;margin-top:16px">
    <button class="btn-primary" onclick="startPlanetQuiz(7,'fg','🔧 Organic Builder')" style="width:auto;padding:12px 32px">
      🎯 ทำแบบทดสอบ Planet 7
    </button>
  </div>`;
  window._bBond = 'single';
  buildMolecule();
}

function setBond(b, btn) {
  window._bBond = b;
  document.querySelectorAll('[data-bond]').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  buildMolecule();
}

function buildMolecule() {
  const n   = +document.getElementById('b-c').value;
  const pos = Math.min(+document.getElementById('b-pos').value, Math.max(1,n-1));
  const fg  = document.getElementById('b-fg').value;
  const bond = window._bBond || 'single';
  const actualBond = fg==='alkene'?'double':fg==='alkyne'?'triple':bond;
  document.getElementById('b-c-val').textContent = n;
  document.getElementById('b-pos-val').textContent = pos;
  const d = ChemEngine.calcFormula(n, actualBond, fg, pos);
  const structSVG = SVGRenderer.drawStructural(n, fg, 520, 110);
  const lineSVG   = SVGRenderer.drawLineAngle(n, fg, actualBond, 460, 90);
  document.getElementById('b-result').innerHTML = `
  <div style="margin-top:16px">
    <div class="formula-display" style="font-size:1.3rem">${d.iupac}</div>
    <div class="builder-result-grid">
      <div class="result-cell"><div class="result-label">สูตรโมเลกุล</div><div class="result-value" style="font-size:1.1rem">${d.molecular}</div></div>
      <div class="result-cell"><div class="result-label">สูตรย่อ</div><div class="result-value" style="font-size:0.9rem">${d.condensed}</div></div>
      <div class="result-cell" style="grid-column:1/-1"><div class="result-label">Structural Formula</div>${structSVG}</div>
      <div class="result-cell" style="grid-column:1/-1"><div class="result-label">Line Angle Formula</div>${lineSVG}</div>
    </div>
  </div>`;
}

/* ── PLANET 8: CHALLENGE ARENA ── */
function renderPlanet8(area) {
  area.innerHTML = `
  <div class="planet-intro">
    <h2>🎮 Challenge Arena</h2>
    <p>เลือก Mini Game เพื่อฝึกทักษะแบบสนุกสนาน</p>
  </div>
  <div class="minigame-grid">
    <div class="mg-card" onclick="startMiniGame('fg-hunter')">
      <div class="mg-icon">🔍</div>
      <div class="mg-name">Functional Group Hunter</div>
      <div class="mg-desc">ระบุหมู่ฟังก์ชันจากสูตรย่อ</div>
    </div>
    <div class="mg-card" onclick="startMiniGame('name-molecule')">
      <div class="mg-icon">📛</div>
      <div class="mg-name">Name The Molecule</div>
      <div class="mg-desc">ตั้งชื่อสารจากโครงสร้าง</div>
    </div>
    <div class="mg-card" onclick="startMiniGame('formula-match')">
      <div class="mg-icon">🎯</div>
      <div class="mg-name">Formula Match</div>
      <div class="mg-desc">จับคู่ชื่อ-สูตรให้ถูกต้อง</div>
    </div>
    <div class="mg-card" onclick="startMiniGame('carbon-race')">
      <div class="mg-icon">🏎️</div>
      <div class="mg-name">Carbon Race</div>
      <div class="mg-desc">ตอบให้เร็ว! นับ Carbon ในโมเลกุล</div>
    </div>
    <div class="mg-card" onclick="startMiniGame('bond-quiz')">
      <div class="mg-icon">⚗️</div>
      <div class="mg-name">Bond Quiz Blitz</div>
      <div class="mg-desc">ทายประเภทพันธะจาก σ/π</div>
    </div>
  </div>`;
}

/* ── PLANET 9: FINAL EXAM ── */
function renderPlanet9(area) {
  area.innerHTML = `
  <div class="planet-intro">
    <h2>🏆 Final Examination</h2>
    <p>แบบทดสอบปลายภาค 50 ข้อ จาก Question Bank 100+ ข้อ</p>
  </div>
  <div class="content-card" style="text-align:center;max-width:480px;margin:0 auto">
    <div style="font-size:4rem;margin-bottom:16px">🏆</div>
    <h3 style="font-size:1.3rem;margin-bottom:12px;color:var(--c-yellow)">พร้อมสอบหรือยัง?</h3>
    <div style="color:var(--c-text-2);margin-bottom:24px;line-height:1.8">
      📝 50 ข้อสุ่มจากฐานข้อมูล<br>
      ❤️ มีระบบ Heart (3 ชีวิต)<br>
      💡 มีคำใบ้จาก AI<br>
      ⏱️ จับเวลา<br>
      🏅 ได้รับ Certificate เมื่อผ่าน
    </div>
    <button class="btn-primary btn-glow" onclick="startFinalExam()">🚀 เริ่มสอบเลย!</button>
  </div>`;
}

/* ══════════════════════════════════════
   SECTION 10: DRAG & DROP (Planet 1)
══════════════════════════════════════ */
function dragAtom(e, atom) { e.dataTransfer.setData('atom', atom); }

function dropAtom(e) {
  e.preventDefault();
  const zone = document.getElementById('mol-builder');
  zone.classList.remove('drag-over');
  const atom = e.dataTransfer.getData('atom');
  if (!atom) return;
  window._molAtoms = window._molAtoms || [];
  window._molAtoms.push(atom);
  zone.querySelector('.drop-placeholder') && (zone.querySelector('.drop-placeholder').style.display='none');
  const node = document.createElement('div');
  node.className = 'mol-node';
  node.textContent = atom;
  node.onclick = ()=>{ node.remove(); window._molAtoms.splice(window._molAtoms.indexOf(atom),1); validateMol(); };
  zone.appendChild(node);
  validateMol();
}

function validateMol() {
  const atoms = window._molAtoms || [];
  const res = document.getElementById('mol-result');
  if (!atoms.length) { res.textContent=''; return; }
  const cCount = atoms.filter(a=>a==='C').length;
  const hCount = atoms.filter(a=>a==='H').length;
  const oCount = atoms.filter(a=>a==='O').length;
  const nCount = atoms.filter(a=>a==='N').length;
  const clCount = atoms.filter(a=>a==='Cl').length;
  const maxBonds = cCount*4 + hCount*1 + oCount*2 + nCount*3 + clCount*1;
  const usedBonds = hCount + oCount*2 + nCount*3 + clCount + (cCount>0?cCount*4-(cCount-1)*2:0);
  let msg = `📊 C=${cCount}, H=${hCount}`;
  if(oCount) msg += `, O=${oCount}`;
  if(nCount) msg += `, N=${nCount}`;
  if(clCount) msg += `, Cl=${clCount}`;
  if (cCount>0 && hCount>0) {
    const expectedH = 2*cCount+2;
    if (hCount === expectedH) msg += ` → ✅ อาจเป็น Alkane (CₙH₂ₙ₊₂)`;
    else if (hCount === expectedH-2) msg += ` → ✅ อาจเป็น Alkene (CₙH₂ₙ)`;
    else if (hCount === expectedH-4) msg += ` → ✅ อาจเป็น Alkyne (CₙH₂ₙ₋₂)`;
    else msg += ` → 💡 ตรวจสอบจำนวน H ให้ถูกต้อง`;
  }
  res.innerHTML = `<div style="padding:10px;background:rgba(56,189,248,0.08);border-radius:8px">${msg}</div>`;
}

function clearMolBuilder() {
  const zone = document.getElementById('mol-builder');
  zone.innerHTML = '<span class="drop-placeholder" id="drop-placeholder">ลากอะตอมมาวางที่นี่</span>';
  window._molAtoms = [];
  document.getElementById('mol-result').innerHTML='';
}

/* ══════════════════════════════════════
   SECTION 11: QUIZ ENGINE
══════════════════════════════════════ */
function startPlanetQuiz(planetNum, topic, title) {
  const allTopics = ['carbon','bond','iupac','hydrocarbon','fg','alcohol',
    'aldehyde','ketone','acid','ester','amine','amide','haloalkane',
    'structure','reaction','property','alkene','alkyne','aromatic','isomer'];
  let qs = QuestionBank.getByTopic(topic, 8);
  if (qs.length < 5) qs = QuestionBank.getRandom(8);
  State.quiz = { questions:qs, idx:0, score:0, topic, planetNum };
  State.hearts = Math.min(State.hearts+1, 3);

  document.getElementById('quiz-title-bar').textContent = title;
  showScreen('screen-quiz');
  renderQuizQuestion();
}

function startMiniGame(game) {
  const gameData = {
    'fg-hunter': { title:'🔍 Functional Group Hunter', topics:['fg','alcohol','aldehyde','ketone','acid','ester','amine','amide','haloalkane'], n:10 },
    'name-molecule': { title:'📛 Name The Molecule', topics:['iupac','alkene','alkyne'], n:10 },
    'formula-match': { title:'🎯 Formula Match', topics:['structure','hydrocarbon'], n:10 },
    'carbon-race': { title:'🏎️ Carbon Race', topics:['iupac','structure'], n:10 },
    'bond-quiz': { title:'⚗️ Bond Quiz Blitz', topics:['bond'], n:10 },
  };
  const gd = gameData[game];
  if (!gd) return;
  let qs = [];
  gd.topics.forEach(t=>qs.push(...QuestionBank.getByTopic(t,3)));
  qs = shuffle(qs).slice(0,gd.n);
  State.quiz = { questions:qs, idx:0, score:0, topic:'minigame', planetNum:8 };
  document.getElementById('quiz-title-bar').textContent = gd.title;
  showScreen('screen-quiz');
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const q = State.quiz.questions[State.quiz.idx];
  if (!q) { endQuiz(); return; }
  const total = State.quiz.questions.length;
  const idx   = State.quiz.idx;

  document.getElementById('quiz-q-num').textContent = `${idx+1}/${total}`;
  document.getElementById('quiz-prog').style.width = ((idx/total)*100)+'%';
  document.getElementById('quiz-hint-box').style.display='none';
  renderHearts('quiz-hearts');

  const molEl = document.getElementById('quiz-molecule-display');
  const n = Math.floor(Math.random()*4)+2;
  const fg = CHEM.functionalGroups[Math.floor(Math.random()*CHEM.functionalGroups.length)];
  molEl.innerHTML = SVGRenderer.drawLineAngle(n, fg.id, 'single', 400, 80);

  document.getElementById('quiz-question-text').textContent = q.q;

  const shuffled = shuffle([...q.opts]);
  const optsEl = document.getElementById('quiz-options');
  optsEl.innerHTML = '';
  shuffled.forEach(opt=>{
    const btn = document.createElement('button');
    btn.className = 'opt-btn';
    btn.textContent = opt;
    btn.onclick = ()=>answerQuiz(opt, q.a, btn, optsEl);
    optsEl.appendChild(btn);
  });
}

function answerQuiz(chosen, correct, btn, optsEl) {
  optsEl.querySelectorAll('.opt-btn').forEach(b=>{ b.disabled=true; if(b.textContent===correct) b.classList.add('correct'); });
  if (chosen === correct) {
    btn.classList.add('correct');
    State.quiz.score++;
    addXP(10);
    showToast('✅ ถูกต้อง! +10 XP');
  } else {
    btn.classList.add('wrong');
    const dead = loseHeart();
    showToast('❌ ผิด! ' + (dead?'หมดหัวใจ':''));
    if (dead) { setTimeout(()=>{ showToast('💀 หมดหัวใจ! ออกจาก Quiz'); setTimeout(exitQuiz,1500); },500); return; }
  }
  setTimeout(()=>{
    State.quiz.idx++;
    renderQuizQuestion();
  }, 1200);
}

function useHint() {
  const q = State.quiz.questions[State.quiz.idx];
  if (!q) return;
  document.getElementById('quiz-hint-text').textContent = '🤖 ' + q.hint;
  document.getElementById('quiz-hint-box').style.display='flex';
}

function endQuiz() {
  const total = State.quiz.questions.length;
  const score = State.quiz.score;
  const pct   = Math.round((score/total)*100);
  const passed = pct >= 60;
  const pn = State.quiz.planetNum;
  if (passed && pn) {
    State.planetsDone[pn] = true;
    awardBadge(`p${pn}`);
    addXP(50);
    saveState();
  }
  if (pct===100) awardBadge('perfect');

  document.getElementById('result-emoji').textContent = pct>=80?'🏆':pct>=60?'🎉':'😅';
  document.getElementById('result-title').textContent = pct>=80?'ยอดเยี่ยม!':pct>=60?'ผ่านแล้ว!':'ลองใหม่อีกครั้ง';
  document.getElementById('result-msg').textContent  = `${score}/${total} ข้อ (${pct}%) ${passed?'✅ ผ่าน':'❌ ไม่ผ่าน (ต้องได้ 60% ขึ้นไป)'}`;
  document.getElementById('res-score').textContent = `${score}/${total}`;
  document.getElementById('res-xp').textContent = `+${score*10+( passed?50:0)}`;
  document.getElementById('res-badge').textContent = passed ? (BADGE_MAP[`p${pn}`]||'🏅') : '—';

  showModal('modal-result');
}

function closeResult() {
  hideModal('modal-result');
  goGalaxy();
}

function exitQuiz() {
  hideModal('modal-result');
  goGalaxy();
}

/* ══════════════════════════════════════
   SECTION 12: FINAL EXAM
══════════════════════════════════════ */
function startFinalExam() {
  State.exam = { questions: QuestionBank.get50(), idx:0, score:0, wrong:[] };
  State.hearts = 3;
  State.examSeconds = 0;
  State.examStartTime = Date.now();
  if (State.examTimer) clearInterval(State.examTimer);
  State.examTimer = setInterval(()=>{
    State.examSeconds++;
    const m = String(Math.floor(State.examSeconds/60)).padStart(2,'0');
    const s = String(State.examSeconds%60).padStart(2,'0');
    const el = document.getElementById('exam-timer');
    if (el) el.textContent = `${m}:${s}`;
  }, 1000);
  showScreen('screen-exam');
  renderExamQuestion();
}

function renderExamQuestion() {
  const q = State.exam.questions[State.exam.idx];
  if (!q) { endFinalExam(); return; }
  const total = 50, idx = State.exam.idx;
  document.getElementById('exam-q-counter').textContent = `ข้อที่ ${idx+1}/${total}`;
  document.getElementById('exam-prog').style.width = ((idx/total)*100)+'%';
  document.getElementById('exam-hint-box').style.display='none';
  renderHearts('exam-hearts');

  const molEl = document.getElementById('exam-molecule-display');
  const n = Math.floor(Math.random()*5)+1;
  const fg = CHEM.functionalGroups[Math.floor(Math.random()*CHEM.functionalGroups.length)];
  molEl.innerHTML = SVGRenderer.drawLineAngle(n, fg.id,'single',380,70);

  document.getElementById('exam-question-text').textContent = q.q;
  const shuffled = shuffle([...q.opts]);
  const optsEl = document.getElementById('exam-options');
  optsEl.innerHTML = '';
  shuffled.forEach(opt=>{
    const btn = document.createElement('button');
    btn.className='opt-btn'; btn.textContent=opt;
    btn.onclick=()=>answerExam(opt, q, btn, optsEl);
    optsEl.appendChild(btn);
  });
}

function answerExam(chosen, q, btn, optsEl) {
  optsEl.querySelectorAll('.opt-btn').forEach(b=>{ b.disabled=true; if(b.textContent===q.a) b.classList.add('correct'); });
  if (chosen === q.a) {
    btn.classList.add('correct'); State.exam.score++;
  } else {
    btn.classList.add('wrong');
    State.exam.wrong.push(q);
    const dead = loseHeart();
    if (dead) { clearInterval(State.examTimer); setTimeout(endFinalExam,1200); return; }
  }
  setTimeout(()=>{ State.exam.idx++; renderExamQuestion(); }, 1200);
}

function useExamHint() {
  const q = State.exam.questions[State.exam.idx];
  if (!q) return;
  document.getElementById('exam-hint-text').textContent = '🤖 '+q.hint;
  document.getElementById('exam-hint-box').style.display='flex';
}

function exitExam() {
  if (!confirm('ออกจากการสอบ? คะแนนจะถูกบันทึก')) return;
  clearInterval(State.examTimer);
  goGalaxy();
}

function endFinalExam() {
  clearInterval(State.examTimer);
  const score = State.exam.score;
  const pct   = Math.round((score/50)*100);
  const elapsed = State.examSeconds;
  const m = String(Math.floor(elapsed/60)).padStart(2,'0');
  const s = String(elapsed%60).padStart(2,'0');

  let badge = '📜', level = 'Chemistry Student';
  if (pct>=90) { badge='👑'; level='Organic Master'; awardBadge('master'); }
  else if (pct>=80) { badge='⭐'; level='Structure Expert'; awardBadge('perfect'); }
  else if (pct>=70) { badge='🏅'; level='Functional Group Expert'; }
  else if (pct>=60) { badge='🎓'; level='IUPAC Champion'; }

  State.planetsDone[9] = pct>=60;
  State.exam.score = score;
  addXP(pct);
  saveState();

  document.getElementById('cert-name').textContent   = State.user ? State.user.name : '';
  document.getElementById('cert-class').textContent  = State.user ? `${State.user.class} เลขที่ ${State.user.number} · ${State.user.school}` : '';
  document.getElementById('cert-score').textContent  = `${score}/50 (${pct}%)`;
  document.getElementById('cert-time').textContent   = `${m}:${s}`;
  document.getElementById('cert-level').textContent  = level;
  document.getElementById('cert-badge').textContent  = badge;
  document.getElementById('cert-badges-earned').textContent = State.badges.map(b=>BADGE_MAP[b]||'').join(' ');
  showScreen('screen-cert');
  showToast(`🏆 ${level}! คะแนน ${score}/50`);
}

/* ══════════════════════════════════════
   SECTION 13: CERTIFICATE DOWNLOAD
══════════════════════════════════════ */
function downloadCert() {
  const el = document.getElementById('cert-printable');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Certificate</title>
  <style>body{font-family:sans-serif;background:#050b1a;color:#e2f0ff;padding:40px;text-align:center}
  .cert{background:rgba(20,40,90,0.9);border:2px solid rgba(100,180,255,0.4);border-radius:20px;padding:48px;max-width:600px;margin:auto}
  .logo{font-size:4rem}.title{font-size:2rem;color:#fde047}.name{font-size:2rem;color:#38bdf8}
  .score{font-size:1.5rem;color:#6ee7b7}.info{color:#8cb4d8;margin:8px 0}</style></head>
  <body><div class="cert">
  <div class="logo">🏆</div><div class="title">ใบประกาศนียบัตร</div>
  <div class="info">Organic Chemistry Studio</div>
  <p style="color:#8cb4d8;margin-top:20px">ขอแสดงความยินดีกับ</p>
  <div class="name">${document.getElementById('cert-name').textContent}</div>
  <div class="info">${document.getElementById('cert-class').textContent}</div>
  <div class="score">${document.getElementById('cert-score').textContent}</div>
  <div class="info">เวลา: ${document.getElementById('cert-time').textContent}</div>
  <div class="info">ระดับ: ${document.getElementById('cert-level').textContent}</div>
  <div style="font-size:2rem;margin:16px">${document.getElementById('cert-badge').textContent}</div>
  <div style="color:#5a7a9a;font-size:0.85rem;margin-top:20px">Organic Chemistry Studio · Grade 12 · Thailand</div>
  </div></body></html>`;
  const blob = new Blob([html], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `certificate_${(State.user?.name||'student').replace(/\s/g,'_')}.html`;
  a.click();
  showToast('📥 ดาวน์โหลด Certificate แล้ว!');
}

function screenshotCert() { showToast('📸 ใช้ Ctrl+Shift+S หรือ Print Screen เพื่อ Screenshot'); }

/* ══════════════════════════════════════
   SECTION 14: ADMIN PANEL
══════════════════════════════════════ */
function openAdmin() {
  document.getElementById('admin-pin-input').value = '';
  document.getElementById('pin-error').textContent = '';
  showModal('modal-pin');
  setTimeout(()=>document.getElementById('admin-pin-input').focus(), 100);
}

function verifyAdminPin() {
  const pin = document.getElementById('admin-pin-input').value.trim();
  if (!pin) { document.getElementById('pin-error').textContent = 'กรุณาใส่รหัส'; return; }
  if (pin !== State.adminPin && pin !== 'admin') {
    document.getElementById('pin-error').textContent = '❌ รหัสไม่ถูกต้อง';
    document.getElementById('admin-pin-input').value = '';
    return;
  }
  hideModal('modal-pin');
  const records = JSON.parse(localStorage.getItem('ochem_records')||'[]');
  let html = '';
  if (!records.length) {
    html = '<div class="admin-no-data">ยังไม่มีข้อมูลนักเรียน<br><small style="color:var(--c-text-3)">นักเรียนต้องเข้าสู่ระบบและเล่นก่อน</small></div>';
  } else {
    html = `<table class="admin-table">
      <tr><th>ชื่อ</th><th>ชั้น</th><th>เลขที่</th><th>XP</th><th>Lv</th><th>ด่านผ่าน</th><th>Badge</th><th>สอบ</th><th>ล่าสุด</th></tr>
      ${records.map(r=>`<tr>
        <td>${r.name||'-'}</td><td>${r.class||'-'}</td><td>${r.number||'-'}</td>
        <td>${r.xp||0}</td><td>${r.level||1}</td><td>${r.planets||0}/9</td>
        <td>${r.badges||0}</td><td>${r.examScore||0}</td><td>${r.lastSeen||'-'}</td>
      </tr>`).join('')}
    </table>`;
  }
  document.getElementById('admin-content').innerHTML = html;
  showModal('modal-admin');
}

function showModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'flex';
  el.classList.add('open');
}

function hideModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'none';
  el.classList.remove('open');
}

function closeAdmin() {
  hideModal('modal-admin');
}

function clearAllData() {
  if (!confirm('ล้างข้อมูลทั้งหมด? ไม่สามารถกู้คืนได้')) return;
  localStorage.removeItem('ochem_state');
  localStorage.removeItem('ochem_records');
  location.reload();
}

/* ══════════════════════════════════════
   SECTION 15: MINI GAMES (FULL LOGIC)
══════════════════════════════════════ */

/* ── MINI GAME: Functional Group Hunter ── */
function mgFGHunter() {
  const examples = [
    { formula:'CH₃CH₂OH',        answer:'Alcohol',         hint:'มีหมู่ –OH' },
    { formula:'CH₃CHO',          answer:'Aldehyde',        hint:'มีหมู่ –CHO' },
    { formula:'CH₃COCH₃',        answer:'Ketone',          hint:'มีหมู่ C=O ตรงกลาง' },
    { formula:'CH₃COOH',         answer:'Carboxylic Acid', hint:'มีหมู่ –COOH' },
    { formula:'CH₃COOCH₃',       answer:'Ester',           hint:'มีหมู่ –COO–' },
    { formula:'CH₃NH₂',          answer:'Amine',           hint:'มีหมู่ –NH₂' },
    { formula:'CH₃CONH₂',        answer:'Amide',           hint:'มีหมู่ –CONH₂' },
    { formula:'CH₃CH₂CH₃',       answer:'Alkane',          hint:'C–H และ C–C เท่านั้น' },
    { formula:'CH₂=CH₂',         answer:'Alkene',          hint:'มีพันธะคู่ C=C' },
    { formula:'CH≡CH',            answer:'Alkyne',          hint:'มีพันธะสาม C≡C' },
    { formula:'CH₃Cl',           answer:'Haloalkane',      hint:'มีอะตอม Cl' },
    { formula:'CH₃OCH₃',         answer:'Ether',           hint:'มีหมู่ C–O–C' },
    { formula:'C₆H₅OH',          answer:'Phenol',          hint:'มีหมู่ –OH ติด Benzene ring' },
    { formula:'CH₃CN',           answer:'Nitrile',         hint:'มีหมู่ –C≡N' },
  ];
  const pool = shuffle([...examples]).slice(0,10);
  const allAnswers = ['Alkane','Alkene','Alkyne','Alcohol','Ether','Aldehyde','Ketone','Carboxylic Acid','Ester','Amine','Amide','Haloalkane','Nitrile','Phenol'];

  State.quiz = { questions: pool.map(p=>({
    q: `สาร ${p.formula} จัดเป็นสารประเภทใด?`,
    a: p.answer,
    opts: shuffle([p.answer, ...shuffle(allAnswers.filter(a=>a!==p.answer)).slice(0,3)]),
    hint: p.hint,
    topic:'fg'
  })), idx:0, score:0, topic:'minigame', planetNum:8 };
  document.getElementById('quiz-title-bar').textContent = '🔍 Functional Group Hunter';
  showScreen('screen-quiz');
  renderQuizQuestion();
}

/* ── MINI GAME: Name The Molecule ── */
function mgNameMolecule() {
  const mols = [];
  for (let n=1; n<=8; n++) {
    ['alkane','alkene','alkyne','alcohol','aldehyde','acid'].forEach(fg=>{
      const d = ChemEngine.calcFormula(n, fg==='alkene'?'double':fg==='alkyne'?'triple':'single', fg);
      mols.push({ q:`สารที่มีโครงสร้าง ${d.condensed} ชื่อ IUPAC คืออะไร?`, a:d.iupac, fg, n });
    });
  }
  const pool = shuffle(mols).slice(0,10);
  const allNames = pool.map(p=>p.a);

  State.quiz = { questions: pool.map(p=>({
    q: p.q,
    a: p.a,
    opts: shuffle([p.a, ...shuffle(allNames.filter(n=>n!==p.a)).slice(0,3)]),
    hint: `เริ่มต้นจาก prefix "${CHEM.chainPrefix[p.n]}-"`,
    topic:'iupac'
  })), idx:0, score:0, topic:'minigame', planetNum:8 };
  document.getElementById('quiz-title-bar').textContent = '📛 Name The Molecule';
  showScreen('screen-quiz');
  renderQuizQuestion();
}

/* ── MINI GAME: Formula Match ── */
function mgFormulaMatch() {
  const pairs = [];
  for (let n=1; n<=10; n++) {
    const a = CHEM.alkanes[n];
    if (!a) continue;
    pairs.push({ q:`${a.name} มีสูตรโมเลกุลอะไร?`, a:a.formula, n });
  }
  const pool = shuffle(pairs).slice(0,10);
  const allFormulas = pairs.map(p=>p.a);

  State.quiz = { questions: pool.map(p=>({
    q: p.q,
    a: p.a,
    opts: shuffle([p.a, ...shuffle(allFormulas.filter(f=>f!==p.a)).slice(0,3)]),
    hint: `Alkane: CₙH₂ₙ₊₂, n = ${p.n}`,
    topic:'structure'
  })), idx:0, score:0, topic:'minigame', planetNum:8 };
  document.getElementById('quiz-title-bar').textContent = '🎯 Formula Match';
  showScreen('screen-quiz');
  renderQuizQuestion();
}

/* ── MINI GAME: Carbon Race ── */
function mgCarbonRace() {
  const qs = [];
  const names = ['Methane','Ethane','Propane','Butane','Pentane','Hexane','Heptane','Octane','Nonane','Decane'];
  names.forEach((nm,i)=>{
    qs.push({
      q: `"${nm}" มีจำนวนคาร์บอนกี่อะตอม?`,
      a: String(i+1),
      opts: shuffle([String(i+1), String(i+2>10?1:i+2), String(i>0?i:2), String(Math.min(i+3,10))].filter((v,j,a)=>a.indexOf(v)===j)).slice(0,4),
      hint: `${nm} = ${CHEM.chainPrefix[i+1]}-ane, C = ${i+1}`,
      topic:'iupac'
    });
  });
  State.quiz = { questions: shuffle(qs).slice(0,10), idx:0, score:0, topic:'minigame', planetNum:8 };
  document.getElementById('quiz-title-bar').textContent = '🏎️ Carbon Race';
  showScreen('screen-quiz');
  renderQuizQuestion();
}

/* ── MINI GAME: Bond Quiz Blitz ── */
function mgBondQuiz() {
  const qs = [
    { q:'พันธะ Single Bond (C–C) มีกี่ sigma bond?', a:'1', opts:['1','2','3','0'], hint:'Single bond = σ เท่านั้น' },
    { q:'พันธะ Double Bond (C=C) มีกี่ pi bond?', a:'1', opts:['0','1','2','3'], hint:'Double = σ1 + π1' },
    { q:'พันธะ Triple Bond (C≡C) มีกี่ pi bond?', a:'2', opts:['0','1','2','3'], hint:'Triple = σ1 + π2' },
    { q:'พันธะใดมีความยาวพันธะสั้นที่สุด?', a:'Triple Bond (C≡C)', opts:['Single Bond','Double Bond','Triple Bond (C≡C)','Ionic Bond'], hint:'พันธะสั้น = แข็งแกร่งกว่า' },
    { q:'Hybridization ของคาร์บอนใน Alkyne คืออะไร?', a:'sp', opts:['sp³','sp²','sp','sp⁴'], hint:'Triple bond → sp hybridization' },
    { q:'Hybridization ของคาร์บอนใน Alkene คืออะไร?', a:'sp²', opts:['sp³','sp²','sp','sp⁴'], hint:'Double bond → sp² hybridization' },
    { q:'Hybridization ของคาร์บอนใน Alkane คืออะไร?', a:'sp³', opts:['sp³','sp²','sp','sp⁴'], hint:'Single bond → sp³ hybridization' },
    { q:'มุมพันธะของ sp³ (Methane) คือกี่องศา?', a:'109.5°', opts:['90°','109.5°','120°','180°'], hint:'Tetrahedral angle' },
    { q:'มุมพันธะของ sp² (Ethene) คือกี่องศา?', a:'120°', opts:['90°','109.5°','120°','180°'], hint:'Trigonal planar' },
    { q:'มุมพันธะของ sp (Ethyne) คือกี่องศา?', a:'180°', opts:['90°','109.5°','120°','180°'], hint:'Linear' },
  ];
  State.quiz = { questions: shuffle(qs), idx:0, score:0, topic:'minigame', planetNum:8 };
  document.getElementById('quiz-title-bar').textContent = '⚗️ Bond Quiz Blitz';
  showScreen('screen-quiz');
  renderQuizQuestion();
}

/* ── Mini Game Router ── */
function startMiniGame(game) {
  State.hearts = Math.min(State.hearts+1, 3);
  switch(game) {
    case 'fg-hunter':    mgFGHunter();    break;
    case 'name-molecule':mgNameMolecule();break;
    case 'formula-match':mgFormulaMatch();break;
    case 'carbon-race':  mgCarbonRace(); break;
    case 'bond-quiz':    mgBondQuiz();   break;
    default: showToast('เกมนี้ยังไม่พร้อม');
  }
}

/* ══════════════════════════════════════
   SECTION 16: EXTRA VISUAL HELPERS
══════════════════════════════════════ */

/** Animated molecule viewer — rotates SVG for 3D feel */
function createMolViewer(containerId, carbons, fg='alkane') {
  const el = document.getElementById(containerId);
  if (!el) return;
  let angle = 0;
  el.innerHTML = SVGRenderer.drawLineAngle(carbons, fg, 'single', 400, 100);
  // Subtle scale pulse to simulate rotation
  el.style.animation = 'mol-rotate 6s ease-in-out infinite';
  const style = document.createElement('style');
  if (!document.getElementById('mol-rotate-style')) {
    style.id = 'mol-rotate-style';
    style.textContent = `@keyframes mol-rotate { 0%,100%{transform:scaleX(1) scaleY(1)} 25%{transform:scaleX(0.92) scaleY(1.04)} 75%{transform:scaleX(1.04) scaleY(0.97)} }`;
    document.head.appendChild(style);
  }
}

/** Draw aromatic benzene ring SVG */
function drawBenzene(w=200, h=180) {
  const cx=w/2, cy=h/2, r=55, ir=38;
  const pts = Array.from({length:6},(_,i)=>{
    const a = (i*60-30) * Math.PI/180;
    return { x: cx+r*Math.cos(a), y: cy+r*Math.sin(a) };
  });
  const hexPath = pts.map((p,i)=>`${i===0?'M':'L'}${p.x},${p.y}`).join(' ')+'Z';
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px">
    <path d="${hexPath}" fill="rgba(56,189,248,0.06)" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${ir}" fill="none" stroke="#22d3ee" stroke-width="1.5" stroke-dasharray="8 4" opacity="0.7"/>
    ${pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="7" fill="#1a2a4a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="${p.x}" y="${p.y+4}" text-anchor="middle" fill="#e2f0ff" font-size="9" font-weight="700" font-family="monospace">C</text>`).join('')}
    <text x="${cx}" y="${cy+50}" text-anchor="middle" fill="#22d3ee" font-size="11" font-family="monospace">Benzene (C₆H₆)</text>
  </svg>`;
}

/** Draw cycloalkane ring */
function drawCycloalkane(n, w=200, h=180) {
  const cx=w/2, cy=h/2-10, r=55;
  const pts = Array.from({length:n},(_,i)=>{
    const a = (i*(360/n)-90) * Math.PI/180;
    return { x: cx+r*Math.cos(a), y: cy+r*Math.sin(a) };
  });
  const path = pts.map((p,i)=>`${i===0?'M':'L'}${p.x},${p.y}`).join(' ')+'Z';
  const names = ['','','','Cyclopropane','Cyclobutane','Cyclopentane','Cyclohexane','Cycloheptane'];
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px">
    <path d="${path}" fill="rgba(110,231,183,0.06)" stroke="#6ee7b7" stroke-width="2"/>
    ${pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="7" fill="#1a2a4a" stroke="#6ee7b7" stroke-width="1.5"/>
    <text x="${p.x}" y="${p.y+4}" text-anchor="middle" fill="#e2f0ff" font-size="9" font-weight="700" font-family="monospace">C</text>`).join('')}
    <text x="${cx}" y="${cy+r+28}" text-anchor="middle" fill="#6ee7b7" font-size="11" font-family="monospace">${names[n]||'Cycloalkane'} (C${sub(n)}H${sub(2*n)})</text>
  </svg>`;
}

/* ══════════════════════════════════════
   SECTION 17: ENHANCED PLANET CONTENT
══════════════════════════════════════ */

/** Planet 1 extension: Ring Structures tab */
function showRingStructure(type) {
  const viewer = document.getElementById('ring-viewer');
  if (!viewer) return;
  if (type === 'benzene') {
    viewer.innerHTML = drawBenzene(280, 180);
  } else {
    const n = parseInt(type);
    viewer.innerHTML = drawCycloalkane(n, 280, 180);
  }
}

/** Planet 5 extension: highlight functional group in molecule SVG */
function highlightFG(fgId) {
  const fg = CHEM.functionalGroups.find(f=>f.id===fgId);
  if (!fg) return;
  showToast(`✨ ${fg.name}: หมู่ ${fg.symbol} กำลังเรืองแสง!`);
}

/** Build interactive isomer explorer */
function buildIsomerExplorer(area) {
  const isomers = {
    4: [
      { name:'n-Butane', condensed:'CH₃CH₂CH₂CH₃', desc:'โซ่ตรง' },
      { name:'2-Methylpropane (Isobutane)', condensed:'(CH₃)₂CHCH₃', desc:'โซ่กิ่ง' },
    ],
    5: [
      { name:'n-Pentane', condensed:'CH₃(CH₂)₃CH₃', desc:'โซ่ตรง' },
      { name:'2-Methylbutane', condensed:'CH₃CH(CH₃)CH₂CH₃', desc:'กิ่งที่ C2' },
      { name:'2,2-Dimethylpropane (Neopentane)', condensed:'C(CH₃)₄', desc:'กิ่งสองที่ C2' },
    ]
  };
  return isomers;
}

/* ══════════════════════════════════════
   SECTION 18: KEYBOARD SHORTCUTS
══════════════════════════════════════ */
document.addEventListener('keydown', e => {
  // ESC = go back
  if (e.key === 'Escape') {
    const modalAdmin = document.getElementById('modal-admin');
    const modalResult = document.getElementById('modal-result');
    if (modalAdmin && modalAdmin.style.display==='flex') { closeAdmin(); return; }
    if (modalResult && modalResult.style.display==='flex') { closeResult(); return; }
    const active = document.querySelector('.screen.active');
    if (active && active.id !== 'screen-login' && active.id !== 'screen-galaxy') goGalaxy();
  }
  // Number keys 1-9 on galaxy screen
  if (document.getElementById('screen-galaxy')?.classList.contains('active')) {
    const n = parseInt(e.key);
    if (n >= 1 && n <= 9) enterPlanet(n);
  }
});

/* ══════════════════════════════════════
   SECTION 19: PROGRESS TRACKER
══════════════════════════════════════ */
function getProgressSummary() {
  const donePlanets = Object.keys(State.planetsDone).filter(k=>State.planetsDone[k]).length;
  const totalQ = QuestionBank.all.length;
  const pct = Math.round((donePlanets/9)*100);
  return {
    donePlanets, totalPlanets:9, pct,
    xp: State.xp, level: State.level,
    badges: State.badges.length,
    badgeEmojis: State.badges.map(b=>BADGE_MAP[b]||'').join(' ')
  };
}

/** Show progress toast on galaxy load */
function showProgressToast() {
  if (!State.user) return;
  const p = getProgressSummary();
  if (p.donePlanets > 0) {
    showToast(`📊 ผ่านแล้ว ${p.donePlanets}/9 ด่าน · Lv.${p.level} · ${p.xp} XP`);
  }
}

/* ══════════════════════════════════════
   SECTION 20: PARTICLES / INIT
══════════════════════════════════════ */
function createParticles() {
  const container = document.getElementById('particles-container');
  const colors = ['rgba(56,189,248,0.6)','rgba(110,231,183,0.5)','rgba(167,139,250,0.5)','rgba(244,114,182,0.4)','rgba(253,224,71,0.4)'];
  for (let i=0; i<30; i++) {
    const p = document.createElement('div');
    const size = Math.random()*3+1;
    const x = Math.random()*100, y = Math.random()*100;
    const dur = Math.random()*8+4, delay = Math.random()*5;
    const color = colors[Math.floor(Math.random()*colors.length)];
    p.style.cssText = `position:absolute;left:${x}%;top:${y}%;width:${size}px;height:${size}px;
      background:${color};border-radius:50%;
      animation:float-particle ${dur}s ease-in-out ${delay}s infinite alternate;
      pointer-events:none`;
    container.appendChild(p);
  }
  const style = document.createElement('style');
  style.textContent = `@keyframes float-particle { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(${(Math.random()-0.5)*40}px,${(Math.random()-0.5)*40}px) scale(1.5)} }`;
  document.head.appendChild(style);
}

/* ── INIT ── */
window.addEventListener('DOMContentLoaded', ()=>{
  loadState();
  createParticles();

  // If already logged in, go to galaxy
  if (State.user) {
    document.getElementById('inp-name').value   = State.user.name;
    document.getElementById('inp-school').value = State.user.school || '';
    updateHUD();
    updatePlanetStatuses();
  }
});
