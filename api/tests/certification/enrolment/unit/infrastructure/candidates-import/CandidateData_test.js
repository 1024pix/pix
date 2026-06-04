import { CandidateData } from '../../../../../../src/certification/enrolment/infrastructure/candidates-import/CandidateData.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | infrastructure | candidates-import | CandidateData', function () {
  describe('CandidateData constructor', function () {
    let i18n;

    beforeEach(function () {
      i18n = {
        __: () => {
          return 'YES';
        },
      };
    });

    Object.keys(Frameworks).forEach((key) => {
      describe(`.${key}`, function () {
        it(`returns 'YES' when framework key is ${key}`, function () {
          const subscription = key;
          const candidateData = new CandidateData({ i18n, subscription });
          expect(candidateData[key]).to.be.equal('YES');
        });
        it(`returns empty string if complementaryCertification key is NOT $(key)`, function () {
          const subscription = { key: 'OTHER_KEY' };
          const candidateData = new CandidateData({ i18n, subscription });
          expect(candidateData[key]).to.be.equal('');
        });
      });
    });

    describe('use empty string instead of null value', function () {
      it('replace null by empty string for id attribute', function () {
        const candidateData = new CandidateData({ i18n, id: null });
        expect(candidateData.id).to.equal('');
      });
    });

    describe('birthCity', function () {
      it('set empty birthCity if birthCountry is france and birthINSEECode', function () {
        const birthINSEECode = '75115';
        const birthCountry = 'FRANCE';
        const birthCity = 'Paris';
        const candidateData = new CandidateData({ i18n, birthCountry, birthINSEECode, birthCity });
        expect(candidateData.birthCity).to.equal('');
      });

      it('set birthCity if birthCountry is france and there is no birthINSEECode', function () {
        const birthINSEECode = undefined;
        const birthCountry = 'FRANCE';
        const birthCity = 'Paris';
        const candidateData = new CandidateData({ i18n, birthCountry, birthINSEECode, birthCity });
        expect(candidateData.birthCity).to.equal('Paris');
      });

      it('set birthCity if birthCountry is not france', function () {
        const birthINSEECode = undefined;
        const birthCountry = 'SPAIN';
        const birthCity = 'Madrid';
        const candidateData = new CandidateData({ i18n, birthCountry, birthINSEECode, birthCity });
        expect(candidateData.birthCity).to.equal('Madrid');
      });
    });

    describe('birthINSEECode', function () {
      it('set to 99 if birthINSEECode is not france and INSEE CODE not equal to 99100', function () {
        const birthINSEECode = '99127';
        const birthCountry = 'ITALY';
        const candidateData = new CandidateData({ i18n, birthINSEECode, birthCountry });
        expect(candidateData.birthINSEECode).to.equal('99');
      });

      it('set to given birthINSEECode if birthCountry is france', function () {
        const birthINSEECode = '75115';
        const birthCountry = 'FRANCE';
        const candidateData = new CandidateData({ i18n, birthCountry, birthINSEECode });
        expect(candidateData.birthINSEECode).to.equal('75115');
      });
    });

    describe('extraTimePercentage', function () {
      it('set to empty string if not a number given', function () {
        const extraTimePercentage = 'string';
        const candidateData = new CandidateData({ i18n, extraTimePercentage });
        expect(candidateData.extraTimePercentage).to.equal('');
      });

      it('set to empty string if number given is negative', function () {
        const extraTimePercentage = -13;
        const candidateData = new CandidateData({ i18n, extraTimePercentage });
        expect(candidateData.extraTimePercentage).to.equal('');
      });

      it('set to value if number given is positive', function () {
        const extraTimePercentage = 25;
        const candidateData = new CandidateData({ i18n, extraTimePercentage });
        expect(candidateData.extraTimePercentage).to.equal(25);
      });
    });
  });
});
