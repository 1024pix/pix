import { LanguageNotSupportedError } from '../../../../../src/shared/domain/errors.js';
import * as languageService from '../../../../../src/shared/domain/services/language-service.js';

import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Shared | Domain | Services | Language Service', function () {
  describe('#assertLanguageAvailability', function () {
    context('when language code is not provided', function () {
      it('returns nothing', function () {
        // then
        expect(languageService.assertLanguageAvailability()).to.be.undefined;
      });
    });
    context('when given language code is available', function () {
      it('returns nothing', function () {
        // given
        const languageCode = 'nl';

        // when & then
        expect(languageService.assertLanguageAvailability(languageCode)).to.be.undefined;
      });
    });
    context('when given language code is not available', function () {
      it('throws an error', function () {
        // given
        const languageCode = 'it';

        // when
        const error = catchErrSync(languageService.assertLanguageAvailability)(languageCode);

        // then
        expect(error).to.be.instanceOf(LanguageNotSupportedError);
      });
    });
  });
});
