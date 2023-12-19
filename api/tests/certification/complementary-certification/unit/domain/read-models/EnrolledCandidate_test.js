import { domainBuilder, expect } from '../../../../../test-helper.js';
import { EnrolledCandidate } from '../../../../../../src/certification/session/domain/read-models/EnrolledCandidate.js';

describe('Unit | Domain | Read Models | EnrolledCandidate', function () {
  describe('static fromCandidateAndComplementaryCertification', function () {
    context('when no complementary certification is provided', function () {
      it('should build an enrolled candidate', function () {
        // given
        const candidate = domainBuilder.buildCertificationSessionCandidate({ userId: null });

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
