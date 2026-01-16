/**
 * @file pdf_service.js
 * @description Serviço para gerar uma visão HTML amigável para impressão e gerar PDF.
 */

window.ChatExporter = window.ChatExporter || {};

window.ChatExporter.PdfService = {
  /**
   * Gera um PDF a partir das mensagens capturadas usando um template limpo.
   * @param {string} title - Título da conversa.
   * @param {Array} messages - Lista de mensagens capturadas.
   * @param {object} metadata - Metadados da conversa.
   */
  exportPDF: function(title, messages, metadata) {
    console.log('ChatExporter: Gerando visão otimizada para PDF...');
    
    // 1. Cria o HTML da visão de impressão
    const printHtml = this.generatePrintTemplate(title, messages, metadata);
    
    // 2. Abre uma nova janela temporária
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Erro: O bloqueador de popups impediu a geração do PDF.');
        return;
    }

    // 3. Escreve o conteúdo e os estilos
    printWindow.document.write(printHtml);
    printWindow.document.close();

    // 4. Aguarda as imagens carregarem antes de disparar a impressão
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
            // Opcional: fechar a janela após a impressão/cancelamento
            // printWindow.close();
        }, 500);
    };
  },

  /**
   * Gera o template HTML completo para impressão.
   */
  generatePrintTemplate: function(title, messages, metadata) {
    const { userName, aiName } = metadata;
    const dateStr = new Date().toLocaleString('pt-BR');
    const platform = window.ChatExporter.Utils.getPlatform().toUpperCase();

    let messagesHtml = '';
    messages.forEach((msg, index) => {
        const isUser = msg.author === 'User';
        const roleName = isUser ? userName : aiName;
        const color = isUser ? '#f0f4f8' : '#ffffff';
        const borderColor = isUser ? '#d1d9e6' : '#e0e0e0';
        
        let attachmentsHtml = '';
        if (msg.attachments && msg.attachments.length > 0) {
            attachmentsHtml = '<div class="attachments">';
            msg.attachments.forEach(src => {
                attachmentsHtml += `<img src="${src}" class="print-img" />`;
            });
            attachmentsHtml += '</div>';
        }

        messagesHtml += `
            <div class="message-row ${msg.author.toLowerCase()}">
                <div class="message-header">
                    <strong>${roleName}</strong>
                    <span class="msg-index">#${index + 1}</span>
                </div>
                <div class="message-content">
                    ${msg.html}
                    ${attachmentsHtml}
                </div>
            </div>
        `;
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #fff;
        }

        .header {
            border-bottom: 2px solid #eee;
            margin-bottom: 30px;
            padding-bottom: 20px;
        }

        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
            color: #2c3e50;
        }

        .meta {
            font-size: 13px;
            color: #666;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 5px;
        }

        .message-row {
            margin-bottom: 25px;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #eee;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .message-row.user {
            background-color: #f9fafb;
            border-left: 4px solid #3b82f6;
        }

        .message-row.assistant {
            background-color: #ffffff;
            border-left: 4px solid #10b981;
        }

        .message-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
            border-bottom: 1px solid #efefef;
            padding-bottom: 5px;
        }

        .msg-index {
            color: #999;
            font-weight: normal;
        }

        .message-content {
            font-size: 15px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .message-content p { margin: 10px 0; }
        
        /* Estilos para Código */
        pre {
            background: #f4f4f4;
            padding: 12px;
            border-radius: 5px;
            overflow-x: auto;
            font-size: 13px;
            border: 1px solid #ddd;
            white-space: pre-wrap;
        }
        
        code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 3px;
        }

        /* Estilos para Imagens no PDF */
        .attachments {
            margin-top: 15px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .print-img {
            max-width: 100%;
            max-height: 400px;
            border-radius: 5px;
            border: 1px solid #eee;
            display: block;
        }

        /* Tabelas */
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
            font-size: 14px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th { background: #f2f2f2; }

        @media print {
            body { padding: 0; }
            .message-row { 
                box-shadow: none !important;
                border: 1px solid #eee !important;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <div class="meta">
            <div><strong>Plataforma:</strong> ${platform}</div>
            <div><strong>Data:</strong> ${dateStr}</div>
            <div><strong>Usuário:</strong> ${userName}</div>
            <div><strong>Assistente:</strong> ${aiName}</div>
        </div>
    </div>
    
    <div class="messages">
        ${messagesHtml}
    </div>

    <div style="text-align: center; font-size: 10px; color: #999; margin-top: 40px; border-top: 1px solid #eee; padding-top: 10px;">
        Exportado por ChatExporter v2.2.4 - Premium Visual Backup
    </div>
</body>
</html>
    `;
  }
};

console.log('ChatExporter: Módulo PdfService carregado');
