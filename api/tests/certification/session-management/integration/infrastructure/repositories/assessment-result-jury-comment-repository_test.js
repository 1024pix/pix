import { AssessmentResultJuryComment } from '../../../../../../src/certification/session-management/domain/models/AssessmentResultJuryComment.js';
import * as assessmentResultJuryCommentRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/assessment-result-jury-comment-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | Certification | Session-management | AssessmentResultJuryCommentRepository', function () {
  describe('#getLatestAssessmentResult', function () {
    it('should return the latest assessment result Jury Comment', async function () {
      // given
      const latestAssessmentResultData = { id: 12, commentByJury: 'New', juryId: 22, assessmentId: 51 };
      databaseBuilder.factory.buildUser({ id: 21 });
      databaseBuilder.factory.buildUser({ id: 22 });
      databaseBuilder.factory.buildCertificationCourse({ id: 55 });
      databaseBuilder.factory.buildAssessment({ id: 51, certificationCourseId: 55 });
      databaseBuilder.factory.buildAssessmentResult({ id: 11, commentByJury: 'Old', juryId: 21, assessmentId: 51 });
      databaseBuilder.factory.buildAssessmentResult.last({ ...latestAssessmentResultData, certificationCourseId: 55 });
      await databaseBuilder.commit();

      // when
      const result = await assessmentResultJuryCommentRepository.getLatestAssessmentResultJuryComment({
        certificationCourseId: 55,
      });

      // then
      expect(result).to.deepEqualInstance(new AssessmentResultJuryComment(latestAssessmentResultData));
    });
  });
});
