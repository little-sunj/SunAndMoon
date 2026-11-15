/*
 * 레이어별 이미지
 * - ''        : 임시 도형
 * - null      : 비워 둠
 * - '경로'    : 3:2 캔버스를 꽉 채우는 이미지 한 장
 * - [ {...} ] : 무대 위에 놓는 조각 이미지들. 뒤에 적은 조각이 앞에 그려짐.
 *     left, bottom : 무대 왼쪽 아래 모서리에서 떨어진 거리(무대 너비·높이의 %)
 *     width        : 무대 너비 대비 %. 높이는 이미지 비율대로 정해짐.
 *     flip         : true면 좌우를 뒤집습니다.
 *     night        : 직접 보정한 밤 이미지 경로(선택)
 */
const ASSETS = {
  skyDay: 'assets/images/scenery/sky-day.webp',
  skyNight: 'assets/images/scenery/sky-night.webp',
  sun: 'assets/images/sun.webp',
  moon: 'assets/images/moon.webp',
  /* 산은 세 겹입니다. 먼 산(옅은 산띠) → 중간 산(도시 뒤 봉우리) → 앞산(양쪽 가장자리). */
  farPeaks: [
    { src: 'assets/images/scenery/far-band.webp', left: 0, bottom: 10, width: 100 }
  ],
  mainPeaks: null,   /* 중간 봉우리(mid-spires.webp)는 뺌. */
  midClouds: null,
  /* 도시: 뒤에서 앞 순서로 적습니다. night는 창문에 불을 켠 밤 그림입니다.
     가운데 건물의 밑동은 파도가, 양옆 건물의 밑동은 앞 구름이 가립니다. */
  city: [
    /* 먼 스카이라인 (반투명). 같은 그림을 세 번 이어 화면 가로 전체를 채웁니다. */
    { src: 'assets/images/city/skyline.webp', night: 'assets/images/city/skyline-night.webp', left: -18, bottom: 13.5, width: 50, flip: true },
    { src: 'assets/images/city/skyline.webp', night: 'assets/images/city/skyline-night.webp', left: 68, bottom: 13.5, width: 50, flip: true },
    { src: 'assets/images/city/skyline.webp', night: 'assets/images/city/skyline-night.webp', left: 25, bottom: 14.5, width: 50 },
    /* 뒷줄 */
    { src: 'assets/images/city/cluster-3.webp', night: 'assets/images/city/cluster-3-night.webp', left: 7, bottom: 9, width: 14, edge: 'line' },
    { src: 'assets/images/city/block-12.webp', night: 'assets/images/city/block-12-night.webp', left: 18, bottom: 8, width: 12, flip: true, edge: 'line' },
    { src: 'assets/images/city/block-7.webp', night: 'assets/images/city/block-7-night.webp', left: 74, bottom: 8, width: 12, edge: 'line' },
    { src: 'assets/images/city/tower-2.webp', night: 'assets/images/city/tower-2-night.webp', left: 41.5, bottom: 11, width: 2.8, edge: 'line' },
    { src: 'assets/images/city/pagoda-3.webp', night: 'assets/images/city/pagoda-3-night.webp', left: 58, bottom: 12, width: 10, edge: 'line' },
    { src: 'assets/images/city/tower-3.webp', night: 'assets/images/city/tower-3-night.webp', left: 63.5, bottom: 13, width: 6.5, edge: 'line' },
    { src: 'assets/images/city/cluster-3.webp', night: 'assets/images/city/cluster-3-night.webp', left: 71, bottom: 4, width: 16, flip: true, edge: 'line' },
    /* 가운뎃줄 */
    /* 삿된 것(밤에만 보임). 뒷줄 앞, 가운뎃줄 뒤에 숨어 고개만 내밉니다. tone은 밤빛에 맞춘 색 보정입니다. */
    { src: 'assets/images/saeki/black-cat.webp', left: 67, bottom: 13.5, width: 10, flip: true, nightOnly: true },
    { src: 'assets/images/city/block-7.webp', night: 'assets/images/city/block-7-night.webp', left: 79.5, bottom: 4, width: 10, flip: true, edge: 'line' },
    { src: 'assets/images/city/cluster-3.webp', night: 'assets/images/city/cluster-3-night.webp', left: 25, bottom: 4, width: 23.8, edge: 'line' },
    { src: 'assets/images/city/block-2.webp', night: 'assets/images/city/block-2-night.webp', left: 52, bottom: 3, width: 12.6, edge: 'line' },
    { src: 'assets/images/city/cluster-2.webp', night: 'assets/images/city/cluster-2-night.webp', left: 59, bottom: 0, width: 19.6, edge: true },
    { src: 'assets/images/city/block-2.webp', night: 'assets/images/city/block-2-night.webp', left: 47, bottom: 6, width: 9.5, edge: 'line' },
    { src: 'assets/images/city/tower-1.webp', night: 'assets/images/city/tower-1-night.webp', left: 50.5, bottom: 0, width: 9.6, edge: true },
    /* 뿔 달린 도깨비(밤에만 보임). 앞줄 건물 바로 뒤에 두어 아랫단을 가립니다. */
    { src: 'assets/images/saeki/horned.webp', left: 22.5, bottom: 10, width: 10, nightOnly: true, tone: 'brightness(.55) saturate(.7)' },
    /* 앞줄 */
    { src: 'assets/images/city/block-7.webp', night: 'assets/images/city/block-7-night.webp', left: 7, bottom: -3, width: 13, edge: true },
    { src: 'assets/images/city/block-7.webp', night: 'assets/images/city/block-7-night.webp', left: 19.5, bottom: -1.1, width: 12.6, edge: true },
    { src: 'assets/images/city/cluster-2.webp', night: 'assets/images/city/cluster-2-night.webp', left: 26, bottom: 0, width: 16.8, flip: true, edge: true },
    { src: 'assets/images/city/pagoda-1.webp', night: 'assets/images/city/pagoda-1-night.webp', left: 37.5, bottom: 0, width: 20, edge: true }
  ],
  /* 앞산과 구름 둑. 구름 둑은 도시 양옆 밑동과 앞산의 잘린 끝을 가립니다. */
  frontClouds: [
    {src: 'assets/images/scenery/front-left.webp', left: -4, bottom: -8.06, width: 28, edge: 'shadow'},
    {src: 'assets/images/scenery/front-right.webp', left: 69.5, bottom: -10.42, width: 31.5, edge: 'shadow'}
  ]
};

