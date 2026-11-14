/*
 * 임시 도형 모음입니다. 진짜 이미지로 모두 교체하면 이 파일과
 * index.html의 <script> 한 줄을 지워도 됩니다.
 * 좌표계는 모든 레이어 공통으로 가로 1800, 세로 1200입니다.
 */
(function () {
  const VIEW = 'width="1800" height="1200" viewBox="0 0 1800 1200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"';
  const ORB = 'width="600" height="600" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"';

  function peak(x, tip, half, base) {
    const h = base - tip;
    return `M${x - half} ${base}` +
      `C${x - half * .55} ${base - h * .3},${x - half * .42} ${tip + h * .3},${x - half * .14} ${tip + h * .05}` +
      `L${x} ${tip}L${x + half * .14} ${tip + h * .06}` +
      `C${x + half * .42} ${tip + h * .32},${x + half * .55} ${base - h * .28},${x + half} ${base}Z`;
  }

  function puffs(list, fill) {
    return list.map(([x, y, w]) => {
      const r = w / 5;
      return `<g fill="${fill}">
        <circle cx="${x - r * 1.5}" cy="${y}" r="${r * .85}"/>
        <circle cx="${x - r * .4}" cy="${y - r * .55}" r="${r * 1.15}"/>
        <circle cx="${x + r * .85}" cy="${y - r * .2}" r="${r}"/>
        <circle cx="${x + r * 1.75}" cy="${y + r * .1}" r="${r * .68}"/>
        <rect x="${x - r * 2.3}" y="${y}" width="${r * 4.7}" height="${r * .85}" rx="${r * .42}"/>
      </g>`;
    }).join('');
  }

  function rng(seed) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* 도시: 건물과 창문 좌표를 함께 만들어 불빛이 창문 자리에 오게 합니다. */
  const CITY = { left: 540, top: 760, width: 720, height: 300 };
  const random = rng(11);
  const windows = [];
  let cityShapes = '';
  for (let x = 625; x < 1170;) {
    const width = 30 + random() * 34;
    const centered = 1 - Math.abs(x - 900) / 290;
    const height = 80 + centered * 150 + random() * 55;
    const top = 1060 - height;
    const tone = ['#517c88', '#658f97', '#47707e'][Math.floor(random() * 3)];
    cityShapes += `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${width.toFixed(1)}" height="${height.toFixed(1)}" fill="${tone}"/>`;
    for (let wx = x + 6; wx < x + width - 6; wx += 11) {
      for (let wy = top + 8; wy < 1045; wy += 15) {
        cityShapes += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="5" height="7" fill="#b9d2cf" opacity=".55"/>`;
        if (random() < .42) {
          windows.push({
            x: (wx - CITY.left) / CITY.width,
            y: (wy - CITY.top) / CITY.height,
            w: 5 / CITY.width,
            h: 7 / CITY.height,
            base: .35 + random() * .5,
            amp: random() < .3 ? .55 : .12,
            speed: .6 + random() * 1.8,
            offset: random() * Math.PI * 2
          });
        }
      }
    }
    x += width + 3 + random() * 7;
  }

  window.Placeholders = {
    skyDay: `<svg ${VIEW}><defs><linearGradient id="sd" x2="0" y2="1">
      <stop offset="0" stop-color="#7fb2b8"/><stop offset=".58" stop-color="#cfe2d4"/><stop offset="1" stop-color="#f4e6c3"/>
      </linearGradient></defs><rect width="1800" height="1200" fill="url(#sd)"/></svg>`,
    skyNight: `<svg ${VIEW}><defs><linearGradient id="sn" x2="0" y2="1">
      <stop offset="0" stop-color="#0a2236"/><stop offset=".62" stop-color="#1d4a60"/><stop offset="1" stop-color="#356a7a"/>
      </linearGradient></defs><rect width="1800" height="1200" fill="url(#sn)"/></svg>`,
    sun: `<svg ${ORB}><defs><radialGradient id="os" cx=".38" cy=".34" r=".8">
      <stop offset="0" stop-color="#f7d982"/><stop offset=".65" stop-color="#d9a23f"/><stop offset="1" stop-color="#ad7620"/>
      </radialGradient></defs><rect width="100" height="100" fill="url(#os)"/></svg>`,
    moon: `<svg ${ORB}><defs><radialGradient id="om" cx=".4" cy=".36" r=".82">
      <stop offset="0" stop-color="#fffdf2"/><stop offset=".72" stop-color="#efead6"/><stop offset="1" stop-color="#c8c8b6"/>
      </radialGradient></defs><rect width="100" height="100" fill="url(#om)"/>
      <circle cx="35" cy="62" r="9" fill="#d9d6c2" opacity=".55"/><circle cx="66" cy="34" r="6" fill="#d9d6c2" opacity=".5"/></svg>`,
    farPeaks: `<svg ${VIEW}><g fill="#8db6b2">
      <path d="${peak(120, 560, 260, 1080)}"/><path d="${peak(300, 690, 210, 1080)}"/>
      <path d="${peak(1690, 500, 280, 1080)}"/><path d="${peak(1520, 660, 220, 1080)}"/>
      <path d="${peak(760, 800, 170, 1080)}"/><path d="${peak(1045, 760, 190, 1080)}"/></g></svg>`,
    mainPeaks: `<svg ${VIEW}><defs><linearGradient id="mp" x2="0" y2="1">
      <stop offset="0" stop-color="#2f6a72"/><stop offset=".78" stop-color="#5f9692"/><stop offset="1" stop-color="#9bbcb0"/>
      </linearGradient></defs><g fill="url(#mp)">
      <path d="${peak(400, 470, 220, 1080)}"/><path d="${peak(1400, 410, 240, 1080)}"/>
      <path d="${peak(560, 235, 275, 1080)}"/><path d="${peak(1240, 195, 285, 1080)}"/></g></svg>`,
    midClouds: `<svg ${VIEW}>${puffs([[210, 880, 360], [560, 880, 250], [1250, 870, 260], [1600, 865, 370]], '#f4efdf')}</svg>`,
    city: `<svg ${VIEW}>${cityShapes}</svg>`,
    frontClouds: `<svg ${VIEW}>${puffs([[170, 1045, 500], [520, 1095, 330], [1290, 1095, 340], [1640, 1035, 520]], '#fbf7e9')}</svg>`,
    cityLights: windows
  };
})();
