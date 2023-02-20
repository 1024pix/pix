import { expect, domainBuilder } from '../../../test-helper';
import ComplementaryCertificationCourseResultsForJuryCertification from '../../../../lib/domain/read-models/ComplementaryCertificationCourseResultsForJuryCertification';

describe('Unit | Domain | Models | ComplementaryCertificationCourseResultsForJuryCertification', function () {
  describe('#status', function () {
    describe('when the complementary certification course result is acquired', function () {
      it('should return Validée', function () {
        // given
        const complementaryCertificationCourseResultsForJuryCertification =
          new ComplementaryCertificationCourseResultsForJuryCertification({ acquired: true });

        // when
        const status = complementaryCertificationCourseResultsForJuryCertification.status;

        // then
        expect(status).to.equal('Validée');
      });
    });

    describe('when the complementary certification course result is not acquired', function () {
      it('should return Rejetée', function () {
        // given
        const complementaryCertificationCourseResultsForJuryCertification =
          new ComplementaryCertificationCourseResultsForJuryCertification({ acquired: false });

        // when
        const status = complementaryCertificationCourseResultsForJuryCertification.status;

        // then
        expect(status).to.equal('Rejetée');
      });
    });
  });

  describe('#from', function () {
    it('should return an instance of ComplementaryCertificationCourseResultsForJuryCertification', function () {
      // given
      const id = 121;
      const partnerKey = 'KEY';
      const acquired = true;
      const label = 'label';

      // when
      const result = ComplementaryCertificationCourseResultsForJuryCertification.from({
        id,
        partnerKey,
        acquired,
        label,
      });

      // then
      expect(result).to.deepEqualInstance(
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertification({
          id,
          partnerKey,
          acquired,
          label,
        })
      );
    });
  });
});
