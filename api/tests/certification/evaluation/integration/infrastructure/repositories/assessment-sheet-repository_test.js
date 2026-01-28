import * as assessmentSheetRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/assessment-sheet-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Certification | Evaluation | Infrastructure | Repositories | AssessmentSheetRepository', function () {
  describe('#findByCertificationCourseId', function () {
    let certificationCourseId, assessmentId, answerData;
    beforeEach(async function () {
      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        abortReason: 'candidate',
        maxReachableLevelOnCertificationDate: 6,
        isRejectedForFraud: true,
      }).id;
      assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
      answerData = databaseBuilder.factory.buildAnswer({ assessmentId, result: 'ok' });
      await databaseBuilder.commit();
    });

    context('when the certification course exists', function () {
      it('should return the assessment sheet', async function () {
        // when
        const assessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationCourseId);

        // then
        expect(assessmentSheet).to.deepEqualInstance(
          domainBuilder.certification.evaluation.buildAssessmentSheet({
            certificationCourseId,
            assessmentId,
            abortReason: 'candidate',
            maxReachableLevelOnCertificationDate: 6,
            isRejectedForFraud: true,
            answers: [domainBuilder.buildAnswer(answerData)],
          }),
        );
      });
    });

    context('when the certification course does not exist', function () {
      it('should return null', async function () {
        // when
        const assessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationCourseId + 1);

        // then
        expect(assessmentSheet).to.be.null;
      });
    });
  });
});
