---
name: indexed-skill
description: >
  Teaches AI agents how to consume Indexed Skills (ISS v0.1).
  Use when encountering a skill with indexed-skill in its frontmatter.
---

# Indexed Skill Consumer

## 1. Detection

When you load a skill's `SKILL.md`, check its YAML frontmatter for:

```
indexed-skill: tier 1
```

or

```
indexed-skill: tier 2
```

If present, do NOT read the full file. Follow the consumption algorithm for the detected tier below.

## 2. Tier 1 Consumption (single-file indexed skill)

All content lives in one `SKILL.md`. Sections are delimited by markers inside that file.

### Algorithm

1. **Read the index.** Grep for `<!-- INDEX` in `SKILL.md`. The index block contains entries in this format:

   ```
   @{id} | {topic} | {description}
   ```

   Parse each entry with regex: `@(.+?) \| (.+?) \| (.+)`

2. **Match sections.** Compare each entry's topic and description against your current task keywords. Select the most relevant section ID(s).

3. **Locate section boundaries.** For each matched `{id}`:
   - Grep `<!-- SECTION:{id}` to get the **start line number**.
   - Grep `<!-- /SECTION:{id}` to get the **end line number**.

4. **Read the line range.** Read only the lines between start and end (inclusive). Do not read the entire file.

5. **Follow related sections.** If the loaded section references other section IDs, repeat steps 3-4 for those sections.

## 3. Tier 2 Consumption (multi-file indexed skill)

Content is split across multiple files. The root `SKILL.md` contains an index that points to external files.

### Algorithm

1. **Read the index.** Grep for `<!-- INDEX` in `SKILL.md`. Entries use this format:

   ```
   @{filepath} | {topic} | {description}
   ```

   Parse each entry with regex: `@(.+?) \| (.+?) \| (.+)`

2. **Identify target file(s).** Match entry topics and descriptions against your current task keywords. Select the relevant filepath(s).

3. **List sections in target file.** Grep for `<!-- SECTION:` in the target file. Each section marker follows this format:

   ```
   <!-- SECTION:{id} | keywords: {kw1, kw2} | {title} -->
   ```

   Parse with regex: `<!-- SECTION:(\S+) \| keywords: (.+?) \| (.+?) -->`

4. **Match relevant section(s).** Compare section keywords and title against your task. Select the best match(es).

5. **Locate section boundaries.** For each matched `{id}`:
   - Grep `<!-- SECTION:{id}` to get the **start line number**.
   - Grep `<!-- /SECTION:{id}` to get the **end line number**.

6. **Read the line range.** Read only the lines between start and end (inclusive).

7. **Follow related sections.** If the loaded section references other section IDs or files, repeat from step 3 or step 2 as needed.

## 4. Regex Reference

| Purpose        | Pattern                                              |
|----------------|------------------------------------------------------|
| Index entry    | `@(.+?) \| (.+?) \| (.+)`                           |
| Section open   | `<!-- SECTION:(\S+) \| keywords: (.+?) \| (.+?) -->` |
| Section close  | `<!-- /SECTION:(\S+) -->`                            |

## 5. Best Practices

- **Never load the full file** without consulting the index first. The index exists to save tokens.
- **Use keyword matching** between your current task and the index entries to find relevant sections.
- **Prefer grep over full file reads.** Use grep to locate markers and read only the needed line ranges.
- **Follow references.** If the first matched section is insufficient or references related sections, load those too.
- **Respect tier boundaries.** Tier 1 stays within one file; Tier 2 navigates across files. Do not mix the algorithms.
- **Cache nothing across turns.** Line numbers may shift between conversations. Always grep for fresh positions.
