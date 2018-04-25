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
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(assessmentRepository, 'get');
    sandbox.stub(answerRepository, 'get');
    sandbox.stub(correctionRepository, 'getByChallengeId');
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('when assessment is not completed', () => {

    it('should reject with a assessment not completed error', () => {
      // given
      const assessment = new Assessment({ state: 'started' });
      const answer = new Answer({ assessmentId: 1, challengeId: 12 });
      assessmentRepository.get.resolves(assessment);
      answerRepository.get.resolves(answer);

      // when
      const promise = getCorrectionForAnswerWhenAssessmentEnded({
        assessmentRepository,
        answerRepository,
        correctionRepository,
        answerId: 2
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

  context('when assessment is completed', () => {

    it('should return with the correction', () => {
      // given
      const assessment = new Assessment({ state: 'completed' });
      const answer = new Answer({ assessmentId: 1, challengeId: 12 });
      const correction = new Correction({ id: 123 });
      assessmentRepository.get.resolves(assessment);
      answerRepository.get.resolves(answer);
      correctionRepository.getByChallengeId.resolves(correction);

      // when
      const promise = getCorrectionForAnswerWhenAssessmentEnded({
        assessmentRepository,
        answerRepository,
        correctionRepository,
        answerId: 2
      });

      // then
      return promise.then((responseSolution) => {
        expect(assessmentRepository.get).to.have.been.calledWith(1);
        expect(answerRepository.get).to.have.been.calledWith(2);
        expect(correctionRepository.getByChallengeId).to.have.been.calledWith(12);
        expect(responseSolution).to.deep.equal(new Correction({ id: 123 }));
      });
    });
  });
});

