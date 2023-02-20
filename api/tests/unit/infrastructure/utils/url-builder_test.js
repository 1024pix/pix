import { expect } from '../../../test-helper';
import { getCampaignUrl } from '../../../../lib/infrastructure/utils/url-builder';

describe('Unit | Utils | url-builder', function () {
  describe('#getCampaignUrl', function () {
    it('should return null if campaignCode is not defined', function () {
      expect(getCampaignUrl('fr', null)).to.be.null;
    });

    describe('when campaignCode is defined', function () {
      const campaignCode = 'AZERTY123';

      it('should return campaignUrl with fr domain when locale is fr-fr', function () {
        expect(getCampaignUrl('fr-fr', campaignCode)).to.be.equal(`https://app.pix.fr/campagnes/${campaignCode}`);
      });

      it('should return campaignUrl with org domain when locale is fr', function () {
        expect(getCampaignUrl('fr', campaignCode)).to.be.equal(
          `https://app.pix.org/campagnes/${campaignCode}/?lang=fr`
        );
      });

      it('should return campaignUrl with org domain when locale is en', function () {
        expect(getCampaignUrl('en', campaignCode)).to.be.equal(
          `https://app.pix.org/campagnes/${campaignCode}/?lang=en`
        );
      });
    });
  });
});
