import fs from 'node:fs';
import path from 'node:path';

const INDEX_ENTRY_REGEX = /^@(.+?) \| (.+?) \| (.+)$/;
const SECTION_OPEN_REGEX = /^<!-- SECTION:(\S+) \| keywords: (.+?) \| (.+?) -->$/;
const SECTION_CLOSE_REGEX = /^<!-- \/SECTION:(\S+) -->$/;
const RELATED_REGEX = /^<!-- RELATED: (.+?) -->$/;
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---/;
const GENERIC_KEYWORDS = new Set(['general', 'misc', 'other', 'stuff', 'section', 'topic']);
const GENERIC_TOPICS = new Set(['misc', 'general', 'other', 'stuff', 'topic']);

function normalizePath(value) {
  return value.replace(/\\/g, '/');
}

function createIssue(severity, rule, file, line, message, suggestion) {
  return { severity, rule, file: normalizePath(file), line, message, suggestion };
}

function resolveSkillRoot(targetPath) {
  const absolute = path.resolve(targetPath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Path not found: ${targetPath}`);
  }

  const stat = fs.statSync(absolute);
  if (stat.isDirectory()) {
    const skillFile = path.join(absolute, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      throw new Error(`SKILL.md not found in: ${targetPath}`);
    }
    return { rootDir: absolute, skillFile };
  }

  if (path.basename(absolute) !== 'SKILL.md') {
    throw new Error(`Expected a skill directory or SKILL.md file, got: ${targetPath}`);
  }

  return { rootDir: path.dirname(absolute), skillFile: absolute };
}

function parseFrontmatter(content) {
  const match = content.match(FRONTMATTER_REGEX);
  if (!match) {
    return { data: {}, hasFrontmatter: false };
  }

  const data = {};
  for (const rawLine of match[1].split(/\r?\n/)) {
    const separatorIndex = rawLine.indexOf(':');
    if (separatorIndex === -1) continue;
    const key = rawLine.slice(0, separatorIndex).trim();
    const value = rawLine.slice(separatorIndex + 1).trim();
    data[key] = value.replace(/^['"]|['"]$/g, '');
  }

  return { data, hasFrontmatter: true };
}

function parseIndexEntries(content, filePath) {
  const lines = content.split(/\r?\n/);
  const entries = [];
  let inIndex = false;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (line === '<!-- INDEX') {
      inIndex = true;
      continue;
    }
    if (inIndex && line === '-->') {
      inIndex = false;
      continue;
    }
    if (!inIndex || !line.trim()) continue;

    const match = line.match(INDEX_ENTRY_REGEX);
    if (match) {
      entries.push({
        target: match[1],
        topic: match[2],
        description: match[3],
        filePath,
        line: index + 1,
      });
    } else {
      entries.push({
        invalid: true,
        raw: line,
        filePath,
        line: index + 1,
      });
    }
  }

  return entries;
}

function parseSections(content, filePath) {
  const lines = content.split(/\r?\n/);
  const sections = [];
  const issues = [];
  const openStack = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const openMatch = line.match(SECTION_OPEN_REGEX);
    if (openMatch) {
      const section = {
        id: openMatch[1],
        keywords: openMatch[2].split(',').map((keyword) => keyword.trim()).filter(Boolean),
        description: openMatch[3],
        startLine: index + 1,
        endLine: null,
        related: [],
        filePath,
      };
      sections.push(section);
      openStack.push(section);
      continue;
    }

    const relatedMatch = line.match(RELATED_REGEX);
    if (relatedMatch && openStack.length > 0) {
      openStack[openStack.length - 1].related.push({
        target: relatedMatch[1].trim(),
        line: index + 1,
      });
      continue;
    }

    const closeMatch = line.match(SECTION_CLOSE_REGEX);
    if (!closeMatch) continue;

    const open = openStack.pop();
    if (!open || open.id !== closeMatch[1]) {
      issues.push(
        createIssue(
          'error',
          'section-close-mismatch',
          filePath,
          index + 1,
          `Section close marker does not match an open section: ${closeMatch[1]}.`,
          'Fix the SECTION markers so each open marker closes with the same id.'
        )
      );
      continue;
    }

    open.endLine = index + 1;
  }

  for (const open of openStack) {
    issues.push(
      createIssue(
        'error',
        'section-not-closed',
        filePath,
        open.startLine,
        `Section "${open.id}" is missing its closing marker.`,
        'Add a matching <!-- /SECTION:{id} --> marker.'
      )
    );
  }

  return { sections, issues };
}

function getFileContent(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function addIssue(report, issue) {
  report.issues.push(issue);
}

function ensureNoDuplicateSections(report, sections, relativeFile) {
  const byId = new Map();
  for (const section of sections) {
    const list = byId.get(section.id) ?? [];
    list.push(section);
    byId.set(section.id, list);
  }

  for (const [sectionId, matches] of byId.entries()) {
    if (matches.length > 1) {
      addIssue(
        report,
        createIssue(
          'error',
          'duplicate-section-id',
          relativeFile,
          matches[1].startLine,
          `Section id "${sectionId}" is defined multiple times in the same file.`,
          'Rename duplicate section ids so each id is unique within the file.'
        )
      );
    }
  }
}

function resolveRelatedTarget(target, currentFileRelative, rootDir) {
  if (target.startsWith('#')) {
    return {
      targetFile: currentFileRelative,
      targetSection: target.slice(1),
    };
  }

  const hashIndex = target.indexOf('#');
  if (hashIndex === -1) {
    return {
      invalid: true,
      targetFile: currentFileRelative,
      targetSection: '',
    };
  }

  const relativeFile = normalizePath(target.slice(0, hashIndex));
  const targetSection = target.slice(hashIndex + 1);
  const resolvedFile = normalizePath(path.relative(rootDir, path.resolve(rootDir, relativeFile)));

  return {
    targetFile: resolvedFile,
    targetSection,
  };
}

function addLintChecks(report, context) {
  const { rootDir, skillFile, frontmatter, tier, fileData } = context;
  const skillRelative = normalizePath(path.relative(rootDir, skillFile));

  if (!frontmatter.hasFrontmatter) {
    addIssue(
      report,
      createIssue(
        'error',
        'frontmatter-missing',
        skillRelative,
        1,
        'SKILL.md is missing YAML frontmatter.',
        'Add frontmatter with name, description, and indexed-skill.'
      )
    );
  }

  if (!frontmatter.data['indexed-skill']) {
    addIssue(
      report,
      createIssue(
        'error',
        'indexed-skill-missing',
        skillRelative,
        1,
        'Frontmatter is missing the indexed-skill field.',
        'Set indexed-skill to "tier 1" or "tier 2".'
      )
    );
  } else if (!['tier 1', 'tier 2'].includes(frontmatter.data['indexed-skill'])) {
    addIssue(
      report,
      createIssue(
        'error',
        'indexed-skill-invalid',
        skillRelative,
        1,
        `Unsupported indexed-skill value: ${frontmatter.data['indexed-skill']}.`,
        'Use "tier 1" or "tier 2".'
      )
    );
  }

  const skillData = fileData.get(skillRelative);
  for (const entry of skillData.indexEntries) {
    if (!entry.invalid) continue;
    addIssue(
      report,
      createIssue(
        'error',
        'index-entry-invalid',
        skillRelative,
        entry.line,
        `Invalid INDEX entry: ${entry.raw}.`,
        'Use the format @target | topic | description.'
      )
    );
  }

  for (const [relativeFile, data] of fileData.entries()) {
    for (const issue of data.parseIssues) {
      addIssue(report, issue);
    }
    ensureNoDuplicateSections(report, data.sections, relativeFile);
  }

  if (tier === 'tier 1') {
    const sectionIds = new Set(skillData.sections.map((section) => section.id));
    for (const entry of skillData.indexEntries.filter((item) => !item.invalid)) {
      if (!sectionIds.has(entry.target)) {
        addIssue(
          report,
          createIssue(
            'error',
            'index-target-not-found',
            skillRelative,
            entry.line,
            `INDEX target "${entry.target}" does not match any section in SKILL.md.`,
            'Create the referenced section or fix the INDEX target id.'
          )
        );
      }
    }
  }

  if (tier === 'tier 2') {
    for (const entry of skillData.indexEntries.filter((item) => !item.invalid)) {
      const relativeTarget = normalizePath(entry.target);
      if (!fileData.has(relativeTarget)) {
        addIssue(
          report,
          createIssue(
            'error',
            'index-target-file-not-found',
            skillRelative,
            entry.line,
            `INDEX target file "${relativeTarget}" does not exist.`,
            'Create the referenced section file or fix the INDEX entry path.'
          )
        );
      }
    }
  }

  for (const [relativeFile, data] of fileData.entries()) {
    const sectionById = new Map(data.sections.map((section) => [section.id, section]));
    for (const section of data.sections) {
      for (const related of section.related) {
        const resolution = resolveRelatedTarget(related.target, relativeFile, rootDir);
        if (resolution.invalid) {
          addIssue(
            report,
            createIssue(
              'error',
              'related-format-invalid',
              relativeFile,
              related.line,
              `RELATED reference "${related.target}" is missing "#section-id".`,
              'Use #section-id or path/to/file.md#section-id.'
            )
          );
          continue;
        }

        if (!fileData.has(resolution.targetFile)) {
          addIssue(
            report,
            createIssue(
              'error',
              'related-file-not-found',
              relativeFile,
              related.line,
              `RELATED target file "${resolution.targetFile}" does not exist.`,
              'Fix the RELATED path or create the referenced file.'
            )
          );
          continue;
        }

        const targetFileData = fileData.get(resolution.targetFile);
        const exists = targetFileData.sections.some((targetSection) => targetSection.id === resolution.targetSection);
        if (!exists) {
          addIssue(
            report,
            createIssue(
              'error',
              'related-target-not-found',
              relativeFile,
              related.line,
              `RELATED target "${related.target}" does not resolve to an existing section.`,
              'Point RELATED to a valid existing section id.'
            )
          );
        }
      }
    }
  }
}

function addDoctorWarnings(report, context) {
  const { fileData, tier } = context;
  const graph = new Map();

  for (const [relativeFile, data] of fileData.entries()) {
    for (const entry of data.indexEntries.filter((item) => !item.invalid)) {
      if (GENERIC_TOPICS.has(entry.topic.toLowerCase())) {
        addIssue(
          report,
          createIssue(
            'warning',
            'generic-index-topic',
            relativeFile,
            entry.line,
            `INDEX topic "${entry.topic}" is too generic for good retrieval.`,
            'Use a specific topic label that matches the user intent more closely.'
          )
        );
      }
    }

    for (const section of data.sections) {
      const nodeId = `${relativeFile}#${section.id}`;
      graph.set(nodeId, []);

      if (section.keywords.length < 3 || section.keywords.some((keyword) => GENERIC_KEYWORDS.has(keyword.toLowerCase()))) {
        addIssue(
          report,
          createIssue(
            'warning',
            'weak-keywords',
            relativeFile,
            section.startLine,
            `Section "${section.id}" has weak keywords for retrieval.`,
            'Use 3-8 specific search terms, including likely synonyms and API names.'
          )
        );
      }

      const sectionLength = (section.endLine ?? section.startLine) - section.startLine - 1;
      if (sectionLength < 10) {
        addIssue(
          report,
          createIssue(
            'warning',
            'section-too-short',
            relativeFile,
            section.startLine,
            `Section "${section.id}" is very short and may be too granular.`,
            'Merge it with an adjacent concept unless it must stand alone.'
          )
        );
      } else if (sectionLength > 200) {
        addIssue(
          report,
          createIssue(
            'warning',
            'section-too-long',
            relativeFile,
            section.startLine,
            `Section "${section.id}" is longer than 200 lines.`,
            'Split it by topic change or move supporting detail into a related section.'
          )
        );
      }

      if (section.related.length > 3) {
        addIssue(
          report,
          createIssue(
            'warning',
            'too-many-related-links',
            relativeFile,
            section.startLine,
            `Section "${section.id}" has ${section.related.length} RELATED links.`,
            'Keep RELATED focused on the highest-value dependencies.'
          )
        );
      }
    }
  }

  for (const [relativeFile, data] of fileData.entries()) {
    for (const section of data.sections) {
      const sourceId = `${relativeFile}#${section.id}`;
      for (const related of section.related) {
        const resolution = resolveRelatedTarget(related.target, relativeFile, context.rootDir);
        if (resolution.invalid || !fileData.has(resolution.targetFile)) continue;
        const targetData = fileData.get(resolution.targetFile);
        const targetExists = targetData.sections.some((targetSection) => targetSection.id === resolution.targetSection);
        if (!targetExists) continue;
        graph.get(sourceId)?.push(`${resolution.targetFile}#${resolution.targetSection}`);
      }
    }
  }

  for (const [node, targets] of graph.entries()) {
    for (const target of targets) {
      const reverse = graph.get(target) ?? [];
      if (reverse.includes(node) && node < target) {
        const [file, sectionId] = node.split('#');
        addIssue(
          report,
          createIssue(
            'warning',
            'related-cycle',
            file,
            fileData.get(file).sections.find((section) => section.id === sectionId)?.startLine ?? 1,
            `Direct RELATED cycle detected between "${node}" and "${target}".`,
            'Keep cycles only when both directions are genuinely necessary.'
          )
        );
      }
    }
  }

  if (tier === 'tier 1') {
    const skillData = fileData.get('SKILL.md');
    if (skillData.sections.length > 0 && skillData.sections.every((section) => section.related.length === 0)) {
      addIssue(
        report,
        createIssue(
          'info',
          'no-related-links',
          'SKILL.md',
          skillData.sections[0].startLine,
          'No RELATED links found. Navigation may still work, but adjacent context discovery is limited.',
          'Add RELATED markers only where a second section is often needed.'
        )
      );
    }
  }
}

