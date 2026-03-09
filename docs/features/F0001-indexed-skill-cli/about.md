# Task: Indexed Skill CLI (idx-skill)

> **Branch:** feature/F0001-indexed-skill-cli
> **Feature:** F0001
> **Date:** 2026-03-09

---

## Objective

CLI `idx-skill` publicado no npm que instala as skills do repositório `indexed-skill-spec` nos diretórios corretos de cada provider AI suportado, com seleção interativa de providers e gerenciamento de `.gitignore`.

## Business Context

- **Why:** Consumidores do indexed-skill-spec precisam instalar manualmente as skills copiando arquivos para os diretórios corretos de cada provider — processo propenso a erros e difícil de atualizar.
- **Problem:** Não há forma automatizada de instalar e manter as indexed skills nos projetos consumidores.
- **Stakeholders:** Desenvolvedores que usam indexed-skill-spec em projetos com Claude Code, Codex, Google Antigravity ou OpenCode.

## Scope

### Included

- `cli/` — pacote npm `idx-skill` com binary `idx-skill`
- Comando `idx-skill install` — fluxo interativo: multiselect providers → confirm gitignore → download → instalar → manifest
- Comando `idx-skill update` — re-download da branch main e sobrescreve skills instaladas (lê manifest para saber quais providers)
- Comando `idx-skill list` — exibe skills instaladas, providers e data de instalação (lê manifest)
- Download sempre da branch `main` do repositório `xmaiconx/indexed-skill-spec` (sem gestão de releases/versões)
- Mapeamento de providers: claudecode, codex, antigravity, opencode com destinos corretos
- Gerenciamento de `.gitignore` com bloco comentado (default: sim)
- Manifest em `.indexed-skill/manifest.json` rastreando providers instalados e arquivos
- `node --test` nativo para testes (Node 18+)
- GitHub Actions CI: testes em PR e push para main, matrix Node 18/20/22
- GitHub Actions Release: publish ao npm em tags `v*` com `--provenance`

### Not Included

- Seleção de versão / branch customizada (sempre usa `main`)
- Instalação de skills customizadas além das do repositório
- Interface web ou GUI
- Suporte a providers além dos 4 listados (na v1)

## Business Rules

### Validations

- Pelo menos 1 provider deve ser selecionado; caso contrário, cancelar com mensagem amigável
- Se `.indexed-skill/manifest.json` existir no `update`, sobrescrever arquivos silenciosamente
- Provider já instalado no `install`: sobrescrever com log de aviso
- `.gitignore` só é modificado se o usuário confirmar (ou default aceito)
- Não duplicar entradas no `.gitignore` se o bloco já existir

### Flows

**Happy Path — install:**
1. Dev executa `npx idx-skill` ou `idx-skill install`
2. Intro exibe nome do tool
3. Multiselect: escolhe providers (claudecode, codex, antigravity, opencode)
4. Confirm: "Add installed dirs to .gitignore? (Y/n)"
5. Spinner: baixa ZIP da branch main do GitHub
6. Spinner: extrai e copia `skills/` para cada destino por provider
7. Atualiza `.gitignore` (se confirmado) com bloco `# idx-skill`
8. Escreve `.indexed-skill/manifest.json`
9. Outro: "Installed successfully ✓"

**Happy Path — update:**
1. Dev executa `idx-skill update`
2. Lê `.indexed-skill/manifest.json` → obtém providers anteriores
3. Spinner: baixa ZIP da branch main
4. Sobrescreve skills nos destinos dos providers registrados
5. Atualiza manifest com novo `installedAt`
6. Outro: "Updated successfully ✓"

**Happy Path — list:**
1. Dev executa `idx-skill list`
2. Lê `.indexed-skill/manifest.json`
3. Exibe tabela: providers instalados, diretórios, data, total de arquivos

**Alternative — install sem manifest existente no update:**
1. `idx-skill update` sem manifest → exibe erro: "No installation found. Run `idx-skill install` first."

**Error:**
1. GitHub inacessível → mensagem de erro clara com sugestão de checar conexão
2. Nenhum provider selecionado → "No providers selected. Installation cancelled."

## Decisions

