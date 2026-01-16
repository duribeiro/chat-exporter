# ChatExporter - Exportador Universal de Conversas de IA

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow.svg)

**Exporta conversas de ChatGPT, Gemini e Claude para Markdown com um clique!**

</div>

---

## 🚀 Funcionalidades

- ✅ **Exportação Universal:** Funciona com ChatGPT, Gemini, Claude e outros
- 🧠 **Aprendizado Automático:** Detecta automaticamente o container de scroll
- 📝 **Markdown Limpo:** Conversão HTML → Markdown com formatação perfeita
- 🔄 **Auto-Scroll Inteligente:** Captura conversas longas com lazy loading
- 📎 **Anexos:** Captura imagens e links de arquivos
- 🎯 **Zero Duplicatas:** Sistema inteligente de filtragem
- 📊 **Metadados Completos:** Título, autor, data e versão rastreáveis
- 🐛 **Debug Logs:** Exporta logs para diagnóstico

---

## 📦 Instalação

### Via Chrome Web Store (Em Breve)
*Aguardando publicação*

### Manual (Desenvolvimento)
1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/ChatExporter.git
   ```

2. Abra o Chrome e vá para `chrome://extensions/`

3. Ative o **Modo do desenvolvedor** (canto superior direito)

4. Clique em **Carregar sem compactação**

5. Selecione a pasta do projeto

---

## 🎯 Como Usar

### Modo Automático (Recomendado)
1. **Abra uma conversa** no ChatGPT, Gemini ou Claude
2. **Clique no ícone da extensão**
3. Marque **"Auto-Scroll"** (padrão)
4. Clique em **"Iniciar Gravação"**
   - A extensão detecta automaticamente o container de scroll
   - Rola suavemente até o topo e depois até o fim
   - Captura todas as mensagens com lazy loading
5. Clique em **"Parar e Exportar"** ao finalizar

### Modo Manual (Fallback)
Se a detecção automática falhar, o Modo Manual é ativado automaticamente:
1. Uma notificação visual aparece: **"Modo Manual Ativo"**
2. **Role manualmente** a página do topo ao fim
3. A extensão captura as mensagens conforme elas aparecem na tela
4. Clique em **"Parar e Exportar"** para baixar

---

## 🧠 Arquitetura Inteligente (v2.0)

O ChatExporter v2.0 introduziu o sistema **Phoenix**, que elimina a necessidade de atualizações constantes de seletores.

### Sistema de Aprendizado
Em vez de seletores hardcoded, a extensão:
1. **Detecta** automaticamente estruturas de mensagem na primeira visita
2. **Identifica** padrões de User vs Assistant
3. **Aprende** seletores de imagens, códigos e links
4. **Salva** o aprendizado localmente para uso futuro

Se o layout do site mudar, a extensão detecta a falha e **re-aprende** sozinha na próxima execução!

### Filtragem de Duplicatas
Para garantir exportações limpas:
- Hash único gerado para cada mensagem
- Detecção inteligente de elementos pai/filho (evita duplicar container e conteúdo)
- Inferência de autor baseada no contexto do turno

---

## 🔧 Guia de Desenvolvimento

### Tecnologias
- **Manifest V3** (Chrome Extension)
- **Turndown.js** (HTML → Markdown)
- **Vanilla JavaScript** (Zero dependências)

### Estrutura do Projeto
```
ChatExporter/
├── manifest.json          # Configuração da extensão
├── version.js             # Metadados e versionamento
├── content.js             # Lógica principal (autoscroll, captura)
├── popup.html/js          # Interface do usuário
├── lib/               
│   └── turndown.js        # Motor de conversão Markdown
├── export_tests/          # Pasta para salvar testes manuais
└── README.md              # Documentação completa
```

### Comandos Git Essenciais

**Inicializar e Commitar:**
```bash
git init
git add .
git commit -m "feat: Initial commit v2.0.0"
git tag -a v2.0.0 -m "Release Phoenix"
```

**Criar Nova Feature:**
```bash
git checkout -b feature/nova-funcionalidade
# ...codar...
git commit -m "feat: Adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
```

**Reverter Versão:**
```bash
# Voltar para tag específica
git checkout v1.3.0
```

---

## 📝 Versionamento

Seguimos [Semantic Versioning](https://semver.org/):
- **Major (X.0.0):** Mudanças incompatíveis (ex: Refatoração v2.0)
- **Minor (0.X.0):** Novas funcionalidades (ex: Modo Híbrido v1.4)
- **Patch (0.0.X):** Correções de bugs

Consulte `CHANGELOG.md` para o histórico detalhado.

---

## 📁 Estrutura de Arquivos Exportados

### Nome do Arquivo
```
v2-0-0-test3-gemini.md
```
- `v2-0-0`: Versão do ChatExporter
- `test3`: Número sequencial do teste
- `gemini`: Plataforma


---

## 📝 Changelog

Veja [CHANGELOG.md](CHANGELOG.md) para histórico completo de mudanças.

### Última Versão: 2.0.0 "Phoenix" (2026-01-15)

**Adicionado:**
- Sistema de filtragem inteligente de duplicatas
- Detecção de autor via turno pai
- Versionamento semântico com metadados
- Contador de testes sequencial

**Corrigido:**
- Duplicatas em conversas longas
- Autores marcados como "Unknown"
- Ordem cronológica das mensagens

---

## 🐛 Reportar Bugs

Encontrou um problema? [Abra uma issue](https://github.com/seu-usuario/ChatExporter/issues) com:
- Versão do ChatExporter (ex: v2.0.0)
- Plataforma (ChatGPT/Gemini/Claude)
- Arquivo de log exportado
- Descrição do problema

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📜 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autor

**Eduardo Ribeiro**
- GitHub: [@eduardoribeiro](https://github.com/eduardoribeiro)

---

## ⭐ Apoie o Projeto

Se este projeto te ajudou, considere dar uma ⭐ no GitHub!

---

*Última atualização: 2026-01-15*
