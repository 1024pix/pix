import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { getNextChallengeForPix1d } from '../../../../lib/domain/usecases/get-next-challenge-for-pix1d.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { AnswerStatus } from '../../../../lib/domain/models/AnswerStatus.js';
import { Activity } from '../../../../lib/domain/models/Activity.js';

describe('Unit | Domain | Use Cases | get-next-challenge-for-pix1d', function () {
  const missionId = 'AZERTYUIO';
  const assessmentId = 'id_assessment';
  const activityId = 'id_activity';
  let activityAnswerRepository;
  let challengeRepository;
  let activityRepository;
  let assessmentRepository;

  beforeEach(function () {
    activityAnswerRepository = { findByActivity: sinon.stub() };
    challengeRepository = { getForPix1D: sinon.stub() };
    activityRepository = {
      getLastActivity: sinon.stub(),
      save: sinon.stub(),
      updateStatus: sinon.stub(),
      getAllByAssessmentId: sinon.stub(),
    };
    assessmentRepository = { get: sinon.stub(), completeByAssessmentId: sinon.stub() };
  });

  context('should calculate the good challenge number', function () {
    context('when there is no answer for the given assessmentId', function () {
      beforeEach(function () {
        assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
        activityAnswerRepository.findByActivity.withArgs(activityId).resolves([]);
        challengeRepository.getForPix1D.resolves({ 'a challenge': 'a challenge' });
        activityRepository.getLastActivity.withArgs(assessmentId).rejects(new NotFoundError('No activity found.'));
        activityRepository.getAllByAssessmentId.withArgs(assessmentId).resolves([]);
        activityRepository.save.resolves({ id: activityId, level: Activity.levels.TUTORIAL });
      });
      it('should call the challengeRepository with an challenge number equal to 1 ', async function () {
        // when
        await getNextChallengeForPix1d({
          assessmentId,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          activityRepository,
        });

        // then
        expect(challengeRepository.getForPix1D).to.have.been.calledWith({
          missionId,
          activityLevel: Activity.levels.TUTORIAL,
          challengeNumber: 1,
        });
      });
      it('should create the first activity', async function () {
        // when
        await getNextChallengeForPix1d({
          assessmentId,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          activityRepository,
        });

        // then
        expect(activityRepository.save).to.have.been.calledWith(
          new Activity({
            assessmentId,
            level: Activity.levels.TUTORIAL,
            status: Activity.status.STARTED,
          })
        );
      });
    });
    context('when there is an answer for the given assessmentId and activity', function () {
      it('should call the challengeRepository with an challenge number equal to 2 ', async function () {
        const answer = domainBuilder.buildAnswer({ assessmentId });
        assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
        activityAnswerRepository.findByActivity.withArgs(activityId).resolves([answer]);
        challengeRepository.getForPix1D.resolves({ 'a challenge': 'a challenge' });
        activityRepository.getLastActivity
          .withArgs(assessmentId)
          .resolves(new Activity({ id: activityId, level: Activity.levels.TUTORIAL }));

        // when
        await getNextChallengeForPix1d({
          assessmentId,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          activityRepository,
        });

        // then
        expect(challengeRepository.getForPix1D).to.have.been.calledWith({
          missionId,
          activityLevel: Activity.levels.TUTORIAL,
          challengeNumber: 2,
        });
      });
    });
  });
  context('when there is no more challenge', function () {
    beforeEach(function () {
      const answer = domainBuilder.buildAnswer({ assessmentId });
      activityAnswerRepository.findByActivity.withArgs(activityId).resolves([answer]);
      challengeRepository.getForPix1D.rejects(new NotFoundError('No challenge found'));
      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      activityRepository.getLastActivity
        .withArgs(assessmentId)
        .resolves({ id: activityId, level: Activity.levels.CHALLENGE });
      activityRepository.getAllByAssessmentId
        .withArgs(assessmentId)
        .resolves([new Activity({ status: Activity.status.SUCCEEDED })]);
    });

    it('should complete the assessment', async function () {
      await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        challengeRepository,
        activityAnswerRepository,
        activityRepository,
      });

      expect(assessmentRepository.completeByAssessmentId).to.have.been.calledOnceWith(assessmentId);
    });

    it('should not return new challenge', async function () {
      // when
      const result = await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        challengeRepository,
        activityAnswerRepository,
        activityRepository,
      });

      // then
      expect(result).to.equal(undefined);
    });

    it('should update the activity with the status succeed', async function () {
      // when
      await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        challengeRepository,
        activityAnswerRepository,
        activityRepository,
      });

      // then
      expect(activityRepository.updateStatus).to.have.been.calledOnceWith({
        activityId,
        status: Activity.status.SUCCEEDED,
      });
    });
  });
  context('when there is no more challenge for the tutorial activity', function () {
    it('should get the first challenge of the training activity', async function () {
      const answer = domainBuilder.buildAnswer({ assessmentId });
      activityAnswerRepository.findByActivity.withArgs(activityId).resolves([answer]);
      activityRepository.getLastActivity
        .withArgs(assessmentId)
        .resolves({ id: activityId, level: Activity.levels.TUTORIAL });
      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      challengeRepository.getForPix1D
        .withArgs({
          missionId,
          activityLevel: Activity.levels.TUTORIAL,
          challengeNumber: 2,
        })
        .rejects(new NotFoundError('No challenge found'));

      activityRepository.getAllByAssessmentId
        .withArgs(assessmentId)
        .resolves([new Activity({ level: Activity.levels.TUTORIAL, status: Activity.status.SUCCEEDED })]);
      const expectedChallenge = { 'a challenge': 'a new activity challenge' };
      challengeRepository.getForPix1D
        .withArgs({
          missionId,
          activityLevel: Activity.levels.TRAINING,
          challengeNumber: 1,
        })
        .resolves(expectedChallenge);

      const challenge = await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        challengeRepository,
        activityAnswerRepository,
        activityRepository,
      });

      expect(activityRepository.save).to.have.been.calledWith(
        new Activity({
          assessmentId,
          level: Activity.levels.TRAINING,
          status: Activity.status.STARTED,
        })
      );
      expect(challenge).to.equal(expectedChallenge);
    });
  });
  context('when there is no more challenge for the training activity', function () {
    it('should get the first challenge of the validation activity', async function () {
      const answer = domainBuilder.buildAnswer({ assessmentId });
      activityAnswerRepository.findByActivity.withArgs(activityId).resolves([answer]);
      activityRepository.getLastActivity
        .withArgs(assessmentId)
        .resolves({ id: activityId, level: Activity.levels.TRAINING });
      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      challengeRepository.getForPix1D
        .withArgs({
          missionId,
          activityLevel: Activity.levels.TRAINING,
          challengeNumber: 2,
        })
        .rejects(new NotFoundError('No challenge found'));

      activityRepository.getAllByAssessmentId
        .withArgs(assessmentId)
        .resolves([new Activity({ level: Activity.levels.TRAINING, status: Activity.status.SUCCEEDED })]);
      const expectedChallenge = { 'a challenge': 'a new activity challenge' };
      challengeRepository.getForPix1D
        .withArgs({
          missionId,
          activityLevel: Activity.levels.VALIDATION,
          challengeNumber: 1,
        })
        .resolves(expectedChallenge);

      const challenge = await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        challengeRepository,
        activityAnswerRepository,
        activityRepository,
      });

      expect(activityRepository.save).to.have.been.calledWith(
        new Activity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.STARTED,
        })
      );
      expect(challenge).to.equal(expectedChallenge);
    });
  });

  context('when last answer is wrong', function () {
    beforeEach(function () {
      const answer = domainBuilder.buildAnswer({ assessmentId, result: AnswerStatus.KO });
      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      activityAnswerRepository.findByActivity.withArgs(activityId).resolves([answer]);
      assessmentRepository.completeByAssessmentId.withArgs(assessmentId).resolves({ missionId });
      activityRepository.getLastActivity
        .withArgs(assessmentId)
        .resolves({ id: activityId, level: Activity.levels.TUTORIAL });
      activityRepository.getAllByAssessmentId
        .withArgs(assessmentId)
        .resolves([new Activity({ level: Activity.levels.TUTORIAL, status: Activity.status.FAILED })]);
    });
    it('should complete the assessment', async function () {
      await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        activityAnswerRepository,
        challengeRepository,
        activityRepository,
      });
      expect(assessmentRepository.completeByAssessmentId).to.have.been.calledOnceWith(assessmentId);
    });

    it('should not return new challenge', async function () {
      // when
      const result = await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        activityAnswerRepository,
        challengeRepository,
        activityRepository,
      });

      // then
      expect(result).to.equal(undefined);
    });
    it('should update the activity with the status failed', async function () {
      // when
      await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        activityAnswerRepository,
        challengeRepository,
        activityRepository,
      });

      // then
      expect(activityRepository.updateStatus).to.have.been.calledOnceWith({
        activityId,
        status: Activity.status.FAILED,
      });
    });
  });

  context('when last challenge skipped', function () {
    beforeEach(function () {
      const answer = domainBuilder.buildAnswer({ assessmentId, result: AnswerStatus.SKIPPED });

      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      activityAnswerRepository.findByActivity.withArgs(activityId).resolves([answer]);
      assessmentRepository.completeByAssessmentId.withArgs(assessmentId).resolves({ missionId });
      activityRepository.getLastActivity
        .withArgs(assessmentId)
        .resolves({ id: activityId, level: Activity.levels.TUTORIAL });
      activityRepository.getAllByAssessmentId
        .withArgs(assessmentId)
        .resolves([new Activity({ level: Activity.levels.TUTORIAL, status: Activity.status.SKIPPED })]);
    });
    it('should complete the assessment', async function () {
      await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        activityAnswerRepository,
        challengeRepository,
        activityRepository,
      });

      expect(assessmentRepository.completeByAssessmentId).to.have.been.calledOnceWith(assessmentId);
    });

    it('should not return new challenge', async function () {
      // when
      const result = await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        activityAnswerRepository,
        challengeRepository,
        activityRepository,
      });

      // then
      expect(result).to.equal(undefined);
    });
    it('should update the activity with the status skipped', async function () {
      // when
      await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        activityAnswerRepository,
        challengeRepository,
        activityRepository,
      });

      // then
      expect(activityRepository.updateStatus).to.have.been.calledOnceWith({
        activityId,
        status: Activity.status.SKIPPED,
      });
    });
  });

  context('when user answered the last challenge of an activity and start a new one', function () {
    it('should update the activity with the status succeeded', async function () {
      const answer = domainBuilder.buildAnswer({ result: AnswerStatus.OK });
      const activity = new Activity({
        id: activityId,
        level: Activity.levels.TUTORIAL,
        status: Activity.status.STARTED,
      });

      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      activityRepository.getLastActivity.withArgs(assessmentId).resolves(activity);
      activityAnswerRepository.findByActivity.withArgs(activityId).resolves([answer]);
      challengeRepository.getForPix1D
        .withArgs({ missionId, activityLevel: Activity.levels.TUTORIAL, challengeNumber: 2 })
        .rejects(new NotFoundError());

      // when
      try {
        await getNextChallengeForPix1d({
          assessmentId,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          activityRepository,
        });
      } catch {
        // check catch error in other unit test
      } finally {
        expect(activityRepository.updateStatus).to.have.been.calledOnceWith({
          activityId,
          status: Activity.status.SUCCEEDED,
        });
      }
    });
  });
});
