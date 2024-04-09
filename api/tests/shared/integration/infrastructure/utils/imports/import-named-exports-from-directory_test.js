import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { importNamedExportsFromDirectory } from '../../../../../../src/shared/infrastructure/utils/import-named-exports-from-directory.js';
import { catchErr, expect } from '../../../../../test-helper.js';

describe('Integration | Infrastructure | Utils | #importNamedExportsFromDirectory', function () {
  it('should throw if several files export the same name', async function () {
    // given
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const path = join(__dirname, './sample-conflict');

    // when
    const result = await catchErr(importNamedExportsFromDirectory)({ path });

    // then
    expect(result).to.be.an.instanceOf(Error);
    expect(result.message).to.be.equal('Duplicate export name a : a.js and b.js');
  });

  it('should import all exported methods to an object', async function () {
    // given
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const path = join(__dirname, './sample');
    const { a: sampleA } = await import('./sample/a.js');
    const { b: sampleB, C: sampleC } = await import('./sample/b-c-d.js');

    // when
    const dirContent = await importNamedExportsFromDirectory({ path });

    // then
    expect(dirContent).to.be.an('object');
    expect(dirContent.a).to.be.a('function');
    expect(dirContent.a()).to.equal(sampleA());
    expect(dirContent.b).to.be.a('function');
    expect(dirContent.b()).to.equal(sampleB());
    expect(new dirContent.C()).to.be.an.instanceof(sampleC);
  });

  it('should not import default exports', async function () {
    // given
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const path = join(__dirname, './sample');
    const { default: sampleD } = await import('./sample/b-c-d.js');

    expect(sampleD).to.equal('D');

    // when
    const dirContent = await importNamedExportsFromDirectory({ path });

    // then
    expect(dirContent.default).to.be.undefined;
  });

  it('should not import nested directories', async function () {
    // given
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const path = join(__dirname, './sample');
    const { e: sampleE } = await import('./sample/directory/e.js');

    expect(sampleE).to.equal('e');

    // when
    const dirContent = await importNamedExportsFromDirectory({ path });

    // then
    expect(dirContent.e).to.be.undefined;
  });

  it('should not import files to ignore', async function () {
    // given
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const path = join(__dirname, './sample');

    // when
    const dirContent = await importNamedExportsFromDirectory({ path, ignoredFileNames: ['a.js'] });

    // then
    expect(dirContent.a).to.be.undefined;
    expect(dirContent.b).to.be.a('function');
  });

  it('should not import files not ending with .js', async function () {
    // given
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const path = join(__dirname, './sample');

    // when
    const dirContent = await importNamedExportsFromDirectory({ path });

    // then
    expect(dirContent.e).to.be.undefined;
  });
});
