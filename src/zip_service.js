/**
 * @file zip_service.js
 * @description Serviço para criação de pacotes ZIP contendo Markdown e Imagens.
 */

window.ChatExporter = window.ChatExporter || {};

window.ChatExporter.ZipService = {
  /**
   * Cria um arquivo ZIP e inicia o download.
   * @param {string} markdown - Conteúdo Markdown.
   * @param {string} filename - Nome base do arquivo.
   * @param {Array} messages - Lista de mensagens com anexos.
   */
  exportZip: async function(markdown, filename, messages) {
    if (typeof JSZip === 'undefined') {
        console.error('ChatExporter: JSZip não carregado.');
        alert('Erro: Biblioteca de compressão não encontrada.');
        return;
    }

    const zip = new JSZip();
    const assetsFolder = zip.folder("assets");
    
    console.log('ChatExporter: Iniciando empacotamento ZIP...');
    
    // 1. Adiciona o Markdown principal
    zip.file(`${filename}.md`, markdown);
    
    // 2. Coleta e baixa todas as imagens
    const imagePromises = [];
    const imageMap = new Map(); // URL -> LocalPath

    messages.forEach((msg, msgIndex) => {
        if (msg.attachments && msg.attachments.length > 0) {
            msg.attachments.forEach((url, imgIndex) => {
                if (!imageMap.has(url)) {
                    const ext = this.getExtension(url);
                    const localName = `img_${msgIndex + 1}_${imgIndex + 1}.${ext}`;
                    imageMap.set(url, localName);
                    
                    // Promise para baixar a imagem
                    imagePromises.push(this.addFileToZip(assetsFolder, localName, url));
                }
            });
        }
    });

    // Aguarda todos os downloads
    if (imagePromises.length > 0) {
        console.log(`ChatExporter: Baixando ${imagePromises.length} imagens para o ZIP...`);
        await Promise.all(imagePromises);
    }

    // 3. Gera o blob do ZIP e dispara download
    const content = await zip.generateAsync({ type: "blob" });
    const zipFilename = `${filename}.zip`;
    
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFilename;
    a.click();
    
    console.log(`ChatExporter: ZIP exportado como ${zipFilename}`);
  },

  /**
   * Baixa um arquivo e adiciona ao ZIP.
   */
  addFileToZip: async function(folder, name, url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        folder.file(name, blob);
    } catch (err) {
        console.error(`ChatExporter: Falha ao baixar imagem ${url}:`, err);
        // Adiciona um arquivo de texto de erro no lugar se falhar?
        folder.file(`${name}_error.txt`, `Falha ao baixar imagem original: ${url}`);
    }
  },

  /**
   * Extrai extensão da URL ou usa png como padrão.
   */
  getExtension: function(url) {
    try {
        const parts = url.split('.');
        let ext = parts[parts.length - 1].split(/[?#]/)[0].toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'png'].includes(ext)) return ext;
        return 'png';
    } catch (e) {
        return 'png';
    }
  }
};

console.log('ChatExporter: Módulo ZipService carregado');
