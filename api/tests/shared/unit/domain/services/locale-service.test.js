import { expect } from 'chai';

import {
  fallbackChallengeLocales,
  getBaseLocale,
  getDefaultChallengeLocale,
  getDefaultLocale,
  getMatchingLocale,
  getNearestChallengeLocale,
  getNearestSupportedLocale,
  getSupportedLanguages,
  isFranceLocale,
  normalizeLocale,
} from '../../../../../src/shared/domain/services/locale-service.js';

describe('Unit | Shared | Domain | Service | Locale', function () {
  describe('getSupportedLanguages', function () {
    it('returns languages computed from the supported locales', function () {
      // when
      const result = getSupportedLanguages();

      // then
      expect(result).to.deep.equal(['de', 'en', 'es', 'fr', 'nl', 'it']);
    });
  });

  describe('getNearestSupportedLocale', function () {
    context('when given a supported locale in canonical form', function () {
      it('returns the locale', function () {
        // given
        const name = 'fr-FR';

        // when
        const locale = getNearestSupportedLocale(name);

        // then
        expect(locale).to.equal('fr-FR');
      });
    });

    context('when given a supported locale but not in canonical form', function () {
      it('returns the canonical locale form', function () {
        // given
        const name = 'fr-fr';

        // when
        const locale = getNearestSupportedLocale(name);

        // then
        expect(locale).to.equal('fr-FR');
      });
    });

    context('when given an unsupported locale but the base language is supported', function () {
      it('returns the base language locale', function () {
        // given
        const name = 'fr-CA';

        // when
        const locale = getNearestSupportedLocale(name);

        // then
        expect(locale).to.equal('fr');
      });
    });

    context('when given a locale and base language are both not supported', function () {
      it('returns the default locale', function () {
        // given
        const name = 'br_FR';

        // when
        const locale = getNearestSupportedLocale(name);

        // then
        expect(locale).to.equal('fr');
      });
    });

    context('when given an invalid name', function () {
      it('returns the default locale', function () {
        // given
        const name = 'anInvalidLocaleName';

        // when
        const locale = getNearestSupportedLocale(name);

        // then
        expect(locale).to.equal('fr');
      });
    });
  });

  describe('getBaseLocale', function () {
    context('when locale is valid', function () {
      [
        { locale: 'fr-fr', expectedBaseLocale: 'fr' },
        { locale: 'fr-FR', expectedBaseLocale: 'fr' },
        { locale: 'en', expectedBaseLocale: 'en' },
        { locale: 'en-GB', expectedBaseLocale: 'en' },
      ].forEach(({ locale, expectedBaseLocale }) => {
        it(`returns the corresponding base locale ${expectedBaseLocale} for ${locale}`, function () {
          // given / when
          const baseLocale = getBaseLocale(locale);

          // then
          expect(baseLocale).to.equal(expectedBaseLocale);
        });
      });
    });

    context('when locale is invalid', function () {
      ['fr_FR', 'yo-yo-yo', null].forEach((invalidLocale) => {
        it(`returns the default base locale for ${invalidLocale}`, function () {
          // given / when
          const baseLocale = getBaseLocale(invalidLocale);

          // then
          const defaultBaseLocale = new Intl.Locale(getDefaultLocale()).language;
          expect(baseLocale).to.equal(defaultBaseLocale);
        });
      });
    });
  });

  describe('normalizeLocale', function () {
    context('when locale is valid', function () {
      [
        { locale: 'fr-fr', expectedLocale: 'fr-FR' },
        { locale: 'FR-FR', expectedLocale: 'fr-FR' },
        { locale: 'en', expectedLocale: 'en' },
        { locale: 'fr-FR-u-ca-gregory', expectedLocale: 'fr-FR' },
      ].forEach(({ locale, expectedLocale }) => {
        it(`returns ${expectedLocale} for ${locale}`, function () {
          // given / when
          const normalizedLocale = normalizeLocale(locale);

          // then
          expect(normalizedLocale).to.equal(expectedLocale);
        });
      });
    });

    context('when locale is invalid', function () {
      ['fr_FR', 'yo-yo-yo', null, undefined].forEach((invalidLocale) => {
        it(`returns undefined for ${invalidLocale}`, function () {
          // given / when
          const normalizedLocale = normalizeLocale(invalidLocale);

          // then
          expect(normalizedLocale).to.be.undefined;
        });
      });
    });
  });

  describe('getMatchingLocale', function () {
    const availableLocales = ['fr', 'es-419', 'de-at', 'nl'];

    context('when locale is available', function () {
      [
        { locale: 'es-419', expectedLocale: 'es-419' },
        { locale: 'de-AT', expectedLocale: 'de-AT' },
        { locale: 'fr', expectedLocale: 'fr' },
      ].forEach(({ locale, expectedLocale }) => {
        it(`returns the normalized locale ${expectedLocale} for ${locale}`, function () {
          // given / when
          const matchingLocale = getMatchingLocale(availableLocales, locale);

          // then
          expect(matchingLocale).to.equal(expectedLocale);
        });
      });
    });

    context('when locale is not available', function () {
      [
        { locale: 'nl-BE', expectedLocale: 'nl' },
        { locale: 'fr-fr', expectedLocale: 'fr' },
        { locale: 'it', expectedLocale: 'it' },
      ].forEach(({ locale, expectedLocale }) => {
        it(`returns the base locale ${expectedLocale} for ${locale}`, function () {
          // given / when
          const matchingLocale = getMatchingLocale(availableLocales, locale);

          // then
          expect(matchingLocale).to.equal(expectedLocale);
        });
      });
    });

    context('when locale is invalid', function () {
      it('returns the default base locale', function () {
        // given / when
        const matchingLocale = getMatchingLocale(availableLocales, 'fr_FR');

        // then
        expect(matchingLocale).to.equal(new Intl.Locale(getDefaultLocale()).language);
      });
    });
  });

  describe('isFranceLocale', function () {
    context('when locale from France', function () {
      ['fr-fr', 'fr-FR'].forEach((franceLocale) => {
        it(`returns true for ${franceLocale}`, function () {
          // given / when
          const result = isFranceLocale(franceLocale);

          // then
          expect(result).to.be.true;
        });
      });
    });

    context('when locale is not from France', function () {
      ['fr', 'en', 'en-GB', null].forEach((franceLocale) => {
        it(`returns true for ${franceLocale}`, function () {
          // given / when
          const result = isFranceLocale(franceLocale);

          // then
          expect(result).to.be.false;
        });
      });
    });
  });

  describe('getNearestChallengeLocale', function () {
    context('when no locale is provided', function () {
      it('returns the default locale', function () {
        // given
        const locale = null;

        // when
        const challengeLocale = getNearestChallengeLocale(locale);

        // then
        expect(challengeLocale).to.equal(getDefaultChallengeLocale());
      });
    });

    context('when locale is supported', function () {
      [
        { locale: 'fr-FR', expectedChallengeLocale: 'fr-fr' },
        { locale: 'fr-BE', expectedChallengeLocale: 'fr' },
        { locale: 'en', expectedChallengeLocale: 'en' },
        { locale: 'nl', expectedChallengeLocale: 'nl' },
        { locale: 'nl-BE', expectedChallengeLocale: 'nl' },
        { locale: 'es', expectedChallengeLocale: 'es' },
        { locale: 'tlh', expectedChallengeLocale: 'fr-fr' },
      ].forEach(({ locale, expectedChallengeLocale }) => {
        it(`returns the challenge locale: ${expectedChallengeLocale} for locale: ${locale}`, function () {
          // when
          const challengeLocale = getNearestChallengeLocale(locale);

          // then
          expect(challengeLocale).to.equal(expectedChallengeLocale);
        });
      });
    });
  });

  describe('#fallbackChallengeLocales', function () {
    it('should return corresponding array of locales', function () {
      // given
      const locale = 'fr';

      // when
      const result = fallbackChallengeLocales(locale);

      // then
      expect(result).to.deep.equal(['fr']);
    });

    it('returns an array of two locales', function () {
      // given
      const locale = 'fr-FR';

      // when
      const result = fallbackChallengeLocales(locale);

      // then
      expect(result).to.deep.equal(['fr-FR', 'fr']);
    });
  });
});
