const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function build() {
  console.log('Building ES module...');
  await esbuild.build({
    entryPoints: ['index.ts'],
    bundle: true,
    format: 'esm',
    outfile: 'dist/index.js',
    external: ['playwright'],
    platform: 'node',
    target: 'node18',
  });

  console.log('Building CommonJS...');
  await esbuild.build({
    entryPoints: ['index.ts'],
    bundle: true,
    format: 'cjs',
    outfile: 'dist/index.cjs',
    external: ['playwright'],
    platform: 'node',
    target: 'node18',
  });

  console.log('Copying types...');
  fs.copyFileSync('dist/index.d.ts', 'dist/index.d.ts');

  console.log('Build complete!');
}

build().catch(console.error);
