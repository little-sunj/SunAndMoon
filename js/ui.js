/* 입장 화면, 소개 창, 음악 */
(function () {
  const site = window.SITE;
  const scene = document.getElementById('scene');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const wait = (ms) => new Promise((done) => setTimeout(done, reducedMotion.matches ? 0 : ms));

  /* ── 음악 ─────────────────────────────── */
  const Music = (() => {
    const box = document.getElementById('music');
    const toggleButton = document.getElementById('music-button');
    const panel = document.getElementById('playlist');
    const playButton = document.getElementById('music-play');
    const title = document.getElementById('music-title');
    const list = document.getElementById('music-list');
    const tracks = site.music;
    const audio = new Audio();
    audio.preload = 'none';
    let index = 0;
    let loaded = false;

    list.innerHTML = tracks.map((track, i) => `
      <li><button type="button" data-track="${i}">
        <span class="num"><span class="digit">${i + 1}</span><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span></span>
        <span class="name">${track.title}</span>
        <span class="time" data-time="${i}"></span>
      </button></li>`).join('');

    function render() {
      const playing = !audio.paused;
      box.dataset.state = playing ? 'playing' : 'paused';
      title.textContent = tracks[index].title;
      playButton.setAttribute('aria-label', playing ? '일시정지' : '재생');
      list.querySelectorAll('[data-track]').forEach((button) => {
        const current = Number(button.dataset.track) === index;
        button.setAttribute('aria-current', current ? 'true' : 'false');
      });
    }

    function play(i = index) {
      const next = (i + tracks.length) % tracks.length;
      if (!loaded || next !== index) {
        index = next;
        audio.src = tracks[index].src;
        loaded = true;
      }
      audio.play().catch((error) => console.warn('음악을 재생하지 못했습니다:', error.message));
      render();
    }

    function togglePlay() {
      if (audio.paused) play();
      else audio.pause();
    }

    function formatTime(seconds) {
      if (!Number.isFinite(seconds)) return '';
      /* 초는 버림으로 셉니다. 반올림하면 1:59.6초가 '1:60'으로 보입니다. */
      const total = Math.floor(seconds);
      const m = Math.floor(total / 60);
      const s = String(total % 60).padStart(2, '0');
      return `${m}:${s}`;
    }

    let timesLoaded = false;
    function loadTimes() {
      if (timesLoaded) return;
      timesLoaded = true;
      tracks.forEach((track, i) => {
        const probe = new Audio();
        probe.preload = 'metadata';
        probe.addEventListener('loadedmetadata', () => {
          list.querySelector(`[data-time="${i}"]`).textContent = formatTime(probe.duration);
        }, { once: true });
        probe.src = track.src;
      });
    }

    document.getElementById('music-count').textContent = `${tracks.length}곡`;

    function setOpen(open) {
      panel.hidden = !open;
      box.dataset.list = open ? "open" : "closed";
      toggleButton.setAttribute('aria-expanded', String(open));
      if (open) loadTimes();
    }

    toggleButton.addEventListener('click', () => setOpen(panel.hidden));
    playButton.addEventListener('click', togglePlay);
    list.addEventListener('click', (event) => {
      const button = event.target.closest('[data-track]');
      if (button) play(Number(button.dataset.track));
    });
    audio.addEventListener('play', render);
    audio.addEventListener('pause', render);
    audio.addEventListener('ended', () => play(index + 1));
    /* 곡 제목 아래 진행 선 */
    const setProgress = () => {
      const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
      box.style.setProperty('--progress', ratio.toFixed(4));
    };
    audio.addEventListener('timeupdate', setProgress);
    audio.addEventListener('emptied', setProgress);

    document.addEventListener('pointerdown', (event) => {
      if (!panel.hidden && !box.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) {
        setOpen(false);
        toggleButton.focus();
      }
    });

    render();
    return { play, close: () => setOpen(false) };
  })();

  /* ── 소개 창 ───────────────────────────── */
  const sheet = document.getElementById('sheet');
  const art = document.getElementById('sheet-art');
  const body = document.getElementById('sheet-body');
  const scroller = document.getElementById('sheet-scroll');
  const closeButton = document.getElementById('sheet-close');
  let returnFocus = null;
  let closing = false;

  const paragraphs = (list) => list.map((text) => `<p>${text}</p>`).join('');
  const sections = (list = []) => list.map((section) => `
    <section><h3>${section.heading}</h3>${paragraphs(section.body)}</section>`).join('');

  function mediaHtml(item) {
    if (item.type === 'video') {
      const auto = reducedMotion.matches ? '' : 'autoplay';
      const webm = item.webm ? `<source src="${item.webm}" type="video/webm">` : '';
      const state = auto ? 'playing' : 'paused';
      return `<video poster="${item.poster}" ${auto} muted loop playsinline aria-label="${item.alt}">
        ${webm}<source src="${item.src}" type="video/mp4"></video>
        <button class="art-motion icon-button" type="button" data-motion="${state}"
          aria-label="${auto ? '움직임 멈추기' : '움직임 재생'}">
          <svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>
          <svg class="icon-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>
        </button>`;
    }
    return `<img src="${item.src}" alt="${item.alt}" draggable="false">`;
  }

  /* 그림 넘기기 */
  const arrow = (step, label, path) => `
    <button class="carousel__arrow icon-button" type="button" data-step="${step}" aria-label="${label}">
      <svg class="line" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>
    </button>`;
  let artIndex = 0;

  function buildArt(person) {
    if (!person) {
      art.innerHTML = '';
      return;
    }
    const many = person.gallery.length > 1;
    art.innerHTML = `<div class="carousel${many ? '' : ' carousel--single'}">
      ${many ? arrow(-1, '이전 그림', 'M15 5l-7 7 7 7') : ''}
      <figure class="art-frame" id="art-frame"></figure>
      ${many ? arrow(1, '다음 그림', 'M9 5l7 7-7 7') : ''}
      ${many ? '<p class="carousel__count" id="art-count" aria-live="polite"></p>' : ''}
    </div>`;
    setArt(0);
  }

  function setArt(i) {
    const gallery = site.characters[sheet.dataset.current].gallery;
    artIndex = (i + gallery.length) % gallery.length;
    const item = gallery[artIndex];
    const frame = document.getElementById('art-frame');
    frame.style.setProperty('--ratio', item.ratio || 1);
    frame.innerHTML = mediaHtml(item);

    const count = document.getElementById('art-count');
    if (count) count.textContent = `${artIndex + 1} / ${gallery.length}`;
    body.querySelectorAll('[data-art]').forEach((button) => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.art) === artIndex));
    });
  }

  function renderWorld() {
    const world = site.world;
    return `<h2 id="sheet-title">${world.title}</h2>
      <p class="lead">${world.lead}</p>${sections(world.sections)}`;
  }

  function renderSaeki() {
    const saeki = site.saeki;
    const kinds = saeki.kinds.map((kind, i) => {
      const art = kind.image ? `<img class="kind__art" src="${kind.image}" alt="" loading="lazy">` : '';
      const side = kind.image ? ` kind--art${i % 2 ? ' kind--right' : ''}` : '';
      return `
      <div class="kind${side}"><dt>${art}<span class="kind__name">${kind.name}<span>${kind.hanja}</span></span></dt><dd>${kind.body}</dd></div>`;
    }).join('');
    return `<h2 id="sheet-title">${saeki.title}</h2>
      <p class="lead">${saeki.lead}</p><dl class="kinds">${kinds}</dl>`;
  }

  function renderCharacter(id) {
    const person = site.characters[id];
    const tabs = Object.entries(site.characters).map(([key, other]) => `
      <button type="button" data-open="${key}" aria-pressed="${key === id}">${other.name}</button>`).join('');
    const gallery = person.gallery.length > 1 ? `
      <div class="gallery" role="group" aria-label="${person.name} 그림 고르기">
        ${person.gallery.map((item, i) => `
          <button type="button" data-art="${i}" aria-pressed="${i === 0}" aria-label="${item.alt}">
            <img src="${item.poster || item.src}" alt="" loading="lazy">
          </button>`).join('')}
      </div>` : '';
    const cta = id === 'soback' && site.bloomUrl ? `
      <a class="button button--primary cta" href="${site.bloomUrl}" target="_blank" rel="noopener">소백과 대화하기</a>` : '';

    return `<div class="tabs" role="group" aria-label="인물 고르기">${tabs}</div>
      <h2 id="sheet-title">${person.name}</h2>
      <p class="role">${person.role}</p>
      <p class="lead">${person.lead}</p>
      <blockquote>${person.quote}</blockquote>
      ${person.place ? `<section class="place">${person.place.image ? `<img class="place__bg" src="${person.place.image}" alt="" loading="lazy">` : ''}<h3><span lang="zh-Hant">${person.place.hanja}</span>${person.place.name}</h3>${paragraphs(person.place.body)}</section>` : ''}
      ${sections(person.sections)}${gallery}${cta}`;
  }

  function render(view) {
    const person = site.characters[view];
    sheet.dataset.current = view;
    if (person) {
      body.innerHTML = renderCharacter(view);
      buildArt(person);
      sheet.dataset.view = 'person';
      window.Scene.goTo(person.phase);
    } else {
      body.innerHTML = view === 'saeki' ? renderSaeki() : renderWorld();
      buildArt(null);
      sheet.dataset.view = 'text';
    }
    scroller.scrollTop = 0;
  }

  function open(view, trigger) {
    Music.close();
    /* 소개 창 안의 인물 탭은 다시 그려지므로, 새로 그린 같은 탭으로 포커스를 옮깁니다. */
    const fromTab = sheet.open && trigger && trigger.closest('.tabs');
    render(view);
    if (fromTab) body.querySelector(`.tabs [data-open="${view}"]`)?.focus();
    if (sheet.open) return;
    returnFocus = trigger || document.activeElement;
    closing = false;
    sheet.showModal();
    scroller.scrollTop = 0;
    document.documentElement.classList.add('has-sheet');
    closeButton.focus();
    requestAnimationFrame(() => sheet.classList.add('is-open'));
  }

  async function close() {
    if (!sheet.open || closing) return;
    closing = true;
    sheet.classList.remove('is-open');
    document.documentElement.classList.remove('has-sheet');
    await wait(350);
    sheet.close();
    art.innerHTML = '';
    closing = false;
    /* 해나 달을 눌러 열었는데 그사이 낮밤이 바뀌었으면, 지금 떠 있는 쪽으로 돌려보냅니다. */
    if (returnFocus && returnFocus.classList.contains('orb') && returnFocus.inert) {
      returnFocus = document.getElementById(window.Scene.phase === 'day' ? 'sun' : 'moon');
    }
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  }

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-open]');
    if (opener) open(opener.dataset.open, opener);

    const pick = event.target.closest('[data-art]');
    if (pick) setArt(Number(pick.dataset.art));

    const step = event.target.closest('[data-step]');
    if (step) setArt(artIndex + Number(step.dataset.step));

    /* 움직이는 그림은 버튼이나 그림을 눌러 멈추고 다시 틀 수 있습니다. */
    const motion = event.target.closest('.art-motion') ||
      (event.target.matches('.art-frame video') && event.target.nextElementSibling);
    if (motion) toggleMotion(motion);
  });

  function toggleMotion(button) {
    const video = button.parentElement.querySelector('video');
    if (!video) return;
    const play = video.paused;
    if (play) video.play().catch(() => {});
    else video.pause();
    button.dataset.motion = play ? 'playing' : 'paused';
    button.setAttribute('aria-label', play ? '움직임 멈추기' : '움직임 재생');
  }

  /* 키보드 좌우 화살표와 휴대폰 밀기로도 넘깁니다. */
  const canFlip = () => sheet.open && document.getElementById('art-count');
  sheet.addEventListener('keydown', (event) => {
    if (!canFlip()) return;
    if (event.key === 'ArrowLeft') setArt(artIndex - 1);
    if (event.key === 'ArrowRight') setArt(artIndex + 1);
  });
  /* 누를 때마다 시작점을 새로 잡아, 그림 밖에서 손을 뗀 이전 밀기가 다음 누름에 섞이지 않게 합니다. */
  let swipeX = null;
  art.addEventListener('pointerdown', (event) => {
    swipeX = event.target.closest('.art-frame') ? event.clientX : null;
  });
  art.addEventListener('pointerup', (event) => {
    if (swipeX === null || !canFlip()) return;
    const distance = event.clientX - swipeX;
    swipeX = null;
    if (Math.abs(distance) > 40) setArt(artIndex + (distance < 0 ? 1 : -1));
  });
  art.addEventListener('pointercancel', () => { swipeX = null; });

  closeButton.addEventListener('click', close);
  sheet.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  /* 그림이나 글이 아닌 빈 곳을 누르면 닫힙니다.
     누른 곳과 뗀 곳이 모두 빈 곳일 때만 닫아, 그림을 밀다가 글 쪽에서 손을 떼도 닫히지 않게 합니다. */
  let pressTarget = null;
  sheet.addEventListener('pointerdown', (event) => { pressTarget = event.target; });
  sheet.addEventListener('click', (event) => {
    const blank = event.target === sheet || event.target === art;
    if (blank && pressTarget === event.target) close();
  });

  /* ── 입장 화면 ─────────────────────────── */
  const gate = document.getElementById('gate');
  const enterButton = document.getElementById('enter');
  /* 문구는 세로줄마다 한 칸씩 나눠 담습니다. */
  document.getElementById('gate-line').replaceChildren(...[].concat(site.gate.line).map((text) => {
    const column = document.createElement('span');
    column.textContent = text;
    return column;
  }));
  enterButton.textContent = site.gate.enter;
  let entered = false;

  /* 키보드로 들어온 경우에만 토글로 포커스를 옮깁니다(터치·클릭 때 테두리가 생기지 않게). */
  async function enter(fromKeyboard = false) {
    if (entered) return;
    entered = true;
    Music.play(0);
    gate.classList.add('is-leaving');
    scene.inert = false;
    if (fromKeyboard) document.getElementById('toggle').focus({ preventScroll: true });
    await wait(1100);
    gate.remove();
    window.Scene.syncThemeColor();
  }

  /* 입장 화면 어디를 눌러도, 키보드 Enter나 스페이스로도 들어갑니다.
     처음부터 버튼에 포커스를 주면 금빛 테두리가 생겨 버튼처럼 보이므로 주지 않습니다. */
  gate.addEventListener('click', (event) => enter(event.detail === 0));
  document.addEventListener('keydown', (event) => {
    if (!entered && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      enter(true);
    }
  });
})();
