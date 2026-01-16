/**
 * @file markdown.js
 * @description Módulo responsável pela conversão de HTML para Markdown.
 * Configura o TurndownService e aplica regras personalizadas para Code Blocks, Tabelas, etc.
 */

window.ChatExporter = window.ChatExporter || {};

window.ChatExporter.Markdown = {
  service: null,

  /**
   * Inicializa o TurndownService com todas as regras customizadas.
   * Deve ser chamado antes de iniciar a captura.
   */
  init: function() {
    if (typeof TurndownService === 'undefined') {
      console.error('ChatExporter: Turndown falhou ao carregar! Verifique manifest.');
      return;
    }

    this.service = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '*',
      fence: '```',
      linkStyle: 'inlined',
      linkReferenceStyle: 'full'
    });

    this.addCodeBlockRule();
    this.addInlineCodeRule();
    this.addTableRule();
    this.addImageRule();
    this.addLinkRule();

    console.log('ChatExporter: Módulo Markdown inicializado');
  },

  /**
   * Regra robusta para blocos de código (suporta ChatGPT, Gemini, Claude).
   */
  addCodeBlockRule: function() {
    this.service.addRule('fencedCodeBlock', {
      filter: function(node) {
        return (
          (node.nodeName === 'PRE' && node.querySelector('code')) ||
          (node.classList && (
            node.classList.contains('code-block') ||
            node.classList.contains('code-block-wrapper') ||
            node.classList.contains('code-container')
          )) ||
          node.tagName === 'CODE-BLOCK'
        );
      },
      replacement: function(content, node) {
        let codeText = '';
        let lang = '';

        // Estratégia 1: Busca elemento <code> interno
        const codeEl = node.querySelector('code');
        if (codeEl) {
          codeText = codeEl.textContent || codeEl.innerText || '';
          const langMatch = codeEl.className.match(/language-(\w+)/);
          lang = langMatch ? langMatch[1] : '';
        }

        // Estratégia 2: Conteúdo direto do nó
        if (!codeText) codeText = node.textContent || node.innerText || '';
        
        // Estratégia 3: Fallback content do Turndown
        if (!codeText) codeText = content || '';

        // Detecção de linguagem
        if (!lang) {
          // Atributos data-*
          lang = node.getAttribute('data-language') || node.getAttribute('language') || '';
          
          // Labels visuais
          if (!lang) {
            const label = node.querySelector('.language-label, [class*="language"]');
            if (label) lang = label.textContent.trim();
          }

          // Inferência por conteúdo (Regex)
          if (!lang && codeText) {
            if (/^(sudo|npm|cd|git|docker|apt)/.test(codeText)) lang = 'bash';
            else if (/^(import|def|class|if __name__)/.test(codeText)) lang = 'python';
            else if (/^(const|let|function|export)/.test(codeText)) lang = 'javascript';
            else if (/^(services:|version:|image:)/.test(codeText)) lang = 'yaml';
          }
        }

        codeText = codeText.trim();
        lang = lang.toLowerCase().trim();

        return '\n```' + lang + '\n' + codeText + '\n```\n';
      }
    });
  },

  addInlineCodeRule: function() {
    this.service.addRule('inlineCode', {
      filter: function(node) {
        return node.nodeName === 'CODE' && node.parentNode.nodeName !== 'PRE';
      },
      replacement: function(content) {
        return '`' + content + '`';
      }
    });
  },

  addTableRule: function() {
    this.service.addRule('tables', {
      filter: 'table',
      replacement: function(content, node) {
        const rows = Array.from(node.querySelectorAll('tr'));
        if (rows.length === 0) return '';

        let markdown = '\n';
        rows.forEach((row, rowIndex) => {
          const cells = Array.from(row.querySelectorAll('th, td'));
          const cellContents = cells.map(cell => 
            cell.textContent.trim().replace(/\|/g, '\\|') // Escapa pipes
          );

          if (cellContents.length > 0) {
            markdown += '| ' + cellContents.join(' | ') + ' |\n';
            if (rowIndex === 0) {
              markdown += '| ' + cells.map(() => '---').join(' | ') + ' |\n';
            }
          }
        });
        return markdown + '\n';
      }
    });
  },

  addImageRule: function() {
    this.service.addRule('images', {
      filter: 'img',
      replacement: function(content, node) {
        const alt = node.alt || 'imagem';
        const src = node.src || '';
        return src ? `![${alt}](${src})` : `[Imagem: ${alt}]`;
      }
    });
  },

  addLinkRule: function() {
    this.service.addRule('links', {
      filter: function(node) {
        return node.nodeName === 'A' && node.getAttribute('href');
      },
      replacement: function(content, node) {
        const href = node.getAttribute('href');
        const title = node.title ? ` "${node.title}"` : '';
        return `[${content}](${href}${title})`;
      }
    });
  }
};

console.log('ChatExporter: Módulo Markdown carregado');
