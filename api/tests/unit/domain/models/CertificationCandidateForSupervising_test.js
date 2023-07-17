import { expect, domainBuilder } from '../../../test-helper.js';

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

  describe('#isStillEligibleToComplementaryCertification', function () {
    context('when candidate has a complementary certification', function () {
      context(
        'when candidate has still valid badge acquisition related to his complementary certification',
        function () {
          it('Should return true', function () {
            // given
            const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising({
              key: 'aKey',
            });

            const certificationCandidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising({
              enrolledComplementaryCertification: complementaryCertification,
              stillValidBadgeAcquisitions: [
                domainBuilder.buildCertifiableBadgeAcquisition({
                  complementaryCertificationKey: 'aKey',
                }),
              ],
            });

            // when
            const isStillEligibleToComplementaryCertification =
              certificationCandidateForSupervising.isStillEligibleToComplementaryCertification;

            // then
            expect(isStillEligibleToComplementaryCertification).to.be.true;
          });
        },
      );

      context(
        'when candidate has no still valid badge acquisition related to his complementary certification',
        function () {
          it('Should return false', function () {
            // given
            const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising();
            const certificationCandidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising({
              enrolledComplementaryCertification: complementaryCertification,
              stillValidBadgeAcquisitions: [],
            });

            // when
            const isStillEligibleToComplementaryCertification =
              certificationCandidateForSupervising.isStillEligibleToComplementaryCertification;

            // then
            expect(isStillEligibleToComplementaryCertification).to.be.false;
          });
        },
      );

      context(
        'when candidate has still valid badge acquisition  not related to his complementary certification',
        function () {
          it('Should return false', function () {
            // given
            const certificationCandidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising({
              enrolledComplementaryCertification: 'Une certif complémentaire',
              stillValidBadgeAcquisitions: [
                domainBuilder.buildCertifiableBadgeAcquisition({
                  complementaryCertificationBadgeLabel: 'Une autre certif complémentaire',
                }),
              ],
            });

            // when
            const isStillEligibleToComplementaryCertification =
              certificationCandidateForSupervising.isStillEligibleToComplementaryCertification;

            // then
            expect(isStillEligibleToComplementaryCertification).to.be.false;
          });
        },
      );
    });

    context('when candidate has no complementary certification', function () {
      it('Should return false', function () {
        // given
        const certificationCandidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising({
          enrolledComplementaryCertification: null,
          stillValidBadgeAcquisitions: [],
        });

        // when
        const isStillEligibleToComplementaryCertification =
          certificationCandidateForSupervising.isStillEligibleToComplementaryCertification;

        // then
        expect(isStillEligibleToComplementaryCertification).to.be.false;
      });
    });
  });
});
