import sinon from 'sinon';

import { ABORT_REASONS } from '../../../../../../src/certification/shared/domain/constants/abort-reasons.js';
import {
  CertificationEndedByFinalizationError,
  CertificationEndedByInvigilatorError,
  ChallengeAlreadyAnsweredError,
  ChallengeNotAskedError,
  ForbiddenAccess,
} from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Unit | Domain | Models | AssessmentSheet', function () {
  const STATES = domainBuilder.certification.evaluation.buildAssessmentSheet.STATES;
  const STATES_OF_LAST_QUESTION = domainBuilder.certification.evaluation.buildAssessmentSheet.STATES_OF_LAST_QUESTION;

  context('#get isAbortReasonTechnical', function () {
    it('should return false when abort reason is null', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        abortReason: null,
      });
      expect(assessmentSheet.isAbortReasonTechnical).to.be.false;
    });
    it('should return true when abort reason is technical', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        abortReason: ABORT_REASONS.TECHNICAL,
      });
      expect(assessmentSheet.isAbortReasonTechnical).to.be.true;
    });
    it('should return false when abort reason is not technical', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        abortReason: ABORT_REASONS.CANDIDATE,
      });
      expect(assessmentSheet.isAbortReasonTechnical).to.be.false;
    });
  });

  context('#complete', function () {
    let clock, assessmentSheetBaseData;
    const now = new Date();

    beforeEach(function () {
      assessmentSheetBaseData = {
        certificationCourseId: 123,
        assessmentId: 456,
        abortReason: 'candidate',
        isRejectedForFraud: true,
        answers: [domainBuilder.buildAnswer()],
      };
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    it(`should update state and assessmentUpdatedAt when assessment sheet is in state ${STATES.STARTED}`, function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        ...assessmentSheetBaseData,
        state: STATES.STARTED,
        assessmentUpdatedAt: new Date('2021-10-29'),
      });
      assessmentSheet.complete();

      expect(assessmentSheet).to.deepEqualInstance(
        domainBuilder.certification.evaluation.buildAssessmentSheet({
          ...assessmentSheetBaseData,
          state: STATES.COMPLETED,
          assessmentUpdatedAt: now,
        }),
      );
    });

    Object.values(STATES)
      .filter((state) => state !== STATES.STARTED)
      .forEach((state) => {
        it(`should do nothing state is ${state}`, async function () {
          const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
            ...assessmentSheetBaseData,
            state,
            assessmentUpdatedAt: new Date('2021-10-29'),
          });
          assessmentSheet.complete();

          expect(assessmentSheet).to.deepEqualInstance(
            domainBuilder.certification.evaluation.buildAssessmentSheet({
              ...assessmentSheetBaseData,
              state,
              assessmentUpdatedAt: new Date('2021-10-29'),
            }),
          );
        });
      });
  });

  context('#get isStarted', function () {
    it(`returns true when state is ${STATES.STARTED}`, function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        state: STATES.STARTED,
      });

      expect(assessmentSheet.isStarted).to.be.true;
    });

    Object.values(STATES)
      .filter((state) => state !== STATES.STARTED)
      .forEach((state) => {
        it(`return false when state is ${state}`, async function () {
          const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
            state,
          });

          expect(assessmentSheet.isStarted).to.be.false;
        });
      });
  });

  context('#isEndedByInvigilator', function () {
    it(`returns true when state is ${STATES.ENDED_BY_INVIGILATOR}`, function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        state: STATES.ENDED_BY_INVIGILATOR,
      });

      expect(assessmentSheet.isEndedByInvigilator()).to.be.true;
    });

    Object.values(STATES)
      .filter((state) => state !== STATES.ENDED_BY_INVIGILATOR)
      .forEach((state) => {
        it(`return false when state is ${state}`, async function () {
          const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
            state,
          });

          expect(assessmentSheet.isEndedByInvigilator()).to.be.false;
        });
      });
  });

  context('#hasBeenEndedDueToFinalization', function () {
    it(`returns true when state is ${STATES.ENDED_DUE_TO_FINALIZATION}`, function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        state: STATES.ENDED_DUE_TO_FINALIZATION,
      });

      expect(assessmentSheet.hasBeenEndedDueToFinalization()).to.be.true;
    });

    Object.values(STATES)
      .filter((state) => state !== STATES.ENDED_DUE_TO_FINALIZATION)
      .forEach((state) => {
        it(`return false when state is ${state}`, async function () {
          const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
            state,
          });

          expect(assessmentSheet.hasBeenEndedDueToFinalization()).to.be.false;
        });
      });
  });

  context('#isChallengeAlreadyAnswered', function () {
    it('returns false when no answers yet', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        answers: [],
      });

      expect(assessmentSheet.isChallengeAlreadyAnswered('myFavoriteChallengeId')).to.be.false;
    });

    it('returns false when no answers on the provided challenge exist', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        answers: [domainBuilder.buildAnswer({ challengeId: 'someOtherChallengeId' })],
      });

      expect(assessmentSheet.isChallengeAlreadyAnswered('myFavoriteChallengeId')).to.be.false;
    });

    it('returns true when an answer has been submitted with provided challenge', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        answers: [domainBuilder.buildAnswer({ challengeId: 'myFavoriteChallengeId' })],
      });

      expect(assessmentSheet.isChallengeAlreadyAnswered('myFavoriteChallengeId')).to.be.true;
    });
  });

  context('#isChallengeExpectedToBeAnswered', function () {
    it('returns true when no lastChallengeId in assessment sheet', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        lastChallengeId: null,
      });

      expect(assessmentSheet.isChallengeExpectedToBeAnswered('myFavoriteChallengeId')).to.be.true;
    });

    it('returns true when submitted challengeId is the one expected to be answered next', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        lastChallengeId: 'myFavoriteChallengeId',
      });

      expect(assessmentSheet.isChallengeExpectedToBeAnswered('myFavoriteChallengeId')).to.be.true;
    });

    it('returns false when submitted challengeId is not the one expected to be answered next', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        lastChallengeId: 'someOtherChallengeId',
      });

      expect(assessmentSheet.isChallengeExpectedToBeAnswered('myFavoriteChallengeId')).to.be.false;
    });
  });

  context('#hasLastQuestionBeenFocusedOut', function () {
    it(`returns true when state of last question is ${STATES_OF_LAST_QUESTION.FOCUSEDOUT}`, function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        lastQuestionState: STATES_OF_LAST_QUESTION.FOCUSEDOUT,
      });

      expect(assessmentSheet.hasLastQuestionBeenFocusedOut()).to.be.true;
    });

    Object.values(STATES_OF_LAST_QUESTION)
      .filter((lastQuestionState) => lastQuestionState !== STATES_OF_LAST_QUESTION.FOCUSEDOUT)
      .forEach((lastQuestionState) => {
        it(`return false when state of last question is ${lastQuestionState}`, async function () {
          const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
            lastQuestionState,
          });

          expect(assessmentSheet.hasLastQuestionBeenFocusedOut()).to.be.false;
        });
      });
  });

  context('#refreshLastAnswerTimestamp', function () {
    let assessmentSheetBaseData;

    beforeEach(function () {
      assessmentSheetBaseData = {
        certificationCourseId: 123,
        assessmentId: 456,
        abortReason: 'candidate',
        isRejectedForFraud: true,
        answers: [domainBuilder.buildAnswer()],
        assessmentUpdatedAt: new Date('2022-01-01'),
        lastQuestionDate: new Date('2021-09-09'),
      };
    });

    it('should update lastAnswerAt and certificationCourseUpdatedAt to provided date', function () {
      const someDate = new Date('2044-05-05');
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        ...assessmentSheetBaseData,
        lastAnswerAt: new Date('2023-03-03'),
        certificationCourseUpdatedAt: new Date('2024-04-04'),
      });
      assessmentSheet.refreshLastAnswerTimestamp(someDate);

      expect(assessmentSheet).to.deepEqualInstance(
        domainBuilder.certification.evaluation.buildAssessmentSheet({
          ...assessmentSheetBaseData,
          lastAnswerAt: someDate,
          certificationCourseUpdatedAt: someDate,
        }),
      );
    });
  });

  context('#checkIfCandidateCanAnswer', function () {
    context('when the candidate can answer', function () {
      it('does not throw', function () {
        // given
        const answer = domainBuilder.buildAnswer();
        const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({ userId: 123 });

        // then
        expect(() =>
          assessmentSheet.checkIfCandidateCanAnswer({ answer, userId: assessmentSheet.userId }),
        ).not.to.throw();
      });
    });

    context('when the user is not related to the assessment sheet', function () {
      it('should throw a ForbiddenAccess error', function () {
        // given
        const answer = domainBuilder.buildAnswer();
        const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
          userId: 123,
        });

        // when
        expect(() => assessmentSheet.checkIfCandidateCanAnswer({ answer, userId: 456 })).to.throw(ForbiddenAccess);
      });
    });

    context('when the assessment is endedByInvigilator', function () {
      it('should throw a CertificationEndedByInvigilatorError error', function () {
        // given
        const answer = domainBuilder.buildAnswer();
        const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
          userId: 123,
          state: STATES.ENDED_BY_INVIGILATOR,
        });

        // when
        expect(() => assessmentSheet.checkIfCandidateCanAnswer({ answer, userId: assessmentSheet.userId })).to.throw(
          CertificationEndedByInvigilatorError,
        );
      });
    });

    context('when the assessment is hasBeenEndedDueToFinalization', function () {
      it('should throw a CertificationEndedByFinalizationError error', function () {
        // given
        const answer = domainBuilder.buildAnswer();
        const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
          userId: 123,
          state: STATES.ENDED_DUE_TO_FINALIZATION,
        });

        // when
        expect(() => assessmentSheet.checkIfCandidateCanAnswer({ answer, userId: assessmentSheet.userId })).to.throw(
          CertificationEndedByFinalizationError,
        );
      });
    });

    context('when the challenge is not expected to be answered', function () {
      it('should throw a ChallengeNotAskedError error', function () {
        // given
        const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
          userId: 123,
          lastChallengeId: 1,
        });

        // when
        expect(() =>
          assessmentSheet.checkIfCandidateCanAnswer({ answer: {}, userId: assessmentSheet.userId }),
        ).to.throw(ChallengeNotAskedError);
      });
    });

    context('when the challenge is already answered', function () {
      it('should throw a ChallengeAlreadyAnsweredError error', function () {
        // given
        const answer = domainBuilder.buildAnswer();
        const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
          userId: 123,
          answers: [answer],
        });

        // when
        expect(() => assessmentSheet.checkIfCandidateCanAnswer({ answer, userId: assessmentSheet.userId })).to.throw(
          ChallengeAlreadyAnsweredError,
        );
      });
    });
  });

  context('#hasCertificationDurationExceeded', function () {
    let clock;
    const now = new Date('2026-01-02T00:00:00Z');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('returns true when the certification has been started for more than 24 hours', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        startedAt: new Date('2025-12-31T23:00:00Z'),
      });

      expect(assessmentSheet.hasCertificationDurationExceeded()).to.be.true;
    });

    it('returns false when the certification has been started for less than 24 hours', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        startedAt: new Date('2026-01-01T23:00:00Z'),
      });

      expect(assessmentSheet.hasCertificationDurationExceeded()).to.be.false;
    });
  });

  context('#endDueToCertificationDurationExceeded', function () {
    let clock, assessmentSheetBaseData;
    const now = new Date();

    beforeEach(function () {
      assessmentSheetBaseData = {
        certificationCourseId: 123,
        assessmentId: 456,
        abortReason: 'candidate',
        isRejectedForFraud: true,
        answers: [domainBuilder.buildAnswer()],
      };
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it(`should set state to ${STATES.ENDED_DUE_TO_DURATION_EXCEEDED} and update assessmentUpdatedAt`, function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        ...assessmentSheetBaseData,
        state: STATES.STARTED,
        assessmentUpdatedAt: new Date('2021-10-29'),
      });

      assessmentSheet.endDueToCertificationDurationExceeded();

      expect(assessmentSheet).to.deepEqualInstance(
        domainBuilder.certification.evaluation.buildAssessmentSheet({
          ...assessmentSheetBaseData,
          state: STATES.ENDED_DUE_TO_DURATION_EXCEEDED,
          assessmentUpdatedAt: now,
        }),
      );
    });
  });
});
