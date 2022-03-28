const {
  expect,
  databaseBuilder,
  domainBuilder,
  knex,
  sinon,
  mockLearningContent,
  catchErr,
} = require('../../../test-helper');
const partnerCertificationScoringRepository = require('../../../../lib/infrastructure/repositories/partner-certification-scoring-repository');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const Badge = require('../../../../lib/domain/models/Badge');
const { NotEligibleCandidateError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Partner Certification Scoring', function () {
  const COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME = 'complementary-certification-course-results';

  describe('#save', function () {
    afterEach(async function () {
      await knex(COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME).delete();
      await knex('certification-courses').delete();
      await knex('badges').delete();
    });

    it('should insert the complementary certification course results in db if it does not already exists by partnerKey', async function () {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const partnerCertificationScoring = domainBuilder.buildCleaCertificationScoring({
        certificationCourseId,
      });
      databaseBuilder.factory.buildBadge({ key: partnerCertificationScoring.partnerKey });
      await databaseBuilder.commit();
      sinon.stub(partnerCertificationScoring, 'isAcquired').returns(true);

      // when
      await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

      // then
      const partnerCertificationSaved = await knex(COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME).select();
      expect(partnerCertificationSaved).to.deep.equal([
        {
          certificationCourseId: partnerCertificationScoring.certificationCourseId,
          partnerKey: partnerCertificationScoring.partnerKey,
          acquired: true,
          temporaryPartnerKey: null,
        },
      ]);
    });

    it('should update the existing complementary certification course results if it exists by partnerKey', async function () {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const partnerCertificationScoring = domainBuilder.buildCleaCertificationScoring({
        certificationCourseId,
      });
      databaseBuilder.factory.buildBadge({ key: partnerCertificationScoring.partnerKey });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        certificationCourseId: partnerCertificationScoring.certificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
      });
      await databaseBuilder.commit();
      sinon.stub(partnerCertificationScoring, 'isAcquired').returns(false);

      // when
      await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

      // then
      const complementaryCertificationCourseResultSaved = await knex(
        COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME
      ).select();
      expect(complementaryCertificationCourseResultSaved).to.have.length(1);
      expect(complementaryCertificationCourseResultSaved[0]).to.deep.equal({
        certificationCourseId: partnerCertificationScoring.certificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
        acquired: false,
        temporaryPartnerKey: null,
      });
    });

    it('should insert the complementary certification course results in db if it does not already exists by temporaryPartnerKey', async function () {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const partnerCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
        certificationCourseId,
      });
      databaseBuilder.factory.buildBadge({ key: partnerCertificationScoring.temporaryPartnerKey });
      await databaseBuilder.commit();
      sinon.stub(partnerCertificationScoring, 'isAcquired').returns(true);

      // when
      await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

      // then
      const complementaryCertificationCourseResultSaved = await knex(
        COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME
      ).select();
      expect(complementaryCertificationCourseResultSaved).to.have.length(1);
      expect(complementaryCertificationCourseResultSaved[0]).to.deep.equal({
        certificationCourseId: partnerCertificationScoring.certificationCourseId,
        partnerKey: null,
        acquired: true,
        temporaryPartnerKey: partnerCertificationScoring.temporaryPartnerKey,
      });
    });

    it('should update the existing complementary certification course results if it exists by temporaryPartnerKey', async function () {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const partnerCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
        certificationCourseId,
      });
      databaseBuilder.factory.buildBadge({ key: partnerCertificationScoring.temporaryPartnerKey });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        certificationCourseId: partnerCertificationScoring.certificationCourseId,
        temporaryPartnerKey: partnerCertificationScoring.temporaryPartnerKey,
      });
      await databaseBuilder.commit();
      sinon.stub(partnerCertificationScoring, 'isAcquired').returns(false);

      // when
      await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

      // then
      const complementaryCertificationCourseResultSaved = await knex(
        COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME
      ).select();
      expect(complementaryCertificationCourseResultSaved).to.have.length(1);
      expect(complementaryCertificationCourseResultSaved[0]).to.deep.equal({
        certificationCourseId: partnerCertificationScoring.certificationCourseId,
        partnerKey: null,
        acquired: false,
        temporaryPartnerKey: partnerCertificationScoring.temporaryPartnerKey,
      });
    });
  });

  describe('#buildCleaCertificationScoring', function () {
    context('when the user does not have no cleA badge', function () {
      it('should build a CleaCertificationScoring that throws a NotEligibleCandidateError', async function () {
        // given
        const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
        const learningContent = { skills: [skill] };
        mockLearningContent(learningContent);
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
        const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
          certificationCourseId,
          userId,
          reproducibilityRate: 75,
          skillRepository,
        });

        // when
        const error = await catchErr(cleaCertificationScoring.isAcquired, cleaCertificationScoring)();

        // then
        expect(error).to.be.instanceOf(NotEligibleCandidateError);
      });
    });

    context('when the user has a cleA badge', function () {
      context('when the badge was obtained after the certification test was taken', function () {
        it('should build a CleaCertificationScoring that throws a NotEligibleCandidateError', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId,
            createdAt: new Date('2020-01-01'),
          }).id;
          const badgeId = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA }).id;
          databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId, createdAt: new Date('2021-06-06') });
          await databaseBuilder.commit();
          const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
          const learningContent = { skills: [skill] };
          mockLearningContent(learningContent);
          const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
            certificationCourseId,
            userId,
            reproducibilityRate: 75,
            skillRepository,
          });

          // when
          const error = await catchErr(cleaCertificationScoring.isAcquired, cleaCertificationScoring)();

          // then
          expect(error).to.be.instanceOf(NotEligibleCandidateError);
        });
      });

      context('when the badge was obtained before the certification test was taken', function () {
        let userId;
        let badgeId;
        let certificationCourseId;

        beforeEach(function () {
          userId = databaseBuilder.factory.buildUser().id;
          certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId,
            createdAt: new Date('2021-04-04'),
          }).id;
          badgeId = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA }).id;
          databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId, createdAt: new Date('2000-01-01') });
          return databaseBuilder.commit();
        });

        context('when user reproducibility rate is below minimum rate', function () {
          it('should build a not acquired CleaCertificationScoring', async function () {
            // given
            const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
            const learningContent = { skills: [skill] };
            mockLearningContent(learningContent);

            // when
            const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
              certificationCourseId,
              userId,
              reproducibilityRate: 10,
              skillRepository,
            });

            // then
            expect(cleaCertificationScoring.isAcquired()).to.be.false;
          });
        });

        context('when user reproducibility rate is above trusted rate', function () {
          it('should build an acquired CleaCertificationScoring', async function () {
            // given
            const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
            const learningContent = { skills: [skill] };
            mockLearningContent(learningContent);

            // when
            const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
              certificationCourseId,
              userId,
              reproducibilityRate: 95,
              skillRepository,
            });

            // then
            expect(cleaCertificationScoring.isAcquired()).to.be.true;
          });
        });

        context(
          'when user reproducibility rate is in between minimum repro rate and trusted repro rate (grey zone)',
          function () {
            it('should build CleaCertificationScoring containing a hash of expectedPixByCompetenceForClea based on operative clea skills', async function () {
              // given
              const cleaSkill1Comp1 = domainBuilder.buildSkill({
                id: 'recSkill1_1',
                competenceId: 'recCompetence1',
                pixValue: 3,
              });
              const cleaSkill2Comp1 = domainBuilder.buildSkill({
                id: 'recSkill1_2',
                competenceId: 'recCompetence1',
                pixValue: 6,
              });
              const cleaSkill1Comp2 = domainBuilder.buildSkill({
                id: 'recSkill2_1',
                competenceId: 'recCompetence2',
                pixValue: 4,
              });
              const cleaSkill2Comp2 = domainBuilder.buildSkill({
                id: 'recSkill2_2',
                competenceId: 'recCompetence2',
                pixValue: 1,
              });
              const cleaSkill1Comp3 = domainBuilder.buildSkill({
                id: 'recSkill3_1',
                competenceId: 'recCompetence3',
                pixValue: 2,
              });
              const someOtherSkill = domainBuilder.buildSkill({
                id: 'recSkillOther',
                competenceId: 'recComptence3',
                pixValue: 66,
              });
              const learningContent = {
                skills: [
                  { ...cleaSkill1Comp1, status: 'actif' },
                  { ...cleaSkill2Comp1, status: 'actif' },
                  { ...cleaSkill1Comp2, status: 'actif' },
                  { ...cleaSkill2Comp2, status: 'périmé' },
                  { ...cleaSkill1Comp3, status: 'actif' },
                  { ...someOtherSkill, status: 'actif' },
                ],
              };
              await mockLearningContent(learningContent);
              databaseBuilder.factory.buildSkillSet({
                badgeId,
                skillIds: ['recSkill1_1', 'recSkill2_2'],
                name: 'badgePart1',
              });
              databaseBuilder.factory.buildSkillSet({
                badgeId,
                skillIds: ['recSkill1_2', 'recSkill2_1', 'recSkill3_1'],
                name: 'badgePart2',
              });
              await databaseBuilder.commit();

              // when
              const cleaCertificationScoring =
                await partnerCertificationScoringRepository.buildCleaCertificationScoring({
                  certificationCourseId,
                  userId,
                  reproducibilityRate: 60,
                  skillRepository,
                });

              // then
              expect(cleaCertificationScoring.expectedPixByCompetenceForClea).to.deep.equal({
                recCompetence1: 9,
                recCompetence2: 4,
                recCompetence3: 2,
              });
            });

            it('should build CleaCertificationScoring containing a the user competence marks of clea competences only', async function () {
              // given
              const cleaSkill1Comp1 = domainBuilder.buildSkill({ id: 'recSkill1_1', competenceId: 'recCompetence1' });
              const cleaSkill1Comp2 = domainBuilder.buildSkill({ id: 'recSkill2_1', competenceId: 'recCompetence2' });
              const learningContent = {
                skills: [
                  { ...cleaSkill1Comp1, status: 'actif' },
                  { ...cleaSkill1Comp2, status: 'actif' },
                ],
              };
              await mockLearningContent(learningContent);
              databaseBuilder.factory.buildSkillSet({
                badgeId,
                skillIds: ['recSkill1_1', 'recSkill2_1'],
                name: 'badgePart1',
              });
              const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId, userId }).id;
              const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({ assessmentId }).id;
              const cleaCompetenceMark1 = domainBuilder.buildCompetenceMark({
                id: 123,
                assessmentResultId,
                area_code: '1',
                competence_code: '1.1',
                competenceId: 'recCompetence1',
                level: 0,
                score: 13,
              });
              const cleaCompetenceMark2 = domainBuilder.buildCompetenceMark({
                id: 456,
                assessmentResultId,
                area_code: '2',
                competence_code: '2.1',
                competenceId: 'recCompetence2',
                level: 0,
                score: 8,
              });
              const otherCompetenceMark = domainBuilder.buildCompetenceMark({
                id: 789,
                assessmentResultId,
                area_code: '3',
                competence_code: '3.1',
                competenceId: 'recCompetence3',
                level: 0,
                score: 11,
              });
              databaseBuilder.factory.buildCompetenceMark(cleaCompetenceMark1);
              databaseBuilder.factory.buildCompetenceMark(cleaCompetenceMark2);
              databaseBuilder.factory.buildCompetenceMark(otherCompetenceMark);
              await databaseBuilder.commit();

              // when
              const cleaCertificationScoring =
                await partnerCertificationScoringRepository.buildCleaCertificationScoring({
                  certificationCourseId,
                  userId,
                  reproducibilityRate: 60,
                  skillRepository,
                });

              // then
              expect(cleaCertificationScoring.cleaCompetenceMarks).to.deep.equal([
                cleaCompetenceMark1,
                cleaCompetenceMark2,
              ]);
            });
          }
        );

        context('when user has more than one clea badges obtained before certification test was taken', function () {
          it('should compute the cleA scoring based on the most recently obtained cleA badge', async function () {
            // given
            const anotherBadgeId = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA_V2 }).id;
            databaseBuilder.factory.buildBadgeAcquisition({
              userId,
              badgeId: anotherBadgeId,
              createdAt: new Date('2015-01-01'),
            });
            const oldCleaSkill1Comp1 = domainBuilder.buildSkill({ id: 'recSkill1_1', competenceId: 'recCompetence1' });
            const oldCleaSkill1Comp2 = domainBuilder.buildSkill({ id: 'recSkill2_1', competenceId: 'recCompetence2' });
            const newCleaSkillACompB = domainBuilder.buildSkill({ id: 'recSkillA_B', competenceId: 'recCompetenceA' });
            const newCleaSkillCCompD = domainBuilder.buildSkill({ id: 'recSkillC_D', competenceId: 'recCompetenceD' });
            const learningContent = {
              skills: [
                { ...oldCleaSkill1Comp1, status: 'actif' },
                { ...oldCleaSkill1Comp2, status: 'actif' },
                { ...newCleaSkillACompB, status: 'actif' },
                { ...newCleaSkillCCompD, status: 'actif' },
              ],
            };
            await mockLearningContent(learningContent);
            databaseBuilder.factory.buildSkillSet({
              badgeId,
              skillIds: ['recSkill1_1', 'recSkill2_1'],
              name: 'old_clea',
            });
            databaseBuilder.factory.buildSkillSet({
              badgeId: anotherBadgeId,
              skillIds: ['recSkillA_B', 'recSkillC_D'],
              name: 'new_clea',
            });
            const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId, userId }).id;
            const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({ assessmentId }).id;
            const cleaCompetenceMark1 = domainBuilder.buildCompetenceMark({
              id: 123,
              assessmentResultId,
              area_code: '1',
              competence_code: '1.1',
              competenceId: 'recCompetenceA',
              level: 0,
              score: 13,
            });
            const cleaCompetenceMark2 = domainBuilder.buildCompetenceMark({
              id: 456,
              assessmentResultId,
              area_code: '2',
              competence_code: '2.1',
              competenceId: 'recCompetenceD',
              level: 0,
              score: 8,
            });
            const otherCompetenceMark = domainBuilder.buildCompetenceMark({
              id: 789,
              assessmentResultId,
              area_code: '3',
              competence_code: '3.1',
              competenceId: 'recCompetence2',
              level: 0,
              score: 11,
            });
            databaseBuilder.factory.buildCompetenceMark(cleaCompetenceMark1);
            databaseBuilder.factory.buildCompetenceMark(cleaCompetenceMark2);
            databaseBuilder.factory.buildCompetenceMark(otherCompetenceMark);
            await databaseBuilder.commit();

            // when
            const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
              certificationCourseId,
              userId,
              reproducibilityRate: 60,
              skillRepository,
            });

            // then
            expect(cleaCertificationScoring.cleaCompetenceMarks).to.deep.equal([
              cleaCompetenceMark1,
              cleaCompetenceMark2,
            ]);
          });
        });
      });
    });
  });
});
