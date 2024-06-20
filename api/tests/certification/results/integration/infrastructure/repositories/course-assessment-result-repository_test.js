import * as courseAssessmentResultRepository from '../../../../../../src/certification/results/infrastructure/repositories/course-assessment-result-repository.js';
import { AutoJuryCommentKeys } from '../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Course | Integration | Repository | course-assessment-result', function () {
  describe('#getLatestAssessmentResult', function () {
    context('when assessment result exists', function () {
      it('should return the assessment result', async function () {
        // given
        const juryId = databaseBuilder.factory.buildUser().id;
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ id: 1 }).id;
        databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
        const competenceMark1 = domainBuilder.buildCompetenceMark({
          id: 200,
          level: 3,
          score: 33,
          area_code: 'area1',
          competence_code: 'compCode1',
          competenceId: 'recComp1',
          assessmentResultId: 9876,
        });
        const competenceMark2 = domainBuilder.buildCompetenceMark({
          id: 201,
          level: 1,
          score: 2,
          area_code: 'area2',
          competence_code: 'compCode2',
          competenceId: 'recComp2',
          assessmentResultId: 9876,
        });
        const competenceMark3 = domainBuilder.buildCompetenceMark({
          id: 202,
          level: 1,
          score: 2,
          area_code: 'area2',
          competence_code: 'compCode2',
          competenceId: 'recComp2',
          assessmentResultId: 6543,
        });
        const commentForCandidate = domainBuilder.certification.shared.buildJuryComment.candidate({
          fallbackComment: 'candidate',
          commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
        });
        const commentForOrganization = domainBuilder.certification.shared.buildJuryComment.organization({
          fallbackComment: 'orga',
          commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
        });
        const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
          id: 9876,
          pixScore: 33,
          reproducibilityRate: 29.1,
          status: AssessmentResult.status.VALIDATED,
          emitter: 'Jury Pix',
          commentForCandidate,
          commentByJury: 'jury',
          commentForOrganization,
          createdAt: new Date('2021-10-29T03:06:00Z'),
          juryId,
          assessmentId: 2,
          competenceMarks: [competenceMark1, competenceMark2],
        });
        const olderAssessmentResult = domainBuilder.buildAssessmentResult({
          id: 6543,
          pixScore: 33,
          reproducibilityRate: 30,
          status: AssessmentResult.status.VALIDATED,
          emitter: 'some-emitter',
          commentForCandidate: null,
          commentByJury: 'jury',
          commentForOrganization: null,
          createdAt: new Date('2020-10-29T03:06:00Z'),
          juryId,
          assessmentId: 2,
          competenceMarks: [competenceMark3],
        });
        const lastAssessmentResultId = databaseBuilder.factory.buildAssessmentResult({
          ...expectedAssessmentResult,
          commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
          commentForCandidate: 'candidate',
          commentForOrganization: 'orga',
        }).id;
        databaseBuilder.factory.buildAssessmentResult(olderAssessmentResult);
        databaseBuilder.factory.buildCompetenceMark(competenceMark1);
        databaseBuilder.factory.buildCompetenceMark(competenceMark2);
        databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
          certificationCourseId,
          lastAssessmentResultId,
        });
        await databaseBuilder.commit();

        // when
        const latestAssessmentResult = await courseAssessmentResultRepository.getLatestAssessmentResult({
          certificationCourseId,
        });

        // then
        expect(latestAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
      });
    });

    context('when no assessment result exists', function () {
      it('should return a NotFound error', async function () {
        // given
        const certificationCourseId = 1;
        databaseBuilder.factory.buildCertificationCourse({ id: certificationCourseId });
        databaseBuilder.factory.buildUser({ id: 100 });
        databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(courseAssessmentResultRepository.getLatestAssessmentResult)({
          certificationCourseId,
        });

        // then
        expect(error).to.deepEqualInstance(new NotFoundError('No assessment result found'));
      });
    });
  });
});
