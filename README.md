# ChatExporter - Exportador Universal de Conversas de IA

<div align="center">

![Version](https://img.shields.io/badge/version-2.2.4-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow.svg)

**Exporta conversas de ChatGPT e Gemini para Markdown, ZIP ou PDF com um clique!**

</div>

---

## 🚀 Funcionalidades

- ✅ **Estratégia Híbrida de Imagens:** 
  - **Download Leve (Padrão):** Markdown com links diretos para as imagens.
  - **Pacote Offline (ZIP):** Markdown + pasta `assets/` com todas as imagens locais.
  - **Visual Backup (PDF):** Gera PDF formatado da conversa.
- ✅ **Exportação Universal:** Suporte aprimorado para ChatGPT e Gemini (incluindo links compartilhados).
- ✅ **Zero Base64 Bloat:** Arquivos 95% menores e carregamento instantâneo.
- ✅ **Auto-Scroll Turbo:** Captura conversas imensas com velocidade 3x superior.
- ✅ **Markdown Limpo:** Conversão HTML → Markdown sem ruídos de interface (botões de cópia, avatares, etc).
- ✅ **Instant Mode:** Exportação imediata para links compartilhados do Gemini.
- ✅ **Debug Logs:** Exportação opcional de registros para diagnóstico técnico.

---

## 📦 Instalação

### Via Chrome Web Store (Em Breve)
*Aguardando publicação*

### Manual (Desenvolvimento)
1. Clone este repositório:
   ```bash
   git clone https://github.com/duribeiro/chat-exporter.git
   ```

2. Abra o Chrome e vá para `chrome://extensions/`

3. Ative o **Modo do desenvolvedor** (canto superior direito)

4. Clique em **Carregar sem compactação**

5. Selecione a pasta do projeto

---

## 🎯 Como Usar

1. **Abra uma conversa** no ChatGPT ou Gemini.
2. **Clique no ícone da extensão**.
3. Escolha suas opções:
   - **Auto-Scroll:** Para capturar conversas longas do topo ao fim.
   - **Download ZIP:** Se quiser as imagens salvas localmente.
   - **Exportar PDF:** Para uma versão visual pronta para impressão.
4. Clique em **"Iniciar Gravação"** (ou use o **Importar do Link** para URLs compartilhadas).
5. Clique em **"Parar e Exportar"** ao finalizar.

---

## 🧠 Arquitetura Phoenix (v2.2.x)

O ChatExporter utiliza o motor **Phoenix**, que elimina a dependência de seletores rígidos.

### Sistema Modular
O projeto foi refatorado para ser totalmente modular, facilitando a manutenção e expansão:
- `src/config.js`: Central de seletores e constantes.
- `src/capture.js`: Core de extração de mensagens e metadados.
- `src/markdown.js`: Regras de conversão (Turndown).
- `src/zip_service.js` & `src/pdf_service.js`: Serviços de exportação especializada.
- `src/scroll.js`: Motores de scroll inteligente e turbo.

### Filtragem de Duplicatas
- Hash único gerado para cada mensagem (normalizado).
- Detecção inteligente de elementos pai/filho.
- Ordenação visual absoluta combinando `turnIndex` e posição no DOM.

---

## 🔧 Guia de Desenvolvimento

### Tecnologias
- **Manifest V3** (Chrome Extension)
- **Turndown.js** (HTML → Markdown)
- **JSZip** (Empacotamento de assets)
- **Vanilla JavaScript** (Zero frameworks pesados)

### Estrutura do Projeto
```
ChatExporter/
├── manifest.json          # Configuração da extensão
├── version.js             # Metadados da versão atual
├── popup.html/js          # Interface do usuário (UI)
├── src/                   # Lógica modular
│   ├── config.js          # Seletores CSS
│   ├── capture.js         # Lógica de captura
│   ├── markdown.js        # Conversor Markdown
│   ├── scroll.js          # Motores de Scroll
│   └── ...service.js      # Serviços (ZIP/PDF)
├── lib/                   # Bibliotecas externas (Turndown, JSZip)
└── README.md              # Documentação
```

### Comandos Git Essenciais

**Inicializar e Taggear:**
```bash
git init
git add .
git commit -m "feat: Initial commit v2.2.4"
git tag -a v2.2.4 -m "Release Hybrid Light"
```

**Reverter Versão:**
Como este repositório foi reinicializado na v2.2.4, as tags de versões anteriores (v1.x/v2.0) não estão no histórico atual. A partir de agora, use:
```bash
# Ver tags disponíveis
git tag

# Voltar para uma versão específica
git checkout v2.2.4
```

---

## 📝 Versionamento

Seguimos [Semantic Versioning](https://semver.org/):
- **Major (X.0.0):** Refatorações críticas ou mudanças arquiteturais.
- **Minor (0.X.0):** Novas funcionalidades relevantes.
- **Patch (0.0.X):** Correções de bugs e melhorias finas.

---

## 📝 Changelog

Consulte o [CHANGELOG.md](CHANGELOG.md) para o histórico detalhado de cada patch.

### Última Versão: 2.2.4 "Hybrid Light" (2026-01-16)

**Adicionado:**
- Estratégia híbrida: Links originais (leve) vs ZIP (offline).
- Exportação nativa para PDF.
- Suporte a links compartilhados do ChatGPT.
- Remoção de Base64 para máxima performance.

---

## 🐛 Reportar Bugs

Encontrou um problema? [Abra uma issue](https://github.com/duribeiro/chat-exporter/issues) com:
1. Versão da extensão (ex: v2.2.4).
2. Plataforma (ChatGPT ou Gemini).
3. O log de debug (se disponível).

---

## 👨‍💻 Autor

**Eduardo Ribeiro**
- GitHub: [@duribeiro](https://github.com/duribeiro)

---

## ⭐ Apoie o Projeto

Se este projeto te ajudou, considere dar uma ⭐ no GitHub!

---

*Última atualização: 2026-01-16*
