# Discovery: Indexed Skill CLI (idx-skill)

> **Branch:** feature/F0001-indexed-skill-cli
> **Feature:** F0001
> **Date:** 2026-03-09

---

## Codebase Analysis

### Commit History
- `d829322` — created nano banana indexed skill
- `c2ba634` — fix: allow additional frontmatter fields in JSON Schema
- `0aa9157` — fix: improve skill descriptions and add indexed-skill gate criteria
- `056bbc2` — feat: add JSON Schema v0.1 for indexed skill validation
- `3873c8a` — feat: add indexed-skill-creator meta-skill

### Related Files

**Source das skills (o que será instalado):**
- `skills/indexed-skill/SKILL.md` — Consumer skill (tier 1)
- `skills/indexed-skill-creator/SKILL.md` — Creator skill (tier 1)
- `skills/gemini-nano-banana/SKILL.md` + `skills/gemini-nano-banana/sections/*.md` — Exemplo real tier 2

**Estrutura de providers no repositório (confirma os destinos):**
- `.claude/skills/` — destino para claudecode
- `.agents/skills/` — destino para antigravity
- `.opencode/skills/` — destino para opencode
- `.agent/` — destino para codex (usa `skills/` subdirectory no destino)

**Referência externa (arquitetura do CLI):**
- `C:/github/xmaiconx/code-addiction/cli/src/providers.js` — padrão PROVIDERS map
- `C:/github/xmaiconx/code-addiction/cli/src/installer.js` — orquestração, AdmZip, manifest
- `C:/github/xmaiconx/code-addiction/cli/src/prompt.js` — @clack/prompts
- `C:/github/xmaiconx/code-addiction/cli/src/gitignore.js` — bloco comentado no .gitignore
- `C:/github/xmaiconx/code-addiction/cli/src/github.js` — download de branch ZIP
- `C:/github/xmaiconx/code-addiction/.github/workflows/ci.yml` — CI pattern
- `C:/github/xmaiconx/code-addiction/.github/workflows/release.yml` — Release + npm publish pattern

### Similar Features

- `code-addiction/cli` — CLI completo para instalação de framework skills; reusar arquitetura exata (providers, installer, prompt, gitignore, github, manifest). Diferença principal: source é `skills/` genérico (não `framwork/.claude` etc.) e sempre baixa da branch `main` (não latest release tag).

### Patterns

- **ES Modules** (`"type": "module"`) — sem CommonJS
- **@clack/prompts** para UX interativa (intro, outro, spinner, multiselect, confirm, log)
- **adm-zip** para extração de ZIP in-memory (sem escrita em disco temporário)
- **node:fs, node:path, node:crypto** nativos — sem dependências extras para I/O
- **node --test** nativo para testes (Node 18+)
- **GitHub ZIP download** via `https://github.com/{owner}/{repo}/archive/refs/heads/{branch}.zip`

## Technical Context

### Infrastructure

- Repositório: `github.com/xmaiconx/indexed-skill-spec`
- npm package: `idx-skill`
- CLI located in `cli/` subdiretório do repositório
- Node.js 18+ (suporte nativo a `--test` e ESM estável)
- GitHub Actions para CI e publish automático ao npm

### Dependencies

```json
{
  "dependencies": {
    "@clack/prompts": "^0.x",
    "adm-zip": "^0.x"
  }
}
```

Sem dependências de test runner (node --test nativo).

### Integration Points

- **GitHub API**: `https://github.com/xmaiconx/indexed-skill-spec/archive/refs/heads/main.zip` — download direto sem autenticação
- **npm registry**: publish via GitHub Actions com `NODE_AUTH_TOKEN`
- **Projeto consumidor**: escreve em `.claude/skills/`, `.agent/skills/`, `.agents/skills/`, `.opencode/skills/` e `.gitignore`

## Files Mapping

### To Create

```
cli/
  bin/idx-skill.js             → entry point; parseArgs → roteamento de comandos
  src/providers.js             → PROVIDERS map + resolveSelected()
  src/github.js                → downloadBranchZip(branch) → Buffer
  src/manifest.js              → writeManifest(), readManifest()
  src/gitignore.js             → writeGitignoreBlock(), hasBlock()
  src/prompt.js                → promptProviders() multiselect, promptGitignore() confirm
  src/installer.js             → install(), update(), list()
  package.json                 → name: idx-skill, bin, type: module, deps
  test/
    providers.test.js          → testa PROVIDERS map e resolveSelected
    gitignore.test.js          → testa writeGitignoreBlock, hasBlock
    manifest.test.js           → testa writeManifest, readManifest

.github/workflows/
  ci.yml                       → PR + push main; matrix node 18/20/22; working-dir: cli/
  release.yml                  → tags v*; npm publish --provenance; working-dir: cli/
```

### To Modify

- Nenhum arquivo existente modificado — feature totalmente nova

## Technical Assumptions

| Assumption | Impact if Wrong |
|------------|-----------------|
| ZIP da branch main tem estrutura `indexed-skill-spec-main/skills/` | Path de extração incorreto — precisa ajustar prefixo no installer |
| `skills/` no repo contém apenas diretórios de skills (sem arquivos soltos) | Mapeamento de files pode incluir arquivos não esperados |
| GitHub permite download anônimo do ZIP de branch pública | Instalação falha para usuários sem autenticação |
| Node 18+ no ambiente do consumidor | `node --test` e ESM podem não funcionar em Node <18 |

## References

### Files Consulted

- `c:/github/xmaiconx/indexed-skill-spec/skills/` — source das skills
- `c:/github/xmaiconx/indexed-skill-spec/.claude/skills/` — confirma estrutura destino claudecode
- `c:/github/xmaiconx/indexed-skill-spec/.agents/skills/` — confirma estrutura destino antigravity
- `c:/github/xmaiconx/indexed-skill-spec/.opencode/skills/` — confirma estrutura destino opencode
- `c:/github/xmaiconx/indexed-skill-spec/.agent/` — confirma estrutura destino codex
- `C:/github/xmaiconx/code-addiction/cli/src/providers.js`
- `C:/github/xmaiconx/code-addiction/cli/src/installer.js`
- `C:/github/xmaiconx/code-addiction/.github/workflows/ci.yml`
- `C:/github/xmaiconx/code-addiction/.github/workflows/release.yml`

### Documentation

- README.md — spec da ISS v0.1, confirma estrutura de `skills/`

### Related Features (histórico)

- N/A — primeiro feature do projeto

## Related Features

| Feature | Relation | Key Files | Impact |
|---------|----------|-----------|--------|
| N/A | N/A | N/A | N/A |

<!-- refs: none -->

## Summary for Planning

### Executive Summary

CLI `idx-skill` a ser criado em `cli/` seguindo arquitetura do `code-addiction/cli`. Source das skills é sempre o diretório `skills/` da branch `main` do repositório. Instala nos destinos corretos por provider. Sem gestão de versões — simplicidade máxima.

### Key Decisions

- Source sempre `main` branch → sem `getLatestTag()`, sem flags `--version`/`--branch`
- `skills/` genérico para todos providers → sem versões platform-specific
- Manifest em `.indexed-skill/manifest.json` → habilita `update` e `list`
- `node --test` nativo → zero dependências de test

### Critical Files

- `cli/src/providers.js` — mapeamento de providers e destinos (crítico para instalação correta)
- `cli/src/installer.js` — orquestração central; extrai ZIP e copia para destinos
- `cli/src/github.js` — download; prefixo do ZIP precisa ser correto (`indexed-skill-spec-main/`)
- `.github/workflows/release.yml` — publish ao npm; requer secret `NPM_TOKEN`
