import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, readdir, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// Model the deployed artifact: Vercel emits .js files and does not ship .ts sources.
// This failed with ERR_MODULE_NOT_FOUND before rewriteRelativeImportExtensions was set in the root config.
test('emitted contact functions start without TypeScript source files', async () => {
  const root = resolve(import.meta.dirname, '..');
  const target = await mkdtemp(join(tmpdir(), 'contact-runtime-'));
  try {
    const config = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile).config;
    const options = ts.convertCompilerOptionsFromJson(config.compilerOptions, root).options;
    const sources = ['api/contact.ts', 'api/contact/[action].ts',
      ...(await readdir(join(root, 'server/contact'))).filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts')).map(file => `server/contact/${file}`)];
    await writeFile(join(target, 'package.json'), '{"type":"module"}');
    await symlink(join(root, 'node_modules'), join(target, 'node_modules'), 'dir');
    for (const file of sources) {
      const result = ts.transpileModule(await readFile(join(root, file), 'utf8'), {
        fileName: join(root, file), compilerOptions: { ...options, noEmit: false, declaration: false, sourceMap: false },
      });
      const destination = join(target, file.replace(/\.ts$/, '.js'));
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, result.outputText);
    }
    for (const file of ['api/contact.js', 'api/contact/[action].js']) {
      const { default: handler } = await import(pathToFileURL(join(target, file)).href);
      let status = 0, response: any;
      const res: any = { setHeader() {}, status(value: number) { status = value; return res; }, json(value: unknown) { response = value; return res; } };
      await handler({ method: 'GET', url: '/api/contact/request-verification', headers: {} }, res);
      assert.equal(status, 405);
      assert.equal(response.success, false);
      await handler({ method: 'POST', url: '/api/contact/request-verification', headers: {} }, res);
      assert.equal(status, 403);
    }
  } finally { await rm(target, { recursive: true, force: true }); }
});

test('frontend handles non-JSON function crashes and rate limits without claiming success', async () => {
  const originalFetch = globalThis.fetch;
  try {
    const root = resolve(import.meta.dirname, '..');
    const source = await readFile(join(root, 'src/services/emailService.ts'), 'utf8');
    const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
    const { contactRequest } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
    for (const status of [401, 403, 404, 500, 502, 503]) {
      globalThis.fetch = async () => new Response('FUNCTION_INVOCATION_FAILED', { status });
      const result = await contactRequest('request-verification', {});
      assert.equal(result.success, false);
      assert.equal(result.code, 'unavailable');
      assert.ok(!result.message.includes('FUNCTION_INVOCATION_FAILED'));
    }
    globalThis.fetch = async () => new Response('Rate limited', { status: 429 });
    assert.equal((await contactRequest('request-verification', {})).code, 'rate_limited');
    globalThis.fetch = async () => { throw new Error('network unavailable'); };
    assert.equal((await contactRequest('request-verification', {})).code, 'network_error');
    globalThis.fetch = async () => new Response(JSON.stringify({ success: true, code: 'verification_sent', message: 'Check your inbox.' }));
    assert.equal((await contactRequest('request-verification', {})).code, 'verification_sent');
  } finally { globalThis.fetch = originalFetch; }
});
