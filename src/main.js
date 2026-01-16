/**
 * @file main.js
 * @description Ponto de entrada principal da extensão (Content Script).
 * Orquestra os módulos e responde aos comandos do Popup.
 */

// Garante que o namespace existe (embora os outros scripts devam ter criado)
window.ChatExporter = window.ChatExporter || {};

console.log('ChatExporter: Inicializando Main...');

// Estado Global da Sessão Atual
let observer = null;
let currentOptions = {};

/**
 * Inicia o processo de gravação.
 * @param {object} options - Opções vindas do popup (autoScroll, zipExport, etc)
 */
function startRecording(options = {}) {
  const { Markdown, Capture, Scroll, Config, Utils } = window.ChatExporter;
  
  if (!Config[Utils.getPlatform()]) {
    console.error('ChatExporter: Plataforma não suportada.');
    return;
  }

  currentOptions = options; // Salva opções para o export final

  // Inicializa dependências
  Markdown.init();
  Capture.extractMetadata();
  
  console.log('ChatExporter: Gravação iniciada com opções:', options);

  // Captura inicial
  Capture.captureVisible();

  // Configura Observer para capturar novas mensagens dinamicamente
  if (!observer) {
    observer = new MutationObserver(() => {
        Capture.captureVisible();
    });
    
    // Observa o corpo ou container principal
    const platform = Utils.getPlatform();
    const containerSelector = Config[platform].containerSelector;
    const container = document.querySelector(containerSelector) || document.body;
    
    observer.observe(container, { childList: true, subtree: true });
    console.log('ChatExporter: MutationObserver ativado em', container);
  }

  // Inicia Auto-Scroll se solicitado
  if (options.autoScroll) {
    setTimeout(async () => {
        await Scroll.start();
        // Se o scroll terminou naturalmente e não foi parado pelo usuário, exporta automaticamente
        if (!Scroll.shouldStop) {
            console.log('ChatExporter: Auto-Scroll finalizado. Iniciando exportação automática...');
            stopAndExport(currentOptions);
        }
    }, 1000);
  }
}

/**
 * Para a gravação, gera o arquivo e inicia o download.
 * @param {object} options - Opções de exportação
 */
async function stopAndExport(options = currentOptions) {
  const { Scroll, Capture, Utils, ZipService } = window.ChatExporter;
  
  Scroll.stop();
  if (observer) observer.disconnect();
  observer = null;
  
  const messageCount = Capture.capturedMessages.size;
  const platform = Utils.getPlatform();
  const versionShort = VERSION.number.replace(/\./g, '-');

  // Atualiza contador no localStorage (uma vez por exportação)
  const storageKey = `chatexporter_test_counter_v${versionShort}`;
  let testCounter = parseInt(localStorage.getItem(storageKey) || '0') + 1;
  localStorage.setItem(storageKey, testCounter.toString());

  const baseFilename = `v${versionShort}-test${testCounter}-${platform}`;
  
  console.log(`ChatExporter: Parando e gerando Exportação (${messageCount} msgs)...`);

  // --- 1. EXPORTAÇÃO PDF (Visual Backup Premium) ---
  if (options.pdfExport) {
    const { PdfService } = window.ChatExporter;
    const allMessages = Array.from(Capture.capturedMessages.values());
    PdfService.exportPDF(Capture.metadata.title, allMessages, Capture.metadata);
  }

  // --- 2. EXPORTAÇÃO ZIP (Offline Assets) ---
  if (options.zipExport) {
    // Para o ZIP, geramos o MD com links locais "assets/"
    const zipMarkdown = Capture.generateMarkdown(VERSION, { useLocalAssets: true });
    const allMessages = Array.from(Capture.capturedMessages.values());
    await ZipService.exportZip(zipMarkdown, baseFilename, allMessages);
  }

  // --- 3. EXPORTAÇÃO MARKDOWN PADRÃO (Hybrid Light) ---
  // Sempre exportamos o MD padrão (links online) como arquivo base leve
  const standardMarkdown = Capture.generateMarkdown(VERSION, { useLocalAssets: false });
  const filenameMd = `${baseFilename}.md`;
  const blobMd = new Blob([standardMarkdown], { type: 'text/markdown;charset=utf-8' });
  const urlMd = URL.createObjectURL(blobMd);
  const aMd = document.createElement('a');
  aMd.href = urlMd;
  aMd.download = filenameMd;
  aMd.click();
  
  // 4. Gera arquivo de Log de Debug (Opcional)
  if (Utils.debugLogs && Utils.debugLogs.length > 0) {
    const logFilename = `${baseFilename}-log.txt`;
    const blobLog = new Blob([Utils.debugLogs.join('\n')], { type: 'text/plain;charset=utf-8' });
    const urlLog = URL.createObjectURL(blobLog);
    const aLog = document.createElement('a');
    aLog.href = urlLog;
    aLog.download = logFilename;
    aLog.click();
  }
  
  // NOTIFICA O POPUP que terminou
  chrome.runtime.sendMessage({
    action: 'exportComplete',
    count: messageCount,
    filename: baseFilename
  }).catch(() => {});

  console.log(`ChatExporter: Exportação concluída.`);
}

// ========================================
// Listeners de Mensagem (Popup -> Content)
// ========================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startRecording') {
    sendResponse({ status: 'started' });
    setTimeout(() => startRecording(request.options || {}), 10);
    return false;

  } else if (request.action === 'stopAndExport') {
    stopAndExport(request.options || currentOptions);
    sendResponse({ status: 'exported' });
    
  } else if (request.action === 'reset') {
    const { Scroll, Capture } = window.ChatExporter;
    Scroll.stop();
    Capture.reset();
    if (observer) observer.disconnect();
    observer = null;
    sendResponse({ status: 'reset' });
  }
  return true;
});

// Log final de carregamento
console.log(`ChatExporter v${VERSION.number} "${VERSION.name}" - Pronto.`);
