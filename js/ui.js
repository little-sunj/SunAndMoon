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

  const paragraphs = (list = []) => [].concat(list).map((text) => `<p>${text}</p>`).join('');
  const heading = (text) => (text ? `<h3>${text}</h3>` : '');
  const lines = (list = []) => [].concat(list).join('<br>');

  /* content.js의 블록(type)마다 그리는 방법 */
  const BLOCKS = {
    text: (b) => `<section>${heading(b.heading)}${paragraphs(b.body)}</section>`,

    verse: (b) => `<div class="verse">${b.stanzas.map((stanza) => {
      const s = Array.isArray(stanza) || typeof stanza === 'string' ? { lines: [].concat(stanza) } : stanza;
      const tone = s.tone ? ` verse__stanza--${s.tone}` : '';
      const inner = s.tone === 'fade'
        ? s.lines.map((line) => `<span>${line}</span>`).join('')
        : lines(s.lines);
      return `<p class="verse__stanza${tone}">${inner}</p>`;
    }).join('')}</div>`,

    callout: (b) => `<p class="callout">${lines(b.lines)}</p>`,

    facts: (b) => `<section>${heading(b.heading)}<dl class="facts">${b.items.map(([k, v]) => `
      <div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></section>`,

    looks: (b) => `<section>${heading(b.heading)}<div class="looks">${b.items.map((look) => `
      <div class="look${look.accent ? ' look--accent' : ''}">
        <p class="look__swatches" aria-hidden="true">${(look.swatches || []).map((c) => `<i style="background:${c}"></i>`).join('')}</p>
        <p class="look__title">${look.title}</p>
        <p class="look__body">${look.body}</p>
      </div>`).join('')}</div>${b.note ? `<p class="note">${b.note}</p>` : ''}</section>`,

    quotes: (b) => `<section>${heading(b.heading)}<ul class="quotes">${b.items.map((q) => {
      const item = typeof q === 'string' ? { text: q } : q;
      return `<li>${item.note ? `<span class="quotes__note">${item.note}</span>` : ''}<span class="quotes__text">“${item.text}”</span></li>`;
    }).join('')}</ul></section>`,

    hours: (b) => `<section>${heading(b.heading)}<ol class="hours">${b.items.map((h) => `
      <li${h.on ? ' class="is-on"' : ''}><span lang="zh-Hant">${h.hanja}</span>${h.name}</li>`).join('')}</ol>${b.body ? `<p>${b.body}</p>` : ''}</section>`,

    grid: (b) => `<section>${heading(b.heading)}${b.body ? `<p>${b.body}</p>` : ''}<div class="duties">${b.items.map((d) => `
      <div><p class="duties__name">${d.name}</p><p>${d.body}</p></div>`).join('')}</div></section>`,

    moons: (b) => `<ol class="moons">${b.items.map((m) => `
      <li class="${m.on ? 'is-on' : ''}"><i class="moon-phase moon-phase--${m.phase}" aria-hidden="true"></i>${m.name}</li>`).join('')}</ol>`,

    chips: (b) => `<section>${heading(b.heading)}<ul class="chips">${b.items.map((c) => `<li>${c}</li>`).join('')}</ul></section>`,

    kinds: (b) => `<dl class="kinds">${b.items.map((kind, i) => {
      const art = kind.image ? `<img class="kind__art" src="${kind.image}" alt="" loading="lazy">` : '';
      const side = kind.image ? ` kind--art${i % 2 ? ' kind--right' : ''}` : '';
      return `
      <div class="kind${side}"><dt>${art}<span class="kind__name">${kind.name}<span>${kind.hanja}</span></span></dt><dd>${kind.body}</dd></div>`;
    }).join('')}</dl>`,

    roster: (b) => `<div class="roster">${b.groups.map((g) => `
      <section class="roster__group">
        <h3>${g.hanja ? `<span lang="zh-Hant">${g.hanja}</span>` : ''}${g.name}</h3>
        <dl>${g.items.map((it) => `<div><dt>${it.name}</dt><dd>${it.body}</dd></div>`).join('')}</dl>
      </section>`).join('')}</div>`,

    cards: (b) => `<section>${heading(b.heading)}<div class="cards">${b.items.map((c) => `
      <article class="card">
        <p class="card__name">${c.name}${c.hanja ? `<span lang="zh-Hant">${c.hanja}</span>` : ''}</p>
        ${c.tag ? `<p class="card__tag">${c.tag}</p>` : ''}
        ${paragraphs(c.body)}
        ${c.quotes ? `<ul class="card__quotes">${c.quotes.map((q) => `<li>“${q}”</li>`).join('')}</ul>` : ''}
      </article>`).join('')}</div></section>`,

    teaser: (b) => `<div class="teaser"><p class="teaser__mark" lang="zh-Hant" aria-hidden="true">${b.mark}</p>
      <p>${b.body}</p>${b.quote ? `<p class="teaser__quote">${b.quote}</p>` : ''}</div>`
  };
  const blocks = (list = []) => list.map((b) => (BLOCKS[b.type] || BLOCKS.text)(b)).join('');

  /* 메뉴 안 탭. key는 data-open 값이 됩니다. */
  const tabsHtml = (items, current, label) => `<div class="tabs" role="group" aria-label="${label}">${items.map(({ key, label: text }) => `
      <button type="button" data-open="${key}" aria-pressed="${key === current}">${text}</button>`).join('')}</div>`;
  const header = (page) => `${page.eyebrow ? `<p class="eyebrow" lang="zh-Hant" aria-hidden="true">${page.eyebrow}</p>` : ''}
      <h2 id="sheet-title">${page.title}</h2>${page.lead ? `<p class="lead">${page.lead}</p>` : ''}`;
  const credit = () => (site.credit ? `<p class="credit">${site.credit}</p>` : '');

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

  /* 세계관·삿된 것: 탭 하나를 그립니다. key는 'world/night' 꼴. */
  function renderMenu(menuId, key) {
    const menu = site[menuId];
    const tab = menu.tabs.find((t) => `${menuId}/${t.id}` === key) || menu.tabs[0];
    const items = menu.tabs.map((t) => ({ key: `${menuId}/${t.id}`, label: t.label }));
    return `${tabsHtml(items, `${menuId}/${tab.id}`, `${menu.title} 고르기`)}
      <div class="page page--${menuId}-${tab.id}">${header(tab)}${blocks(tab.blocks)}</div>${credit()}`;
  }

  /* 인물 메뉴의 탭: 소백 · 염희 · 주변 인물 */
  const peopleTabs = (current) => tabsHtml([
    ...Object.entries(site.characters).map(([key, p]) => ({ key, label: p.name })),
    ...(site.people ? [{ key: 'people', label: site.people.label }] : [])
  ], current, '인물 고르기');

  function renderPeople() {
    return `${peopleTabs('people')}<div class="page page--people">${header(site.people)}${blocks(site.people.blocks)}</div>${credit()}`;
  }

  function renderCharacter(id) {
    const person = site.characters[id];
    const gallery = person.gallery.length > 1 ? `
      <div class="gallery" role="group" aria-label="${person.name} 그림 고르기">
        ${person.gallery.map((item, i) => `
          <button type="button" data-art="${i}" aria-pressed="${i === 0}" aria-label="${item.alt}">
            <img src="${item.poster || item.src}" alt="" loading="lazy">
          </button>`).join('')}
      </div>` : '';
    const cta = id === 'soback' && site.bloomUrl ? `
      <a class="button button--primary cta" href="${site.bloomUrl}" target="_blank" rel="noopener">소백과 대화하기</a>` : '';

    return `${peopleTabs(id)}
      <h2 id="sheet-title">${person.name}${person.hanja ? `<span class="hanja" lang="zh-Hant">${person.hanja}</span>` : ''}</h2>
      <p class="role">${person.role}</p>
      <p class="lead">${person.lead}</p>
      <blockquote>${person.quote}</blockquote>
      ${person.place ? `<section class="place">${person.place.image ? `<img class="place__bg" src="${person.place.image}" alt="" loading="lazy">` : ''}<h3><span lang="zh-Hant">${person.place.hanja}</span>${person.place.name}</h3>${paragraphs(person.place.body)}</section>` : ''}
      ${blocks(person.blocks)}${gallery}${cta}${credit()}`;
  }

  /* view: 'soback' · 'yeomhee' · 'people' · 'world' · 'world/night' · 'saeki/named' … */
  function render(view) {
    const [menuId] = view.split('/');
    const person = site.characters[view];
    sheet.dataset.current = view;
    if (person) {
      body.innerHTML = renderCharacter(view);
      buildArt(person);
      sheet.dataset.view = 'person';
      window.Scene.goTo(person.phase);
    } else {
      body.innerHTML = menuId === 'people' ? renderPeople() : renderMenu(site[menuId] ? menuId : 'world', view);
      buildArt(null);
      sheet.dataset.view = 'text';
    }
    scroller.scrollTop = 0;
  }

  function open(view, trigger) {
    Music.close();
    /* 소개 창 안의 탭은 다시 그려지므로, 새로 그린 같은 탭으로 포커스를 옮깁니다. */
    const fromTab = sheet.open && trigger && trigger.closest('.tabs');
    render(view);
    if (fromTab) body.querySelector('.tabs [aria-pressed="true"]')?.focus();
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
    showToggleHint();
    await wait(1100);
    gate.remove();
    window.Scene.syncThemeColor();
  }

  /* 낮/밤 버튼 안내: 들어온 뒤 금빛 물결이 퍼지고 아래 글귀가 깜박이다 6초 안에 사라집니다.
     버튼을 한 번이라도 눌러 본 방문자에게는 다시 보이지 않습니다. */
  const HINT_KEY = 'sunandmoon.toggleHintSeen';
  const toggleEl = document.getElementById('toggle');
  const hintEl = document.getElementById('toggle-hint');
  let hintTimer = 0;
  const hintSeen = () => { try { return localStorage.getItem(HINT_KEY) === '1'; } catch (e) { return false; } };
  function hideToggleHint() {
    clearTimeout(hintTimer);
    toggleEl.classList.remove('is-hinting');
    hintEl.classList.remove('is-on');
  }
  function showToggleHint() {
    if (hintSeen()) return;
    hintEl.textContent = site.toggleHint || '';
    hintTimer = setTimeout(() => {
      toggleEl.classList.add('is-hinting');
      if (site.toggleHint) hintEl.classList.add('is-on');
      hintTimer = setTimeout(hideToggleHint, 5600);
    }, reducedMotion.matches ? 300 : 1300);
  }
  toggleEl.addEventListener('click', () => {
    hideToggleHint();
    try { localStorage.setItem(HINT_KEY, '1'); } catch (e) { /* 저장할 수 없으면 다음에도 안내합니다 */ }
  });

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
