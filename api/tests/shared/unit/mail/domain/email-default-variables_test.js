import { LOCALE } from '../../../../../src/shared/domain/constants.js';
import { getEmailDefaultVariables } from '../../../../../src/shared/mail/domain/emails-default-variables.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Email | Domain | email-default-variables', function () {
  describe('#getEmailDefaultVariables', function () {
    it('returns email default variables for France', function () {
      const result = getEmailDefaultVariables(LOCALE.FRENCH_FRANCE);

      expect(result).to.deep.equal({
        homeName: 'pix.fr',
        homeUrl: 'https://pix.fr',
        pixOrgaHomeUrl: 'https://orga.pix.fr',
        pixCertifHomeUrl: 'https://certif.pix.fr',
        pixAppConnectionUrl: 'https://app.pix.fr/connexion',
        helpdeskUrl: 'https://pix.fr/support',
        displayNationalLogo: true,
      });
    });

    it('returns email default variables for International french', function () {
      const result = getEmailDefaultVariables(LOCALE.FRENCH_SPOKEN);

      expect(result).to.deep.equal({
        homeName: 'pix.org',
        homeUrl: 'https://pix.org/fr/',
        pixOrgaHomeUrl: 'https://orga.pix.org',
        pixCertifHomeUrl: 'https://certif.pix.org',
        pixAppConnectionUrl: 'https://app.pix.org/connexion/?lang=fr',
        helpdeskUrl: 'https://pix.org/fr/support',
        displayNationalLogo: false,
      });
    });

    it('returns email default variables for International english', function () {
      const result = getEmailDefaultVariables(LOCALE.ENGLISH_SPOKEN);

      expect(result).to.deep.equal({
        homeName: 'pix.org',
        homeUrl: 'https://pix.org/en/',
        pixOrgaHomeUrl: 'https://orga.pix.org',
        pixCertifHomeUrl: 'https://certif.pix.org',
        pixAppConnectionUrl: 'https://app.pix.org/connexion/?lang=en',
        helpdeskUrl: 'https://pix.org/en/support',
        displayNationalLogo: false,
      });
    });

    it('returns email default variables for International spanish', function () {
      const result = getEmailDefaultVariables(LOCALE.SPANISH_SPOKEN);

      expect(result).to.deep.equal({
        homeName: 'pix.org',
        homeUrl: 'https://pix.org/en/',
        pixOrgaHomeUrl: 'https://orga.pix.org',
        pixCertifHomeUrl: 'https://certif.pix.org',
        pixAppConnectionUrl: 'https://app.pix.org/connexion/?lang=es',
        helpdeskUrl: 'https://pix.org/en/support',
        displayNationalLogo: false,
      });
    });

    it('returns email default variables for International dutch', function () {
      const result = getEmailDefaultVariables(LOCALE.DUTCH_SPOKEN);

      expect(result).to.deep.equal({
        homeName: 'pix.org',
        homeUrl: 'https://pix.org/nl-be/',
        pixOrgaHomeUrl: 'https://orga.pix.org',
        pixCertifHomeUrl: 'https://certif.pix.org',
        pixAppConnectionUrl: 'https://app.pix.org/connexion/?lang=nl',
        helpdeskUrl: 'https://pix.org/nl-be/support',
        displayNationalLogo: false,
      });
    });
  });
});
