import { LABEL_FOR_CORE } from '../../../../../../src/certification/enrolment/domain/models/UserCertificabilityCalculator.js';
import { services } from '../../../../../../src/certification/enrolment/domain/services/index.js';
import { usecases } from '../../../../../../src/certification/enrolment/domain/usecases/index.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | UseCase | get-user-certification-eligibility', function () {
  let complementaryCertificationBadgeRepository;
  let getUserCertificabilityStub;
  const userId = 123;

  beforeEach(function () {
    complementaryCertificationBadgeRepository = {
      findAll: sinon.stub(),
    };
    getUserCertificabilityStub = sinon.stub(services.userCertificabilityService, 'getUserCertificability');
  });

  context('v2', function () {
    let certificabilityV2Data;
    let complementary1BadgeData;
    let complementary2BadgeData;
    let complementary3BadgeData;
    let complementary4BadgeData;

    beforeEach(function () {
      complementary1BadgeData = {
        id: 'badgeId1',
        label: 'badge1Label',
        imageUrl: 'badge1ImageUrl',
      };
      complementary2BadgeData = {
        id: 'badgeId2',
        label: 'badge2Label',
        imageUrl: 'badge2ImageUrl',
      };
      complementary3BadgeData = {
        id: 'badgeId3',
        label: 'badge3Label',
        imageUrl: 'badge3ImageUrl',
      };
      complementary4BadgeData = {
        id: 'badgeId4',
        label: 'badge4Label',
        imageUrl: 'badge4ImageUrl',
      };
      complementaryCertificationBadgeRepository.findAll
        .withArgs()
        .resolves([
          domainBuilder.certification.enrolment.buildComplementaryCertificationBadge(complementary1BadgeData),
          domainBuilder.certification.enrolment.buildComplementaryCertificationBadge(complementary2BadgeData),
          domainBuilder.certification.enrolment.buildComplementaryCertificationBadge(complementary3BadgeData),
          domainBuilder.certification.enrolment.buildComplementaryCertificationBadge(complementary4BadgeData),
        ]);
    });
    context('when pix certification is not eligible', function () {
      beforeEach(function () {
        certificabilityV2Data = [{ certification: LABEL_FOR_CORE, isCertifiable: false }];
      });
      it('should return the user certification eligibility without eligible complementary certifications', async function () {
        // given
        getUserCertificabilityStub.withArgs({ userId }).resolves(
          domainBuilder.certification.enrolment.buildUserCertificability({
            userId,
            certificabilityV2: [{ certification: LABEL_FOR_CORE, isCertifiable: false }],
          }),
        );

        // when
        const certificationEligibility = await usecases.getUserCertificationEligibility({
          userId,
          complementaryCertificationBadgeRepository,
        });

        // then
        const expectedCertificationEligibility = domainBuilder.certification.enrolment.buildCertificationEligibility({
          id: userId,
          pixCertificationEligible: false,
          complementaryCertifications: [],
        });
        expect(certificationEligibility).to.deep.equal(expectedCertificationEligibility);
      });
    });

    context('when pix certification is eligible', function () {
      beforeEach(function () {
        certificabilityV2Data = [{ certification: LABEL_FOR_CORE, isCertifiable: true }];
      });
      context('when some complementary certifications are eligible', function () {
        it('should return the user certification eligibilities', async function () {
          // given
          certificabilityV2Data.push(
            _buildComplementaryCertificabilityItem({
              certification: 'complementaryEligible1',
              isCertifiable: true,
              complementaryCertificationBadgeId: complementary1BadgeData.id,
              isOutdated: false,
              isCoreCertifiable: true,
              hasComplementaryCertificationForThisLevel: false,
              versionsBehind: 0,
            }),
            _buildComplementaryCertificabilityItem({
              certification: 'complementaryEligible2',
              isCertifiable: true,
              complementaryCertificationBadgeId: complementary2BadgeData.id,
              isOutdated: false,
              isCoreCertifiable: true,
              hasComplementaryCertificationForThisLevel: false,
              versionsBehind: 0,
            }),
            _buildComplementaryCertificabilityItem({
              certification: 'complementaryNotEligible3',
              isCertifiable: false,
              complementaryCertificationBadgeId: complementary3BadgeData.id,
              isOutdated: true,
              isCoreCertifiable: true,
              hasComplementaryCertificationForThisLevel: false,
              versionsBehind: 20,
            }),
          );
          getUserCertificabilityStub.withArgs({ userId }).resolves(
            domainBuilder.certification.enrolment.buildUserCertificability({
              userId,
              certificabilityV2: certificabilityV2Data,
            }),
          );

          // when
          const certificationEligibility = await usecases.getUserCertificationEligibility({
            userId,
            complementaryCertificationBadgeRepository,
          });

          // then
          const expectedCertificationEligibility = domainBuilder.certification.enrolment.buildCertificationEligibility({
            id: userId,
            pixCertificationEligible: true,
            complementaryCertifications: [
              {
                label: complementary1BadgeData.label,
                imageUrl: complementary1BadgeData.imageUrl,
                isOutdated: false,
                isAcquiredExpectedLevel: false,
              },
              {
                label: complementary2BadgeData.label,
                imageUrl: complementary2BadgeData.imageUrl,
                isOutdated: false,
                isAcquiredExpectedLevel: false,
              },
            ],
          });
          expect(certificationEligibility).to.deep.equal(expectedCertificationEligibility);
        });
        it('should not return those for which user has a certification already', async function () {
          // given
          certificabilityV2Data.push(
            _buildComplementaryCertificabilityItem({
              certification: 'complementaryEligiblePasDeCertif',
              isCertifiable: true,
              complementaryCertificationBadgeId: complementary1BadgeData.id,
              isOutdated: false,
              isCoreCertifiable: true,
              hasComplementaryCertificationForThisLevel: false,
              versionsBehind: 0,
            }),
            _buildComplementaryCertificabilityItem({
              certification: 'complementaryEligibleAvecCertif',
              isCertifiable: true,
              complementaryCertificationBadgeId: complementary2BadgeData.id,
              isOutdated: false,
              isCoreCertifiable: true,
              hasComplementaryCertificationForThisLevel: true,
              versionsBehind: 0,
            }),
          );
          getUserCertificabilityStub.withArgs({ userId }).resolves(
            domainBuilder.certification.enrolment.buildUserCertificability({
              userId,
              certificabilityV2: certificabilityV2Data,
            }),
          );

          // when
          const certificationEligibility = await usecases.getUserCertificationEligibility({
            userId,
            complementaryCertificationBadgeRepository,
          });

          // then
          const expectedCertificationEligibility = domainBuilder.certification.enrolment.buildCertificationEligibility({
            id: userId,
            pixCertificationEligible: true,
            complementaryCertifications: [
              {
                label: complementary1BadgeData.label,
                imageUrl: complementary1BadgeData.imageUrl,
                isOutdated: false,
                isAcquiredExpectedLevel: false,
              },
            ],
          });
          expect(certificationEligibility).to.deep.equal(expectedCertificationEligibility);
        });
      });
      context(
        'when some complementary certifications are not eligible only because badge is outdated by one version',
        function () {
          it('should return eligibility for the ones outdated by only one version', async function () {
            // given
            certificabilityV2Data.push(
              _buildComplementaryCertificabilityItem({
                certification: 'complementaryNotEligibleZeroConditionsFilled',
                isCertifiable: false,
                complementaryCertificationBadgeId: complementary1BadgeData.id,
                isOutdated: true,
                isCoreCertifiable: false,
                hasComplementaryCertificationForThisLevel: false,
                versionsBehind: 20,
              }),
              _buildComplementaryCertificabilityItem({
                certification: 'complementaryNotEligibleBadgeWayTooOld',
                isCertifiable: false,
                complementaryCertificationBadgeId: complementary2BadgeData.id,
                isOutdated: true,
                isCoreCertifiable: true,
                hasComplementaryCertificationForThisLevel: false,
                versionsBehind: 2,
              }),
              _buildComplementaryCertificabilityItem({
                certification: 'complementaryNotEligibleBadgeOldOneVersionAndWithCertification',
                isCertifiable: false,
                complementaryCertificationBadgeId: complementary3BadgeData.id,
                isOutdated: true,
                isCoreCertifiable: true,
                hasComplementaryCertificationForThisLevel: true,
                versionsBehind: 1,
              }),
              _buildComplementaryCertificabilityItem({
                certification: 'complementaryNotEligibleBadgeOldOneVersionAndNoCertification',
                isCertifiable: false,
                complementaryCertificationBadgeId: complementary4BadgeData.id,
                isOutdated: true,
                isCoreCertifiable: true,
                hasComplementaryCertificationForThisLevel: false,
                versionsBehind: 1,
              }),
            );
            getUserCertificabilityStub.withArgs({ userId }).resolves(
              domainBuilder.certification.enrolment.buildUserCertificability({
                userId,
                certificabilityV2: certificabilityV2Data,
              }),
            );

            // when
            const certificationEligibility = await usecases.getUserCertificationEligibility({
              userId,
              complementaryCertificationBadgeRepository,
            });

            // then
            const expectedCertificationEligibility =
              domainBuilder.certification.enrolment.buildCertificationEligibility({
                id: userId,
                pixCertificationEligible: true,
                complementaryCertifications: [
                  {
                    label: complementary3BadgeData.label,
                    imageUrl: complementary3BadgeData.imageUrl,
                    isOutdated: true,
                    isAcquiredExpectedLevel: true,
                  },
                  {
                    label: complementary4BadgeData.label,
                    imageUrl: complementary4BadgeData.imageUrl,
                    isOutdated: true,
                    isAcquiredExpectedLevel: false,
                  },
                ],
              });
            expect(certificationEligibility).to.deep.equal(expectedCertificationEligibility);
          });
        },
      );
    });
  });
});

function _buildComplementaryCertificabilityItem({
  certification,
  isCertifiable,
  complementaryCertificationBadgeId,
  isOutdated,
  isCoreCertifiable,
  hasComplementaryCertificationForThisLevel,
  versionsBehind,
}) {
  return {
    certification,
    isCertifiable,
    complementaryCertificationBadgeId,
    why: { isOutdated, isCoreCertifiable },
    info: { hasComplementaryCertificationForThisLevel, versionsBehind },
  };
}
