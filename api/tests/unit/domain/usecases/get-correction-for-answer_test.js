const getCorrectionForAnswer = require('../../../../lib/domain/usecases/get-correction-for-answer');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Answer = require('../../../../lib/domain/models/Answer');
const Correction = require('../../../../lib/domain/models/Correction');
const { AssessmentNotCompletedError, NotFoundError } = require('../../../../lib/domain/errors');
const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

describe('Unit | UseCase | getCorrectionForAnswer', () => {

  const assessmentRepository = { get: () => undefined };
  const answerRepository = { get: () => undefined };
  const correctionRepository = { getByChallengeId: () => undefined };
  const userTutorialRepository = { find: () => undefined };

  beforeEach(() => {
    sinon.stub(assessmentRepository, 'get');
    sinon.stub(answerRepository, 'get');
    sinon.stub(correctionRepository, 'getByChallengeId');
    sinon.stub(userTutorialRepository, 'find');
  });

  context('when assessment is not completed', () => {

    context('and when the assessment is not a SMART_PLACEMENT', () => {
      it('should reject with a assessment not completed error', async () => {
        // given
        const userId = 'userId';
        const assessment = new Assessment({ state: 'started', userId });
        const answer = new Answer({ assessmentId: 1, challengeId: 12 });
        assessmentRepository.get.resolves(assessment);
        answerRepository.get.resolves(answer);

        // when
        const error = await catchErr(getCorrectionForAnswer)({
          assessmentRepository,
          answerRepository,
          correctionRepository,
          answerId: 2,
          userId
        });

        // then
        expect(error).to.be.instanceOf(AssessmentNotCompletedError);
        expect(assessmentRepository.get).to.have.been.calledWith(1);
        expect(answerRepository.get).to.have.been.calledWith(2);
        expect(correctionRepository.getByChallengeId).to.not.have.been.called;
      });
    });

    context('and when the assessment is SMART_PLACEMENT', () => {
      it('should return the content', async () => {
        // given
        const assessmentId = 1;
        const challengeId = 12;
        const userId = 'userId';
        const unsavedTutorial = domainBuilder.buildTutorial({ id: 'unsaved-tutorial-id' });
        const savedTutorial = domainBuilder.buildTutorial({ id: 'saved-tutorial-id' });
        const assessment = new Assessment({ state: 'started', type: Assessment.types.SMARTPLACEMENT, userId });
        const answer = new Answer({ assessmentId, challengeId });
        const correction = new Correction({ id: 123, tutorials: [unsavedTutorial], learningMoreTutorials: [savedTutorial] });
        assessmentRepository.get.resolves(assessment);
        answerRepository.get.resolves(answer);
        correctionRepository.getByChallengeId.resolves(correction);
        userTutorialRepository.find.resolves([{ id: 1, userId, tutorialId: savedTutorial.id }]);
        const expectedCorrection = new Correction({
          id: 123,
          tutorials: [{ ...unsavedTutorial, isSaved: false }],
          learningMoreTutorials: [{ ...savedTutorial, isSaved: true }]
        });

        // when
        const responseSolution = await getCorrectionForAnswer({
          assessmentRepository,
          answerRepository,
          correctionRepository,
          userTutorialRepository,
          answerId: 2,
          userId
        });

        // then
        expect(assessmentRepository.get).to.have.been.calledWith(assessmentId);
        expect(answerRepository.get).to.have.been.calledWith(2);
        expect(correctionRepository.getByChallengeId).to.have.been.calledWith(challengeId);
        expect(responseSolution).to.deep.equal(expectedCorrection);
      });
    });

    context('and when the assessment is COMPETENCE_EVALUATION', () => {
      it('should return the content', async () => {
        // given
        const assessmentId = 1;
        const challengeId = 12;
        const userId = 'userId';
        const assessment = new Assessment({ state: 'started', type: Assessment.types.COMPETENCE_EVALUATION, userId });
        const answer = new Answer({ assessmentId, challengeId });
        const correction = new Correction({ id: 123 });
        assessmentRepository.get.resolves(assessment);
        answerRepository.get.resolves(answer);
        correctionRepository.getByChallengeId.resolves(correction);

        // when
        const responseSolution = await getCorrectionForAnswer({
          assessmentRepository,
          answerRepository,
          correctionRepository,
          userTutorialRepository,
          answerId: 2,
          userId,
        });

        // then
        expect(assessmentRepository.get).to.have.been.calledWith(assessmentId);
        expect(answerRepository.get).to.have.been.calledWith(2);
        expect(correctionRepository.getByChallengeId).to.have.been.calledWith(challengeId);
        expect(responseSolution).to.deep.equal(new Correction({ id: 123 }));
      });
    });
  });

  context('when assessment is completed', () => {

    it('should return with the correction', async () => {
      // given
      const assessmentId = 1;
      const challengeId = 12;
      const userId = 'userId';
      const assessment = new Assessment({ state: 'completed', userId });
      const answer = new Answer({ assessmentId, challengeId });
      const correction = new Correction({ id: 123 });
      assessmentRepository.get.resolves(assessment);
      answerRepository.get.resolves(answer);
      correctionRepository.getByChallengeId.resolves(correction);

      // when
      const responseSolution = await getCorrectionForAnswer({
        assessmentRepository,
        answerRepository,
        correctionRepository,
        userTutorialRepository,
        answerId: 2,
        userId
      });

      // then
      expect(assessmentRepository.get).to.have.been.calledWith(assessmentId);
      expect(answerRepository.get).to.have.been.calledWith(2);
      expect(correctionRepository.getByChallengeId).to.have.been.calledWith(challengeId);
      expect(responseSolution).to.deep.equal(new Correction({ id: 123 }));
    });
  });

  context('when user ask for correction is not the user who answered the challenge', () => {

    it('should throw a NotFound error', async () => {
      // given
      const assessmentId = 1;
      const challengeId = 12;
      const userId = 'userId';
      const assessment = new Assessment({ state: 'completed', userId });
      const answer = new Answer({ assessmentId, challengeId });
      assessmentRepository.get.resolves(assessment);
      answerRepository.get.resolves(answer);
      correctionRepository.getByChallengeId.resolves({});

      // when
      const error = await catchErr(getCorrectionForAnswer)({
        assessmentRepository,
        answerRepository,
        correctionRepository,
        answerId: 2,
        userId: userId + 2
      });

      // then
      return expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when provided answer id is not an integer', () => {

    it('should throw a NotFound error', async () => {
      // given
      const assessmentId = 1;
      const challengeId = 12;
      const userId = 'userId';
      const assessment = new Assessment({ state: 'completed', userId });
      const answer = new Answer({ assessmentId, challengeId });
      assessmentRepository.get.resolves(assessment);
      answerRepository.get.resolves(answer);
      correctionRepository.getByChallengeId.resolves({});

      // when
      const error = await catchErr(getCorrectionForAnswer)({
        assessmentRepository,
        answerRepository,
        correctionRepository,
        answerId: 'salut',
        userId: userId,
      });

      // then
      return expect(error).to.be.instanceOf(NotFoundError);
    });
  });

});
