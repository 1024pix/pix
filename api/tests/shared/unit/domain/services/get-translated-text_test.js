import { expect } from 'chai';

import * as service from '../../../../../src/shared/domain/services/get-translated-text.js';

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

    context('when the locale is a regional variant', function () {
      [
        { locale: 'es-419', language: 'es' },
        { locale: 'nl-BE', language: 'nl' },
      ].forEach(({ locale, language }) => {
        it('returns the key of the language when the locale key is missing', function () {
          // given
          const key = { fr: 'Ma clef', [language]: 'Mi clave' };

          // when
          const result = service.getTranslatedKey(key, locale);

          // then
          expect(result).to.equal(key[language]);
        });
      });

      it('returns the key of the locale when present', function () {
        // given
        const locale = 'es-419';
        const key = { fr: 'Ma clef', es: 'Mi clave', 'es-419': 'Mi llave' };

        // when
        const result = service.getTranslatedKey(key, locale);

        // then
        expect(result).to.equal('Mi llave');
      });

      it('returns the french key when neither the locale nor the language is present', function () {
        // given
        const locale = 'es-419';

        // when
        const result = service.getTranslatedKey(translatedKey, locale);

        // then
        expect(result).to.equal('Ma clef');
      });
    });
  });
});
