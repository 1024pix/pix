import * as url from 'node:url';

import { FileValidationError } from '../../../../../../../lib/domain/errors.js';
import { detectEncoding } from '../../../../../../../src/prescription/learner-management/infrastructure/utils/xml/detect-encoding.js';
import { catchErr, expect } from '../../../../../../test-helper.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('detect-encoding', function () {
  context('when no encoding is specified in the xml file', function () {
    it('should return the default encoding', async function () {
      const path = `${__dirname}files/xml/valid.xml`;
      const encoding = await detectEncoding(path);
      expect(encoding).to.equal('UTF-8');
    });
  });
  context('when encoding specified in the xml file', function () {
    it('should return the default encoding', async function () {
      const path = `${__dirname}files/xml/unknown-encoding.xml`;
      const encoding = await detectEncoding(path);
      expect(encoding).to.equal('x-macthai');
    });
  });
  context('when the filepath point to nothing', function () {
    it('should throw an error', async function () {
      const path = `${__dirname}files/xml/unknow-file.xml`;
      const error = await catchErr(detectEncoding)(path);
      expect(error).to.be.instanceOf(FileValidationError);
    });
  });
});
