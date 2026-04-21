import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
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

  describe('#isStillEligibleToDoubleCertification', function () {
    context('when candidate has a valid double certification badge acquisition', function () {
      it('returns true', function () {
        // given
        const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising({
          key: ComplementaryCertificationKeys.CLEA,
        });

        const certificationCandidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising({
          enrolledDoubleCertification: complementaryCertification,
          stillValidBadgeAcquisitions: [
            domainBuilder.buildCertifiableBadgeAcquisition({
              complementaryCertificationKey: ComplementaryCertificationKeys.CLEA,
            }),
          ],
        });

        // when
        const isStillEligibleToDoubleCertification =
          certificationCandidateForSupervising.isStillEligibleToDoubleCertification;

        // then
        expect(isStillEligibleToDoubleCertification).to.be.true;
      });
    });

    context('when candidate has no double certification badge acquisition', function () {
      it('returns false', function () {
        // given
        const certificationCandidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising({
          enrolledDoubleCertification: null,
          stillValidBadgeAcquisitions: [],
        });

        // when
        const isStillEligibleToDoubleCertification =
          certificationCandidateForSupervising.isStillEligibleToDoubleCertification;

        // then
        expect(isStillEligibleToDoubleCertification).to.be.false;
      });
    });
  });
});
