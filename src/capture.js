/**
 * @file capture.js
 * @description Módulo Core de captura. Responsável por ler o DOM e extrair mensagens.
 * Contém a lógica de hash anti-duplicata e identificação de autor.
 */

window.ChatExporter = window.ChatExporter || {};

window.ChatExporter.Capture = {
  capturedMessages: new Map(),
  metadata: {
    title: '',
    userName: '',
    aiName: ''
  },

  /**
   * Reseta o estado da captura.
   */
  reset: function() {
    this.capturedMessages.clear();
    this.metadata = { title: '', userName: '', aiName: '' };
  },

  /**
   * Extrai metadados da conversa (título, nomes) do DOM.
   */
  extractMetadata: function() {
    const platform = window.ChatExporter.Utils.getPlatform();
    
    if (platform === 'gemini') {
      const titleEl = document.querySelector('#app-root > main > top-bar-actions > div > div.center-section > div > conversation-actions > button > span');
      this.metadata.title = titleEl?.innerText?.trim() || 'Conversa Gemini';
      this.metadata.userName = 'Você';
      // Tenta achar nome do bot ou usa padrão
      const aiEl = document.querySelector('.bot-name-text');
      this.metadata.aiName = aiEl?.innerText?.trim() || 'Gemini';
    } else if (platform === 'chatgpt') {
      this.metadata.title = document.title.replace(' - ChatGPT', '').trim() || 'Conversa ChatGPT';
      this.metadata.userName = 'Você';
      
      // Tenta achar nome do bot (Ex: "RAYA disse:")
      const aiNameEl = document.querySelector('h6.sr-only, [data-turn="assistant"] h6');
      if (aiNameEl) {
          const rawName = aiNameEl.innerText.replace(' disse:', '').trim();
          this.metadata.aiName = rawName || 'ChatGPT';
      } else {
          this.metadata.aiName = 'ChatGPT';
      }
    }

    console.log('ChatExporter: Metadados extraídos', this.metadata);
  },

  /**
   * Varre o DOM visível e captura novas mensagens.
   * Implementa o sistema "Phoenix" de aprendizado de seletores.
   */
  captureVisible: async function() {
    const platform = window.ChatExporter.Utils.getPlatform();
    let config = window.ChatExporter.Config[platform];
    const Utils = window.ChatExporter.Utils;

    if (!config) return;

    // --- PHOENIX LEARNING ENGINE ---
    // Se o seletor padrão falhar, tenta descobrir a estrutura do site (Zero-Config)
    let elements = document.querySelectorAll(config.messageSelector);
    
    if (elements.length === 0) {
        Utils.logDebug('INFO', 'Seletor padrão falhou. Iniciando Aprendizado Phoenix...');
        // Heurística 1: Atributos de role de mensagem (Padrão OpenAI/Anthropic)
        const commonSelectors = [
            '[data-testid*="turn"]',
            '[data-message-author-role]',
            '.message-row',
            'article[role="article"]',
            '.chat-message',
            '.message-content',
            'article[role="article"]'
        ];
        
        for (const sel of commonSelectors) {
            const found = document.querySelectorAll(sel);
            if (found.length > 5) { // Padrão repetitivo detectado
                Utils.logDebug('INFO', `Phoenix aprendeu novo seletor: ${sel}`);
                config.messageSelector = sel; // Atualiza em runtime
                elements = found;
                break;
            }
        }
    }

    for (const el of elements) {
      try {
        // --- 1. SELEÇÃO DE CONTEÚDO (Cleanup UI) ---
        // Busca o div de conteúdo real para ignorar botões de editar/copiar
        let contentEl = el;
        if (config.contentSelector) {
            const found = el.querySelector(config.contentSelector);
            if (found) contentEl = found;
        }

        // --- 2. SANITIZAÇÃO (Remove SVG/Buttons) ---
        // Cria um clone para não afetar a página real
        const cleanNode = contentEl.cloneNode(true);
        const junk = cleanNode.querySelectorAll('button, svg, .button-group, .footer, .edit-button, [role="button"]');
        junk.forEach(node => node.remove());

        // --- 3. NORMALIZAÇÃO E HASH (Anti-Duplicatas) ---
        const textRaw = cleanNode.innerText || cleanNode.textContent || '';
        if (!textRaw) continue;

        const textNormalized = textRaw.replace(/\s+/g, ' ').trim();
        if (!textNormalized) continue;

        const uniqueId = Utils.generateHash(textNormalized);
        
        // --- 4. FILTRO DE DUPLICATAS ---
        if (this.capturedMessages.has(uniqueId)) continue;

        // --- 5. DETECÇÃO DE AUTOR ---
        let author = 'Unknown';
        const elClass = el.className || '';
        const elTag = el.tagName.toLowerCase();

        // Tenta detectar por atributos explícitos (ChatGPT/Gemini novos)
        const roleAttr = el.getAttribute('data-message-author-role') || 
                        el.querySelector('[data-message-author-role]')?.getAttribute('data-message-author-role') ||
                        el.getAttribute('data-turn'); // ChatGPT shared links

        if (roleAttr) {
            author = (roleAttr === 'user' || roleAttr === 'Você') ? 'User' : 'Assistant';
        } else if (elClass.includes('user-query') || elTag === 'user-query' || el.closest('.user-query-container')) {
            author = 'User';
        } else if (elClass.includes('model-response') || elClass.includes('response-container') || el.closest('.response-container')) {
            author = 'Assistant';
        } else {
            // Heurística visual de fallback
            const style = window.getComputedStyle(el);
            if (style.justifyContent === 'flex-end' || style.textAlign === 'right') author = 'User';
            else author = 'Assistant';
        }

        // 4. Captura de Anexos (URLs Originais)
        const attachments = [];
        const images = el.querySelectorAll(config.attachmentSelector);
        for (const img of images) {
            let src = img.src || img.getAttribute('data-src') || img.getAttribute('src') || '';
            if (src && !attachments.includes(src)) {
                // APENAS ARMAZENA A URL. Não converte mais para Base64 por padrão.
                attachments.push(src);
                Utils.logDebug('INFO', '📎 Link de anexo capturado');
            }
        }

        // 5. Captura Metadados de Ordenação (Chronos System)
        let turnIndex = -1;
        const turnContainer = el.closest('.conversation-container, share-turn-viewer, [data-testid^="conversation-turn-"]');
        if (turnContainer) {
            const allTurns = Array.from(document.querySelectorAll('.conversation-container, share-turn-viewer, [data-testid^="conversation-turn-"]'));
            turnIndex = allTurns.indexOf(turnContainer);
        }

        // --- 6. ARMAZENA ---
        this.capturedMessages.set(uniqueId, {
            html: cleanNode.innerHTML, 
            text: textNormalized,
            author: author,
            attachments: attachments,
            timestamp: Date.now(),
            turnIndex: turnIndex,
            domPosition: Utils.getScrollPosition(el)
        });

      } catch (err) {
        console.error('ChatExporter: Erro ao capturar elemento:', err);
      }
    }
    
    // Atualiza contagem no popup
    chrome.runtime.sendMessage({
        action: 'updateCount',
        count: this.capturedMessages.size
    }).catch(() => {});
  },

  /**
   * Gera o conteúdo Markdown final.
   * @param {object} version - Objeto de versão
   * @param {object} options - Opções de exportação
   * @returns {string} Markdown completo
   */
  generateMarkdown: function(version, options = {}) {
    const allMessages = Array.from(this.capturedMessages.values());
    
    // Ordenação Robusta (Chronos System)
    allMessages.sort((a, b) => {
        if (a.turnIndex !== -1 && b.turnIndex !== -1) {
            if (a.turnIndex !== b.turnIndex) return a.turnIndex - b.turnIndex;
            return a.domPosition - b.domPosition;
        }
        if (Math.abs(a.domPosition - b.domPosition) > 15) {
            return a.domPosition - b.domPosition;
        }
        return a.timestamp - b.timestamp;
    });

    const { title, userName, aiName } = this.metadata;
    const dateStr = new Date().toLocaleString('pt-BR');

    let md = `# ${title}\n\n`;
    md += `**Plataforma:** ${window.ChatExporter.Utils.getPlatform().toUpperCase()}\n`;
    md += `**Data:** ${dateStr}\n`;
    md += `**Total de Mensagens:** ${allMessages.length}\n`;
    md += `**Usuário:** ${userName} | **Assistente:** ${aiName}\n\n`;
    md += `---\n*Exportado com ChatExporter v${version.number} "${version.name}"*\n---\n\n`;

    allMessages.forEach((msg, index) => {
        const roleName = msg.author === 'User' ? userName : aiName;
        md += `## ${roleName} (${index + 1})\n\n`;
        
        const contentMd = window.ChatExporter.Markdown.service.turndown(msg.html);
        md += contentMd + '\n\n';

        if (msg.attachments && msg.attachments.length > 0) {
            md += `### 📎 Anexos\n`;
            msg.attachments.forEach((src, imgIndex) => {
                // Se for ZIP, usamos o caminho relativo assets/. Caso contrário, link original.
                const imgPath = options.useLocalAssets ? `assets/img_${index+1}_${imgIndex+1}.png` : src;
                md += `![Anexo](${imgPath})\n\n`;
            });
        }

        md += '---\n\n';
    });

    return md;
  }
};

console.log('ChatExporter: Módulo Capture carregado');
