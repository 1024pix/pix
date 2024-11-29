import * as service from '../../../../../src/shared/domain/services/get-translated-text.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Services | get-translated-text', function () {
  describe('#getTranslatedKey', function () {
    const translatedKey = {
      fr: 'Ma clef',
      en: 'My key',
    };

    it('returns the french key', function () {
      // given
      const locale = 'fr';

      // when
      const result = service.getTranslatedKey(translatedKey, locale);

      // then
      expect(result).to.equal('Ma clef');
    });

    it('returns the english key', function () {
      // given
      const locale = 'en';

      // when
      const result = service.getTranslatedKey(translatedKey, locale);

      // then
      expect(result).to.equal('My key');
    });

    context('when key not present', function () {
      it('returns by default the french key when fallback is enabled', function () {
        // given
        const locale = 'fr-fr-';

        // when
        const result = service.getTranslatedKey(translatedKey, locale);

        // then
        expect(result).to.equal('Ma clef');
      });
      it('returns null when fallback is not enabled', function () {
        // given
        const locale = 'fr-fr-';

        // when
        const result = service.getTranslatedKey(translatedKey, locale, false);

        // then
        expect(result).to.be.null;
      });
    });

    it('returns undefined when the key is undefined', function () {
      // given
      const locale = 'fr-fr-';

      // when
      const result = service.getTranslatedKey(undefined, locale);

      // then
      expect(result).to.equal(undefined);
    });
  });
});
