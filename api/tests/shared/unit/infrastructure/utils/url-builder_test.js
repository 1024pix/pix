import { urlBuilder } from '../../../../../src/shared/infrastructure/utils/url-builder.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Shared | Infrastructure | Utils | url-builder', function () {
  describe('#getCampaignUrl', function () {
    it('should return null if campaignCode is not defined', function () {
      expect(urlBuilder.getCampaignUrl('fr', null)).to.be.null;
    });

    describe('when campaignCode is defined', function () {
      const campaignCode = 'AZERTY123';

      it('should return campaignUrl with fr domain when locale is fr-fr', function () {
        expect(urlBuilder.getCampaignUrl('fr-fr', campaignCode)).to.be.equal(
          `https://app.pix.fr/campagnes/${campaignCode}`,
        );
      });

      it('should return campaignUrl with org domain when locale is fr', function () {
        expect(urlBuilder.getCampaignUrl('fr', campaignCode)).to.be.equal(
          `https://app.pix.org/campagnes/${campaignCode}/?lang=fr`,
        );
      });

      it('should return campaignUrl with org domain when locale is en', function () {
        expect(urlBuilder.getCampaignUrl('en', campaignCode)).to.be.equal(
          `https://app.pix.org/campagnes/${campaignCode}/?lang=en`,
        );
      });
    });
  });

  describe('getEmailValidationUrl', function () {
    context('when locale is given', function () {
      it('returns email validation URL with domain .org', function () {
        // given
        const token = '00000000-0000-0000-0000-000000000000';
        const redirectUri = 'https://app.pix.org/connexion?lang=nl';
        const locale = 'en';

        // when
        const url = urlBuilder.getEmailValidationUrl({ locale, redirectUri, token });

        // then
        expect(url).to.equal(`https://app.pix.org/api/users/validate-email?token=${token}&redirect_uri=${redirectUri}`);
      });
    });

    context('when locale is not given', function () {
      it('returns email validation URL with domain .fr', function () {
        // given
        const token = '00000000-0000-0000-0000-000000000000';
        const redirectUri = 'https://app.pix.fr/connexion';

        // when
        const url = urlBuilder.getEmailValidationUrl({ redirectUri, token });

        // then
        expect(url).to.equal(`https://app.pix.fr/api/users/validate-email?token=${token}&redirect_uri=${redirectUri}`);
      });
    });
  });
});
