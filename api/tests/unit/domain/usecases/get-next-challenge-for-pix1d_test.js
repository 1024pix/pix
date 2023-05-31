import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';
import { getNextChallengeForPix1d } from '../../../../lib/domain/usecases/get-next-challenge-for-pix1d.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { AnswerStatus } from '../../../../lib/domain/models/AnswerStatus.js';

describe('Unit | Domain | Use Cases | get-next-challenge-for-pix1d', function () {
  context('should calculate the good challenge number', function () {
    context('when there is no answer for the given assessmentId', function () {
      it('should call the challengeRepository with an challenge number equal to 1 ', async function () {
        const missionId = 'AZERTYUIO';
        const assessmentId = 'id_assessment';
        const DIDACTICIEL = 'didacticiel';
        const answers = [];

        const assessmentRepository = { get: sinon.stub() };
        const answerRepository = { findByAssessment: sinon.stub() };
        const challengeRepository = { getForPix1D: sinon.stub() };

        assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
        answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
        challengeRepository.getForPix1D.resolves({ 'a challenge': 'a challenge' });

        // when
        await getNextChallengeForPix1d({
          assessmentId,
          assessmentRepository,
          challengeRepository,
          answerRepository,
        });

        // then
        expect(challengeRepository.getForPix1D).to.have.been.calledWith({
          missionId,
          activityLevel: DIDACTICIEL,
          challengeNumber: 1,
        });
      });
    });
    context('when there is an answer for the given assessmentId', function () {
      it('should call the challengeRepository with an challenge number equal to 2 ', async function () {
        const missionId = 'AZERTYUIO';
        const DIDACTICIEL = 'didacticiel';
        const assessmentId = 'id_assessment';
        const answer = domainBuilder.buildAnswer({ assessmentId });

        const assessmentRepository = { get: sinon.stub() };
        const answerRepository = { findByAssessment: sinon.stub() };
        const challengeRepository = { getForPix1D: sinon.stub() };

        assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
        answerRepository.findByAssessment.withArgs(assessmentId).resolves([answer]);
        challengeRepository.getForPix1D.resolves({ 'a challenge': 'a challenge' });

        // when
        await getNextChallengeForPix1d({
          assessmentId,
          assessmentRepository,
          challengeRepository,
          answerRepository,
        });

        // then
        expect(challengeRepository.getForPix1D).to.have.been.calledWith({
          missionId,
          activityLevel: DIDACTICIEL,
          challengeNumber: 2,
        });
      });
    });
  });
  context('when there is no more challenge', function () {
    it('should complete the assessment', async function () {
      const missionId = 'AZERTYUIO';
      const assessmentId = 'id_assessment';
      const answer = domainBuilder.buildAnswer({ assessmentId });

      const answerRepository = { findByAssessment: sinon.stub() };
      const challengeRepository = { getForPix1D: sinon.stub() };
      const getStub = sinon.stub();

      answerRepository.findByAssessment.withArgs(assessmentId).resolves([answer]);
      challengeRepository.getForPix1D.rejects(new NotFoundError('No challenge found'));
      getStub.withArgs(assessmentId).resolves({ missionId });

      const assessmentRepository = { get: getStub, completeByAssessmentId: sinon.stub() };

      try {
        await getNextChallengeForPix1d({
          assessmentId,
          assessmentRepository,
          challengeRepository,
          answerRepository,
        });
      } catch {
        // check catch error in other unit test
      } finally {
        expect(assessmentRepository.completeByAssessmentId).to.have.been.calledOnceWith(assessmentId);
      }
    });

    it('should throw a NotFoundError', async function () {
      const missionId = 'AZERTYUIO';
      const assessmentId = 'id_assessment';
      const answer = domainBuilder.buildAnswer({ assessmentId });

      const answerRepository = { findByAssessment: sinon.stub() };
      const challengeRepository = { getForPix1D: sinon.stub() };
      const assessmentRepository = { get: sinon.stub(), completeByAssessmentId: sinon.stub() };

      answerRepository.findByAssessment.withArgs(assessmentId).resolves([answer]);
      challengeRepository.getForPix1D.rejects(new NotFoundError('No challenge found'));
      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      assessmentRepository.completeByAssessmentId.withArgs(assessmentId).resolves({ missionId });

      // when
      const error = await catchErr(getNextChallengeForPix1d)({
        assessmentId,
        assessmentRepository,
        challengeRepository,
        answerRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('No challenge found');
    });
  });
  context('when last answer is wrong', function () {
    it('should complete the assessment', async function () {
      const missionId = 'AZERTYUIO';
      const assessmentId = 'id_assessment';
      const answer = domainBuilder.buildAnswer({ assessmentId, result: AnswerStatus.KO });

      const assessmentRepository = { get: sinon.stub(), completeByAssessmentId: sinon.stub() };
      const answerRepository = { findByAssessment: sinon.stub() };
      const challengeRepository = {};

      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      answerRepository.findByAssessment.withArgs(assessmentId).resolves([answer]);
      assessmentRepository.completeByAssessmentId.withArgs(assessmentId).resolves({ missionId });

      await catchErr(getNextChallengeForPix1d)({
        assessmentId,
        assessmentRepository,
        answerRepository,
        challengeRepository,
      });
      expect(assessmentRepository.completeByAssessmentId).to.have.been.calledOnceWith(assessmentId);
    });

    it('should throw a NotFoundError with no more challenge message', async function () {
      const missionId = 'AZERTYUIO';
      const assessmentId = 'id_assessment';
      const answer = domainBuilder.buildAnswer({ assessmentId, result: AnswerStatus.KO });

      const assessmentRepository = { get: sinon.stub(), completeByAssessmentId: sinon.stub() };
      const answerRepository = { findByAssessment: sinon.stub() };
      const challengeRepository = {};

      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      answerRepository.findByAssessment.withArgs(assessmentId).resolves([answer]);
      assessmentRepository.completeByAssessmentId.withArgs(assessmentId).resolves({ missionId });

      // when
      const error = await catchErr(getNextChallengeForPix1d)({
        assessmentId,
        assessmentRepository,
        challengeRepository,
        answerRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('No more challenge');
    });
  });

  context('when last challenge skipped', function () {
    it('should complete the assessment', async function () {
      const missionId = 'AZERTYUIO';
      const assessmentId = 'id_assessment';
      const answer = domainBuilder.buildAnswer({ assessmentId, result: AnswerStatus.SKIPPED });

      const assessmentRepository = { get: sinon.stub(), completeByAssessmentId: sinon.stub() };
      const answerRepository = { findByAssessment: sinon.stub() };
      const challengeRepository = {};

      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      answerRepository.findByAssessment.withArgs(assessmentId).resolves([answer]);
      assessmentRepository.completeByAssessmentId.withArgs(assessmentId).resolves({ missionId });

      await catchErr(getNextChallengeForPix1d)({
        assessmentId,
        assessmentRepository,
        challengeRepository,
        answerRepository,
      });

      expect(assessmentRepository.completeByAssessmentId).to.have.been.calledOnceWith(assessmentId);
    });

    it('should throw a NotFoundError with no more challenge message', async function () {
      const missionId = 'AZERTYUIO';
      const assessmentId = 'id_assessment';
      const answer = domainBuilder.buildAnswer({ assessmentId, result: AnswerStatus.SKIPPED });

      const assessmentRepository = { get: sinon.stub(), completeByAssessmentId: sinon.stub() };
      const answerRepository = { findByAssessment: sinon.stub() };
      const challengeRepository = {};

      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      answerRepository.findByAssessment.withArgs(assessmentId).resolves([answer]);
      assessmentRepository.completeByAssessmentId.withArgs(assessmentId).resolves({ missionId });

      // when
      const error = await catchErr(getNextChallengeForPix1d)({
        assessmentId,
        assessmentRepository,
        challengeRepository,
        answerRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('No more challenge');
    });
  });
});
