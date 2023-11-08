import { expect, sinon } from '../../../../test-helper.js';
import {
  getChallengeForCurrentActivity,
  getNextActivityChallenge,
} from '../../../../../src/school/domain/services/activity-challenge.js';
import { challengeService } from '../../../../../src/school/domain/services/challenge.js';
import { pix1dService } from '../../../../../src/school/domain/services/algorithm-method.js';
import { Answer } from '../../../../../lib/domain/models/index.js';
import { Activity } from '../../../../../src/school/domain/models/Activity.js';

describe('Unit | Service | ActivityChallenge', function () {
  describe('#getChallengeForCurrentActivity', function () {
    it('calls getChallenge method when there is no answers', function () {
      const missionId = 'mission_id';
      const alternativeVersion = null;
      const answers = [];
      const activityLevel = Activity.levels.TRAINING;
      const currentActivity = { level: activityLevel, alternativeVersion };
      const challengeNumber = 1;
      const locale = 'fr';

      const getChallengeStub = sinon.stub(challengeService, 'getChallenge');
      const challengeRepository = Symbol();
      getChallengeForCurrentActivity({
        currentActivity,
        missionId,
        challengeRepository,
        answers,
        locale,
      });

      expect(getChallengeStub).to.have.been.calledOnceWith({
        missionId,
        activityLevel,
        challengeNumber,
        challengeRepository,
        alternativeVersion,
        locale,
      });
    });
    it('calls getChallenge method when the last answer status is success', function () {
      const missionId = 'mission_id';
      const alternativeVersion = null;
      const answers = [new Answer({ result: 'ok' })];
      const activityLevel = Activity.levels.TRAINING;
      const currentActivity = { level: activityLevel, alternativeVersion };
      const expectedChallengeNumber = 2;
      const locale = 'fr';

      const getChallengeStub = sinon.stub(challengeService, 'getChallenge');
      const challengeRepository = Symbol();
      getChallengeForCurrentActivity({
        currentActivity,
        missionId,
        challengeRepository,
        answers,
        locale,
      });

      expect(getChallengeStub).to.have.been.calledOnceWith({
        missionId,
        activityLevel,
        challengeNumber: expectedChallengeNumber,
        challengeRepository,
        alternativeVersion,
        locale,
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
      const locale = 'fr';
      getChallengeForCurrentActivity({
        missionId,
        currentActivity,
        challengeRepository,
        answers,
        locale,
      });
      sinon.assert.notCalled(getChallengeStub);
    });
  });
  describe('#getNextActivityChallenge', function () {
    it('calls getAllByAssessmentId method', function () {
      const assessmentId = 'assessment_id';
      const missionId = 'mission_id';
      const locale = 'fr';
      const getNextActivityLevelStub = sinon.stub(pix1dService, 'getNextActivityLevel');
      getNextActivityLevelStub.returns(Activity.levels.TRAINING);

      const challengeRepository = Symbol();
      const activityRepository = { getAllByAssessmentId: sinon.stub(), save: sinon.stub() };
      getNextActivityChallenge({
        missionId,
        assessmentId,
        challengeRepository,
        activityRepository,
        locale,
      });

      expect(activityRepository.getAllByAssessmentId).to.have.been.calledOnceWith(assessmentId);
    });
    it('calls getAlternativeVersion method', async function () {
      const assessmentId = 'assessment_id';
      const missionId = 'mission_id';
      const locale = 'fr';
      const challengeRepository = Symbol();
      const getAlternativeVersionStub = sinon.stub(challengeService, 'getAlternativeVersion');
      const getChallengeStub = sinon.stub(challengeService, 'getChallenge');
      const getNextActivityLevelStub = sinon.stub(pix1dService, 'getNextActivityLevel');
      const activityRepository = { getAllByAssessmentId: sinon.stub(), save: sinon.stub() };
      getNextActivityLevelStub.returns(Activity.levels.TRAINING);
      activityRepository.getAllByAssessmentId.resolves([]);
      getAlternativeVersionStub.returns(undefined);
      getChallengeStub.resolves({ alternativeVersion: undefined });
      await getNextActivityChallenge({
        missionId,
        assessmentId,
        challengeRepository,
        activityRepository,
        locale,
      });

      expect(getAlternativeVersionStub).to.have.been.calledOnceWith({
        missionId,
        activityLevel: Activity.levels.TRAINING,
        challengeRepository,
        alreadyPlayedAlternativeVersions: [],
        locale,
      });
    });
    context('when the challenge alternative version === undefined', function () {
      it('calls activityRepository#save method with alternativeVersion === 0', async function () {
        const assessmentId = 'assessment_id';
        const missionId = 'mission_id';
        const locale = 'fr';
        const nextActivityLevel = Activity.levels.TRAINING;
        const getAlternativeVersionStub = sinon.stub(challengeService, 'getAlternativeVersion');
        const getChallengeStub = sinon.stub(challengeService, 'getChallenge');
        const getNextActivityLevelStub = sinon.stub(pix1dService, 'getNextActivityLevel');
        getNextActivityLevelStub.returns(nextActivityLevel);
        const challengeRepository = Symbol();
        const activityRepository = { getAllByAssessmentId: sinon.stub(), save: sinon.stub() };
        activityRepository.getAllByAssessmentId.resolves([]);
        getAlternativeVersionStub.resolves(undefined);
        getChallengeStub.resolves({ alternativeVersion: undefined });
        const activity = new Activity({
          assessmentId,
          level: nextActivityLevel,
          status: Activity.status.STARTED,
          alternativeVersion: 0,
          locale,
        });
        await getNextActivityChallenge({
          missionId,
          assessmentId,
          challengeRepository,
          activityRepository,
          locale,
        });

        expect(activityRepository.save).to.have.been.calledOnceWith(activity);
      });
    });
    context('when the challenge alternative !== undefined ', function () {
      it("calls activityRepository#save method with the challenge's alternativeVersion", async function () {
        const assessmentId = 'assessment_id';
        const missionId = 'mission_id';
        const locale = 'fr';
        const nextActivityLevel = Activity.levels.TRAINING;
        const challenge = { alternativeVersion: 1 };
        const challengeRepository = Symbol();
        const getNextActivityLevelStub = sinon.stub(pix1dService, 'getNextActivityLevel');
        getNextActivityLevelStub.returns(nextActivityLevel);
        const getAlternativeVersionStub = sinon.stub(challengeService, 'getAlternativeVersion');
        getAlternativeVersionStub.resolves(1);
        const activity = new Activity({
          assessmentId,
          level: nextActivityLevel,
          status: Activity.status.STARTED,
          alternativeVersion: challenge.alternativeVersion,
        });
        const activityRepository = { getAllByAssessmentId: sinon.stub(), save: sinon.stub() };
        activityRepository.getAllByAssessmentId.resolves([]);
        const getChallengeStub = sinon.stub(challengeService, 'getChallenge');

        getChallengeStub.resolves(challenge);
        await getNextActivityChallenge({
          missionId,
          assessmentId,
          challengeRepository,
          activityRepository,
          locale,
        });

        expect(activityRepository.save).to.have.been.calledOnceWith(activity);
      });
    });
    context('when the user already played activities with same level', function () {
      it('calls getAlternativeVersion with already played alternative versions', async function () {
        const assessmentId = 'assessment_id';
        const missionId = 'mission_id';
        const locale = 'fr';
        const challenge = { alternativeVersion: 3 };
        const nextActivityLevel = Activity.levels.TRAINING;

        const challengeRepository = Symbol();
        const getNextActivityLevelStub = sinon.stub(pix1dService, 'getNextActivityLevel');
        getNextActivityLevelStub.returns(nextActivityLevel);
        const getAlternativeVersionStub = sinon.stub(challengeService, 'getAlternativeVersion');
        getAlternativeVersionStub.resolves(3);
        const getChallengeStub = sinon.stub(challengeService, 'getChallenge');
        getChallengeStub.resolves(challenge);
        const activityRepository = { getAllByAssessmentId: sinon.stub(), save: sinon.stub() };

        activityRepository.getAllByAssessmentId.resolves([
          { alternativeVersion: undefined, level: Activity.levels.TRAINING },
          { alternativeVersion: 2, level: Activity.levels.TRAINING },
          { alternativeVersion: 3, level: Activity.levels.VALIDATION },
        ]);
        await getNextActivityChallenge({
          missionId,
          assessmentId,
          challengeRepository,
          activityRepository,
          locale,
        });

        expect(getAlternativeVersionStub).to.have.been.calledOnceWith({
          missionId,
          activityLevel: Activity.levels.TRAINING,
          challengeRepository,
          alreadyPlayedAlternativeVersions: [undefined, 2],
          locale,
        });
      });
    });
    context('when the user never played an activity with the same level', function () {
      it('calls getAlternativeVersion with already played alternative versions = empty array', async function () {
        const assessmentId = 'assessment_id';
        const missionId = 'mission_id';
        const locale = 'fr';
        const nextActivityLevel = Activity.levels.TRAINING;
        const challenge = { alternativeVersion: 1 };
        const challengeRepository = Symbol();
        const getNextActivityLevelStub = sinon.stub(pix1dService, 'getNextActivityLevel');
        getNextActivityLevelStub.returns(nextActivityLevel);
        const getAlternativeVersionStub = sinon.stub(challengeService, 'getAlternativeVersion');
        const activityRepository = { getAllByAssessmentId: sinon.stub(), save: sinon.stub() };
        const getChallengeStub = sinon.stub(challengeService, 'getChallenge');
        getAlternativeVersionStub.resolves(1);
        getChallengeStub.resolves(challenge);
        activityRepository.getAllByAssessmentId.resolves([
          { alternativeVersion: 3, level: Activity.levels.VALIDATION },
        ]);
        await getNextActivityChallenge({
          missionId,
          assessmentId,
          challengeRepository,
          activityRepository,
          locale,
        });

        expect(getAlternativeVersionStub).to.have.been.calledOnceWith({
          missionId,
          activityLevel: Activity.levels.TRAINING,
          challengeRepository,
          alreadyPlayedAlternativeVersions: [],
          locale,
        });
      });
    });
    context('when the user never played any activity', function () {
      it('calls getAlternativeVersion with already played alternative versions = empty array', async function () {
        const assessmentId = 'assessment_id';
        const missionId = 'mission_id';
        const locale = 'fr';
        const nextActivityLevel = Activity.levels.TRAINING;
        const challenge = { alternativeVersion: 1 };
        const challengeRepository = Symbol();
        const getNextActivityLevelStub = sinon.stub(pix1dService, 'getNextActivityLevel');
        getNextActivityLevelStub.returns(nextActivityLevel);
        const getAlternativeVersionStub = sinon.stub(challengeService, 'getAlternativeVersion');
        getAlternativeVersionStub.resolves(1);
        const getChallengeStub = sinon.stub(challengeService, 'getChallenge');
        getChallengeStub.resolves(challenge);
        const activityRepository = { getAllByAssessmentId: sinon.stub(), save: sinon.stub() };

        activityRepository.getAllByAssessmentId.resolves([]);
        await getNextActivityChallenge({
          missionId,
          assessmentId,
          challengeRepository,
          activityRepository,
          locale,
        });

        expect(getAlternativeVersionStub).to.have.been.calledOnceWith({
          missionId,
          activityLevel: Activity.levels.TRAINING,
          challengeRepository,
          alreadyPlayedAlternativeVersions: [],
          locale,
        });
      });
    });
    context('when there is no nextActivityLevel', function () {
      it('returns nothing', async function () {
        const assessmentId = 'assessment_id';
        const missionId = 'mission_id';
        const locale = 'fr';
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
          locale,
        });

        expect(result).to.be.undefined;
      });
    });
  });
});
