const { expect } = require('../../../../test-helper');
const { challengeHasLocale } = require('../../../../../lib/infrastructure/utils/i18n/challenge-locales');

describe.only('Unit | Infrastructure | Utils | i18n/challenge-locales', () => {
  describe('#challengeHasLocale', () => {
    [
      {
        challenge: { locales: ['fr'] },
        searchedLocale: 'en',
        expected: false,
      },
      {
        challenge: { locales: ['en'] },
        searchedLocale: 'en',
        expected: true,
      },
      {
        challenge: { locales: ['it'] },
        searchedLocale: 'en',
        expected: false,
      },
      {
        challenge: { locales: ['it'] },
        searchedLocale: 'fr',
        expected: true,
      },
      {
        challenge: { locales: ['it'] },
        searchedLocale: 'fr-fr',
        expected: false,
      },
      {
        challenge: { locales: ['it'] },
        searchedLocale: 'it',
        expected: false,
      },
      {
        challenge: { locales: ['en', 'fr'] },
        searchedLocale: 'fr',
        expected: true,
      },
    ].forEach(
      (data) => {
        it(`it should say if challenge contains locale for ${data}`, () => {
          const result = challengeHasLocale(data.challenge, data.searchedLocale);
          expect(result).to.equal(data.expected);
        })
      }
    );
  });
});
