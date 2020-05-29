const { expect } = require('../../../test-helper');
const CertificationCleaAcquisition = require('../../../../lib/domain/models/CertificationCleaAcquisition');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');

const GREEN_ZONE_REPRO = [80, 90, 100];
const RED_ZONE_REPRO = [1, 50];
const GREY_ZONE_REPRO = [75];

describe('Unit | Domain | Models | CertificationPartnerAcquisition', () => {

  describe('#hasAcquiredCertification', () => {

    context('when user does not have badge', () => {

      it('for any reproducibility rate, it should not obtain certification', async () => {
        // given
        const certificationPartnerAcquisition = new CertificationCleaAcquisition({
          certificationCourseId: Symbol('certificationCourseId'),
          hasAcquiredBadge: false,
        });

        // when
        const hasAcquiredCertif = certificationPartnerAcquisition.isAcquired();

        // then
        expect(hasAcquiredCertif).to.be.false;
      });
    });

    context('when user has badge', () => {
      context('reproducibility rate in green zone', () => {
        GREEN_ZONE_REPRO.forEach((reproducibilityRate) =>
          it(`for ${reproducibilityRate} reproducibility rate, it should obtain certification`, async () => {
            // given
            const certificationPartnerAcquisition = new CertificationCleaAcquisition({
              certificationCourseId: Symbol('certificationCourseId'),
              hasAcquiredBadge: true,
              reproducibilityRate
            });

            // when
            const hasAcquiredCertif = certificationPartnerAcquisition.isAcquired();

            // then
            expect(hasAcquiredCertif).to.be.true;
          })
        );
      });

      context('reproducibility rate in grey zone', () => {
        const reproducibilityRate = GREY_ZONE_REPRO[0];
        const competenceId1 = 'competenceId1', competenceId2 = 'competenceId2';

        it('for 70 reproducibility rate, it should obtain certification when the pixScore for each certifiable competences is above 75% of Clea corresponding competence\'s pixScore', async () => {
          // given
          const totalPixCleaByCompetence = {
            [competenceId1]: 20,
            [competenceId2]: 10,
            ['competenceId4']: 30,
          };

          const competenceMarks = [
            new CompetenceMark(
              {
                competenceId: competenceId1,
                score: 15
              }
            ),
            new CompetenceMark(
              {
                competenceId: competenceId2,
                score: 7.5
              }
            ),
            new CompetenceMark(
              {
                competenceId: 'competence3',
                score: 0
              }
            ),
          ];

          const certificationPartnerAcquisition = new CertificationCleaAcquisition({
            certificationCourseId: Symbol('certificationCourseId'),
            hasAcquiredBadge: true,
            reproducibilityRate,
            totalPixCleaByCompetence,
            competenceMarks,
          });

          // when
          const hasAcquiredCertif = certificationPartnerAcquisition.isAcquired();

          // then
          expect(hasAcquiredCertif).to.be.true;
        });

        it('for 70 reproducibility rate, it should not obtain certification when the pixScore for each certifiable competences is above 75% of Clea corresponding competence\'s pixScore', async () => {
          // given
          const totalPixCleaByCompetence = {
            [competenceId1]: 20,
            [competenceId2]: 10,
            ['competenceId4']: 30,
          };
          const competenceMarks = [
            new CompetenceMark(
              {
                competenceId: competenceId1,
                score: 15
              }
            ),
            new CompetenceMark(
              {
                competenceId: competenceId2,
                score: 7.4
              }
            ),
            new CompetenceMark(
              {
                competenceId: 'competence3',
                score: 0
              }
            ),
          ];

          const certificationPartnerAcquisition = new CertificationCleaAcquisition({
            certificationCourseId: Symbol('certificationCourseId'),
            hasAcquiredBadge: true,
            reproducibilityRate,
            totalPixCleaByCompetence,
            competenceMarks,
          });

          // when
          const hasAcquiredCertif = certificationPartnerAcquisition.isAcquired();

          // then
          expect(hasAcquiredCertif).to.be.false;
        });
      });

      context('reproducibility rate in red zone', () => {
        RED_ZONE_REPRO.forEach((reproducibilityRate) =>
          it(`for ${reproducibilityRate} reproducibility rate, it should not obtain certification`, async () => {
            // given
            const certificationPartnerAcquisition = new CertificationCleaAcquisition({
              certificationCourseId: Symbol('certificationCourseId'),
              hasAcquiredBadge: true,
              reproducibilityRate,
            });

            // when
            const hasAcquiredCertif = certificationPartnerAcquisition.isAcquired({
              hasAcquiredBadge: true,
              reproducibilityRate
            });

            // then
            expect(hasAcquiredCertif).to.be.false;
          })
        );
      });
    });
  });
});

