# 이미지 준비

이미지는 `assets/images`에 넣고 `js/scene.js` 맨 위의 `ASSETS`에 적습니다.

## 지금 쓰는 이미지

| 파일 | 레이어 | 위치 | 원본 |
|---|---|---|---|
| `scenery/sky-day.webp`, `scenery/sky-night.webp` | 하늘 (낮, 밤) | 화면 전체 | 니지 하늘 그림. 밤은 낮 그림에 색을 입혀 만들고 별을 얹음 |
| `sun.webp`, `moon.webp` | 해, 달 | 회전 바퀴 | `sun-glow.png`(원 부분만 정사각형으로 잘라냄), `moon.png` |
| `scenery/far-band.webp` | 먼 산 (`farPeaks`) | 도시 뒤, 가로 전체 | 니지 산 그림(옅은 산띠) |
| `scenery/front-left.webp`, `scenery/front-right.webp` | 앞산 (`frontClouds`) | 양쪽 가장자리 | 니지 산 그림(금선) |
| `city/*.webp`, `city/*-night.webp` | 도시 (`city`) 건물 18종의 낮·밤 그림. 같은 건물을 뒤집거나 크기를 바꿔 여러 번 놓아 화면 가로 전체를 채웁니다 | 양쪽 앞산 사이 | 니지 건물 그림을 투명 배경으로 자른 것. 낮 그림은 산 팔레트(남색·크림색)로 다시 칠했습니다 |
| `soback-motion.mp4` / `.webm` / `.webp` | 소백 소개 첫 그림 (영상, 포스터) | 소개 창 | `소백_움짤.gif` |
| `yeomhee-motion.mp4` / `.webm` / `.webp` | 염희 소개 첫 그림 (영상, 포스터) | 소개 창 | `염화_움짤.gif` |
| `soback-1.webp` ~ `soback-6.webp` | 소백 그림 고르기 | 소개 창 | `소백1.png` ~ `소백6.png` |
| `og-image.jpg` | 링크 공유 미리보기 (1200×630) | `index.html`의 og:image | `sky-night.webp`, `moon.webp`, `soback-1.webp` 합성 |
| `place-moon.webp`, `place-sun.webp` | 월당·일궁 소개 상자 배경 | 인물 소개 창 | `moon-shrine.png`, `sun-castle.png` |
| `saeki/black-cat.webp`, `saeki/horned.webp` | 밤에만 보이는 삿된 것 (`city`) | 건물 사이 | `saeki-black-cat.png`, `saeki-horned.png` |
| `saeki/*-thumb.webp` | 삿된 것 메뉴의 갈래별 그림 | 삿된 것 창 | `saeki-*.png` |

WebP는 원본 PNG를 웹용으로 줄인 파일입니다. 원본을 고치면 WebP도 다시 만들어야 합니다.
원본 PNG와 움짤(GIF)은 사이트 폴더 밖 `바탕화면\단\원본` 폴더에 있습니다.
지금 쓰지 않는 예전 그림(예전 하늘·산·금빛 해, 빼 둔 건물과 중간 봉우리, 하늘 가림막 등)은 `단\원본\sunandmoon-미사용`에 같은 폴더 구조로 옮겨 두었습니다. 표의 '원본' 칸에 적힌 파일이 그곳에 있어요.
삿된 것 투명 PNG(`saeki-*.png`)도 그곳에 있습니다. 사이트에 쓸 때는 WebP로 줄여서 이 폴더에 넣습니다.
움짤(GIF)은 16MB가 넘어서 같은 움직임의 영상(MP4, WebM)으로 바꿨습니다. 크기가 1MB 안팎으로 줄어듭니다.
글과 그림 목록, 음악 목록은 `js/content.js`에서 고칩니다.

도시 건물의 밤 그림(`-night`)은 낮 그림을 어둡게 하고 창문 일부에 불을 켜서 만든 파일입니다.
반짝이는 창문 불빛은 `js/city-lights.js`에 있고, 지금 건물 배치에 맞춘 값입니다. 건물을 옮기거나 크기를 바꾸면 불빛도 다시 만들어야 합니다.

## 적는 방법

- 3:2 캔버스를 꽉 채우는 이미지: `mainPeaks: 'assets/images/peaks.webp'`
- 원하는 자리에 놓는 조각 이미지: `{ src, night, left, bottom, width, flip }`
  - `night`: 직접 만든 밤 그림(선택). 없으면 낮 그림에 밤 톤을 입혀 자동으로 만듭니다.
  - `left`, `bottom`: 무대 왼쪽 아래 모서리에서 떨어진 거리(%)
  - `width`: 무대 너비 대비 크기(%). 높이는 이미지 비율대로 정해집니다.
  - 같은 이미지를 `flip: true`로 뒤집어 한 번 더 쓸 수 있습니다.
- 레이어를 비우려면 `null`, 임시 도형을 쓰려면 `''`

## 크기 기준

| 항목 | 내용 |
|---|---|
| 해, 달 | 원이 꽉 차는 정사각형, 800×800 이상 |
| 산, 구름 | 투명 배경, 가로 2000px 안팎 |
| 하늘 | 불투명, 3:2 |

- 무대는 3:2이며, 해와 달은 위에서 46% 지점에 뜹니다.
- 휴대폰 세로 화면에서는 가운데 40%만 보입니다.
