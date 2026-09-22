
(() => {
  "use strict";

  const ITEM_SELECTOR = 'article, .soundList__item, .searchList__item, .compactTrackListItem, [data-testid*="track"]';
  const MENU_BUTTON_SELECTORS = [
    'button[aria-label="More"]',
    'button[aria-label="More actions"]',
    'button[title="More"]',
    'button[title="More actions"]',
    '[data-testid="moreActions"] button',
    '.sc-button-more'
  ];

  const text = s => (s || "").replace(/\s+/g, " ").trim().toLowerCase();

  function findTrackContainer(el) {
    let node = el;
    for (let i = 0; node && i < 8; i++, node = node.parentElement) {
      if (
        node.matches &&
        (
          node.matches('article') ||
          node.classList.contains('soundList__item') ||
          node.classList.contains('searchList__item') ||
          node.classList.contains('compactTrackListItem') ||
          node.querySelector?.('a[href*="/sets/"], a[href*="/tracks/"]')
        )
      ) return node;
    }
    return el.closest?.('article, li') || el.parentElement;
  }

  function findMoreButton(track) {
    for (const sel of MENU_BUTTON_SELECTORS) {
      const btn = track.querySelector(sel);
      if (btn) return btn;
    }

    const buttons = [...track.querySelectorAll('button, [role="button"]')];
    return buttons.find(b => {
      const label = text(
        b.getAttribute("aria-label") ||
        b.getAttribute("title") ||
        b.textContent
      );
      return label === "more" || label.includes("more actions");
    });
  }

  function getMenu() {
    return [...document.querySelectorAll('[role="menu"], .moreActions, .sc-menu')].find(m => {
      const r = m.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
  }

  function findNativeAddToPlaylist(menu) {
    if (!menu) return null;
    const candidates = [
      ...menu.querySelectorAll('button, a, [role="menuitem"], [role="option"]')
    ];
    return candidates.find(el => {
      const label = text(
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        el.textContent
      );
      return label === "add to playlist" || label.includes("add to playlist");
    });
  }

  function addCustomAction(track) {
    if (!track || track.dataset.scPlaylistHelper === "1") return;
    const more = findMoreButton(track);
    if (!more) return;

    track.dataset.scPlaylistHelper = "1";

    const host = more.parentElement;
    if (!host || host.querySelector(".sc-playlist-helper")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sc-playlist-helper";
    btn.setAttribute("aria-label", "Add to Playlist");
    btn.title = "Add to Playlist";
    btn.textContent = "＋ Playlist";

    btn.addEventListener("click", async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      more.click();

      for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 50));
        const menu = getMenu();
        const nativeAction = findNativeAddToPlaylist(menu);
        if (nativeAction) {
          nativeAction.click();
          return;
        }
      }

      console.warn("[SC Playlist Helper] SoundCloud's native 'Add to Playlist' action was not found.");
    });

    host.appendChild(btn);
  }

  function scan() {
    const containers = new Set();
    document.querySelectorAll(MENU_BUTTON_SELECTORS.join(",")).forEach(more => {
      const track = findTrackContainer(more);
      if (track) containers.add(track);
    });
    document.querySelectorAll(ITEM_SELECTOR).forEach(el => containers.add(el));

    containers.forEach(addCustomAction);
  }

  const style = document.createElement("style");
  style.textContent = `
    .sc-playlist-helper {
      margin-left: 6px !important;
      padding: 0 8px !important;
      min-height: 28px !important;
      border: 0 !important;
      border-radius: 4px !important;
      background: transparent !important;
      color: inherit !important;
      font: inherit !important;
      cursor: pointer !important;
      opacity: .85 !important;
      white-space: nowrap !important;
    }
    .sc-playlist-helper:hover {
      opacity: 1 !important;
      background: rgba(255,255,255,.08) !important;
    }
  `;
  document.documentElement.appendChild(style);

  const observer = new MutationObserver(() => {
    clearTimeout(observer._timer);
    observer._timer = setTimeout(scan, 150);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  scan();
})();
