import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | Certification Candidate V3 for supervising', function () {
  context('when the user has a live alert', function () {
    it('should have a live alert defined', function () {
      // given
      const liveAlert = domainBuilder.buildCertificationChallengeLiveAlert();

      // when
      const certificationCandidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising.v3({
        liveAlert,
      });

      // then
      expect(certificationCandidateForSupervising.liveAlert).to.deep.equal(
        domainBuilder.buildCertificationChallengeLiveAlert(),
      );
    });
  });
});
