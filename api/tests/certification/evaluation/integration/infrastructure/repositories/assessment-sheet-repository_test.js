import * as assessmentSheetRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/assessment-sheet-repository.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Certification | Evaluation | Infrastructure | Repositories | AssessmentSheetRepository', function () {
  let certificationCourseId, assessmentId, userId, versionId, answer1;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    versionId = databaseBuilder.factory.buildCertificationVersion().id;
    const session = databaseBuilder.factory.buildSession();
    const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
      sessionId: session.id,
      userId,
      accessibilityAdjustmentNeeded: true,
    });
    certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
      abortReason: 'candidate',
      maxReachableLevelOnCertificationDate: 6,
      isRejectedForFraud: true,
      userId,
      sessionId: session.id,
      createdAt: new Date('2022-02-20'),
      updatedAt: new Date('2022-02-22'),
      lastAnswerAt: new Date('2022-01-11'),
      versionId,
      framework: Frameworks.EDU_1ER_DEGRE,
      lang: 'fr',
      candidateId: certificationCandidate.id,
    }).id;
    assessmentId = databaseBuilder.factory.buildAssessment({
      certificationCourseId,
      state: Assessment.states.COMPLETED,
      updatedAt: new Date('2023-10-05'),
      userId,
      lastChallengeId: 'nextChallengeIdToAnswer',
      lastQuestionDate: new Date('2024-11-07'),
      lastQuestionState: Assessment.statesOfLastQuestion.TIMEOUT,
    }).id;
    answer1 = databaseBuilder.factory.buildAnswer({
      assessmentId,
      challengeId: 'challenge1',
      result: 'ok',
      createdAt: new Date('2022-02-22'),
    });
    await databaseBuilder.commit();
  });

  describe('#findByCertificationCourseId', function () {
    context('when the certification course exists', function () {
      it('should return the assessment sheet', async function () {
        // when
        const assessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationCourseId);

        // then
        expect(assessmentSheet).to.deepEqualInstance(
          domainBuilder.certification.evaluation.buildAssessmentSheet({
            certificationCourseId,
            assessmentId,
            userId,
            startedAt: new Date('2022-02-20'),
            abortReason: 'candidate',
            isRejectedForFraud: true,
            state: Assessment.states.COMPLETED,
            assessmentUpdatedAt: new Date('2023-10-05'),
            answers: [domainBuilder.buildAnswer(answer1)],
            lastChallengeId: 'nextChallengeIdToAnswer',
            lastQuestionDate: new Date('2024-11-07'),
            lastQuestionState: Assessment.statesOfLastQuestion.TIMEOUT,
            certificationCourseUpdatedAt: new Date('2022-02-22'),
            lastAnswerAt: new Date('2022-01-11'),
            versionId,
            lang: 'fr',
            accessibilityAdjustmentNeeded: true,
            certificationFramework: Frameworks.EDU_1ER_DEGRE,
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

  describe('#getByAssessmentId', function () {
    context('when the assessment exists', function () {
      it('should return the assessment sheet', async function () {
        // given
        const answer3 = databaseBuilder.factory.buildAnswer({
          assessmentId,
          challengeId: 'challenge3',
          result: 'ok',
          createdAt: new Date('2022-02-24'),
        });
        const answer2 = databaseBuilder.factory.buildAnswer({
          assessmentId,
          challengeId: 'challenge2',
          result: 'ok',
          createdAt: new Date('2022-02-23'),
        });
        await databaseBuilder.commit();

        // when
        const assessmentSheet = await assessmentSheetRepository.getByAssessmentId(assessmentId);

        // then
        expect(assessmentSheet).to.deepEqualInstance(
          domainBuilder.certification.evaluation.buildAssessmentSheet({
            certificationCourseId,
            assessmentId,
            userId,
            startedAt: new Date('2022-02-20'),
            abortReason: 'candidate',
            isRejectedForFraud: true,
            state: Assessment.states.COMPLETED,
            assessmentUpdatedAt: new Date('2023-10-05'),
            answers: [
              domainBuilder.buildAnswer(answer1),
              domainBuilder.buildAnswer(answer2),
              domainBuilder.buildAnswer(answer3),
            ],
            lastChallengeId: 'nextChallengeIdToAnswer',
            lastQuestionDate: new Date('2024-11-07'),
            lastQuestionState: Assessment.statesOfLastQuestion.TIMEOUT,
            certificationCourseUpdatedAt: new Date('2022-02-22'),
            lastAnswerAt: new Date('2022-01-11'),
            versionId,
            certificationFramework: Frameworks.EDU_1ER_DEGRE,
            lang: 'fr',
            accessibilityAdjustmentNeeded: true,
          }),
        );
      });
    });

    context('when the assessment does not exist', function () {
      it('returns a not found error', async function () {
        // given
        const unknownAssessmentId = 123;

        // when
        const error = await catchErr(assessmentSheetRepository.getByAssessmentId)(unknownAssessmentId);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#update', function () {
    it('should update only allowed fields of the assessment the assessment sheet', async function () {
      // given
      const assessmentSheetToUpdate = domainBuilder.certification.evaluation.buildAssessmentSheet({
        certificationCourseId,
        assessmentId,
        abortReason: 'technical',
        isRejectedForFraud: false,
        state: Assessment.states.STARTED,
        assessmentUpdatedAt: new Date('2024-05-11'),
        answers: [],
        lastChallengeId: 'somethingElse',
        lastQuestionDate: new Date('2033-10-07'),
        lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
        certificationCourseUpdatedAt: new Date('2044-02-22'),
        lastAnswerAt: new Date('2044-01-11'),
        versionId: 'somethingElse',
      });

      // when
      await assessmentSheetRepository.update(assessmentSheetToUpdate);

      // then
      const updatedAssessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationCourseId);
      expect(updatedAssessmentSheet).to.deepEqualInstance(
        domainBuilder.certification.evaluation.buildAssessmentSheet({
          certificationCourseId,
          assessmentId,
          userId,
          startedAt: new Date('2022-02-20'),
          abortReason: 'candidate',
          isRejectedForFraud: true,
          state: Assessment.states.STARTED, // updated
          assessmentUpdatedAt: new Date('2024-05-11'), // updated
          answers: [domainBuilder.buildAnswer(answer1)],
          lastChallengeId: 'nextChallengeIdToAnswer',
          lastQuestionDate: new Date('2024-11-07'),
          lastQuestionState: Assessment.statesOfLastQuestion.TIMEOUT,
          certificationCourseUpdatedAt: new Date('2044-02-22'), // updated
          lastAnswerAt: new Date('2044-01-11'), // updated
          versionId,
          lang: 'fr',
          accessibilityAdjustmentNeeded: true,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
        }),
      );
    });
  });
});
