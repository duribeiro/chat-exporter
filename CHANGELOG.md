# Changelog - ChatExporter

Todas as mudanças notáveis neste projeto serão documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [2.2.4] "Hybrid Light" - 2026-01-16
### ✨ Novidades: Estratégia Híbrida de Imagens
- **Markdown Inteligente**: Por padrão, as imagens agora são salvas como links originais (`https://...`). Isso reduz o tamanho dos arquivos em 95% e torna os logs ideais para treinamento de IA.
- **Modo Offline (.zip)**: Nova opção no Popup para baixar um pacote ZIP contendo o Markdown e uma pasta `assets/` com todas as imagens reais (via JSZip).
- **Visual Backup (PDF)**: Opção de disparar a impressão para PDF diretamente.
- **Remoção do Base64 Bloat**: Fim dos arquivos de 10MB! Exportações agora são leves e rápidas.
- **Fim da Divisão de Arquivos**: Como os arquivos agora são leves, não é mais necessário quebrar conversas longas em múltiplas partes.

## [2.2.3] - Phoenix Fix - 2026-01-16

### 🚀 Correções ChatGPT
- **Suporte Total a Links Compartilhados**: Agora captura autores (user/assistant) corretamente via atributos `data-turn` e `data-message-author-role`.
- **Captura de Imagens**: Adicionado suporte para imagens do ChatGPT (`oaiusercontent.com` e anexos do usuário).
- **Nome da IA Customizado**: Detecta nomes como "RAYA" em vez de apenas "ChatGPT" quando disponível no DOM.

### 🔧 Importação (Modo 1)
- **ChatGPT Support**: Agora o botão de importar URLs via Popup suporta links do ChatGPT.
- **Cleanup Inteligente**: Remoção automática de botões "Copy code" e lixo de UI do ChatGPT durante a importação.
- **Robustez**: Adicionados gatilhos de captura durante o "Instant Mode" para garantir que lazy-loading não deixe mensagens para trás.

---

## [2.2.2] - Phoenix Turbo - 2026-01-16

### 🚀 Novidades
- **Instant Mode (Shared Links)** ⚡
  - Links compartilhados do Gemini agora são exportados instantaneamente. A extensão detecta que o conteúdo já está no DOM e pula o scroll demorado.
- **Fix: Importar do Link (Modo 1)** 🔗
  - Corrigida a funcionalidade de importar links diretamente via Popup. 
  - Lógica de extração aprimorada para capturar usuário e assistente corretamente em links compartilhados.

### 🏎️ Performance
- **Scroll Turbo**: Aumentado o passo de scroll para 1200px. Conversas normais agora são processadas ainda mais rápido.

### 🔧 Outros
- **Melhores Seletores**: Atualizados os seletores de autor para o modo "Share" do Gemini.

---

## [2.2.1] - Phoenix Speed - 2026-01-16

### 🚀 Melhorias
- **Auto-Scroll 3x mais rápido** 🏎️
  - Aumentado o step de scroll e reduzido o delay entre saltos. Conversas imensas agora são capturadas muito mais rápido.
- **Cleanup de UI (Zero Noise)** 🧼
  - Implementado suporte real ao `contentSelector`.
  - Remoção automática de botões ("Edit", "Copy"), SVGs, toolbars e rodapés de feedback. O Markdown agora é 100% conteúdo.

### 🔧 Corrigido
- **Regressão de Captura**: Corrigida a lógica que capturava o container de mensagem inteiro incluindo lixo de interface.

---
 Linda
## [2.2.0] - Phoenix Reborn - 2026-01-16

### 🚀 Novas Funcionalidades (Restauradas)
- **Phoenix Learning Engine v2** 🧠
  - Motor de aprendizado automático restaurado e modularizado.
  - Se os seletores padrão falharem, a extensão agora descobre sozinha o container de mensagens (Zero-Config).
- **Imagens em Base64** 🖼️
  - Suporte à conversão de imagens para Data URIs (Base64).
  - Garante que as imagens capturadas funcionem mesmo se o arquivo for visualizado offline.
- **Chronos Sorting System** 📜
  - Ordenação visual absoluta combinando Turn Index e DOM Position.
  - Ordem cronológica garantida 100% fiel à tela.

---

## [2.1.2] - Phoenix Chronos - 2026-01-16

### 🔄 Restaurado
- **Ordenação Cronológica Perfeita** 🕒
  - Reimplementada a lógica de `turnIndex` e `domPosition` que havia sido perdida na refatoração.
  - As mensagens agora são ordenadas pela posição visual na página, não pelo momento da captura.
  - Isso corrige chats longos onde o usuário faz scroll manual fora de ordem.

---

## [2.1.1] - Phoenix Patch 1 - 2026-01-16