| Context | Decision | Rationale |
|---------|----------|-----------|
| Source das skills | Diretório `skills/` genérico (mesmo para todos providers) | Skills são provider-agnostic por design da ISS spec |
| Versão do source | Sempre branch `main` | Elimina complexidade de gestão de releases; ISS spec é pequeno o suficiente para isso |
| Manifest location | `.indexed-skill/manifest.json` | Namespace próprio, não conflita; prepara para update/list |
| Binary name | `idx-skill` | Alinhado ao nome npm `idx-skill` |
| Test runner | `node --test` nativo | Sem dependência extra; Node 18+ já tem suporte |
| npm publish | Trigger em tags `v*` via GitHub Actions | Padrão do ecossistema; `--provenance` aumenta confiança |

## Edge Cases

| Name | Description | Strategy |
|------|-------------|----------|
| Provider já instalado | Diretório de destino já existe com arquivos | Sobrescrever com log de aviso |
| GitHub inacessível | Download falha | Erro claro com instrução para checar conexão |
| Nenhum provider selecionado | Usuário cancela multiselect | Cancelar instalação com mensagem amigável |
| `.gitignore` já tem bloco | Bloco `# idx-skill` já existe | Não duplicar; skip silencioso |
| `idx-skill update` sem install prévia | Manifest não existe | Erro: "Run `idx-skill install` first" |
| skills/ vazio no ZIP | Repositório sem skills | Aviso: "No skills found in source" |

## Acceptance Criteria

- [ ] `npx idx-skill` inicia fluxo interativo com multiselect de 4 providers
- [ ] Seleção de claudecode instala em `.claude/skills/` no projeto consumidor
- [ ] Seleção de codex instala em `.agent/skills/`
- [ ] Seleção de antigravity instala em `.agents/skills/`
- [ ] Seleção de opencode instala em `.opencode/skills/`
- [ ] `.gitignore` é atualizado com bloco comentado quando confirmado (default sim)
- [ ] `.indexed-skill/manifest.json` é criado com providers, arquivos e timestamp
- [ ] `idx-skill update` re-instala usando providers do manifest existente
- [ ] `idx-skill list` exibe providers, diretórios e data da instalação
- [ ] `npm test` passa (node --test nativo) em Node 18, 20, 22
- [ ] GitHub Actions CI roda testes em PR e push para main
- [ ] GitHub Actions Release publica ao npm com `--provenance` em tags `v*`
- [ ] Nenhum provider selecionado cancela graciosamente (sem crash)

## Spec (Token-Efficient)

```
cli/
  bin/idx-skill.js       → entry point, parseArgs (install|update|list)
  src/
    providers.js         → PROVIDERS map: {claudecode,codex,antigravity,opencode} → {label,hint,src,dest}
    installer.js         → install(), update(), list(); download zip, extract, copy files
    prompt.js            → promptProviders() multiselect, promptGitignore() confirm
    gitignore.js         → writeGitignoreBlock(), hasBlock(), getInstalledDirs()
    github.js            → downloadBranchZip(branch='main') → Buffer
    manifest.js          → writeManifest(), readManifest()
  package.json           → name: idx-skill, bin: {idx-skill: ./bin/idx-skill.js}, type: module
  test/
    providers.test.js
    gitignore.test.js
    manifest.test.js

.github/workflows/
  ci.yml                 → on: PR + push main; matrix: node 18/20/22; working-dir: cli/
  release.yml            → on: tags v*; npm publish --provenance

PROVIDERS:
  claudecode → src: skills/, dest: .claude/skills/
  codex      → src: skills/, dest: .agent/skills/
  antigravity→ src: skills/, dest: .agents/skills/
  opencode   → src: skills/, dest: .opencode/skills/

MANIFEST: .indexed-skill/manifest.json
  {installedAt, providers[], files[], hashes{}}
```

## Next Steps

Pronto para implementação. Executar `/add-dev` para desenvolvimento.

Ordem de implementação sugerida:
1. `cli/package.json` + estrutura de diretórios
2. `src/providers.js` — mapeamento
3. `src/github.js` — download da branch main
4. `src/manifest.js` — read/write
5. `src/gitignore.js` — gerenciamento de bloco
6. `src/prompt.js` — prompts interativos
7. `src/installer.js` — orquestração (install, update, list)
8. `bin/idx-skill.js` — entry point CLI
9. `test/` — testes com node --test
10. `.github/workflows/` — CI + release
