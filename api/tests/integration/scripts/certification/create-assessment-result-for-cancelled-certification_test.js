import { CreateAssessmentResultForCancelledCertificationScript } from '../../../../scripts/certification/create-assessment-result-for-cancelled-certification.js';
import { AlgorithmEngineVersion } from '../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { AutoJuryCommentKeys } from '../../../../src/certification/shared/domain/models/JuryComment.js';
import { config } from '../../../../src/shared/config.js';
import { Assessment } from '../../../../src/shared/domain/models/index.js';
import { AssessmentResult } from '../../../../src/shared/domain/models/index.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | Scripts | Certification | create-assessment-result-for-cancelled-certification', function () {
  describe('when certification-course is cancelled', function () {
    describe('when last related assessment-result is already cancelled', function () {
      it('should do nothing', async function () {
        // given
        const assessmentResult = await _createCertification({
          isCancelled: true,
          lastAssessmentResultStatus: AssessmentResult.status.CANCELLED,
          commentByAutoJury: null,
        });

        // when
        const script = new CreateAssessmentResultForCancelledCertificationScript();
        await script.handle({ logger, options: { dryRun: false, batchSize: 1000 } });

        // then
        const lastAssessmentResult = await knex('certification-courses-last-assessment-results')
          .select('assessment-results.*')
          .innerJoin(
            'certification-courses',
            'certification-courses.id',
            'certification-courses-last-assessment-results.certificationCourseId',
          )
          .innerJoin(
            'assessment-results',
            'assessment-results.id',
            'certification-courses-last-assessment-results.lastAssessmentResultId',
          );

        expect(lastAssessmentResult[0]).to.deep.equal(assessmentResult);
      });
    });

    describe('when last related assessment-result is not cancelled', function () {
      describe('when commentByAutoJury have not a cancelled key', function () {
        it('should not duplicate commentByAutoJury', async function () {
          // given
          await _createCertification({
            isCancelled: true,
            lastAssessmentResultStatus: AssessmentResult.status.REJECTED,
            commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS,
          });

          // when
          const script = new CreateAssessmentResultForCancelledCertificationScript();
          await script.handle({ logger, options: { dryRun: false, batchSize: 1000 } });

          // then
          const lastAssessmentResults = await knex('certification-courses-last-assessment-results')
            .select('assessment-results.commentByAutoJury')
            .innerJoin(
              'assessment-results',
              'assessment-results.id',
              'certification-courses-last-assessment-results.lastAssessmentResultId',
            );

          expect(lastAssessmentResults[0].commentByAutoJury).to.be.null;
        });
      });

      describe('when commentByAutoJury have already a cancelled key', function () {
        it('should create a new cancelled assessment-result + competences marks', async function () {
          // given
          const assessmentResult = await _createCertification({
            isCancelled: true,
            lastAssessmentResultStatus: AssessmentResult.status.REJECTED,
            commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
          });

          // when
          const script = new CreateAssessmentResultForCancelledCertificationScript();
          await script.handle({ logger, options: { dryRun: false, batchSize: 1000 } });

          // then
          const lastAssessmentResults = await knex('certification-courses-last-assessment-results')
            .select(
              'assessment-results.id',
              'assessment-results.level',
              'assessment-results.pixScore',
              'assessment-results.commentByJury',
              'assessment-results.commentForOrganization',
              'assessment-results.commentForCandidate',
              'assessment-results.assessmentId',
              'assessment-results.reproducibilityRate',
              'assessment-results.commentByAutoJury',
              'assessment-results.status',
              'assessment-results.juryId',
              'assessment-results.createdAt',
            )
            .innerJoin(
              'certification-courses',
              'certification-courses.id',
              'certification-courses-last-assessment-results.certificationCourseId',
            )
            .innerJoin(
              'assessment-results',
              'assessment-results.id',
              'certification-courses-last-assessment-results.lastAssessmentResultId',
            );

          const previousCompetenceMarks = await knex('competence-marks')
            .select('level', 'score', 'area_code', 'competence_code', 'competenceId', 'createdAt')
            .where('competence-marks.assessmentResultId', assessmentResult.id);

          const competenceMarks = await knex('competence-marks')
            .select('level', 'score', 'area_code', 'competence_code', 'competenceId', 'createdAt')
            .where('competence-marks.assessmentResultId', lastAssessmentResults[0].id);

          lastAssessmentResults[0].id = null;

          const expectedAssessmentResult = {
            id: null,
            level: assessmentResult.level,
            pixScore: assessmentResult.pixScore,
            commentByJury: assessmentResult.commentByJury,
            commentForOrganization: assessmentResult.commentForOrganization,
            commentForCandidate: assessmentResult.commentForCandidate,
            assessmentId: assessmentResult.assessmentId,
            reproducibilityRate: assessmentResult.reproducibilityRate,
            commentByAutoJury: assessmentResult.commentByAutoJury,
            status: AssessmentResult.status.CANCELLED,
            juryId: config.infra.engineeringUserId,
            createdAt: assessmentResult.createdAt,
          };
          expect(lastAssessmentResults[0]).to.deep.equal(expectedAssessmentResult);
          expect(lastAssessmentResults).to.have.lengthOf(1);
          expect(previousCompetenceMarks).to.have.deep.members(competenceMarks);
          expect(competenceMarks).to.have.lengthOf(2);
        });
      });
    });
  });

  describe('when certification-course is not cancelled', function () {
    it('should do nothing', async function () {
      // given
      const assessmentResult = await _createCertification({
        isCancelled: false,
        lastAssessmentResultStatus: AssessmentResult.status.REJECTED,
        commentByAutoJury: null,
      });

      // when
      const script = new CreateAssessmentResultForCancelledCertificationScript();
      await script.handle({ logger, options: { dryRun: false, batchSize: 1000 } });

      // then
      const lastAssessmentResult = await knex('certification-courses-last-assessment-results')
        .select('assessment-results.*')
        .innerJoin(
          'certification-courses',
          'certification-courses.id',
          'certification-courses-last-assessment-results.certificationCourseId',
        )
        .innerJoin(
          'assessment-results',
          'assessment-results.id',
          'certification-courses-last-assessment-results.lastAssessmentResultId',
        );

      expect(lastAssessmentResult[0]).to.deep.equal(assessmentResult);
    });
  });
});

