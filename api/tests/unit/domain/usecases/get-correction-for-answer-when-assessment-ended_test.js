const getCorrectionForAnswerWhenAssessmentEnded = require('../../../../lib/domain/usecases/get-correction-for-answer-when-assessment-ended');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Answer = require('../../../../lib/domain/models/Answer');
const Correction = require('../../../../lib/domain/models/Correction');
const { NotCompletedAssessmentError } = require('../../../../lib/domain/errors');
const { expect, sinon } = require('../../../test-helper');

describe('Unit | UseCase | getCorrectionForAnswerWhenAssessmentEnded', () => {

  const assessmentRepository = { get: () => undefined };
  const answerRepository = { get: () => undefined };
  const correctionRepository = { getByChallengeId: () => undefined };

  beforeEach(() => {
    sinon.stub(assessmentRepository, 'get');
    sinon.stub(answerRepository, 'get');
    sinon.stub(correctionRepository, 'getByChallengeId');
  });

  context('when assessment is not completed', () => {

    context('and when the assessment is not a SMART_PLACEMENT', () => {
      it('should reject with a assessment not completed error', () => {
        // given
        const assessment = Assessment.fromAttributes({ state: 'started' });
        const answer = new Answer({ assessmentId: 1, challengeId: 12 });
        assessmentRepository.get.resolves(assessment);
        answerRepository.get.resolves(answer);

        // when
        const promise = getCorrectionForAnswerWhenAssessmentEnded({
          assessmentRepository,
          answerRepository,
          correctionRepository,
          answerId: 2,
        });

        // then
        return expect(promise).to.be.rejectedWith(NotCompletedAssessmentError)
          .then(() => {
            expect(assessmentRepository.get).to.have.been.calledWith(1);
            expect(answerRepository.get).to.have.been.calledWith(2);
            expect(correctionRepository.getByChallengeId).to.not.have.been.called;
          });
      });
    });

    context('and when the assessment is SMART_PLACEMENT', () => {
      it('should return the content', () => {
        // given
        const assessmentId = 1;
        const challengeId = 12;
        const assessment = Assessment.fromAttributes({ state: 'started', type: Assessment.types.SMARTPLACEMENT });
        const answer = new Answer({ assessmentId, challengeId });
        const correction = new Correction({ id: 123 });
        assessmentRepository.get.resolves(assessment);
        answerRepository.get.resolves(answer);
        correctionRepository.getByChallengeId.resolves(correction);

        // when
        const promise = getCorrectionForAnswerWhenAssessmentEnded({
          assessmentRepository,
          answerRepository,
          correctionRepository,
          answerId: 2,
        });

        // then
        return promise.then((responseSolution) => {
          expect(assessmentRepository.get).to.have.been.calledWith(assessmentId);
          expect(answerRepository.get).to.have.been.calledWith(2);
          expect(correctionRepository.getByChallengeId).to.have.been.calledWith(challengeId);
          expect(responseSolution).to.deep.equal(new Correction({ id: 123 }));
        });
      });
    });

    context('and when the assessment is COMPETENCE_EVALUATION', () => {
      it('should return the content', () => {
        // given
        const assessmentId = 1;
        const challengeId = 12;
        const assessment = Assessment.fromAttributes({ state: 'started', type: Assessment.types.COMPETENCE_EVALUATION });
        const answer = new Answer({ assessmentId, challengeId });
        const correction = new Correction({ id: 123 });
        assessmentRepository.get.resolves(assessment);
        answerRepository.get.resolves(answer);
        correctionRepository.getByChallengeId.resolves(correction);

        // when
        const promise = getCorrectionForAnswerWhenAssessmentEnded({
          assessmentRepository,
          answerRepository,
          correctionRepository,
          answerId: 2,
        });

        // then
        return promise.then((responseSolution) => {
          expect(assessmentRepository.get).to.have.been.calledWith(assessmentId);
          expect(answerRepository.get).to.have.been.calledWith(2);
          expect(correctionRepository.getByChallengeId).to.have.been.calledWith(challengeId);
          expect(responseSolution).to.deep.equal(new Correction({ id: 123 }));
        });
      });
    });
  });

  context('when assessment is completed', () => {

    it('should return with the correction', () => {
      // given
      const assessmentId = 1;
      const challengeId = 12;
      const assessment = Assessment.fromAttributes({ state: 'completed' });
      const answer = new Answer({ assessmentId, challengeId });
      const correction = new Correction({ id: 123 });
      assessmentRepository.get.resolves(assessment);
      answerRepository.get.resolves(answer);
      correctionRepository.getByChallengeId.resolves(correction);

      // when
      const promise = getCorrectionForAnswerWhenAssessmentEnded({
        assessmentRepository,
        answerRepository,
        correctionRepository,
        answerId: 2,
      });

      // then
      return promise.then((responseSolution) => {
        expect(assessmentRepository.get).to.have.been.calledWith(assessmentId);
        expect(answerRepository.get).to.have.been.calledWith(2);
        expect(correctionRepository.getByChallengeId).to.have.been.calledWith(challengeId);
        expect(responseSolution).to.deep.equal(new Correction({ id: 123 }));
      });
    });
  });
});

