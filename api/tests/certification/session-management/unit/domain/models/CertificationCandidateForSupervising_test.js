import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | Certification Candidate for supervising', function () {
  describe('#authorizeToStart', function () {
    it('Should update authorizeToStart property to true', function () {
      // given
      const certificationCandidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising({
        authorizedToStart: false,
      });

      // when
      certificationCandidateForSupervising.authorizeToStart();

      // then
      expect(certificationCandidateForSupervising.authorizedToStart).to.be.true;
    });
  });
});
