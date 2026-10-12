import { describe, it } from 'node:test';
import assert from 'node:assert';
import { credvidhiArchitecture } from '../src/data/credvidhiArchitectureData.ts';
import { kaushalnexusArchitecture } from '../src/data/kaushalnexusArchitectureData.ts';
import { ARCHIFY_SVGS } from '../src/data/architectureSvgs.ts';

describe('System Architecture Experience & Regression Test Suite', () => {
  it('CredVidhi architecture dataset has valid views and non-empty component nodes', () => {
    assert.strictEqual(credvidhiArchitecture.projectId, 'credvidhi');
    assert.ok(credvidhiArchitecture.views.length >= 3, 'CredVidhi must have at least 3 views');
    assert.ok(Object.keys(credvidhiArchitecture.components).length >= 8, 'Must have all core components');

    // Verify all view svgKeys resolve to valid SVGs
    for (const view of credvidhiArchitecture.views) {
      const svg = (ARCHIFY_SVGS.credvidhi as Record<string, string>)[view.svgKey];
      assert.ok(svg, `CredVidhi SVG for key '${view.svgKey}' must exist`);
      assert.ok(svg.startsWith('<svg'), 'SVG string must begin with <svg');
      assert.ok(svg.includes('</svg>'), 'SVG string must end with </svg>');
      assert.ok(svg.length > 5000, 'SVG must not be empty or truncated');
    }
  });

  it('Regression check: CredVidhi SVGs contain semantic nodes, connections, and legible text', () => {
    const topologySvg = ARCHIFY_SVGS.credvidhi.topology;
    assert.ok(topologySvg.includes('class="c-frontend"'), 'Must have styled frontend components');
    assert.ok(topologySvg.includes('class="c-backend"'), 'Must have styled backend components');
    assert.ok(topologySvg.includes('class="c-database"'), 'Must have styled database components');
    assert.ok(topologySvg.includes('class="a-emphasis"') || topologySvg.includes('class="a-default"'), 'Must have styled connections');
    assert.ok(topologySvg.includes('Borrowers'), 'Must render node label Borrowers');
    assert.ok(topologySvg.includes('FastAPI'), 'Must render node label FastAPI');
  });

  it('KaushalNexus architecture dataset has distinct project-specific components and views', () => {
    assert.strictEqual(kaushalnexusArchitecture.projectId, 'kaushal-nexus');
    assert.ok(kaushalnexusArchitecture.views.length >= 3, 'KaushalNexus must have at least 3 views');
    assert.ok(Object.keys(kaushalnexusArchitecture.components).length >= 8, 'Must have all core components');

    // Confirm KaushalNexus is strictly distinct from CredVidhi
    assert.notStrictEqual(kaushalnexusArchitecture.components, credvidhiArchitecture.components);
    assert.ok(kaushalnexusArchitecture.components['bkt-engine'], 'KaushalNexus must include BKT engine component');
    assert.ok(kaushalnexusArchitecture.components['matching-engine'], 'KaushalNexus must include matching engine component');
    assert.strictEqual(credvidhiArchitecture.components['bkt-engine'], undefined, 'CredVidhi must NOT have BKT engine');

    // Verify all KaushalNexus view svgKeys resolve to valid SVGs
    for (const view of kaushalnexusArchitecture.views) {
      const svg = (ARCHIFY_SVGS.kaushalnexus as Record<string, string>)[view.svgKey];
      assert.ok(svg, `KaushalNexus SVG for key '${view.svgKey}' must exist`);
      assert.ok(svg.startsWith('<svg'), 'SVG string must begin with <svg');
      assert.ok(svg.includes('</svg>'), 'SVG string must end with </svg>');
      assert.ok(svg.length > 5000, 'SVG must not be empty or truncated');
    }
  });

  it('Every component references unique node IDs and valid source paths', () => {
    [credvidhiArchitecture, kaushalnexusArchitecture].forEach((dataset) => {
      for (const [id, comp] of Object.entries(dataset.components)) {
        assert.strictEqual(id, comp.id, 'Dictionary key must match component ID');
        assert.ok(comp.name.length > 0, 'Component must have a name');
        assert.ok(comp.technology.length > 0, 'Component must declare implementation technology');
        assert.ok(comp.inputs.length > 0, 'Component must declare inputs');
        assert.ok(comp.outputs.length > 0, 'Component must declare outputs');
        assert.ok(comp.securityControls.length > 0, 'Component must declare security controls');
        assert.ok(comp.sourceReferences.length > 0, 'Component must declare verified source references');
      }
    });
  });

  it('Every engineering decision has valid architectural rationale and evidence', () => {
    [credvidhiArchitecture, kaushalnexusArchitecture].forEach((dataset) => {
      assert.ok(dataset.decisions.length >= 5, 'Dataset must have at least 5 architectural decisions');
      for (const dec of dataset.decisions) {
        assert.ok(dec.title.length > 0);
        assert.ok(dec.implementation.length > 0);
        assert.ok(dec.reason.length > 0);
        assert.ok(dec.tradeoff.length > 0);
        assert.ok(dec.evidence.length > 0);
      }
    });
  });
});
