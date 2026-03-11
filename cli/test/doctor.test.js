import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { analyzeIndexedSkill } from '../src/doctor.js';

function writeFiles(rootDir, files) {
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(rootDir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
  }
}

describe('analyzeIndexedSkill()', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-skill-doctor-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns no issues for a valid tier 1 indexed skill', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'valid-tier1-'));
    writeFiles(dir, {
      'SKILL.md': `---
name: valid-skill
description: Valid indexed skill
indexed-skill: tier 1
---
# Valid Skill

<!-- INDEX
@auth-overview | auth | Authentication overview
@auth-jwt | jwt | JWT implementation
-->

<!-- SECTION:auth-overview | keywords: auth,login,oauth | Authentication overview -->
## Authentication

Line 1
Line 2
Line 3
Line 4
Line 5
Line 6
Line 7
Line 8
Line 9
Line 10
<!-- RELATED: #auth-jwt -->
<!-- /SECTION:auth-overview -->

<!-- SECTION:auth-jwt | keywords: jwt,token,bearer | JWT implementation -->
## JWT

Line 1
Line 2
Line 3
Line 4
Line 5
Line 6
Line 7
Line 8
Line 9
Line 10
<!-- /SECTION:auth-jwt -->
`,
    });

    const report = analyzeIndexedSkill(dir);
    assert.equal(report.summary.errors, 0);
    assert.equal(report.summary.warnings, 0);
    assert.equal(report.issues.length, 0);
  });

  it('reports lint errors for broken RELATED references and duplicate section ids', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'broken-tier1-'));
    writeFiles(dir, {
      'SKILL.md': `---
name: broken-skill
description: Broken indexed skill
indexed-skill: tier 1
---
# Broken Skill

<!-- INDEX
@dup-section | duplicate | Duplicate section
-->

<!-- SECTION:dup-section | keywords: auth,login,oauth | Duplicate section -->
## First

one
two
three
four
five
six
seven
eight
nine
ten
<!-- RELATED: #missing-section -->
<!-- /SECTION:dup-section -->

<!-- SECTION:dup-section | keywords: auth,login,oauth | Duplicate section again -->
## Second

one
two
three
four
five
six
seven
eight
nine
ten
<!-- /SECTION:dup-section -->
`,
    });

    const report = analyzeIndexedSkill(dir);
    const rules = report.issues.filter((issue) => issue.severity === 'error').map((issue) => issue.rule);

    assert.ok(rules.includes('duplicate-section-id'));
    assert.ok(rules.includes('related-target-not-found'));
    assert.equal(report.summary.errors, 2);
  });

  it('reports doctor warnings for weak keywords, oversized sections, and direct cycles', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'doctor-warnings-'));
    const longBody = Array.from({ length: 205 }, (_, index) => `Line ${index + 1}`).join('\n');

    writeFiles(dir, {
      'SKILL.md': `---
name: warning-skill
description: Warning indexed skill
indexed-skill: tier 1
---
# Warning Skill

<!-- INDEX
@short-section | misc | Short generic section
@large-section | implementation | Very large section
@cycle-a | links | Cyclic section A
@cycle-b | links | Cyclic section B
-->

<!-- SECTION:short-section | keywords: general | Generic section -->
## Short

one
two
three
four
five
<!-- /SECTION:short-section -->

<!-- SECTION:large-section | keywords: implementation,details,example | Large section -->
## Large

${longBody}
<!-- /SECTION:large-section -->

<!-- SECTION:cycle-a | keywords: cycle,link,test | Cycle A -->
## Cycle A

one
two
three
four
five
six
seven
eight
nine
ten
<!-- RELATED: #cycle-b -->
<!-- /SECTION:cycle-a -->

<!-- SECTION:cycle-b | keywords: cycle,link,test | Cycle B -->
## Cycle B

one
two
three
four
five
six
seven
eight
nine
ten
<!-- RELATED: #cycle-a -->
<!-- /SECTION:cycle-b -->
`,
    });

    const report = analyzeIndexedSkill(dir);
    const warningRules = report.issues
      .filter((issue) => issue.severity === 'warning')
      .map((issue) => issue.rule);

    assert.ok(warningRules.includes('weak-keywords'));
    assert.ok(warningRules.includes('section-too-short'));
    assert.ok(warningRules.includes('section-too-long'));
    assert.ok(warningRules.includes('related-cycle'));
    assert.equal(report.summary.errors, 0);
  });
});
