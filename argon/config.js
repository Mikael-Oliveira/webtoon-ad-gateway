/**
 * config.js — Configuração central do Argon YouTube Downloader.
 * Roda no service worker (importScripts) e nas páginas da extensão. Só define self.ARGON_CONFIG.
 */
self.ARGON_CONFIG = {
  version: '1.0.0',

  /** Plano grátis: N downloads por dia (zera à meia-noite do computador da pessoa). Vitalício = ilimitado. */
  free: {
    perDay: 3
  },

  ad: {
    /**
     * Anúncio "1 anúncio = +3 downloads": DESLIGADO (AdSense não aceita recompensa por anúncio neste modelo).
     * Todo o código continua aqui; para religar, enabled: true.
     */
    enabled: false,
    /** Gateway já publicado (o mesmo endereço precisa estar nos matches do ad_listener.js no manifest). */
    gatewayUrl: 'https://mikael-oliveira.github.io/webtoon-ad-gateway/',
    appId: 'argon-yt',
    closeGatewayAfterMs: 2500,
    durationSeconds: 15,
    toleranceMs: 1500,
    pendingTtlMs: 30 * 60 * 1000
  },

  download: {
    rootFolder: 'Argon',            // Downloads/Argon/Videos/ e Downloads/Argon/Audios/
    startTimeoutMs: 10000,          // espera o servidor aceitar o download antes de tentar outro cliente
    maxClientAttempts: 3
  },

  /**
   * Servidor de licenças (Cloudflare Worker em servidor/). Ex.: 'https://argon-licencas.SEU-USUARIO.workers.dev'
   * Preenchido: "Comprar" abre <apiUrl>/comprar (Mercado Pago) e "Ativar" confere a chave no servidor.
   * Vazio: modo local (só checksum) e "Comprar" abre checkoutUrl ou vendas.html.
   */
  apiUrl: '',
  recheckDays: 7,                   // reconfere a chave no servidor (estorno revoga)
  checkoutUrl: 'https://pay.kiwify.com.br/7RffvPJ' // link de checkout da Kiwify (R$ 15). Preenchido: "Comprar" abre ele (vence o /comprar do Mercado Pago)
};
