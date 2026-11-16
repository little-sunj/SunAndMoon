/*
 * 배포된 사이트에서만 마우스 오른쪽 버튼과 개발자 도구 단축키를 막습니다.
 * 내 컴퓨터에서 열 때(index.html 더블클릭, localhost)는 막지 않아 작업에 지장이 없습니다.
 *
 * 이건 가벼운 잠금장치일 뿐, 완전한 보호는 아닙니다.
 * 브라우저 메뉴로 개발자 도구를 열거나 자바스크립트를 끄면 얼마든지 볼 수 있어요.
 * 그만 쓰려면 index.html에서 이 파일을 불러오는 줄을 지우면 됩니다.
 */
(() => {
  const host = location.hostname;
  const isLocal = location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '' || host.endsWith('.local');
  if (isLocal) return;

  /* 오른쪽 버튼 메뉴 */
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  /* 그림을 끌어서 저장하기 */
  document.addEventListener('dragstart', (e) => {
    if (e.target instanceof HTMLImageElement || e.target instanceof HTMLVideoElement) e.preventDefault();
  });

  /* F12, 개발자 도구(Ctrl+Shift+I/J/C, Mac ⌘⌥I/J/C), 소스 보기(Ctrl+U, ⌘⌥U) */
  document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    const devtools = mod && (e.shiftKey || e.altKey) && ['i', 'j', 'c'].includes(k);
    const viewSource = mod && k === 'u';
    if (e.key === 'F12' || devtools || viewSource) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
})();
