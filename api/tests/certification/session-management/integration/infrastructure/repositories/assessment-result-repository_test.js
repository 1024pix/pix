import { AssessmentResultJuryComment } from '../../../../../../src/certification/session-management/domain/models/AssessmentResultJuryComment.js';
import * as assessmentResultJuryCommentRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/assessment-result-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | Certification | Session-management | AssessmentResultRepository', function () {
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

    describe('#when there is no assessment-results for the given certification-course id', function () {
      it('should throw a not found exception', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 55 });
        databaseBuilder.factory.buildAssessment({ id: 51, certificationCourseId: 55 });
        await databaseBuilder.commit();

        // when
        const promise = assessmentResultJuryCommentRepository.getLatestAssessmentResultJuryComment({
          certificationCourseId: 55,
        });

        // then
        expect(promise).to.have.been.rejectedWith(NotFoundError);
      });
    });
  });

  describe('#update', function () {
    it('should save the jury internal note and the juryId', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 55 });
      databaseBuilder.factory.buildAssessment({ id: 51, certificationCourseId: 55 });
      const { id: oldJuryId } = databaseBuilder.factory.buildUser({ id: 10 });
      const { id: newJuryId } = databaseBuilder.factory.buildUser({ id: 1000 });
      databaseBuilder.factory.buildAssessmentResult({
        id: 11,
        commentByJury: 'Old',
        assessmentId: 51,
        juryId: oldJuryId,
      });
      await databaseBuilder.commit();
      const newCommentByJury = 'New';
      const assessmentResult = domainBuilder.buildAssessmentResult({
        id: 11,
        commentByJury: newCommentByJury,
        juryId: newJuryId,
      });

      // when
      await assessmentResultJuryCommentRepository.update({ assessmentResult });

      // then
      const { commentByJury, juryId } = await knex('assessment-results').select('*').where({ id: 11 }).first();
      expect(commentByJury).to.equal(newCommentByJury);
      expect(juryId).to.equal(newJuryId);
    });
  });
});
