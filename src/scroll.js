/**
 * @file scroll.js
 * @description Módulo de gerenciamento de scroll (Auto-Scroll e Manual).
 */

window.ChatExporter = window.ChatExporter || {};

window.ChatExporter.Scroll = {
  isAutoScrolling: false,
  manualScrollHandlers: [],
  learnedScrollContainer: null,
  shouldStop: false,

  /**
   * Inicia o processo de Auto-Scroll suave para carregar histórico.
   */
  start: async function() {
    if (this.isAutoScrolling) return;
    this.isAutoScrolling = true;
    this.shouldStop = false;

    console.log('ChatExporter: Iniciando Auto-Scroll...');
    
    // Tenta encontrar o container de scroll correto
    const scroller = this.findScrollContainer();
    if (!scroller) {
      console.warn('ChatExporter: Container de scroll não encontrado. Ativando modo manual.');
      this.activateManualMode();
      return;
    }

    // --- INSTANT MODE (Para Links Compartilhados) ---
    const isSharedLink = window.location.href.includes('/share/');
    if (isSharedLink) {
        console.log('ChatExporter: Link compartilhado detectado. Tentando captura instantânea...');
        // Dá um pulo rápido para o meio e fim apenas para garantir renderização de lazy-assets
        scroller.scrollTop = scroller.scrollHeight / 2;
        await window.ChatExporter.Utils.wait(500);
        window.ChatExporter.Capture.captureVisible(); // Ponto de captura intermediário
        
        scroller.scrollTop = scroller.scrollHeight;
        await window.ChatExporter.Utils.wait(500);
        window.ChatExporter.Capture.captureVisible(); // Ponto de captura final
        
        console.log('ChatExporter: Captura instantânea concluída.');
        this.isAutoScrolling = false;
        return;
    }

    // Scroll para o topo primeiro (para garantir histórico completo em chats normais)
    scroller.scrollTop = 0;
    await window.ChatExporter.Utils.wait(1000);

    let lastScrollTop = -1;
    let samePositionCount = 0;
    const maxRetries = 10; // 5 segundos parado = fim

    while (this.isAutoScrolling && !this.shouldStop) {
        // Tenta rolar para baixo - Aumentado para 1200px (Turbo)
        scroller.scrollTop += 1200; 
        await window.ChatExporter.Utils.wait(200); 

        const currentScrollTop = scroller.scrollTop;
        const maxScroll = scroller.scrollHeight - scroller.clientHeight;

        // Verifica se chegou ao fim (ou parou de mover)
        if (Math.abs(currentScrollTop - lastScrollTop) < 5) {
            samePositionCount++;
            if (samePositionCount >= maxRetries) {
                console.log('ChatExporter: Auto-Scroll finalizado (fim da página detectado).');
                break;
            }
        } else {
            samePositionCount = 0; // Reset se moveu
        }

        lastScrollTop = currentScrollTop;
    }

    this.isAutoScrolling = false;
  },

  /**
   * Para o auto-scroll imediatamente.
   */
  stop: function() {
    this.isAutoScrolling = false;
    this.shouldStop = true;
    this.cleanupManualMode();
  },

  /**
   * Tenta identificar o container que possui scroll na página.
   * Usa heurística de scrollHeight > clientHeight.
   */
  findScrollContainer: function() {
    if (this.learnedScrollContainer && document.body.contains(this.learnedScrollContainer)) {
        return this.learnedScrollContainer;
    }

    // Heurística Específica para Gemini (2026)
    // O scroll geralmente está no infinite-scroller ou na main
    const geminiScroller = document.querySelector('infinite-scroller, .infinite-scroller, main');
    if (geminiScroller && geminiScroller.scrollHeight > geminiScroller.clientHeight) {
        console.log('ChatExporter: Container de scroll detectado (Gemini Spec):', geminiScroller);
        this.learnedScrollContainer = geminiScroller;
        return geminiScroller;
    }

    const candidates = Array.from(document.querySelectorAll('div, main, section, article'));
    // Ordena por scrollHeight (o maior geralmente é o chat)
    candidates.sort((a, b) => b.scrollHeight - a.scrollHeight);

    for (const el of candidates) {
        const style = window.getComputedStyle(el);
        const hasOverflow = style.overflowY === 'auto' || style.overflowY === 'scroll';
        const isScrollable = el.scrollHeight > el.clientHeight + 100; // Margem de erro

        if (hasOverflow && isScrollable) {
            console.log('ChatExporter: Container de scroll detectado:', el);
            this.learnedScrollContainer = el;
            return el;
        }
    }

    // Fallback: document.documentElement (scroll da janela)
    if (document.documentElement.scrollHeight > window.innerHeight) {
        return document.documentElement;
    }

    return null;
  },

  activateManualMode: function() {
    // Implementação básica de aviso visual para o usúario rolar manualmente
    const toast = document.createElement('div');
    toast.textContent = "⚠️ Role a página manualmente para capturar o histórico!";
    toast.style.cssText = "position: fixed; top: 20px; right: 20px; background: #ff9800; color: white; padding: 15px; z-index: 9999; border-radius: 5px; font-weight: bold;";
    toast.id = "chatexporter-toast";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  },

  cleanupManualMode: function() {
    const toast = document.getElementById('chatexporter-toast');
    if (toast) toast.remove();
  }
};

console.log('ChatExporter: Módulo Scroll carregado');