export function analyzeIndexedSkill(targetPath) {
  const { rootDir, skillFile } = resolveSkillRoot(targetPath);
  const report = {
    rootDir,
    skillFile: normalizePath(path.relative(rootDir, skillFile)),
    issues: [],
    summary: { errors: 0, warnings: 0, infos: 0 },
  };

  const skillContent = getFileContent(skillFile);
  const frontmatter = parseFrontmatter(skillContent);
  const tier = frontmatter.data['indexed-skill'];
  const fileData = new Map();

  const skillRelative = normalizePath(path.relative(rootDir, skillFile));
  const skillParsed = parseSections(skillContent, skillRelative);
  fileData.set(skillRelative, {
    sections: skillParsed.sections,
    parseIssues: skillParsed.issues,
    indexEntries: parseIndexEntries(skillContent, skillRelative),
  });

  if (tier === 'tier 2') {
    for (const entry of fileData.get(skillRelative).indexEntries.filter((item) => !item.invalid)) {
      const absoluteTarget = path.join(rootDir, entry.target);
      if (!fs.existsSync(absoluteTarget)) continue;
      const relativeTarget = normalizePath(entry.target);
      if (fileData.has(relativeTarget)) continue;
      const content = getFileContent(absoluteTarget);
      const parsed = parseSections(content, relativeTarget);
      fileData.set(relativeTarget, {
        sections: parsed.sections,
        parseIssues: parsed.issues,
        indexEntries: [],
      });
    }
  }

  for (const [relativeFile, data] of [...fileData.entries()]) {
    for (const section of data.sections) {
      for (const related of section.related) {
        if (related.target.startsWith('#')) continue;
        const hashIndex = related.target.indexOf('#');
        if (hashIndex === -1) continue;
        const relatedFile = normalizePath(related.target.slice(0, hashIndex));
        if (fileData.has(relatedFile)) continue;
        const absoluteRelated = path.join(rootDir, relatedFile);
        if (!fs.existsSync(absoluteRelated)) continue;
        const relatedContent = getFileContent(absoluteRelated);
        const parsed = parseSections(relatedContent, relatedFile);
        fileData.set(relatedFile, {
          sections: parsed.sections,
          parseIssues: parsed.issues,
          indexEntries: [],
        });
      }
    }
  }

  addLintChecks(report, { rootDir, skillFile, frontmatter, tier, fileData });
  addDoctorWarnings(report, { rootDir, tier, fileData });

  for (const issue of report.issues) {
    if (issue.severity === 'error') report.summary.errors += 1;
    if (issue.severity === 'warning') report.summary.warnings += 1;
    if (issue.severity === 'info') report.summary.infos += 1;
  }

  return report;
}

