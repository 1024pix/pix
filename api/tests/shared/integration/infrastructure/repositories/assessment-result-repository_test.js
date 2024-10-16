import { AutoJuryCommentKeys } from '../../../../../src/certification/shared/domain/models/JuryComment.js';
import { MissingAssessmentId, NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/AssessmentResult.js';
import * as assessmentResultRepository from '../../../../../src/shared/infrastructure/repositories/assessment-result-repository.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Repository | AssessmentResult', function () {
  describe('#save', function () {
    context('when save is successful', function () {
      it('should return the saved assessment result', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 100 });
        databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
        await databaseBuilder.commit();
        const assessmentResultToSave = domainBuilder.buildAssessmentResult({
          pixScore: 33,
          reproducibilityRate: 29.1,
          status: AssessmentResult.status.VALIDATED,
          emitter: 'some-emitter',
          commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
            commentByAutoJury: AutoJuryCommentKeys.FRAUD,
            fallbackComment: 'candidate',
          }),
          commentByJury: 'jury',
          commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
            commentByAutoJury: AutoJuryCommentKeys.FRAUD,
            fallbackComment: 'orga',
          }),
          createdAt: new Date('2021-10-29T03:06:00Z'),
          juryId: 100,
          assessmentId: 2,
          competenceMarks: [],
        });
        assessmentResultToSave.id = undefined;

        // when
        const savedAssessmentResult = await assessmentResultRepository.save({
          certificationCourseId: 1,
          assessmentResult: assessmentResultToSave,
        });

        // then
        expect(savedAssessmentResult).to.deepEqualInstanceOmitting(assessmentResultToSave, ['id', 'createdAt']);
      });

      it('should persist the assessment result in DB', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 100 });
        databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
        await databaseBuilder.commit();
        const assessmentResultToSave = domainBuilder.buildAssessmentResult({
          pixScore: 33,
          reproducibilityRate: 29.1,
          status: AssessmentResult.status.VALIDATED,
          emitter: 'some-emitter',
          commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
            commentByAutoJury: AutoJuryCommentKeys.FRAUD,
            fallbackComment: 'candidate',
          }),
          commentByJury: 'jury',
          commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
            commentByAutoJury: AutoJuryCommentKeys.FRAUD,
            fallbackComment: 'orga',
          }),
          createdAt: new Date('2021-10-29T03:06:00Z'),
          juryId: 100,
          assessmentId: 2,
          competenceMarks: [],
        });
        assessmentResultToSave.id = undefined;

        // when
        await assessmentResultRepository.save({ certificationCourseId: 1, assessmentResult: assessmentResultToSave });

        // then
        const actualAssessmentResult = await assessmentResultRepository.getByCertificationCourseId({
          certificationCourseId: 1,
        });
        expect(actualAssessmentResult).to.deepEqualInstanceOmitting(assessmentResultToSave, ['id', 'createdAt']);
        expect(actualAssessmentResult.id).to.exist;
        expect(actualAssessmentResult.createdAt).to.exist;
      });

      context('when there is no assessment result for the certification course yet', function () {
        it('should persist the link between the assessment result and the certification course in DB', async function () {
          // given
          databaseBuilder.factory.buildCertificationCourse({ id: 1 });
          databaseBuilder.factory.buildUser({ id: 100 });
          databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
          await databaseBuilder.commit();
          const assessmentResultToSave = domainBuilder.buildAssessmentResult({
            pixScore: 33,
            reproducibilityRate: 29.1,
            status: AssessmentResult.status.VALIDATED,
            emitter: 'some-emitter',
            commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
              fallbackComment: 'candidate',
            }),
            commentByJury: 'jury',
            commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
              fallbackComment: 'orga',
            }),
            createdAt: new Date('2021-10-29T03:06:00Z'),
            juryId: 100,
            assessmentId: 2,
            competenceMarks: [],
          });
          assessmentResultToSave.id = undefined;

          // when
          const assessmentResult = await assessmentResultRepository.save({
            certificationCourseId: 1,
            assessmentResult: assessmentResultToSave,
          });

          // then
          const result = await knex('certification-courses-last-assessment-results').select('*');
          expect(result).to.deep.equal([{ lastAssessmentResultId: assessmentResult.id, certificationCourseId: 1 }]);
        });
      });

      context('when there is already an assessment result for the certification course', function () {
        it('should update the link between the assessment result and the certification course in DB', async function () {
          // given
          databaseBuilder.factory.buildCertificationCourse({ id: 1 });
          databaseBuilder.factory.buildUser({ id: 100 });
          databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
          databaseBuilder.factory.buildAssessmentResult({ id: 99, assessmentId: 2 });
          databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
            certificationCourseId: 1,
            lastAssessmentResultId: 99,
          });
          await databaseBuilder.commit();
          const assessmentResultToSave = domainBuilder.buildAssessmentResult({
            pixScore: 33,
            reproducibilityRate: 29.1,
            status: AssessmentResult.status.VALIDATED,
            emitter: 'some-emitter',
            commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
              fallbackComment: 'candidate',
            }),
            commentByJury: 'jury',
            commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
              fallbackComment: 'orga',
            }),
            createdAt: new Date('2021-10-29T03:06:00Z'),
            juryId: 100,
            assessmentId: 2,
            competenceMarks: [],
          });
          assessmentResultToSave.id = undefined;

          // when
          const assessmentResult = await assessmentResultRepository.save({
            certificationCourseId: 1,
            assessmentResult: assessmentResultToSave,
          });

          // then
          const result = await knex('certification-courses-last-assessment-results').select('*');
          expect(result).to.deep.equal([{ lastAssessmentResultId: assessmentResult.id, certificationCourseId: 1 }]);
        });
      });
    });

    context('when assessmentId attribute is not valid', function () {
      it('should throw a MissingAssessmentId error', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 100 });
        databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
        await databaseBuilder.commit();
        const assessmentResultToSave = domainBuilder.buildAssessmentResult({
          pixScore: 33,
          reproducibilityRate: 29.1,
          status: AssessmentResult.status.VALIDATED,
          emitter: 'some-emitter',
          commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
            fallbackComment: 'candidate',
          }),
          commentByJury: 'jury',
          commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
            fallbackComment: 'orga',
          }),
          createdAt: new Date('2021-10-29T03:06:00Z'),
          juryId: 100,
          assessmentId: null,
          competenceMarks: [],
        });
        assessmentResultToSave.id = undefined;

        // when
        const result = await catchErr(assessmentResultRepository.save)({
          certificationCourseId: 1,
          assessmentResult: assessmentResultToSave,
        });

        // then
        expect(result).to.be.instanceOf(MissingAssessmentId);
      });
    });
  });

  describe('#findLatestLevelAndPixScoreByAssessmentId', function () {
    context('when assessment has one assessment result', function () {
      it('should return the level and pixScore', async function () {
        // given
        databaseBuilder.factory.buildAssessment({ id: 1 });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 1,
          level: 5,
          pixScore: 9000,
        });
        databaseBuilder.factory.buildAssessmentResult({ level: 4, pixScore: 55 });
        await databaseBuilder.commit();

        // when
        const result = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
          assessmentId: 1,
        });

        // then
        expect(result).to.deep.equal({ level: 5, pixScore: 9000 });
      });
    });
    context('when certification course has several assessment results', function () {
      it('should return the level and pixScore of the latest assessment result', async function () {
        // given
        databaseBuilder.factory.buildAssessment({ id: 1 });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 1,
          level: 5,
          pixScore: 9000,
          createdAt: new Date('2021-10-29T03:06:00Z'),
        });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 1,
          level: 3,
          pixScore: 8999,
          createdAt: new Date('2022-05-05T03:06:00Z'),
        });
        await databaseBuilder.commit();

        // when
        const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
          assessmentId: 1,
        });

        // then
        expect(level).to.equal(3);
        expect(pixScore).to.equal(8999);
      });
    });
    context('when a limit date is specified', function () {
      it('should return the level and pixScore of the latest assessment result before that date', async function () {
        // given
        databaseBuilder.factory.buildAssessment({ id: 1 });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 1,
          level: 5,
          pixScore: 9000,
          createdAt: new Date('2021-10-29T03:06:00Z'),
        });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 1,
          level: 3,
          pixScore: 8999,
          createdAt: new Date('2022-05-05T03:06:00Z'),
        });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 1,
          level: 1,
          pixScore: 8,
          createdAt: new Date('2021-12-31T03:06:00Z'),
        });
        await databaseBuilder.commit();

        // when
        const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
          assessmentId: 1,
          limitDate: new Date('2022-01-01T03:06:00Z'),
        });

        // then
        expect(level).to.equal(1);
        expect(pixScore).to.equal(8);
      });
    });
    context('when assessment has no assessment-result', function () {
      it('should return 0 as level and pixScore', async function () {
        // given
        databaseBuilder.factory.buildAssessment({ id: 1 });
        databaseBuilder.factory.buildAssessment({ id: 2 });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 2,
          level: 5,
          pixScore: 9000,
        });
        await databaseBuilder.commit();

        // when
        const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
          assessmentId: 1,
        });

        // then
        expect(level).to.equal(0);
        expect(pixScore).to.equal(0);
      });
    });
  });

  describe('#getByCertificationCourseId', function () {
    context('when certification course has one assessment result', function () {
      it('should return the assessment result', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 100 });
        databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
        const competenceMark1 = domainBuilder.buildCompetenceMark({
          id: 200,
          level: 3,
          score: 33,
          area_code: 'area1',
          competence_code: 'compCode1',
          competenceId: 'recComp1',
          assessmentResultId: 4,
        });
        const competenceMark2 = domainBuilder.buildCompetenceMark({
          id: 201,
          level: 1,
          score: 2,
          area_code: 'area2',
          competence_code: 'compCode2',
          competenceId: 'recComp2',
          assessmentResultId: 4,
        });
        const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
          id: 4,
          pixScore: 33,
          reproducibilityRate: 29.1,
          status: AssessmentResult.status.VALIDATED,
          emitter: 'some-emitter',
          commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
            fallbackComment: 'candidate',
          }),
          commentByJury: 'jury',
          commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
            fallbackComment: 'orga',
          }),
          createdAt: new Date('2021-10-29T03:06:00Z'),
          juryId: 100,
          assessmentId: 2,
          competenceMarks: [competenceMark1, competenceMark2],
        });
        databaseBuilder.factory.buildAssessmentResult({
          ...expectedAssessmentResult,
          commentForCandidate: expectedAssessmentResult.commentForCandidate.fallbackComment,
          commentForOrganization: expectedAssessmentResult.commentForOrganization.fallbackComment,
        });
        databaseBuilder.factory.buildCompetenceMark(competenceMark1);
        databaseBuilder.factory.buildCompetenceMark(competenceMark2);
        await databaseBuilder.commit();

        // when
        const actualAssessmentResult = await assessmentResultRepository.getByCertificationCourseId({
          certificationCourseId: 1,
        });

        // then
        expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
      });
    });

    context('when certification course has several assessment results', function () {
      it('should return the latest assessment result', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 100 });
        databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
        const competenceMark1 = domainBuilder.buildCompetenceMark({
          id: 200,
          level: 3,
          score: 33,
          area_code: 'area1',
          competence_code: 'compCode1',
          competenceId: 'recComp1',
          assessmentResultId: 4,
        });
        const competenceMark2 = domainBuilder.buildCompetenceMark({
          id: 201,
          level: 1,
          score: 2,
          area_code: 'area2',
          competence_code: 'compCode2',
          competenceId: 'recComp2',
          assessmentResultId: 5,
        });
        const competenceMark3 = domainBuilder.buildCompetenceMark({
          id: 202,
          level: 5,
          score: 200,
          area_code: 'area3',
          competence_code: 'compCode3',
          competenceId: 'recComp3',
          assessmentResultId: 4,
        });
        const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
          id: 4,
          pixScore: 33,
          reproducibilityRate: 29.1,
          status: AssessmentResult.status.VALIDATED,
          emitter: 'some-emitter',
          commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
            fallbackComment: 'candidate',
          }),
          commentByJury: 'jury',
          commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
            fallbackComment: 'orga',
          }),
          createdAt: new Date('2021-10-29T03:06:00Z'),
          juryId: 100,
          assessmentId: 2,
          competenceMarks: [competenceMark1, competenceMark3],
        });
        databaseBuilder.factory.buildAssessmentResult({
          ...expectedAssessmentResult,
          commentForCandidate: expectedAssessmentResult.commentForCandidate.fallbackComment,
          commentForOrganization: expectedAssessmentResult.commentForOrganization.fallbackComment,
        });
        databaseBuilder.factory.buildAssessmentResult({
          id: 5,
          pixScore: 66,
          reproducibilityRate: 28.1,
          status: AssessmentResult.status.REJECTED,
          emitter: 'some-other-emitter',
          commentForCandidate: expectedAssessmentResult.commentForCandidate.fallbackComment,
          commentForOrganization: expectedAssessmentResult.commentForOrganization.fallbackComment,
          createdAt: new Date('1990-01-01T22:06:00Z'),
          juryId: 100,
          assessmentId: 2,
          competenceMarks: [competenceMark2],
        });
        databaseBuilder.factory.buildCompetenceMark(competenceMark1);
        databaseBuilder.factory.buildCompetenceMark(competenceMark2);
        databaseBuilder.factory.buildCompetenceMark(competenceMark3);
        await databaseBuilder.commit();

        // when
        const actualAssessmentResult = await assessmentResultRepository.getByCertificationCourseId({
          certificationCourseId: 1,
        });

        // then
        expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
      });
    });

    context('when certification course has an assessment but no assessment result', function () {
      it('should return a started assessment result with assessmentId set', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 100 });
        databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
        await databaseBuilder.commit();

        // when
        const actualAssessmentResult = await assessmentResultRepository.getByCertificationCourseId({
          certificationCourseId: 1,
        });

        // then
        const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
          assessmentId: 2,
          status: Assessment.states.STARTED,
          competenceMarks: [],
        });
        expectedAssessmentResult.id = undefined;
        expectedAssessmentResult.commentByJury = undefined;
        expectedAssessmentResult.createdAt = undefined;
        expectedAssessmentResult.emitter = undefined;
        expectedAssessmentResult.reproducibilityRate = undefined;
        expectedAssessmentResult.pixScore = undefined;
        expectedAssessmentResult.juryId = undefined;
        expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
      });
    });

    context('when certification course has no assessment at all', function () {
      it('should return a started assessment result with no assessmentId set', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 100 });
        await databaseBuilder.commit();

        // when
        const actualAssessmentResult = await assessmentResultRepository.getByCertificationCourseId({
          certificationCourseId: 1,
        });

        // then
        const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
          assessmentId: null,
          status: Assessment.states.STARTED,
          competenceMarks: [],
        });
        expectedAssessmentResult.id = undefined;
        expectedAssessmentResult.commentByJury = undefined;
        expectedAssessmentResult.createdAt = undefined;
        expectedAssessmentResult.emitter = undefined;
        expectedAssessmentResult.reproducibilityRate = undefined;
        expectedAssessmentResult.pixScore = undefined;
        expectedAssessmentResult.juryId = undefined;
        expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
      });
    });
  });

  describe('#updateToAcquiredLowerLevelComplementaryCertification', function () {
    context('when the assessment result exists', function () {
      it('should update the assessment result', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 100 });
        databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
        const competenceMark1 = domainBuilder.buildCompetenceMark({
          id: 200,
          level: 3,
          score: 33,
          area_code: 'area1',
          competence_code: 'compCode1',
          competenceId: 'recComp1',
          assessmentResultId: 4,
        });
        const competenceMark2 = domainBuilder.buildCompetenceMark({
          id: 201,
          level: 1,
          score: 2,
          area_code: 'area2',
          competence_code: 'compCode2',
          competenceId: 'recComp2',
          assessmentResultId: 4,
        });
        const assessmentResult = domainBuilder.buildAssessmentResult({
          id: 4,
          pixScore: 62,
          reproducibilityRate: 29.1,
          status: AssessmentResult.status.VALIDATED,
          emitter: 'some-emitter',
          createdAt: new Date('2021-10-29T03:06:00Z'),
          juryId: 100,
          assessmentId: 2,
          competenceMarks: [competenceMark1, competenceMark2],
        });
        databaseBuilder.factory.buildAssessmentResult(assessmentResult);
        databaseBuilder.factory.buildCompetenceMark(competenceMark1);
        databaseBuilder.factory.buildCompetenceMark(competenceMark2);
        await databaseBuilder.commit();

        // when
        await assessmentResultRepository.updateToAcquiredLowerLevelComplementaryCertification({
          id: assessmentResult.id,
        });

        // then
        const { commentByAutoJury } = await knex('assessment-results')
          .select('*')
          .where({ id: assessmentResult.id })
          .first();
        expect(commentByAutoJury).to.be.equal(AutoJuryCommentKeys.LOWER_LEVEL_COMPLEMENTARY_CERTIFICATION_ACQUIRED);
      });
    });

    context('when no assessment result exists', function () {
      it('should throw a NotFoundError domain error', async function () {
        // when
        const error = await catchErr(assessmentResultRepository.updateToAcquiredLowerLevelComplementaryCertification)({
          id: 100,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.be.equal('No row updated for assessment result id 100.');
      });
    });
  });
});
