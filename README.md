# SoundCloud Helper

This is a local Chrome extension for SoundCloud.

What it does:
- adds a quick `＋ Playlist` next to the `...` button;
- when clicked, it opens the standard SoundCloud menu;
- finds `Add to Playlist` in it;
- clicks the standard SoundCloud button, so playlist selection and authorization remain on the SoundCloud side.

Installation:1. Unzip the ZIP.
2. Open `chrome://extensions`.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select the `soundcloud-helper` folder.
6. Open/refresh SoundCloud.

Important:
The extension deliberately does not use private SoundCloud APIs and does not store cookies/passwords. It works via the website’s DOM interface. If SoundCloud changes the HTML classes or menu structure, the selectors in `content.js` may need to be updated.
