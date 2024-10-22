import { extractExternalIds } from '../../../../../../../src/certification/configuration/infrastructure/serializers/csv/sco-whitelist-csv-parser.js';
import { FileValidationError } from '../../../../../../../src/shared/domain/errors.js';
import { catchErr, createTempFile, expect, removeTempFile } from '../../../../../../test-helper.js';

describe('Integration | Serializer | CSV | Certification | Configuration | sco-whitelist-csv-parser', function () {
  describe('#extractExternalIds', function () {
    let file;

    afterEach(function () {
      removeTempFile(file);
    });

    context('when the file is correctly parsed', function () {
      it('returns all external ids in the file', async function () {
        file = 'valid.csv';
        const data = 'externalId\n ext1 \next2';
        const filePath = await createTempFile(file, data);
        const ids = await extractExternalIds(filePath);
        expect(ids).to.exactlyContain(['ext1', 'ext2']);
      });
    });

    context('when the file is incorrectly formed', function () {
      it('throws an error', async function () {
        file = 'invalid.csv';
        const data = 'RendLesDonnées\n1';
        const filePath = await createTempFile(file, data);
        const error = await catchErr(extractExternalIds)(filePath);
        expect(error).to.be.an.instanceOf(FileValidationError);
      });
    });
  });
});
