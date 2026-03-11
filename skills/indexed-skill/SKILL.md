---
name: indexed-skill
description: >
  How to consume Indexed Skills (ISS v0.1) efficiently — reading only
  the sections you need instead of the full file. MUST use this skill
  whenever you detect `indexed-skill: tier 1` or `indexed-skill: tier 2`
  in any skill's YAML frontmatter. Covers detection, index parsing,
  section grep, and surgical line-range reading for both tiers.
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

5. **Follow related sections.** Check for `<!-- RELATED: ... -->` tags at the end of the loaded section.
   - Same-file reference: `<!-- RELATED: #section-id -->`
   - Cross-file reference: `<!-- RELATED: path/to/file.md#section-id -->`
   - In Tier 1, prefer same-file references. If a path is present, resolve it relative to the skill root.
   - Follow RELATED tags only if the current section does not fully resolve the task.
   - Keep a set of visited targets and do not revisit the same section in the same traversal.

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
   <!-- SECTION:{id} | keywords: {kw1,kw2} | {title} -->
   ```

   Parse with regex: `<!-- SECTION:(\S+) \| keywords: (.+?) \| (.+?) -->`

4. **Match relevant section(s).** Compare section keywords and title against your task. Select the best match(es).

5. **Locate section boundaries.** For each matched `{id}`:
   - Grep `<!-- SECTION:{id}` to get the **start line number**.
   - Grep `<!-- /SECTION:{id}` to get the **end line number**.

6. **Read the line range.** Read only the lines between start and end (inclusive).

7. **Follow related sections.** Check for `<!-- RELATED: ... -->` tags at the end of the loaded section.
   - Same-file reference: `<!-- RELATED: #section-id -->`
   - Cross-file reference: `<!-- RELATED: path/to/file.md#section-id -->`
   - If the current section is insufficient, load the referenced section by repeating from step 3 for same-file references or step 2 for cross-file references.
   - Keep a set of visited targets and do not revisit the same section in the same traversal.

## 4. Regex Reference

| Purpose        | Pattern                                              |
|----------------|------------------------------------------------------|
| Index entry    | `@(.+?) \| (.+?) \| (.+)`                           |
| Section open   | `<!-- SECTION:(\S+) \| keywords: (.+?) \| (.+?) -->` |
| Section close  | `<!-- /SECTION:(\S+) -->`                            |
| Related ref    | `<!-- RELATED: (.+?) -->`                            |

## 5. Best Practices

- **Never load the full file** without consulting the index first. The index exists to save tokens.
- **Use keyword matching** between your current task and the index entries to find relevant sections.
- **Prefer grep over full file reads.** Use grep to locate markers and read only the needed line ranges.
- **Follow references.** If the first matched section is insufficient or references related sections, load those too.
- **Prefer local references in Tier 1.** Use `#section-id` for same-file navigation when all sections live in one `SKILL.md`.
- **Respect tier boundaries.** Tier 1 stays within one file; Tier 2 navigates across files. Do not mix the algorithms.
- **Avoid traversal loops.** Track visited RELATED targets during a single task.
- **Cache nothing across turns.** Line numbers may shift between conversations. Always grep for fresh positions.
