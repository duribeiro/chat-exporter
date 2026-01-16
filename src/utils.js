/**
 * @file utils.js
 * @description Módulo de utilitários e funções auxiliares.
 * Contém helpers puros para logging, hash, detecção de plataforma e formatação.
 */

window.ChatExporter = window.ChatExporter || {};

window.ChatExporter.Utils = {
  debugLogs: [],

  /**
   * Adiciona uma mensagem ao log de debug interno.
   * @param {string} type - Tipo de log (INFO, WARN, ERROR)
   * @param  {...any} args - Argumentos da mensagem
   */
  logDebug: function(type, ...args) {
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    this.debugLogs.push(`[${timestamp}] [${type}] ${msg}`);
  },

  /**
   * Detecta a plataforma atual baseada na URL.
   * @returns {'chatgpt' | 'gemini' | null} Nome da plataforma ou null
   */
  getPlatform: function() {
    if (window.location.hostname.includes('chatgpt')) return 'chatgpt';
    if (window.location.hostname.includes('gemini')) return 'gemini';
    return null;
  },

  /**
   * Gera um hash único (cyrb53) para uma string.
   * Usado para detecção de duplicatas.
   * @param {string} str - String para gerar hash
   * @param {number} seed - Semente opcional
   * @returns {string} Hash em base36
   */
  generateHash: function(str, seed = 0) {
    if (!str) return 'empty';
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    
    // Combina para string única
    let hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
    
    // Garante que é positivo para conversão base36 limpa
    if (hash < 0) {
        // Fallback simples se estourou int32
        hash = ((hash << 5) - hash) + 1;
        hash = hash & hash;
    }
    return hash.toString(36);
  },

  /**
   * Remove acentos e caracteres especiais para nome de arquivo.
   * @param {string} str - String original
   * @returns {string} String limpa
   */
  sanitizeFilename: function(str) {
    if (!str) return 'conversa';
    return str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  },

  /**
   * Pausa a execução por determinado tempo (async sleep).
   * @param {number} ms - Milissegundos para esperar
   * @returns {Promise<void>}
   */
  wait: function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Calcula a posição absoluta de um elemento na página.
   * @param {HTMLElement} element 
   * @returns {number} Posição Y absoluta
   */
  getScrollPosition: function(element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return scrollTop + rect.top;
  },

  /**
   * Converte uma imagem URL ou Blob para Base64 (Data URI).
   * @param {string} url - URL da imagem
   * @returns {Promise<string>} Data URI ou URL original se falhar
   */
  imageToBase64: async function(url) {
    if (!url || url.startsWith('data:')) return url;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(url);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      this.logDebug('WARN', `Falha ao converter imagem para base64: ${url}`, e);
      return url;
    }
  }
};

// Override do console nativo para capturar logs
(function() {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.log = function(...args) {
    window.ChatExporter.Utils.logDebug('INFO', ...args);
    originalLog.apply(console, args);
  };
  
  console.warn = function(...args) {
    window.ChatExporter.Utils.logDebug('WARN', ...args);
    originalWarn.apply(console, args);
  };
  
  console.error = function(...args) {
    window.ChatExporter.Utils.logDebug('ERROR', ...args);
    originalError.apply(console, args);
  };
})();

console.log('ChatExporter: Módulo Utils carregado');
