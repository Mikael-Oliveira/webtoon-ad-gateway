# webtoon-ad-gateway

Página de anúncio do Neon Webtoon Downloader, hospedada no GitHub Pages.

- A extensão abre `https://<usuario>.github.io/webtoon-ad-gateway/?nonce=<uuid>`.
- Depois de 15 s com a aba visível, a página emite `window.postMessage({ type: 'AD_FINISHED', token: 'AUTH_DOWNLOAD_PROCEED', nonce }, location.origin)`.
- O content script `ad_listener.js` da extensão repassa ao background e responde com `{ type: 'AD_ACK', ok, message }`.

**Publicar:** Settings → Pages → Branch `main` / `(root)` → Save.
**Rede de anúncios:** colocar o player dentro de `#ad-slot` (`index.html`) e chamar `finishAd()` no evento de anúncio concluído (`app.js`).