/*
 * 밤 톤: 낮 그림에 이 색을 곱해 밤 그림을 자동으로 만듭니다.
 * 색이 어두울수록 밤도 어두워지고, 파란색이 강할수록 푸르게 물듭니다.
 */
const NIGHT_TONE = {
  farPeaks: '#4d6c8a',
  mainPeaks: '#324d6a',
  midClouds: '#55728f',
  city: '#2c4259',
  frontClouds: '#607f9c'
};

/*
 * 3:2 캔버스 이미지용 밤 이미지. 직접 보정한 파일이 있으면 적으세요.
 * 자동 톤보다 우선합니다. 조각 이미지는 각 조각의 night에 적습니다.
 */
const NIGHT_IMAGES = {
  farPeaks: '',
  mainPeaks: '',
  midClouds: '',
  city: '',
  frontClouds: ''
};

/* 휴대폰 주소창 색: 낮·밤 하늘 윗부분 색에 맞춥니다. 입장 화면에서는 석청색입니다. */
const THEME_COLOR = { gate: '#12344a', day: '#92cbe7', night: '#1a2435' };
const themeMeta = document.querySelector('meta[name="theme-color"]');

const COPY = {
  day: { action: '밤으로 바꾸기' },
  night: { action: '낮으로 바꾸기' }
};

