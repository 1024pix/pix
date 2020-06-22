const { expect } = require('../../../test-helper');
const { getCampaignUrl } = require('../../../../lib/infrastructure/utils/url-builder');

describe('Unit | Utils | url-builder', () => {

  describe('#getCampaignUrl', () => {

    it('should return null if campaignCode is not defined', () => {
      expect(getCampaignUrl('fr', null)).to.be.null;
    });

    describe('when campaignCode is defined', () => {
      const campaignCode = 'AZERTY123';

      it('should return campaignUrl with fr domain when locale is fr-fr', () => {
        expect(getCampaignUrl('fr-fr', campaignCode)).to.be.equal(`https://app.pix.fr/campagnes/${campaignCode}`);
      });

      it('should return campaignUrl with org domain when locale is fr', () => {
        expect(getCampaignUrl('fr', campaignCode)).to.be.equal(`https://app.pix.org/campagnes/${campaignCode}`);
      });
    });
  });

});
