const { expect } = require('../../../test-helper');
const ComplementaryCertificationCourseResultsForJuryCertification = require('../../../../lib/domain/read-models/ComplementaryCertificationCourseResultsForJuryCertification');

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
});
