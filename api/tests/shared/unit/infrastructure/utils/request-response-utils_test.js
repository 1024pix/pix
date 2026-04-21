import { getDefaultLocale } from '../../../../../src/shared/domain/services/locale-service.js';
import {
  escapeFileName,
  extractTimestampFromRequest,
  extractTLDFromRequest,
  extractUserIdFromRequest,
  getChallengeLocale,
  getUserLocale,
} from '../../../../../src/shared/infrastructure/utils/request-response-utils.js';

import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Unit | Utils | Request Utils', function () {
  describe('#extractUserIdFromRequest', function () {
    it('should extract the ID of user from request', function () {
      // given
      const userId = 4;
      const request = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };
      // when
      const result = extractUserIdFromRequest(request);

      // then
      expect(result).to.equal(userId);
    });

    it('should return null when request does not have headers', function () {
      // given
      const request = {};
      // when
      const result = extractUserIdFromRequest(request);

      // then
      expect(result).to.equal(null);
    });
  });

  describe('#extractTLDFromRequest', function () {
    it('should return fr when forwared host includes .fr', function () {
      // given
      const request = {
        headers: generateAuthenticatedUserRequestHeaders({ audience: 'https://app.pix.fr' }),
      };
      // when
      const result = extractTLDFromRequest(request);

      // then
      expect(result).to.equal('fr');
    });
    it('should return org when forwared host includes .org', function () {
      // given
      const request = {
        headers: generateAuthenticatedUserRequestHeaders({ audience: 'https://app.pix.org' }),
      };
      // when
      const result = extractTLDFromRequest(request);

      // then
      expect(result).to.equal('org');
    });
    it('should return null when forwared host includes something else', function () {
      // given
      const request = {
        headers: generateAuthenticatedUserRequestHeaders({ audience: 'http://localhost:4200' }),
      };
      // when
      const result = extractTLDFromRequest(request);

      // then
      expect(result).to.be.null;
    });
  });

  describe('#escapeFileName', function () {
    it('should allow only a restricted set of characters', function () {
      // given
      const fileName = 'file-name with é invalid_chars •’<>:"/\\|?*"\n👌.csv';

      // when
      const escapedFileName = escapeFileName(fileName);

      // then
      expect(escapedFileName).to.equal('file-name_with_e_invalid_chars_.csv');
    });
  });

  describe('getUserLocale', function () {
    context('when the request has no cookie locale and no query param', function () {
      it('should return the default locale', function () {
        // when
        const locale = getUserLocale();

        // then
        expect(locale).to.equal(getDefaultLocale());
      });
    });

    context('when the request has a cookie locale', function () {
      it('should return the locale from the cookie', function () {
        // given
        const request = { state: { locale: 'fr-FR' } };

        // when
        const locale = getUserLocale(request);

        // then
        expect(locale).to.equal('fr-FR');
      });
    });

    context('when the request has a query param locale', function () {
      it('should return the locale from the query param', function () {
        // given
        const request = { query: { locale: 'fr-BE' } };

        // when
        const locale = getUserLocale(request);

        // then
        expect(locale).to.equal('fr-BE');
      });
    });

    context('when the request has a query param lang', function () {
      it('should return the lang from the query param', function () {
        // given
        const request = { query: { lang: 'fr-BE' } };

        // when
        const locale = getUserLocale(request);

        // then
        expect(locale).to.equal('fr-BE');
      });
    });

    context('when the locale is not supported', function () {
      it('should return the default locale for invalid locale', function () {
        // given
        const request = { query: { lang: 'unsupported-locale' } };

        // when
        const locale = getUserLocale(request);

        // then
        expect(locale).to.equal(getDefaultLocale());
      });

      it('should return the default locale for empty locale', function () {
        // given
        const request = { query: { lang: '' } };

        // when
        const locale = getUserLocale(request);

        // then
        expect(locale).to.equal(getDefaultLocale());
      });

      it('should return the nearest supported locale for invalid locale', function () {
        // given
        const request = { query: { lang: 'fr-CA' } };

        // when
        const locale = getUserLocale(request);

        // then
        expect(locale).to.equal('fr');
      });
    });
  });

  describe('#getChallengeLocale', function () {
    it('returns fr-fr locale when there is no header (to ensure retro-compat)', function () {
      // given
      const request = {};

      // when
      const locale = getChallengeLocale(request);

      // then
      expect(locale).to.equal('fr-fr');
    });

    [
      { userLocale: 'fr-FR', challengeLocale: 'fr-fr' },
      { userLocale: 'fr', challengeLocale: 'fr' },
      { userLocale: 'en', challengeLocale: 'en' },
      { userLocale: 'en-US', challengeLocale: 'en' },
      { userLocale: 'fr-BE', challengeLocale: 'fr' },
      { userLocale: 'nl-BE', challengeLocale: 'nl' },
      { userLocale: 'tlh', challengeLocale: 'fr-fr' }, // tlh: Klingon locale not found, so returns default locale
    ].forEach(function ({ userLocale, challengeLocale }) {
      it(`returns ${challengeLocale} when user locale is ${userLocale}`, async function () {
        // given
        const request = { state: { locale: userLocale } };

        // when
        const locale = getChallengeLocale(request);

        // then
        expect(locale).to.equal(challengeLocale);
      });
    });
  });

  describe('#extractTimestampFromRequest', function () {
    it('returns the value of attribute "request.info.received"', function () {
      // given
      const startDateTimestamp = new Date('2025-01-01').getTime();
      const request = {
        info: {
          received: startDateTimestamp,
        },
      };

      // when
      const timestamp = extractTimestampFromRequest(request);

      // then
      expect(timestamp).to.equal(startDateTimestamp);
    });
  });
});