function printIssues(issues) {
  for (const issue of issues) {
    const location = issue.line ? `${issue.file}:${issue.line}` : issue.file;
    console.log(`[${issue.severity}] ${issue.rule} ${location}`);
    console.log(`  ${issue.message}`);
    if (issue.suggestion) {
      console.log(`  suggestion: ${issue.suggestion}`);
    }
  }
}

export function runLint(targetPath, { json = false } = {}) {
  const report = analyzeIndexedSkill(targetPath);
  const issues = report.issues.filter((issue) => issue.severity === 'error');

  if (json) {
    console.log(JSON.stringify({
      summary: { errors: report.summary.errors },
      issues,
    }, null, 2));
  } else if (issues.length === 0) {
    console.log('Lint passed. No structural issues found.');
  } else {
    printIssues(issues);
    console.log(`\n${issues.length} error(s) found.`);
  }

  return {
    ok: issues.length === 0,
    report,
  };
}

export function runDoctor(targetPath, { json = false } = {}) {
  const report = analyzeIndexedSkill(targetPath);

  if (json) {
    console.log(JSON.stringify({
      summary: report.summary,
      issues: report.issues,
    }, null, 2));
  } else if (report.issues.length === 0) {
    console.log('Doctor found no issues.');
  } else {
    printIssues(report.issues);
    console.log(
      `\nSummary: ${report.summary.errors} error(s), ${report.summary.warnings} warning(s), ${report.summary.infos} info item(s).`
    );
  }

  return report;
}
