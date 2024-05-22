import { EnrolledCandidate } from '../../../../../../src/certification/enrolment/domain/read-models/EnrolledCandidate.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Read Models | EnrolledCandidate', function () {
  describe('static fromCandidateAndComplementaryCertification', function () {
    context('when no complementary certification is provided', function () {
      it('should build an enrolled candidate', function () {
        // given
        const candidate = domainBuilder.certification.session.buildCertificationSessionCandidate({ userId: null });

        // when
        const enrolledCandidate = EnrolledCandidate.fromCandidateAndComplementaryCertification({
          candidate,
        });

        // then
        expect(enrolledCandidate).to.deepEqualInstance(
          new EnrolledCandidate({
            ...candidate,
            isLinked: false,
            complementaryCertificationId: undefined,
            complementaryCertificationLabel: undefined,
            complementaryCertificationKey: undefined,
          }),
        );
      });
    });
  });
});