async function _createCertification({ isCancelled, lastAssessmentResultStatus, commentByAutoJury }) {
  databaseBuilder.factory.buildUser({
    id: config.infra.engineeringUserId,
  });
  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
    id: 123,
    version: AlgorithmEngineVersion.V3,
    isCancelled,
  });
  const assessment = databaseBuilder.factory.buildAssessment({
    id: 456,
    type: Assessment.types.CERTIFICATION,
    userId: certificationCourse.userId,
    certificationCourseId: certificationCourse.id,
  });
  const previousAssessmentResult = databaseBuilder.factory.buildAssessmentResult({
    status: AssessmentResult.status.VALIDATED,
    juryId: null,
  });
  const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
    assessmentId: assessment.id,
    status: lastAssessmentResultStatus,
    commentByAutoJury,
    commentByJury: null,
    juryId: null,
  });
  databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
    certificationCourseId: certificationCourse.id,
    lastAssessmentResultId: assessmentResult.id,
  });
  databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: previousAssessmentResult.id });
  databaseBuilder.factory.buildCompetenceMark({
    score: 10,
    level: 4,
    competence_code: '2.3',
    area_code: '2',
    competenceId: 'recComp23',
    assessmentResultId: assessmentResult.id,
  });
  databaseBuilder.factory.buildCompetenceMark({
    score: 56,
    level: 2,
    competence_code: '3.1',
    area_code: 'area1',
    competenceId: 'recComp1',
    assessmentResultId: assessmentResult.id,
  });

  await databaseBuilder.commit();

  return assessmentResult;
}
