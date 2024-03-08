import {
  escapeFileName,
  extractLocaleFromRequest,
  extractUserIdFromRequest,
} from '../../../../lib/infrastructure/utils/request-response-utils.js';
import { LOCALE } from '../../../../src/shared/domain/constants.js';
import { expect, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';

const { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } = LOCALE;

describe('Unit | Utils | Request Utils', function () {
  describe('#extractUserIdFromRequest', function () {
    it('should extract the ID of user from request', function () {
      // given
      const userId = 4;
      const request = {
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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

  describe('#extractLocaleFromRequest', function () {
    it('should return fr-fr locale when there is no header (to ensure retro-compat)', function () {
      // given
      const request = {};

      // when
      const locale = extractLocaleFromRequest(request);

      // then
      expect(locale).to.equal(FRENCH_FRANCE);
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { header: 'fr-FR', expectedLocale: FRENCH_FRANCE },
      { header: 'fr', expectedLocale: FRENCH_SPOKEN },
      { header: 'en', expectedLocale: ENGLISH_SPOKEN },
      { header: 'de', expectedLocale: FRENCH_FRANCE },
      { header: 'fr-BE', expectedLocale: FRENCH_FRANCE },
    ].forEach(function (data) {
      it(`should return ${data.expectedLocale} locale when header is ${data.header}`, function () {
        // given
        const request = {
          headers: { 'accept-language': data.header },
        };

        // when
        const locale = extractLocaleFromRequest(request);

        // then
        expect(locale).to.equal(data.expectedLocale);
      });
    });
  });
});