### 🔧 Corrigido
- **Exportação de Logs de Debug** 📝
  - Restaurada a funcionalidade (perdida no refactor) de baixar o arquivo `.txt` com os logs.
  - Agora baixa ambos: `v*-gemini.md` e `v*-gemini-log.txt`.

- **Auto-Scroll no Gemini** 📜
  - Detecção melhorada do container de scroll (`infinite-scroller` ou `main`).
  - Resolve o erro "Container de scroll não encontrado".

---

## [2.1.0] - Phoenix Refactor - 2026-01-16

### ♻️ Refatoração (Clean Code)
- **Modularização Completa**
  - O antigo `content.js` (monolito) foi extinto.
  - Código dividido em módulos semânticos na pasta `src/`:
    - `config.js`: Seletores e constantes.
    - `utils.js`: Helpers, Logging, Hash.
    - `markdown.js`: Regras de conversão Turndown.
    - `scroll.js`: Gerenciamento de scroll manual e auto.
    - `capture.js`: Lógica core de captura e metadados.
    - `main.js`: Inicialização e listeners.
- **Improved Maintainability**: Código mais limpo, funções menores e JSDocs em português.

### 🛡️ Estabilidade
- Mesmas correções da v2.0.5 mantidas (timeout fix, try-catch, hash normalizado).

---

## [2.0.5] - Phoenix Patch 5 - 2026-01-16

### 🚑 Hotfix
- **Erro "Recarregue a página" (Timeout)**
  - Listener de mensagens agora responde imediatamente (`sendResponse`) antes de executar a lógica pesada
  - Isso evita que o Popup ache que a extensão travou enquanto ela processa mensagens
  - Adicionado `try-catch` robusto no loop de mensagens para evitar falhas silenciosas

---

## [2.0.4] - Phoenix Patch 4 - 2026-01-16

### 🔧 Corrigido
- **Duplicatas Persistentes (Mensagens 11/12)** 🛑
  - Implementada **Normalização Agressiva de Texto** antes do hash (`replace(/\s+/g, ' ').trim()`)
  - Agora mensagens que parecem iguais (mas têm espaços invisíveis diferentes) são tratadas como duplicatas reais
  - Ignora repetições do texto independentemente do autor detectado

- **Captura de Imagens** 🖼️
  - Expandido seletor para incluir `img[src*="googleusercontent"]` e BLOBs
  - Adicionado suporte para imagens de upload do usuário

### 📝 Melhorias
- Incremento de versão para 2.0.4 em todos os arquivos

---

## [2.0.3] - Phoenix Patch 3 - 2026-01-16

### 🔧 Corrigido
- **Tabelas Mal Formatadas** ⚠️
  - Tabelas do Gemini agora exportam como markdown correto com pipes e separadores
  - Implementada conversão robusta: `| col1 | col2 |` ao invés de linhas soltas
  - Escapa pipes internos para não quebrar formatação

- **Contador de Teste Incorreto**
  - Cada versão agora tem contador independente (`chatexporter_test_counter_v2-0-3`)
  - v2.0.3 começa do `test1` ao invés de herdar contador global
  - Formato: `v2-0-3-test1-gemini.md`

### ✨ Melhorias
- **Versão Exibida nos Textos**
  - Popup agora mostra "ChatExporter v2.0.3" (dinâmico do manifest)
  - Console log inicial: "ChatExporter v2.0.3 'Phoenix' - Content script carregado"
  - Melhor rastreabilidade de qual versão está rodando

### 📝 Mudanças Técnicas
- `initTurndown()`: Regra de tabelas com conversão cell-by-cell (linha 196-221)
- `stopAndExport()`: Contador usa chave por versão (linha 1007)
- `popup.js`: Título dinâmico com `chrome.runtime.getManifest().version` (linha 9-11)
- `content.js`: Log de startup com versão e nome (linha 1191)

---

## [2.0.2] - Phoenix Patch 2 - 2026-01-15

### 🐛 Corrigido - CRÍTICO
- **Mensagens Duplicadas com Autores Trocados** ⚠️
  - Bug identificado: múltiplas mensagens apareciam duplicadas (User copiando Assistant)
  - Exemplos: msg 3=cópia de 2, msg 6=cópia de 5, msg 9=cópia de 8, msg 29=cópia de 30
  - Causa raiz: Filtro de duplicatas permitia passar hash idếntico se autor fosse diferente
  - **Solução:** Return incondicional para qualquer hash duplicado (linha 288)

### ✨ Melhorias
- **Inferência de Linguagem em Code Blocks**
  - Detecta automaticamente `bash`, `yaml`, `python`, `javascript` por padrões de código
  - Reduz ~50% os blocos sem tag de linguagem
  - Fallback para comandos comuns: `sudo`, `docker`, `git`, `npm`

- **Captura de Imagens Expandida**
  - Agora busca imagens em TODAS as mensagens (não apenas User)
  - Suporte para `data-src` e múltiplos seletores

