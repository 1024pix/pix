const { expect, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const { escapeFileName, extractUserIdFromRequest, extractLocaleFromRequest } = require('../../../../lib/infrastructure/utils/request-response-utils');
const { FRENCH_FRANCE, FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Unit | Utils | Request Utils', function() {

  describe('#extractUserIdFromRequest', function() {

    it('should extract the ID of user from request', function() {
      // given
      const userId = 4;
      const request = {
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
      };
      // when
      const result = extractUserIdFromRequest(request);

      // then
      expect(result).to.equal(userId);
    });

    it('should return null when request does not have headers', function() {
      // given
      const request = {};
      // when
      const result = extractUserIdFromRequest(request);

      // then
      expect(result).to.equal(null);
    });

  });

  describe('#escapeFileName', function() {

    it('should allow only a restricted set of characters', function() {
      // given
      const fileName = 'file-name with invalid_chars •’<>:"/\\|?*"\n.csv';

      // when
      const escapedFileName = escapeFileName(fileName);

      // then
      expect(escapedFileName).to.equal('file-name with invalid_chars _____________.csv');
    });

  });

  describe('#extractLocaleFromRequest', function() {
    it('should return fr-fr locale when there is no header (to ensure retro-compat)', function() {
      // given
      const request = {};

      // when
      const locale = extractLocaleFromRequest(request);

      // then
      expect(locale).to.equal(FRENCH_FRANCE);
    });

    it('should return fr-fr locale when header is fr-FR', function() {
      // given
      const request = {
        headers: { 'accept-language': 'fr-FR' }
      };

      // when
      const locale = extractLocaleFromRequest(request);

      // then
      expect(locale).to.equal(FRENCH_FRANCE);
    });

    it('should return fr locale when header is fr', function() {
      // given
      const request = {
        headers: { 'accept-language': 'fr' }
      };

      // when
      const locale = extractLocaleFromRequest(request);

      // then
      expect(locale).to.equal(FRENCH_SPOKEN);
    });

    it('should return fr-fr locale when header is de (to ensure retro-compat)', function() {
      // given
      const request = {
        headers: { 'accept-language': 'de' }
      };

      // when
      const locale = extractLocaleFromRequest(request);

      // then
      expect(locale).to.equal(FRENCH_FRANCE);
    });

    it('should return fr-fr locale when header is fr-BE (to ensure retro-compat)', function() {
      // given
      const request = {
        headers: { 'accept-language': 'fr-BE' }
      };

      // when
      const locale = extractLocaleFromRequest(request);

      // then
      expect(locale).to.equal(FRENCH_FRANCE);
    });
  });
});
