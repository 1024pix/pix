import { urlBuilder } from '../../../../../src/shared/infrastructure/utils/url-builder.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Shared | Infrastructure | Utils | url-builder', function () {
  describe('#getPixAppBaseUrl', function () {
    it('returns base url fr if locale not defined', function () {
      // when
      const url = urlBuilder.getPixAppBaseUrl();
      // then
      expect(url).to.equal('https://app.pix.fr');
    });

    it('returns base url fr if locale is fr-FR', function () {
      // when
      const url = urlBuilder.getPixAppBaseUrl('fr-FR');
      // then
      expect(url).to.equal('https://app.pix.fr');
    });

    it('returns base url fr if locale is not supported', function () {
      // when
      const url = urlBuilder.getPixAppBaseUrl('ru');
      // then
      expect(url).to.equal('https://app.pix.fr');
    });

    it('returns base url org if locale is in supported locales and not fr-FR', function () {
      // when
      const url = urlBuilder.getPixAppBaseUrl('fr');
      // then
      expect(url).to.equal('https://app.pix.org');
    });
  });

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
        const redirectUrl = 'https://app.pix.org/connexion?lang=nl';
        const locale = 'en';
        const expectedParams = new URLSearchParams({ token, redirect_url: redirectUrl });

        // when
        const url = urlBuilder.getEmailValidationUrl({ locale, redirectUrl, token });

        // then
        expect(url).to.equal(`https://app.pix.org/api/users/validate-email?${expectedParams.toString()}`);
      });
    });

    context('when locale is not given', function () {
      it('returns email validation URL with domain .fr', function () {
        // given
        const token = '00000000-0000-0000-0000-000000000000';
        const redirectUrl = 'https://app.pix.fr/connexion';
        const expectedParams = new URLSearchParams({ token, redirect_url: redirectUrl });

        // when
        const url = urlBuilder.getEmailValidationUrl({ redirectUrl, token });

        // then
        expect(url).to.equal(`https://app.pix.fr/api/users/validate-email?${expectedParams.toString()}`);
      });
    });

    context('when token is not given', function () {
      it('returns email validation URL with domain .fr', function () {
        // given
        const redirectUrl = 'https://app.pix.fr/connexion';
        const expectedParams = new URLSearchParams({ redirect_url: redirectUrl });

        // when
        const url = urlBuilder.getEmailValidationUrl({ redirectUrl });

        // then
        expect(url).to.equal(`https://app.pix.fr/api/users/validate-email?${expectedParams.toString()}`);
      });
    });

    context('when redirect_url is not given', function () {
      it('returns email validation URL with domain .fr', function () {
        // when
        const url = urlBuilder.getEmailValidationUrl();

        // then
        expect(url).to.equal(`https://app.pix.fr/api/users/validate-email?`);
      });
    });
  });
});