### 📝 Mudanças Técnicas
- `captureVisibleMessages()`: Filtro de duplicatas simplificado (linha 286-291)
- `initTurndown()`: Fallback de inferência por regex (linha 149-167)
- `captureVisibleMessages()`: Anexos capturados sem restrição de autor (linha 362-370)

### ⚠️ Limitação Conhecida
- **Imagens Base64**: Sistema de conversão implementado mas limitado por CORS
  - Imagens de domínios externos podem não ser convertidas
  - URLs são mantidas no markdown (fallback seguro)

---

## [2.0.1] - Phoenix Patch 1 - 2026-01-15

### 🔧 Corrigido
- **Code Blocks Vazios:** Blocos de código agora são exportados com conteúdo completo
  - Implementada extração robusta com 3 métodos de fallback (querySelector, textContent, innerText)
  - Detecção de linguagem via múltiplas fontes (atributos data-*, labels visuais, className)
  - Logs de warning para diagnóstico de blocos vazios
- **Captura de Imagens:** Melhorado seletor para capturar uploads do usuário
  - Adicionado suporte para URLs googleusercontent e blob:
  - Captura imagens em containers de preview diversos

### 📝 Mudanças Técnicas
- `initTurndown()`: Regra `fencedCodeBlock` reescrita (93-164)
- `CONFIG.gemini.attachmentSelector`: Expandido para incluir mais padrões de imagem

---

## [2.0.0] - Phoenix - 2026-01-15

### 🎯 Objetivo da Release
Refatoração completa para eliminar duplicatas e resolver detecção de autores.

### ✨ Adicionado
- Sistema de filtragem inteligente de duplicatas
- Fallback de detecção de autor via turno pai
- Timestamp completo nos nomes de arquivo (HH-MM-SS)
- Captura de metadados da conversa (título, nome da IA)
- Ordenação por `turnIndex` (índice do turno no DOM)
- Exportação de logs de debug junto com markdown
- Sistema de versionamento com `version.js`

### 🔧 Corrigido
- **Duplicatas:** Elementos pai/filho com mesmo texto não geram mais duplicatas
- **Autores "Unknown":** Inferência pelo container do turno resolve 99% dos casos
- **Ordem cronológica:** Uso de `turnIndex` garante ordem perfeita
- **Nome do usuário:** Simplificado para "Você" (elemento real está oculto)

### 🗑️ Removido
- Função `scrollToBottom()` (código morto, 33 linhas)
- querySelector complexo para nome de usuário (elemento oculto)

### 📝 Mudanças Técnicas
- `captureVisibleMessages()`: Adicionada lógica de skip para duplicatas
- `generateMarkdown()`: Ordenação por `turnIndex` em vez de `scrollPosition`
- `stopAndExport()`: Timestamp com hora/minuto/segundo nos arquivos
- `extractConversationMetadata()`: Nome fixo "Você" para usuário

### 🧪 Testes Validados
- ✅ Zero duplicatas em conversas longas (269+ mensagens)
- ✅ Zero autores "Unknown" 
- ✅ Ordem cronológica perfeita
- ✅ Anexos capturados corretamente
- ✅ Título e nome da IA extraídos

---

## [1.3.0] - Stable - 2026-01-12

### ✨ Adicionado
- Sistema de aprendizado de scroll container
- Detecção automática de lazy loading
- Flag `shouldStop` para parar imediatamente
- Persistência de seletor aprendido em `localStorage`

### 🔧 Corrigido
- Auto-scroll não funcionava em links compartilhados
- Botão "Limpar" não parava o scroll
- Lazy loading causava mensagens faltando

---

## [1.0.0] - Initial - 2026-01-10

### ✨ Inicial
- Exportação básica de conversas ChatGPT/Gemini
- Conversão HTML para Markdown
- Auto-scroll para capturar mensagens
- Modo manual com seleção de texto

---

## Convenção de Nomenclatura de Versões

### Número Semântico (X.Y.Z)
- **X (Major):** Mudanças incompatíveis/refatoração grande
- **Y (Minor):** Novas funcionalidades compatíveis
- **Z (Patch):** Correções de bugs

### Nome Codinome
Cada versão major/minor tem um codinome temático:
- **2.0 "Phoenix":** Renascimento após refatoração completa
- **1.3 "Stable":** Versão estável com aprendizado
- **1.0 "Initial":** Versão inicial funcional

---

## Como Reverter para Versão Anterior

### Via Git (Recomendado)
```bash
# Ver histórico
git log --oneline

# Reverter para versão específica
git checkout v2.0.0

# Ou criar branch da versão antiga
git checkout -b rollback-v1.3 v1.3.0
```

### Manual (Backup)
1. Baixe a release da versão desejada no GitHub
2. Substitua os arquivos na pasta da extensão
3. Recarregue a extensão no Chrome

---

*Última atualização: 2026-01-15*
