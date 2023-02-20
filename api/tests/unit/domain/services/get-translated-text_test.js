import { expect } from '../../../test-helper';
import service from '../../../../lib/domain/services/get-translated-text';
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

    it('returns by default then french key', function () {
      // given
      const locale = 'fr-fr-';

      // when
      const result = service.getTranslatedKey(translatedKey, locale);

      // then
      expect(result).to.equal('Ma clef');
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
