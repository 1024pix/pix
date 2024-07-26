import { ComplementaryCertificationCourseResultForJuryCertification } from '../../../../../../src/certification/session-management/domain/read-models/ComplementaryCertificationCourseResultForJuryCertification.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Session-management | Unit | Domain | Read-models | ComplementaryCertificationCourseResultForJuryCertification', function () {
  describe('#status', function () {
    describe('when the complementary certification course result is acquired', function () {
      it('should return Validée', function () {
        // given
        const complementaryCertificationCourseResultForJuryCertification =
          new ComplementaryCertificationCourseResultForJuryCertification({ acquired: true });

        // when
        const status = complementaryCertificationCourseResultForJuryCertification.status;

        // then
        expect(status).to.equal('Validée');
      });
    });

    describe('when the complementary certification course result is not acquired', function () {
      it('should return Rejetée', function () {
        // given
        const complementaryCertificationCourseResultForJuryCertification =
          new ComplementaryCertificationCourseResultForJuryCertification({ acquired: false });

        // when
        const status = complementaryCertificationCourseResultForJuryCertification.status;

        // then
        expect(status).to.equal('Rejetée');
      });
    });
  });

  describe('#from', function () {
    it('should return an instance of ComplementaryCertificationCourseResultForJuryCertification', function () {
      // given
      const id = 121;
      const acquired = true;
      const label = 'label';
      const complementaryCertificationBadgeId = 99;

      // when
      const result = ComplementaryCertificationCourseResultForJuryCertification.from({
        id,
        complementaryCertificationBadgeId,
        acquired,
        label,
      });

      // then
      expect(result).to.deepEqualInstance(
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertification({
          id,
          complementaryCertificationBadgeId,
          acquired,
          label,
        }),
      );
    });
  });
});
