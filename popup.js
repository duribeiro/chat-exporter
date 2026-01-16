let startBtn = document.getElementById('startBtn');
let stopBtn = document.getElementById('stopBtn');
let resetBtn = document.getElementById('resetBtn');
let importBtn = document.getElementById('importBtn');
let shareLinkInput = document.getElementById('shareLink');
let statusText = document.getElementById('status');
let counterText = document.getElementById('counter');

// Atualiza título com versão
chrome.runtime.getManifest().version;
document.getElementById('extensionTitle').textContent = `ChatExporter v${chrome.runtime.getManifest().version}`;

// Recupera estado salvo ao abrir o popup
chrome.storage.local.get(['isRecording', 'messageCount'], (res) => {
  if (res.isRecording) {
    updateUI(true);
  }
  if (res.messageCount !== undefined) {
    counterText.innerText = `Mensagens capturadas: ${res.messageCount}`;
  }
});

// NOVO: Importar do link compartilhado
importBtn.onclick = async () => {
  const link = shareLinkInput.value.trim();
  
  if (!link) {
    alert('Por favor, cole o link de compartilhamento do Gemini');
    return;
  }
  
  if (!link.includes('g.co/gemini/share/') && 
      !link.includes('gemini.google.com/share/') && 
      !link.includes('chatgpt.com/share/')) {
    alert('Link inválido. Use um link de compartilhamento do Gemini ou ChatGPT.');
    return;
  }
  
  // Feedback visual
  importBtn.disabled = true;
  importBtn.innerText = 'Importando...';
  
  try {
    // Log inicial na aba atual para o usuário ver
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (msg) => console.log(`%c[ChatExporter] %c${msg}`, 'color: #2196F3; font-weight: bold;', 'color: inherit;'),
        args: ['Iniciando processo de importação em background...']
      }).catch(() => {});
    });

    // Envia para background script fazer o fetch
    chrome.runtime.sendMessage({
      action: 'importFromLink',
      link: link
    }, (response) => {
      if (response && response.success) {
        alert(`✅ Sucesso! ${response.messageCount} mensagens exportadas para ${response.filename}`);
        shareLinkInput.value = '';
      } else {
        const errorMsg = response?.error || 'Erro desconhecido';
        alert(`❌ Erro: ${errorMsg}`);
        console.error('ChatExporter: Erro na importação:', errorMsg);
      }
      
      importBtn.disabled = false;
      importBtn.innerText = 'Importar do Link';
    });
  } catch (error) {
    alert(`❌ Erro: ${error.message}`);
    importBtn.disabled = false;
    importBtn.innerText = 'Importar do Link';
  }
};

startBtn.onclick = () => {
  // Feedback imediato
  startBtn.disabled = true;
  statusText.innerText = "Iniciando...";
  statusText.style.color = "#2196F3";
  
  const options = {
    autoScroll: document.getElementById('autoScrollCheck').checked,
    zipExport: document.getElementById('zipExportCheck').checked,
    pdfExport: document.getElementById('pdfExportCheck').checked
  };
  
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'startRecording',
      options: options
    }, (response) => {
      if (chrome.runtime.lastError) {
        statusText.innerText = "Erro: Recarregue a página";
        statusText.style.color = "#f44336";
        startBtn.disabled = false;
        return;
      }
      updateUI(true);
      if (options.autoScroll) {
        statusText.innerText = "Gravando (Auto-Scroll)...";
      } else {
        statusText.innerText = "Gravando...";
      }
      statusText.style.color = "#4CAF50";
    });
  });
};

stopBtn.onclick = () => {
  const options = {
    zipExport: document.getElementById('zipExportCheck').checked,
    pdfExport: document.getElementById('pdfExportCheck').checked
  };
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
        action: 'stopAndExport',
        options: options
    }, (response) => {
      updateUI(false);
    });
  });
};

resetBtn.onclick = () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'reset'}, (response) => {
      chrome.storage.local.set({messageCount: 0, isRecording: false});
      counterText.innerText = `Mensagens capturadas: 0`;
      updateUI(false);
    });
  });
};

function updateUI(isRecording) {
  startBtn.disabled = isRecording;
  stopBtn.disabled = !isRecording;
  statusText.innerText = isRecording ? "Gravando..." : "Pronto";
  chrome.storage.local.set({isRecording});
}

// Ouve atualizações de contagem vindas do content script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'updateCount') {
    counterText.innerText = `Mensagens capturadas: ${msg.count}`;
    chrome.storage.local.set({messageCount: msg.count});
  } else if (msg.action === 'manualModeActivated') {
    statusText.innerText = "Modo Manual - Role a página";
    statusText.style.color = "#ff9800";
  } else if (msg.action === 'exportComplete') {
    updateUI(false);
    statusText.innerText = `Exportado! (${msg.count} mensagens)`;
    statusText.style.color = "#4CAF50";
  }
});
