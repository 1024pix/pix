import { CampaignCodeFormatError } from '../../../../../../src/prescription/campaign/domain/errors.js';
import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import { catchErr, expect } from '../../../../../test-helper.js';

describe('Campaign', function () {
  let campaign;

  beforeEach(function () {
    campaign = new Campaign({
      id: 1,
      code: 'RIGHTCODE',
      name: 'Assessment101',
      title: 'Minus One',
      multipleSendings: true,
    });
  });

  describe('#updateFields', function () {
    it('update only field existing on model', function () {
      campaign.updateFields({ name: 'GodZilla', toto: 'toto', multipleSendings: undefined });

      expect(campaign.name).to.be.equal('GodZilla');
      expect(campaign.title).to.be.equal('Minus One');
      expect(campaign.multipleSendings).to.be.true;
      expect(campaign.toto).to.be.undefined;
    });

    describe('#code', function () {
      it('should throw an error if the code format is not respected', async function () {
        const error = await catchErr(campaign.updateFields, campaign)({ code: 'WRONG' });

        expect(error).to.be.instanceOf(CampaignCodeFormatError);
      });

      it('should not update code if not provided', async function () {
        const originalCode = campaign.code;

        campaign.updateFields({ name: 'Something' });

        expect(campaign.code).to.equal(originalCode);
      });

      it('should return false if code is less than 9 char', async function () {
        const error = await catchErr(campaign.updateFields, campaign)({ code: 'ABC123' });

        expect(error).to.be.ok;
      });

      it('should return false if code is more than 9 char', async function () {
        const error = await catchErr(campaign.updateFields, campaign)({ code: 'ABC123ABC123' });

        expect(error).to.be.ok;
      });

      it('should return false if code contains char other than uppercase Alphanumeric or numbers', async function () {
        const error = await catchErr(campaign.updateFields, campaign)({ code: 'abc abc @' });

        expect(error).to.be.instanceOf(CampaignCodeFormatError);
      });

      it('should return true if code contains only uppercase alphanumeric chars', function () {
        const expectedCode = '123ABDCDE';

        campaign.updateFields({ code: expectedCode });

        expect(campaign.code).to.equal(expectedCode);
      });
    });
  });
});
