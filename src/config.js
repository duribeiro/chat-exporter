/**
 * @file config.js
 * @description Módulo de configuração e constantes do ChatExporter.
 * Define seletores CSS para diferentes plataformas e configurações globais.
 */

// Define o namespace global se não existir
window.ChatExporter = window.ChatExporter || {};

/**
 * Configurações de seletores para cada plataforma suportada.
 * Inclui seletores para contêineres, mensagens, autores e conteúdo.
 */
window.ChatExporter.Config = {
  chatgpt: {
    containerSelector: 'main, [data-scroll-root="true"]',
    // Captura turnos completos para garantir contexto
    messageSelector: 'article[data-testid^="conversation-turn-"], [data-testid^="conversation-turn-"]',
    
    // Seletores de autor
    userMessageSelector: '[data-message-author-role="user"]',
    assistantMessageSelector: '[data-message-author-role="assistant"]',
    
    // Conteúdo (Markdown para IA, whitespace para User)
    contentSelector: '.markdown, .whitespace-pre-wrap, .prose',
    
    // Seletores de anexos (imagens)
    attachmentSelector: 'img[alt="Imagem carregada"], img[src*="oaiusercontent.com"], .grid-cols-2 img, [data-message-author-role="user"] img',
  },
  gemini: {
    containerSelector: 'main, .content-container, infinite-scroller',
    // Focando APENAS nos blocos individuais de mensagem
    messageSelector: '.user-query-container, .response-container, .model-response-container, model-response, message-content',
    
    // Seletores de autor - Expandidos para incluir links compartilhados
    userMessageSelector: '[data-message-author-role="user"], .user-query-container, user-query, .user-query, .query-content, .user-query-bubble-with-background',
    assistantMessageSelector: '[data-message-author-role="model"], .response-container, .model-response-container, model-response, .model-response, message-content',
    
    // Onde está o texto/conteúdo
    contentSelector: '.message-content, .query-text, .markdown, p.query-text-line',
    
    // Seletores de anexos (imagens) - expandido para uploads e blobs
    attachmentSelector: 'img[src*="googleusercontent"], img[src^="blob:"], .file-preview-container img, img[data-test-id="uploaded-img"], .uploaded-image img, [class*="image"] img',
  }
};

console.log('ChatExporter: Módulo Config carregado');
