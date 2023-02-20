import { expect } from '../../../test-helper';
import CleaCertifiedCandidate from '../../../../lib/domain/read-models/CleaCertifiedCandidate';

describe('Unit | Domain | Models | CleaCertifiedCandidate', function () {
  describe('#isBornInAForeignCountry', function () {
    describe('when the candidate is born in a foreign country', function () {
      it('should return true', function () {
        // given
        const cleaCertifiedCandidate = new CleaCertifiedCandidate({ birthINSEECode: '99100' });

        // when
        const bornInAForeignCountry = cleaCertifiedCandidate.isBornInAForeignCountry;

        // then
        expect(bornInAForeignCountry).to.be.true;
      });
    });
    describe('when the candidate is born in France', function () {
      it('should return false', function () {
        // given
        const cleaCertifiedCandidate = new CleaCertifiedCandidate({ birthINSEECode: '94700' });

        // when
        const bornInAForeignCountry = cleaCertifiedCandidate.isBornInAForeignCountry;

        // then
        expect(bornInAForeignCountry).to.be.false;
      });
    });
  });

  describe('#geographicAreaOfBirthCode', function () {
    describe('when the candidate is born in a foreign country', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        {
          code: '100',
          INSEECode: '99102',
        },
        {
          code: '200',
          INSEECode: '99201',
        },
        {
          code: '300',
          INSEECode: '99302',
        },
        {
          code: '400',
          INSEECode: '99402',
        },
        {
          code: '500',
          INSEECode: '99502',
        },
      ].forEach(({ code, INSEECode }) => {
        it(`should return ${code}`, function () {
          // given
          const cleaCertifiedCandidate = new CleaCertifiedCandidate({ birthINSEECode: INSEECode });

          // when
          const geographicAreaOfBirthCode = cleaCertifiedCandidate.geographicAreaOfBirthCode;

          // then
          expect(geographicAreaOfBirthCode).to.equal(code);
        });
      });
    });
    describe('when the candidate is born in France', function () {
      it('should return null', function () {
        // given
        const cleaCertifiedCandidate = new CleaCertifiedCandidate({ birthINSEECode: '94700' });

        // when
        const geographicAreaOfBirthCode = cleaCertifiedCandidate.geographicAreaOfBirthCode;

        // then
        expect(geographicAreaOfBirthCode).to.be.null;
      });
    });
  });

  describe('#isBornInFrenchOutermostRegion', function () {
    describe('when the candidate is born in outermost region', function () {
      describe('when the candidate has a INSEE code', function () {
        it('should return true', function () {
          // given
          const cleaCertifiedCandidate = new CleaCertifiedCandidate({ birthINSEECode: '97302' });

          // when
          const bornInFrenchOutermostRegion = cleaCertifiedCandidate.isBornInFrenchOutermostRegion;

          // then
          expect(bornInFrenchOutermostRegion).to.be.true;
        });
      });
      describe('when the candidate has a postal code', function () {
        it('should return true', function () {
          // given
          const cleaCertifiedCandidate = new CleaCertifiedCandidate({ birthPostalCode: '97302' });

          // when
          const bornInFrenchOutermostRegion = cleaCertifiedCandidate.isBornInFrenchOutermostRegion;

          // then
          expect(bornInFrenchOutermostRegion).to.be.true;
        });
      });
    });

    describe('when the candidate is not born in outermost region', function () {
      describe('when the candidate has a INSEE code', function () {
        it('should return false', function () {
          // given
          const cleaCertifiedCandidate = new CleaCertifiedCandidate({ birthINSEECode: '37300' });

          // when
          const bornInFrenchOutermostRegion = cleaCertifiedCandidate.isBornInFrenchOutermostRegion;

          // then
          expect(bornInFrenchOutermostRegion).to.be.false;
        });
      });
      describe('when the candidate has a postal code', function () {
        it('should return false', function () {
          // given
          const cleaCertifiedCandidate = new CleaCertifiedCandidate({ birthPostalCode: '37300' });

          // when
          const bornInFrenchOutermostRegion = cleaCertifiedCandidate.isBornInFrenchOutermostRegion;

          // then
          expect(bornInFrenchOutermostRegion).to.be.false;
        });
      });
    });
  });
});
