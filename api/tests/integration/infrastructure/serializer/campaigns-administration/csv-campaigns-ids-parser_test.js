import { expect, catchErr, createTempFile, removeTempFile } from '../../../../test-helper';
import { CsvImportError } from '../../../../../lib/domain/errors';
import csvCampaignIdsParser from '../../../../../lib/infrastructure/serializers/csv/campaigns-administration/csv-campaigns-ids-parser';

describe('Integration | Serializer | CSV | campaigns-administration | csv-campaigns-ids-parser', function () {
  describe('#extractCampaignsIds', function () {
    let file;
    afterEach(function () {
      removeTempFile(file);
    });

    context('when the file is correctly parsed', function () {
      it('returns all campaigns id in the file', async function () {
        file = 'valid.csv';
        const data = 'campaignId\n1\n2';
        const filePath = await createTempFile(file, data);
        const ids = await csvCampaignIdsParser.extractCampaignsIds(filePath);
        expect(ids).to.exactlyContain([1, 2]);
      });
    });

    context('when the file is incorrectly formed', function () {
      it('throws an error', async function () {
        file = 'invalid.csv';
        const data = 'RendLesDonnées\n1';
        const filePath = await createTempFile(file, data);
        const error = await catchErr(csvCampaignIdsParser.extractCampaignsIds)(filePath);
        expect(error).to.be.an.instanceOf(CsvImportError);
        expect(error.code).to.equal('ENCODING_NOT_SUPPORTED');
      });
    });
  });
});
