import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

describe('SEO, Canonicalization, and Routing Invariants', () => {
  test('vercel.json is valid JSON with correct SPA rewrites and 301 redirects', () => {
    const vercelConfigPath = path.join(rootDir, 'vercel.json');
    assert.ok(fs.existsSync(vercelConfigPath), 'vercel.json must exist');

    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));

    // 1. Verify cleanUrls
    assert.equal(config.cleanUrls, true, 'cleanUrls should be true for clean route matching');

    // 2. Verify SPA rewrite destination is "/" so cleanUrls does not loop into 404
    assert.ok(Array.isArray(config.rewrites), 'rewrites must be an array');
    const spaRewrite = config.rewrites.find(
      (r: { source: string; destination: string }) => r.source === '/((?!api/).*)'
    );
    assert.ok(spaRewrite, 'SPA catchall rewrite must exist');
    assert.equal(
      spaRewrite.destination,
      '/',
      'SPA catchall rewrite destination must be "/" when cleanUrls is true'
    );

    // 3. Verify permanent 301 redirects
    assert.ok(Array.isArray(config.redirects), 'redirects must be an array');
    const rpsRedirect = config.redirects.find(
      (r: { source: string }) => r.source === '/projects/rock-paper-scissors'
    );
    assert.ok(rpsRedirect, 'Redirect for deprecated rock-paper-scissors must exist');
    assert.equal(rpsRedirect.destination, '/projects/gemini-ai-chatbot');
    assert.equal(rpsRedirect.permanent, true);

    const kaushalRedirect = config.redirects.find(
      (r: { source: string }) => r.source === '/projects/kaushalnexus'
    );
    assert.ok(kaushalRedirect, 'Redirect for legacy /projects/kaushalnexus must exist');
    assert.equal(kaushalRedirect.destination, '/projects/kaushal-nexus');
    assert.equal(kaushalRedirect.permanent, true);
  });

  test('sitemap.xml contains valid canonical URLs and matching project slugs', () => {
    const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
    assert.ok(fs.existsSync(sitemapPath), 'sitemap.xml must exist in public directory');

    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

    // Extract all <loc> tags
    const locMatches = [...sitemapContent.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map(
      (m) => m[1]
    );

    assert.ok(locMatches.length >= 7, 'Sitemap should contain core routes and projects');

    // Domain consistency: all URLs must start with https://www.calligraphyguruji.dev
    for (const loc of locMatches) {
      assert.ok(
        loc.startsWith('https://www.calligraphyguruji.dev'),
        `All sitemap locations must use the canonical www domain. Found: ${loc}`
      );
      assert.ok(!loc.includes('.html'), `No .html extensions should be in sitemap: ${loc}`);
    }

    // Deprecated URLs should NOT be in sitemap
    assert.ok(
      !sitemapContent.includes('/projects/rock-paper-scissors'),
      'Deprecated rock-paper-scissors should not exist in sitemap'
    );
    assert.ok(
      !sitemapContent.includes('/projects/kaushalnexus<'),
      'Legacy unhyphenated kaushalnexus should not exist in sitemap'
    );

    // Read portfolioData source to extract project IDs without direct ESM import issues
    const portfolioDataContent = fs.readFileSync(
      path.join(rootDir, 'src', 'data', 'portfolioData.ts'),
      'utf8'
    );
    const idMatches = [...portfolioDataContent.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);

    // Canonical project URLs MUST be present
    const expectedProjectSlugs = [
      'credvidhi',
      'kaushal-nexus',
      'amazon-clone',
      'gemini-ai-chatbot',
      'leetcode-solutions',
      'youtube-clone',
    ];

    for (const slug of expectedProjectSlugs) {
      const expectedUrl = `https://www.calligraphyguruji.dev/projects/${slug}`;
      assert.ok(
        locMatches.includes(expectedUrl),
        `Expected project URL ${expectedUrl} to be listed in sitemap.xml`
      );

      // Must correspond to an actual project in portfolioData
      assert.ok(idMatches.includes(slug), `Slug ${slug} in sitemap must exist in portfolioData.ts`);
    }

    // Core section routes must be present
    const expectedCoreRoutes = [
      'https://www.calligraphyguruji.dev/',
      'https://www.calligraphyguruji.dev/projects',
      'https://www.calligraphyguruji.dev/about',
      'https://www.calligraphyguruji.dev/experience',
      'https://www.calligraphyguruji.dev/resume',
      'https://www.calligraphyguruji.dev/contact',
    ];

    for (const route of expectedCoreRoutes) {
      assert.ok(locMatches.includes(route), `Core route ${route} must be in sitemap.xml`);
    }
  });

  test('robots.txt points to correct canonical sitemap', () => {
    const robotsPath = path.join(rootDir, 'public', 'robots.txt');
    assert.ok(fs.existsSync(robotsPath), 'robots.txt must exist');

    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    assert.ok(robotsContent.includes('User-agent: *'), 'Must allow user agents');
    assert.ok(robotsContent.includes('Allow: /'), 'Must allow root');
    assert.ok(
      robotsContent.includes('Sitemap: https://www.calligraphyguruji.dev/sitemap.xml'),
      'Must reference canonical sitemap URL'
    );
  });

  test('index.html specifies canonical tag with www domain', () => {
    const indexPath = path.join(rootDir, 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');

    assert.ok(
      indexContent.includes('<link rel="canonical" href="https://www.calligraphyguruji.dev/" />'),
      'index.html must have correct canonical tag'
    );
    assert.ok(
      indexContent.includes('https://www.calligraphyguruji.dev/og-image.png'),
      'og:image must have absolute canonical URL'
    );
  });
});
