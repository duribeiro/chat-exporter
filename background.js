// Background script simplificado - delega processamento para content script

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'importFromLink') {
    handleImportFromLink(request.link, sendResponse);
    return true;
  }
});

async function handleImportFromLink(link, sendResponse) {
  let activeTabId = null;
  try {
    // Tenta pegar a aba ativa para mandar logs
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    activeTabId = tabs[0]?.id;

    logToActiveTab(activeTabId, `Iniciando importação de: ${link}`);
    
    // Abre o link em uma nova aba (invisível)
    const tab = await chrome.tabs.create({
      url: link,
      active: false
    });
    
    logToActiveTab(activeTabId, "Aguardando página carregar...");

    // Aguarda a página carregar
    await new Promise(resolve => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      });
    });
    
    // Aguarda um pouco mais para garantir que tudo carregou
    logToActiveTab(activeTabId, "Página carregada. Aguardando renderização do DOM (2s)...");
    await sleep(2000);
    
    logToActiveTab(activeTabId, "Extraindo mensagens...");

    // Injeta script para capturar e converter
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractAndConvert
    });
    
    // Fecha a aba
    chrome.tabs.remove(tab.id);
    
    if (result && result[0] && result[0].result) {
      const data = result[0].result;
      logToActiveTab(activeTabId, `Sucesso! ${data.messageCount} mensagens encontradas.`);
      
      // Faz download
      downloadMarkdown(data.markdown, data.filename);
      
      sendResponse({
        success: true,
        messageCount: data.messageCount,
        filename: data.filename
      });
    } else {
      throw new Error('Falha ao extrair mensagens do DOM');
    }
    
  } catch (error) {
    console.error('ChatExporter: Erro ao importar:', error);
    logToActiveTab(activeTabId, `ERRO: ${error.message}`, true);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Helper para mandar logs para o console da aba do usuário
function logToActiveTab(tabId, msg, isError = false) {
  if (!tabId) return;
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (text, err) => {
        const color = err ? '#f44336' : '#4CAF50';
        console.log(`%c[ChatExporter] %c${text}`, `color: ${color}; font-weight: bold;`, 'color: inherit;');
    },
    args: [msg, isError]
  }).catch(() => {});
}

// Função que roda NA ABA (tem acesso ao DOM)
function extractAndConvert() {
  try {
    const url = window.location.href;
    const isChatGPT = url.includes('chatgpt.com');
    const isGemini = url.includes('gemini.google.com') || url.includes('g.co/gemini');
    
    const messages = [];
    let elements = [];
    
    if (isChatGPT) {
      // ChatGPT Shared Link selectors
      elements = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
    } else {
      // Gemini Shared Link selectors (fallback)
      elements = document.querySelectorAll('message-content, .query-content, .user-query-bubble-with-background');
    }
    
    elements.forEach((el, index) => {
      let author = 'Unknown';
      let contentEl = el;
      
      if (isChatGPT) {
        const authorRole = el.querySelector('[data-message-author-role]')?.getAttribute('data-message-author-role');
        author = authorRole === 'user' ? 'Você' : (authorRole === 'assistant' ? 'GPT' : 'Unknown');
        contentEl = el.querySelector('.markdown, .whitespace-pre-wrap') || el;
      } else {
        const isUser = el.classList.contains('query-content') || el.classList.contains('user-query-bubble-with-background');
        author = isUser ? 'Você' : 'Gemini';
      }

      let text = contentEl.innerText.trim();
      
      // Captura imagens do turno
      const imgLinks = [];
      const imageSelectors = isChatGPT ? 'img[alt="Imagem carregada"], img[src*="oaiusercontent.com"]' : 'img.query-content, .user-query-bubble-with-background img';
      const imgs = el.querySelectorAll(imageSelectors);
      imgs.forEach(img => {
          const src = img.src || img.getAttribute('data-src');
          if (src && !imgLinks.includes(src)) imgLinks.push(src);
      });

      if (!text && imgLinks.length === 0) return;

      // Limpeza de lixo de UI
      text = text.replace(/Copiar o código/g, ''); // Gemini
      text = text.replace(/Copy code/g, '');       // ChatGPT
      text = text.replace(/Copy/g, '');            // ChatGPT general
      text = text.trim();

      messages.push({ index, text, author, attachments: imgLinks });
    });
    
    // Metadados do documento
    const platform = isChatGPT ? 'ChatGPT' : 'Gemini';
    const title = document.title.split(' - ')[0] || `Conversa ${platform}`;
    
    let md = `# ${title}\n\n`;
    md += `**Plataforma:** ${platform}\n`;
    md += `**Link:** ${url}\n`;
    md += `**Data:** ${new Date().toLocaleString()}\n`;
    md += `**Total de Mensagens:** ${messages.length}\n\n`;
    md += `---\n\n`;
    
    messages.forEach((msg) => {
      md += `## ${msg.author}\n\n`;
      if (msg.text) md += msg.text + '\n\n';
      
      if (msg.attachments && msg.attachments.length > 0) {
          md += `### 📎 Anexos\n`;
          msg.attachments.forEach(src => {
              md += `![Anexo](${src})\n\n`;
          });
      }
      md += `---\n\n`;
    });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return {
      markdown: md,
      messageCount: messages.length,
      filename: `import_${platform.toLowerCase()}_${timestamp}.md`
    };
    
  } catch (error) {
    console.error('Erro ao extrair:', error);
    return null;
  }
}

function downloadMarkdown(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  }, (downloadId) => {
    console.log('ChatExporter: Download iniciado:', downloadId);
    URL.revokeObjectURL(url);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
