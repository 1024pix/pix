import { expect, sinon } from '../../../../test-helper.js';
import {
  getChallengeForCurrentActivity,
  getNextActivityChallenge,
} from '../../../../../lib/domain/services/1d/activity-challenge.js';
import { challengeService } from '../../../../../lib/domain/services/1d/challenge.js';
import { pix1dService } from '../../../../../lib/domain/services/algorithm-methods/pix1d.js';
import { Activity, Answer } from '../../../../../lib/domain/models/index.js';

describe('Unit | Service | ActivityChallenge', function () {
  describe('#getChallengeForCurrentActivity', function () {
    it('calls getChallenge method when there is no answers', function () {
      const missionId = 'mission_id';
      const alternativeVersion = null;
      const answers = [];
      const activityLevel = Activity.levels.TRAINING;
      const currentActivity = { level: activityLevel, alternativeVersion };
      const challengeNumber = 1;

      const getChallengeStub = sinon.stub(challengeService, 'getChallenge');
      const challengeRepository = Symbol();
      getChallengeForCurrentActivity({
        currentActivity,
        missionId,
        challengeRepository,
        answers,
      });

      expect(getChallengeStub).to.have.been.calledOnceWith({
        missionId,
        activityLevel,
        challengeNumber,
        challengeRepository,
        alternativeVersion,
      });
    });
    it('calls getChallenge method when the last answer status is success', function () {
      const missionId = 'mission_id';
      const alternativeVersion = null;
      const answers = [new Answer({ result: 'ok' })];
      const activityLevel = Activity.levels.TRAINING;
      const currentActivity = { level: activityLevel, alternativeVersion };
      const expectedChallengeNumber = 2;

      const getChallengeStub = sinon.stub(challengeService, 'getChallenge');
      const challengeRepository = Symbol();
      getChallengeForCurrentActivity({
        currentActivity,
        missionId,
        challengeRepository,
        answers,
      });

      expect(getChallengeStub).to.have.been.calledOnceWith({
        missionId,
        activityLevel,
        challengeNumber: expectedChallengeNumber,
        challengeRepository,
        alternativeVersion,
      });
    });
    it('does not call getChallenge method when the last answer is not success', function () {
      const missionId = 'mission_id';
      const alternativeVersion = null;
      const activityLevel = Activity.levels.TRAINING;
      const currentActivity = { level: activityLevel, alternativeVersion };
      const getChallengeStub = sinon.stub(challengeService, 'getChallenge');
      const challengeRepository = Symbol();
      const answers = [new Answer({ result: 'ko' })];
      getChallengeForCurrentActivity({
        missionId,
        currentActivity,
        challengeRepository,
        answers,
      });
      sinon.assert.notCalled(getChallengeStub);
    });
  });
  describe('#getNextActivityChallenge', function () {
    it('calls getAllByAssessmentId method', function () {
      const assessmentId = 'assessment_id';
      const missionId = 'mission_id';
      const getNextActivityLevelStub = sinon.stub(pix1dService, 'getNextActivityLevel');
      getNextActivityLevelStub.returns(Activity.levels.TRAINING);

      const challengeRepository = Symbol();
      const activityRepository = { getAllByAssessmentId: sinon.stub(), save: sinon.stub() };
      getNextActivityChallenge({
        missionId,
        assessmentId,
        challengeRepository,
        activityRepository,
      });

      expect(activityRepository.getAllByAssessmentId).to.have.been.calledOnceWith(assessmentId);
    });
    it('calls getStartChallenge method', async function () {
      const assessmentId = 'assessment_id';
      const missionId = 'mission_id';
      const challengeNumber = 1;

      const getStartChallengeStub = sinon.stub(challengeService, 'getStartChallenge');
      const getNextActivityLevelStub = sinon.stub(pix1dService, 'getNextActivityLevel');
      getNextActivityLevelStub.returns(Activity.levels.TRAINING);

      const challengeRepository = Symbol();
      const activityRepository = { getAllByAssessmentId: sinon.stub(), save: sinon.stub() };
      activityRepository.getAllByAssessmentId.resolves([]);
      getStartChallengeStub.resolves({ alternativeVersion: undefined });
      await getNextActivityChallenge({
        missionId,
        assessmentId,
        challengeRepository,
        activityRepository,
      });

      expect(getStartChallengeStub).to.have.been.calledOnceWith({
        missionId,
        activityLevel: Activity.levels.TRAINING,
        challengeNumber,
        challengeRepository,
      });
    });
    context('when the challenge alternative version === undefined', function () {
      it('calls activityRepository#save method with alternativeVersion == 0', async function () {
        const assessmentId = 'assessment_id';
        const missionId = 'mission_id';
        const nextActivityLevel = Activity.levels.TRAINING;
        const getStartChallengeStub = sinon.stub(challengeService, 'getStartChallenge');
        const getNextActivityLevelStub = sinon.stub(pix1dService, 'getNextActivityLevel');
        getNextActivityLevelStub.returns(nextActivityLevel);
        const challengeRepository = Symbol();
        const activityRepository = { getAllByAssessmentId: sinon.stub(), save: sinon.stub() };
        activityRepository.getAllByAssessmentId.resolves([]);
        getStartChallengeStub.resolves({ alternativeVersion: undefined });
        const activity = new Activity({
          assessmentId,
          level: nextActivityLevel,
          status: Activity.status.STARTED,
          alternativeVersion: 0,
        });
        await getNextActivityChallenge({
          missionId,
          assessmentId,
          challengeRepository,
          activityRepository,
        });

        expect(activityRepository.save).to.have.been.calledOnceWith(activity);
      });
    });
    context('when the challenge alternative !== undefined ', function () {
      it("calls activityRepository#save method with the challenge's alternativeVersion", async function () {
        const assessmentId = 'assessment_id';
        const missionId = 'mission_id';
        const nextActivityLevel = Activity.levels.TRAINING;
        const challenge = { alternativeVersion: 1 };
        const challengeRepository = Symbol();
        const getNextActivityLevelStub = sinon.stub(pix1dService, 'getNextActivityLevel');
        getNextActivityLevelStub.returns(nextActivityLevel);
        const getStartChallengeStub = sinon.stub(challengeService, 'getStartChallenge');
        getStartChallengeStub.resolves(challenge);
        const activity = new Activity({
          assessmentId,
          level: nextActivityLevel,
          status: Activity.status.STARTED,
          alternativeVersion: challenge.alternativeVersion,
        });
        const activityRepository = { getAllByAssessmentId: sinon.stub(), save: sinon.stub() };
        activityRepository.getAllByAssessmentId.resolves([]);
        await getNextActivityChallenge({
          missionId,
          assessmentId,
          challengeRepository,
          activityRepository,
        });

        expect(activityRepository.save).to.have.been.calledOnceWith(activity);
      });
    });
    context('when there is no nextActivityLevel', function () {
      it('returns nothing', async function () {
        const assessmentId = 'assessment_id';
        const missionId = 'mission_id';
        const challengeRepository = Symbol();
        const getNextActivityLevelStub = sinon.stub(pix1dService, 'getNextActivityLevel');
        getNextActivityLevelStub.returns(undefined);
        const activityRepository = { getAllByAssessmentId: sinon.stub() };
        activityRepository.getAllByAssessmentId.resolves([]);
        const result = await getNextActivityChallenge({
          missionId,
          assessmentId,
          challengeRepository,
          activityRepository,
        });

        expect(result).to.be.undefined;
      });
    });
  });
});
