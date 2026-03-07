# Indexed Skills Specification (ISS) v0.1
> An open standard for surgical context loading in AI Agent Skills

---

## O Problema

O padrão atual de Agent Skills usa **Progressive Disclosure em 2 níveis**:

```
Nível 1: frontmatter YAML  →  ~5 linhas (sempre carregado)
Nível 2: corpo do SKILL.md →  pode ter 3000 linhas (tudo ou nada)
```

Se uma skill tem 3000 linhas e o agente precisa de 80 linhas sobre autenticação,
ele carrega **3000 linhas**. Desperdício de contexto, latência, custo.

**O que propomos:** um terceiro nível de precisão, inspirado em índices de banco de dados.

```
Nível 1: frontmatter YAML     →  ~10 linhas  (startup)
Nível 2: index.json           →  ~200 linhas (seleção de tópico)
Nível 3: seção específica     →  ~80 linhas  (execução)
Total: ~290 linhas, não 3000
```

---

## Analogias de Indexação Adaptadas

| Técnica Original          | Como Adaptamos                                      |
|--------------------------|-----------------------------------------------------|
| **Inverted Index** (Lucene/Elasticsearch) | `keywords[]` → `{file, lines}` no index.json |
| **B-Tree Index** (SQL)   | Hierarquia `topic → subtopic → section`             |
| **llms.txt**             | SKILL.md como "curated TOC" apontando pro índice    |
| **Sitemap.xml**          | index.json listando todos os arquivos + metadados   |
| **RAG Chunking**         | Chunks determinísticos com line ranges fixos        |
| **Book Index**           | Keyword → página → parágrafo específico             |

---

## Estrutura de Diretório

```
my-skill/
├── SKILL.md           # About + ponteiro para index.json (< 50 linhas)
├── index.json         # Índice estruturado de todo o conteúdo
├── sections/
│   ├── auth.md        # ~80-150 linhas por arquivo
│   ├── billing.md
│   ├── deployment.md
│   └── troubleshoot.md
└── scripts/
    └── helper.py
```

### Regra de ouro
- `SKILL.md` → identidade + ponteiro. **Nunca** conteúdo técnico.
- `index.json` → mapa completo. Suficiente para o agente decidir o que ler.
- `sections/*.md` → conteúdo real, isolado por responsabilidade.

---

## Especificação: SKILL.md

```yaml
---
name: my-skill
description: >
  Descrição clara do domínio e quando usar esta skill.
  Palavras-chave relevantes aqui para matching.
version: "0.1.0"
index: index.json          # ponteiro obrigatório neste padrão
license: MIT
---
```

```markdown
# My Skill

Breve parágrafo descritivo (2-4 linhas).
Não inclua conteúdo técnico aqui — use as seções indexadas.

> Este skill segue o padrão **Indexed Skills Specification (ISS) v0.1**
> Consulte `index.json` para navegar pelo conteúdo disponível.
```

**Tamanho máximo recomendado: 50 linhas.**

---

## Especificação: index.json

```json
{
  "$schema": "https://indexed-skills.dev/schema/v0.1.json",
  "version": "0.1",
  "skill": "my-skill",
  "generated_at": "2026-03-07T00:00:00Z",
  "total_lines": 3200,
  "sections": [
    {
      "id": "auth-overview",
      "topic": "authentication",
      "subtopic": "overview",
      "label": "Visão geral de autenticação",
      "summary": "Explica os métodos suportados: OAuth2, JWT, API Key",
      "file": "sections/auth.md",
      "lines": [1, 45],
      "keywords": ["auth", "login", "oauth", "jwt", "token", "autenticação"],
      "triggers": [
        "como autenticar",
        "preciso fazer login",
        "configurar oauth"
      ],
      "related": ["auth-jwt", "auth-oauth"],
      "complexity": "basic"
    },
    {
      "id": "auth-jwt",
      "topic": "authentication",
      "subtopic": "jwt",
      "label": "Implementação JWT",
      "summary": "Como gerar, validar e renovar tokens JWT",
      "file": "sections/auth.md",
      "lines": [46, 130],
      "keywords": ["jwt", "token", "bearer", "refresh", "expiration"],
      "triggers": [
        "jwt não está funcionando",
        "token expirado",
        "refresh token"
      ],
      "related": ["auth-overview", "troubleshoot-auth"],
      "complexity": "intermediate"
    },
    {
      "id": "billing-overview",
      "topic": "billing",
      "subtopic": "overview",
      "label": "Sistema de cobrança",
      "summary": "Stripe integration, planos e webhooks",
      "file": "sections/billing.md",
      "lines": [1, 60],
      "keywords": ["billing", "pagamento", "stripe", "plano", "cobrança"],
      "triggers": [
        "configurar pagamento",
        "integrar stripe",
        "webhook de cobrança"
      ],
      "related": ["billing-webhooks"],
      "complexity": "intermediate"
    }
  ],
  "topic_tree": {
    "authentication": ["auth-overview", "auth-jwt", "auth-oauth"],
    "billing": ["billing-overview", "billing-webhooks"],
    "deployment": ["deploy-docker", "deploy-k8s"],
    "troubleshooting": ["troubleshoot-auth", "troubleshoot-billing"]
  }
}
```

---

## Como o Agente Deve Usar

O agente segue este algoritmo determinístico:

