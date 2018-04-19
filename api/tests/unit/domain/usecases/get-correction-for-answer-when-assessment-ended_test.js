const getCorrectionForAnswerWhenAssessmentEnded = require('../../../../lib/domain/usecases/get-correction-for-answer-when-assessment-ended');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Answer = require('../../../../lib/domain/models/Answer');
const Correction = require('../../../../lib/domain/models/Correction');
const { NotCompletedAssessmentError } = require('../../../../lib/domain/errors');
const { expect, sinon } = require('../../../test-helper');

describe('Unit | UseCase | getCorrectionForAnswerWhenAssessmentEnded', () => {

  const assessmentRepository = {};
  const answerRepository = {};
  const correctionRepository = {};
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    assessmentRepository.get = () => undefined;
    answerRepository.get = () => undefined;
    correctionRepository.getByChallengeId = () => undefined;
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('when assessment is not completed', () => {

    it('should reject with a assessment not completed error', () => {
      // given
      const assessment = new Assessment({ state: 'not completed' });
      const answer = new Answer({ assessmentId: 1, challengeId: 12 });
      sandbox.stub(assessmentRepository, 'get').resolves(assessment);
      sandbox.stub(answerRepository, 'get').resolves(answer);
      sandbox.stub(correctionRepository, 'getByChallengeId');

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
      sandbox.stub(assessmentRepository, 'get').resolves(assessment);
      sandbox.stub(answerRepository, 'get').resolves(answer);
      sandbox.stub(correctionRepository, 'getByChallengeId').resolves(correction);

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