const root = document.documentElement;
const toggle = document.getElementById('toggle');
const toggleLabel = document.getElementById('toggle-label');
const placeholders = window.Placeholders || {};
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/* 레이어 채우기: 경로가 없거나 못 불러오면 임시 도형을 씁니다. */
function placeholderUrl(key) {
  const svg = placeholders[key];
  return svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : '';
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.alt = '';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(source));
    image.src = source;
  });
}

async function loadWithFallback(key, source) {
  try {
    return await loadImage(source || placeholderUrl(key));
  } catch (error) {
    console.warn(`이미지를 불러오지 못했습니다: ${error.message}`);
    return loadImage(placeholderUrl(key));
  }
}

/* 이 기기에서 무대가 가장 넓어질 때의 너비(px). 가로·세로로 돌려도 충분하도록 둘 다 봅니다. */
function maxStageWidth() {
  const a = screen.width;
  const b = screen.height;
  const stage = (w, h) => Math.max(w, Math.min(1.5 * h, 2.5 * w));
  return Math.max(stage(a, b), stage(b, a)) * Math.min(window.devicePixelRatio || 1, 2);
}

/* 밤 그림은 화면에 보일 크기까지만 만들어 휴대폰 메모리를 아낍니다. */
function bakeNight(image, tone, share = 1) {
  const needed = Math.ceil(maxStageWidth() * share);
  const width = Math.min(image.naturalWidth, 2400, needed);
  const height = Math.round(width * image.naturalHeight / image.naturalWidth);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;

  context.drawImage(image, 0, 0, width, height);
  context.globalCompositeOperation = 'multiply';
  context.fillStyle = tone;
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = 'destination-in';
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

function piecesFor(key) {
  const value = ASSETS[key];
  if (value === null) return [];
  if (Array.isArray(value)) return value;
  return [{ src: value, night: NIGHT_IMAGES[key] }];
}

async function paintPiece(key, spec) {
  const placed = spec.width !== undefined;
  const piece = document.createElement('div');
  piece.className = placed ? 'piece piece--placed' : 'piece';
  if (spec.flip) piece.classList.add('is-flipped');

  let day;
  if (placed) {
    try {
      day = await loadImage(spec.src);
    } catch (error) {
      console.warn(`이미지를 불러오지 못했습니다: ${error.message}`);
      return null;
    }
    piece.style.left = `${spec.left}%`;
    piece.style.bottom = `${spec.bottom}%`;
    piece.style.width = `${spec.width}%`;
    piece.style.aspectRatio = `${day.naturalWidth} / ${day.naturalHeight}`;
    /* 금빛 테두리. edge: true 는 금선과 그림자(앞줄용), edge: 'line' 은 금선과 옅은 그림자(뒷줄·가운뎃줄용),
       edge: 'shadow' 는 그림자만(이미 금선이 그려진 앞산용)입니다. */
    if (spec.edge) piece.classList.add('has-edge');
    if (spec.edge === 'line' || spec.edge === 'shadow') piece.classList.add(`has-edge--${spec.edge}`);
  } else {
    day = await loadWithFallback(key, spec.src);
  }
  piece.append(day);

  /* 밤에만 나타나는 삿된 것: 밤 그림을 따로 두지 않고, 밤이 되면 서서히 나타납니다. */
  if (spec.nightOnly) {
    piece.classList.add('is-night-only');
    if (spec.tone) day.style.filter = spec.tone;
    return piece;
  }

  if (!(key in NIGHT_TONE)) return piece;

  let night;
  if (spec.night) {
    try {
      night = await loadImage(spec.night);
    } catch (error) {
      console.warn(`밤 이미지를 불러오지 못했습니다: ${error.message}`);
    }
  }
  night = night || bakeNight(day, NIGHT_TONE[key], placed ? spec.width / 100 : 1);
  night.classList.add('night');
  piece.classList.add('has-night');
  piece.append(night);
  return piece;
}

async function paintLayer(element) {
  const key = element.dataset.asset;
  const pieces = await Promise.all(piecesFor(key).map((spec) => paintPiece(key, spec)));
  element.replaceChildren(...pieces.filter(Boolean));
}

document.querySelectorAll('[data-asset]').forEach(paintLayer);

/* 도시 불빛 */
const lights = {
  canvas: document.getElementById('lights'),
  /* 실제 건물 창문 자리에 맞춘 불빛(js/city-lights.js). 없으면 임시 도형용 불빛을 씁니다. */
  points: window.CITY_LIGHTS || placeholders.cityLights || [],
  frame: 0,
  lastDraw: 0,
  fadeTimer: 0
};
lights.context = lights.canvas.getContext('2d');

function resizeLights() {
  const box = lights.canvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  lights.canvas.width = Math.round(box.width * scale);
  lights.canvas.height = Math.round(box.height * scale);
  drawLights(performance.now());
}

function drawLights(time) {
  const { canvas, context, points } = lights;
  const seconds = reducedMotion.matches ? 0 : time / 1000;
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (const point of points) {
    const wave = Math.sin(seconds * point.speed + point.offset);
    const alpha = Math.max(0, Math.min(1, point.base + point.amp * wave));
    const x = point.x * canvas.width;
    const y = point.y * canvas.height;
    const width = Math.max(1, point.w * canvas.width);
    const height = Math.max(1, point.h * canvas.height);

    context.fillStyle = `rgba(242, 178, 72, ${alpha * .22})`;
    context.fillRect(x - width, y - height * .7, width * 3, height * 2.4);
    context.fillStyle = `rgba(255, 224, 150, ${alpha})`;
    context.fillRect(x, y, width, height);
  }
}

function lightLoop(time) {
  if (time - lights.lastDraw > 50) {
    drawLights(time);
    lights.lastDraw = time;
  }
  lights.frame = requestAnimationFrame(lightLoop);
}

function startLights() {
  clearTimeout(lights.fadeTimer);
  cancelAnimationFrame(lights.frame);
  if (reducedMotion.matches || document.hidden) {
    drawLights(performance.now());
    return;
  }
  lights.frame = requestAnimationFrame(lightLoop);
}

function stopLights() {
  cancelAnimationFrame(lights.frame);
}

/* 낮과 밤 전환 */
let turn = 0;

const sunButton = document.getElementById('sun');
const moonButton = document.getElementById('moon');

function syncThemeColor() {
  if (themeMeta && !document.getElementById('gate')) themeMeta.content = THEME_COLOR[root.dataset.phase];
}

function setPhase(phase) {
  root.dataset.phase = phase;
  syncThemeColor();
  root.style.setProperty('--turn', turn);
  toggleLabel.textContent = COPY[phase].action;

  /* 화면 아래로 숨은 쪽은 누르거나 탭으로 고를 수 없게 합니다. */
  sunButton.inert = phase === 'night';
  moonButton.inert = phase === 'day';

  if (phase === 'night') {
    startLights();
  } else {
    clearTimeout(lights.fadeTimer);
    /* 불빛이 다 꺼진 뒤(회전이 끝날 즈음) 그리기를 멈춥니다. */
    const dur = parseFloat(getComputedStyle(root).getPropertyValue('--dur')) || 2400;
    lights.fadeTimer = setTimeout(stopLights, dur + 200);
  }
}

toggle.addEventListener('click', () => {
  turn += 1;
  setPhase(turn % 2 === 0 ? 'day' : 'night');
});

/* 다른 화면(인물 소개 등)에서 낮과 밤을 바꿀 때 씁니다. */
window.Scene = {
  get phase() { return root.dataset.phase; },
  syncThemeColor,
  goTo(phase) {
    if (root.dataset.phase === phase) return;
    turn += 1;
    setPhase(phase);
  }
};

document.addEventListener('visibilitychange', () => {
  if (root.dataset.phase !== 'night') return;
  if (document.hidden) stopLights();
  else startLights();
});

new ResizeObserver(resizeLights).observe(lights.canvas);
