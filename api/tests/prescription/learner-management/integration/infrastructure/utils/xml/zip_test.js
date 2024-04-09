import fs from 'node:fs/promises';
import Path from 'node:path';
import * as url from 'node:url';

import { FileValidationError } from '../../../../../../../lib/domain/errors.js';
import { unzip } from '../../../../../../../src/prescription/learner-management/infrastructure/utils/xml/zip.js';
import { catchErr, expect } from '../../../../../../test-helper.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('unzip', function () {
  describe('success case', function () {
    it('unzip the file', async function () {
      // given
      const path = `${__dirname}/files/zip/valid.zip`;

      // when
      const { file } = await unzip(path);

      const text = await fs.readFile(file);

      expect(text.toString('utf-8')).to.equal('<hello></hello>\n');
    });

    it('two unzip should render different name', async function () {
      // given
      const path = `${__dirname}/files/zip/valid.zip`;

      // when
      const { file: filePath1 } = await unzip(path);
      const { file: filePath2 } = await unzip(path);

      expect(Path.basename(filePath1)).to.not.equal(Path.basename(filePath2));
    });

    context('when there is a file name starting with a dot', function () {
      it('ignores the folder', async function () {
        const path = `${__dirname}/files/zip/hidden-file.zip`;

        const { file } = await unzip(path);

        const text = await fs.readFile(file);

        expect(text.toString('utf-8')).to.equal('<hello></hello>\n');
      });
    });

    context('when there is en empty folder', function () {
      it('ignores the folder', async function () {
        const path = `${__dirname}/files/zip/empty-folder.zip`;

        const { file } = await unzip(path);

        const text = await fs.readFile(file);

        expect(text.toString('utf-8')).to.equal('<hello></hello>\n');
      });
    });
  });
  context('when there are files with a corrupted entry within zip', function () {
    it('throws an error', async function () {
      // given
      const path = `${__dirname}/files/zip/corrupted-entry.zip`;

      const error = await catchErr(unzip)(path);

      expect(error).to.be.an.instanceof(FileValidationError);
      expect(error.code).to.equal('INVALID_FILE');
    });
  });
  context('when there are several files in the zip', function () {
    it('throws an error', async function () {
      const path = `${__dirname}/files/zip/several-files.zip`;

      const error = await catchErr(unzip)(path);

      expect(error).to.be.an.instanceof(FileValidationError);
      expect(error.code).to.equal('INVALID_FILE');
    });
  });
});