```
1. STARTUP
   └── Lê SKILL.md frontmatter → sabe que a skill existe e quando usar

2. INVOCAÇÃO (skill relevante detectada)
   └── Lê index.json completo → ~200 linhas
       └── Analisa: keywords[], triggers[], summary de cada seção

3. SELEÇÃO CIRÚRGICA
   └── Identifica IDs relevantes (ex: ["auth-jwt", "auth-overview"])
       └── Lê sections/auth.md linhas 1-130 → ~130 linhas

4. EXECUÇÃO
   └── Trabalha com ~330 linhas totais
       └── (vs 3200 linhas sem indexação)
```

### Exemplo de instrução para o agente (em SKILL.md)

```markdown
## Como usar este skill

1. Leia `index.json` para identificar seções relevantes
2. Use `keywords` e `triggers` para matching com a tarefa atual
3. Leia APENAS os arquivos e line ranges identificados
4. Se precisar de contexto adicional, verifique o campo `related`
5. Nunca carregue todo o conteúdo sem consultar o índice primeiro
```

---

## Algoritmo de Matching Recomendado

O agente pode usar qualquer uma destas estratégias, em ordem de preferência:

### 1. Trigger Matching (mais preciso)
Compara a intenção do usuário com os `triggers[]` de cada seção.
```
user: "meu token jwt está expirado"
match: section "auth-jwt" (trigger: "token expirado") → score: 0.95
```

### 2. Keyword Intersection
Intersecção entre palavras da query e `keywords[]` de cada seção.
```
user: "configurar refresh token"
keywords da query: ["configurar", "refresh", "token"]
seção "auth-jwt": ["jwt", "token", "bearer", "refresh"] → 2 matches
```

### 3. Topic Tree Navigation
Navega pela `topic_tree` quando o tópico geral é claro.
```
user: "problemas com pagamento"
topic detectado: "billing"
→ lê sections: ["billing-overview", "billing-webhooks"]
```

### 4. Related Chain
Expande leitura via `related[]` se a primeira seção não for suficiente.
```
leu: "auth-overview"
não resolveu → lê "auth-jwt" (está em related[])
```

---

## Convenções de Nomeação

| Campo | Convenção | Exemplo |
|-------|-----------|---------|
| `id` | `{topic}-{subtopic}` | `auth-jwt` |
| `topic` | snake_case singular | `authentication` |
| `subtopic` | snake_case | `jwt_tokens` |
| `file` | `sections/{topic}.md` | `sections/auth.md` |
| `lines` | `[start, end]` inclusivo, 1-indexed | `[46, 130]` |

---

## Campo `complexity`

| Valor | Significado |
|-------|-------------|
| `basic` | Conceito geral, leitura recomendada primeiro |
| `intermediate` | Implementação prática |
| `advanced` | Edge cases, tuning, detalhes internos |
| `reference` | Tabelas, listas de API, não narrativo |

---

## Tooling: index.json Generator

Um script `generate-index.py` pode ser incluído na skill para
manter o index.json atualizado automaticamente:

```python
# Lê todos os sections/*.md
# Extrai headings H2/H3 como topics/subtopics
# Conta linhas por seção
# Atualiza index.json mantendo keywords/triggers manuais
```

---

## Comparação com Padrão Atual

| | SKILL.md Padrão Atual | ISS v0.1 |
|---|---|---|
| Nível 1 | frontmatter (~10 linhas) | frontmatter + ponteiro (~15 linhas) |
| Nível 2 | corpo do SKILL.md (ilimitado) | index.json (~200 linhas) |
| Nível 3 | arquivos extras (inferido) | sections com line ranges (determinístico) |
| Matching | semântico (LLM decide) | keywords + triggers + topic_tree |
| Linha total (exemplo) | 3200 | ~330 |
| Compatibilidade | — | 100% retrocompatível com Agent Skills spec |

---

## Compatibilidade

Este padrão é **100% compatível** com o Agent Skills spec atual:
- `SKILL.md` ainda começa com frontmatter YAML válido
- A presença de `index: index.json` é um campo de metadados opcional
- Skills sem `index.json` continuam funcionando normalmente
- Agentes que não entendem ISS simplesmente ignoram o campo `index`

---

## Roadmap

- [ ] v0.1 — Especificação base (este documento)
- [ ] v0.2 — JSON Schema formal para validação do index.json
- [ ] v0.3 — CLI: `iss generate` para auto-gerar index.json
- [ ] v0.4 — CLI: `iss validate` para checar conformidade
- [ ] v0.5 — Suporte a `embeddings` opcionais por seção (vetor semântico pré-computado)
- [ ] v1.0 — Estável, submetido para agentskills/agentskills

---

## Repositório Sugerido

```
github.com/seu-usuario/indexed-skills-spec
├── README.md
├── SPEC.md              # este documento
├── schema/
│   └── v0.1.json        # JSON Schema para validação
├── examples/
│   ├── simple-skill/    # skill pequena usando ISS
│   └── large-skill/     # skill com 3000+ linhas usando ISS
├── tools/
│   ├── generate.py      # gera index.json a partir de sections/
│   └── validate.py      # valida conformidade com o schema
└── CONTRIBUTING.md
```

---

*Indexed Skills Specification (ISS) v0.1 — Proposta aberta para contribuição da comunidade*
*Inspirado em: Agent Skills (Anthropic), llms.txt (Jeremy Howard/Answer.AI), Inverted Index (Lucene)*
