import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { AnswerStatus } from '../../../../lib/domain/models/AnswerStatus.js';
import { Activity } from '../../../../lib/domain/models/Activity.js';
import { getNextChallengeForPix1d } from '../../../../lib/domain/usecases/get-next-challenge-for-pix1d.js';

describe('Unit | Domain | Use Cases | get-next-challenge-for-pix1d', function () {
  const missionId = 'AZERTYUIO';
  const assessmentId = 'id_assessment';
  const activityId = 'id_activity';
  let activityAnswerRepository;
  let challengeRepository;
  let activityRepository;
  let assessmentRepository;
  let dependencies;

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
    dependencies = {
      assessmentRepository,
      challengeRepository,
      activityAnswerRepository,
      activityRepository,
    };
  });

  context('when last answer is wrong and there is no more activity', function () {
    beforeEach(function () {
      const activityAnswer = domainBuilder.buildActivityAnswer({ assessmentId, result: AnswerStatus.KO });
      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      activityAnswerRepository.findByActivity.withArgs(activityId).resolves([activityAnswer]);
      assessmentRepository.completeByAssessmentId.withArgs(assessmentId).resolves({ missionId });
      activityRepository.getLastActivity
        .withArgs(assessmentId)
        .resolves({ id: activityId, level: Activity.levels.CHALLENGE });
      activityRepository.getAllByAssessmentId
        .withArgs(assessmentId)
        .resolves([new Activity({ level: Activity.levels.CHALLENGE, status: Activity.status.FAILED })]);
    });
    it('should complete the assessment', async function () {
      // given
      await getNextChallengeForPix1d({ assessmentId, ...dependencies });
      // when
      expect(assessmentRepository.completeByAssessmentId).to.have.been.calledOnceWith(assessmentId);
    });
    it('should not return new challenge', async function () {
      // when
      const result = await getNextChallengeForPix1d({ assessmentId, ...dependencies });

      // then
      expect(result).to.equal(null);
    });
    it('should update the activity with the status failed', async function () {
      // when
      await getNextChallengeForPix1d({ assessmentId, ...dependencies });

      // then
      expect(activityRepository.updateStatus).to.have.been.calledOnceWith({
        activityId,
        status: Activity.status.FAILED,
      });
    });
  });

  context('when last challenge skipped and there is no more activity', function () {
    beforeEach(function () {
      const activityAnswer = domainBuilder.buildActivityAnswer({ assessmentId, result: AnswerStatus.SKIPPED });

      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      activityAnswerRepository.findByActivity.withArgs(activityId).resolves([activityAnswer]);
      assessmentRepository.completeByAssessmentId.withArgs(assessmentId).resolves({ missionId });
      activityRepository.getLastActivity
        .withArgs(assessmentId)
        .resolves({ id: activityId, level: Activity.levels.CHALLENGE });
      activityRepository.getAllByAssessmentId
        .withArgs(assessmentId)
        .resolves([new Activity({ level: Activity.levels.CHALLENGE, status: Activity.status.SKIPPED })]);
    });
    it('should complete the assessment', async function () {
      await getNextChallengeForPix1d({ assessmentId, ...dependencies });

      expect(assessmentRepository.completeByAssessmentId).to.have.been.calledOnceWith(assessmentId);
    });

    it('should not return new challenge', async function () {
      // when
      const result = await getNextChallengeForPix1d({ assessmentId, ...dependencies });

      // then
      expect(result).to.equal(null);
    });
    it('should update the activity with the status skipped', async function () {
      // when
      await getNextChallengeForPix1d({ assessmentId, ...dependencies });

      // then
      expect(activityRepository.updateStatus).to.have.been.calledOnceWith({
        activityId,
        status: Activity.status.SKIPPED,
      });
    });
  });

  context('when user answered the last challenge of an activity and start a new one', function () {
    it('should update the activity with the status succeeded', async function () {
      const activityAnswer = domainBuilder.buildActivityAnswer({ result: AnswerStatus.OK });
      const activity = new Activity({
        id: activityId,
        level: Activity.levels.TUTORIAL,
        status: Activity.status.STARTED,
      });

      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      activityRepository.getLastActivity.withArgs(assessmentId).resolves(activity);
      activityRepository.getAllByAssessmentId.withArgs(assessmentId).resolves([activity]);
      activityAnswerRepository.findByActivity.withArgs(activityId).resolves([activityAnswer]);
      challengeRepository.getForPix1D
        .withArgs({ missionId, activityLevel: Activity.levels.TUTORIAL, challengeNumber: 2 })
        .rejects(new NotFoundError());

      // when
      await getNextChallengeForPix1d({ assessmentId, ...dependencies });
      expect(activityRepository.updateStatus).to.have.been.calledOnceWith({
        activityId,
        status: Activity.status.SUCCEEDED,
      });
    });
  });
});
