/**
 * app.js — Gateway de anúncio (GitHub Pages).
 *
 * A extensão abre esta página como  https://<usuario>.github.io/webtoon-ad-gateway/?nonce=<uuid>
 * O nonce é o token de liberação de uso único criado pelo background da extensão.
 *
 * Fluxo:
 *   1. Conta 15 s SÓ com a aba visível (aba escondida = anúncio pausado).
 *   2. No fim, emite  window.postMessage({ type: 'AD_FINISHED', token: 'AUTH_DOWNLOAD_PROCEED', nonce }, origin)
 *      → o ad_listener.js da extensão (content script desta URL) repassa ao background.
 *   3. O ad_listener responde com { type: 'AD_ACK', ok, message } e a página mostra o resultado.
 *      Quem fecha a aba é o background (window.close() não funciona em aba aberta pela extensão).
 *
 * Futuro: trocar o placeholder pelo player da rede de anúncios e chamar finishAd()
 * no evento "ad completed" do SDK em vez do timer.
 */
const AD_SECONDS = 15;
const ACK_TIMEOUT_MS = 6000;

const timerElement = document.getElementById('timer');
const statusText = document.getElementById('status-text');
const player = document.getElementById('player');

const nonce = new URLSearchParams(location.search).get('nonce') || '';
const NONCE_OK = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nonce);

let watchedMs = 0;
let lastTick = performance.now();
let finished = false;
let countdown = null;

function setStatus(text, kind = '') {
    statusText.textContent = text;
    statusText.className = 'status' + (kind ? ' ' + kind : '');
}

function isVisible() {
    return document.visibilityState === 'visible';
}

function render() {
    const left = Math.max(0, Math.ceil((AD_SECONDS * 1000 - watchedMs) / 1000));
    if (!finished) timerElement.textContent = String(left);
    player.classList.toggle('is-paused', !isVisible() && !finished);
}

function tick() {
    const now = performance.now();
    if (isVisible()) watchedMs += now - lastTick;
    lastTick = now;
    render();
    if (watchedMs >= AD_SECONDS * 1000) finishAd();
}

function finishAd() {
    if (finished) return;
    finished = true;
    clearInterval(countdown);
    timerElement.textContent = 'OK';
    timerElement.classList.add('done');
    setStatus('Anúncio concluído. Retornando para a extensão...');

    // targetOrigin = a própria página (nunca '*'): só scripts desta origem recebem.
    window.postMessage({ type: 'AD_FINISHED', token: 'AUTH_DOWNLOAD_PROCEED', nonce }, location.origin);

    // Sem resposta do ad_listener → extensão não instalada ou URL fora do manifest.
    setTimeout(() => {
        if (!acked) setStatus('A extensão não respondeu. Confira se ela está instalada e ativa e tente de novo.', 'bad');
    }, ACK_TIMEOUT_MS);
}

let acked = false;
window.addEventListener('message', (event) => {
    if (event.source !== window || event.origin !== location.origin) return;
    const data = event.data;
    if (!data || data.type !== 'AD_ACK' || data.nonce !== nonce) return;
    acked = true;
    if (data.ok) setStatus('✔ Download liberado! Acompanhe pelo ícone da extensão. Esta aba fecha sozinha.', 'ok');
    else setStatus(data.message || 'Não foi possível liberar o download.', 'bad');
});

document.addEventListener('visibilitychange', () => {
    lastTick = performance.now(); // não conta o tempo com a aba escondida
    render();
});

if (!NONCE_OK) {
    timerElement.textContent = '—';
    setStatus('Abra esta página pelo botão "Baixar" da extensão.', 'bad');
} else {
    render();
    countdown = setInterval(tick, 250);
}
