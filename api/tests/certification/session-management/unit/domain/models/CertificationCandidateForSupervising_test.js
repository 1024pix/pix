import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
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

  describe('#isStillEligibleToDoubleCertification', function () {
    context('when candidate is enrolled for CLEA and has a valid badge', function () {
      it('returns true', function () {
        // given
        const certificationCandidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising({
          subscription: Frameworks.CLEA,
          stillValidBadgeAcquisitions: [
            domainBuilder.buildCertifiableBadgeAcquisition({
              complementaryCertificationKey: Frameworks.CLEA,
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

    context('when candidate is not enrolled for CLEA', function () {
      it('returns false', function () {
        // given
        const certificationCandidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising({
          subscription: Frameworks.CORE,
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

  describe('#get theoricalEndDateTime', function () {
    context('when candidate start certification date is invalid', function () {
      it('returns null', function () {
        const candidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising({
          startDateTime: null,
        });

        expect(candidateForSupervising.theoricalEndDateTime).to.be.null;
      });
    });

    context('when candidate start certification date is valid', function () {
      it('returns the theoritical end certification time based on assessment duration', function () {
        const candidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising({
          startDateTime: new Date('2024-04-01T12:00:00Z'),
          assessmentDuration: 93,
        });

        expect(candidateForSupervising.theoricalEndDateTime).to.deep.equal(new Date('2024-04-01T13:33:00Z'));
      });
    });
  });
});
