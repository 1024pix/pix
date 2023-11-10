import { databaseBuilder, expect, knex, mockLearningContent, sinon } from '../../../../test-helper.js';
import { Assessment, Challenge } from '../../../../../lib/domain/models/index.js';
import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import * as activityRepository from '../../../../../lib/infrastructure/repositories/activity-repository.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as challengeRepository from '../../../../../src/school/infrastructure/repositories/challenge-repository.js';
import * as activityAnswerRepository from '../../../../../lib/infrastructure/repositories/activity-answer-repository.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import { getNextChallenge } from '../../../../../src/school/domain/usecases/get-next-challenge.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Integration | Usecase | get-next-challenge', function () {
  describe('#getNextChallenge', function () {
    const missionId = 'recCHAL1';
    let challengeVal1;
    let challengeAlterVal1;
    let challengeVal2;
    let challengeAlterVal2;
    let challengeEn1;
    let challengeDefi;
    let assessmentId;
    const alternativeVersion = 2;

    beforeEach(async function () {
      const tubeIdVal = 'tubeIdVal';
      const tubeIdEn = 'tubeIdEn';
      const tubeIdDefi = 'tubeIdDefi';
      const skillVal1 = learningContentBuilder.buildSkill({
        id: 'recSkillVal1',
        name: '@rechercher_va1',
        tubeId: tubeIdVal,
      });
      const skillVal2 = learningContentBuilder.buildSkill({
        id: 'recSkillVal2',
        name: '@rechercher_va2',
        tubeId: tubeIdVal,
      });
      const skillEn1 = learningContentBuilder.buildSkill({
        id: 'recSkillEn2',
        name: '@rechercher_en1',
        tubeId: tubeIdEn,
      });
      const skillDefi = learningContentBuilder.buildSkill({
        id: 'recSkillDefi',
        name: '@rechercher_de1',
        tubeId: tubeIdDefi,
      });

      const tubeVal = learningContentBuilder.buildTube({
        id: tubeIdVal,
        thematicId: missionId,
        name: '@rechercher_va',
        skillIds: [skillVal1.id, skillVal2.id],
      });
      const tubeEn = learningContentBuilder.buildTube({
        id: tubeIdEn,
        thematicId: missionId,
        name: '@rechercher_en',
        skillIds: [skillEn1.id],
      });
      const tubeDefi = learningContentBuilder.buildTube({
        id: tubeIdDefi,
        thematicId: missionId,
        name: '@rechercher_en',
        skillIds: [skillDefi.id],
      });

      challengeVal1 = learningContentBuilder.buildChallenge({ id: 'challengeVal1', skillId: skillVal1.id });
      challengeAlterVal1 = learningContentBuilder.buildChallenge({
        id: 'challengeAlterVal1',
        skillId: skillVal1.id,
        alternativeVersion,
      });
      challengeVal2 = learningContentBuilder.buildChallenge({ id: 'challengeVal2', skillId: skillVal2.id });
      challengeAlterVal2 = learningContentBuilder.buildChallenge({
        id: 'challengeAlterVal2',
        skillId: skillVal2.id,
        alternativeVersion,
      });
      challengeEn1 = learningContentBuilder.buildChallenge({ id: 'challengeEn1', skillId: skillEn1.id });
      challengeDefi = learningContentBuilder.buildChallenge({ id: 'challengeDefi1', skillId: skillDefi.id });

      const learningContent = {
        tubes: [tubeDefi, tubeVal, tubeEn],
        skills: [skillDefi, skillVal1, skillVal2, skillEn1],
        challenges: [challengeDefi, challengeVal1, challengeAlterVal1, challengeVal2, challengeAlterVal2, challengeEn1],
      };

      mockLearningContent(learningContent);
    });

    context('when the user starts a mission with a challenge without alternative version', function () {
      beforeEach(async function () {
        assessmentId = databaseBuilder.factory.buildMissionAssessment({ missionId }).assessmentId;
        await databaseBuilder.commit();
      });

      it('should return the first challenge for the level Validation', async function () {
        // when
        sinon.stub(Math, 'random').returns(0.2);
        const nextChallenge = await getNextChallenge({
          assessmentId,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
        });
        // then
        expect(nextChallenge).to.be.instanceOf(Challenge);
        expect(nextChallenge.id).to.deep.equal(challengeVal1.id);
      });

      it('should create an activity with status started', async function () {
        // when
        sinon.stub(Math, 'random').returns(0.2);
        await getNextChallenge({
          assessmentId,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
        });

        // then
        const activities = await knex('activities').where({ assessmentId });

        expect(activities.length).to.equal(1);
        expect(activities[0].status).to.equal(Activity.status.STARTED);
        expect(activities[0].alternativeVersion).to.equal(0);
      });
    });

    context('when the user reloads the first challenge of an activity', function () {
      beforeEach(async function () {
        assessmentId = databaseBuilder.factory.buildMissionAssessment({ missionId }).assessmentId;

        databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.TRAINING,
          status: Activity.status.STARTED,
          alternativeVersion: 0,
        });
        await databaseBuilder.commit();
      });

      it('should return the first challenge', async function () {
        // when
        const nextChallenge = await getNextChallenge({
          assessmentId,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
        });

        // then
        expect(nextChallenge).to.be.instanceOf(Challenge);
        expect(nextChallenge.id).to.deep.equal(challengeEn1.id);
      });
      it('should not create a new activity', async function () {
        // when
        await getNextChallenge({
          assessmentId,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
        });

        // then
        const activities = await knex('activities').where({ assessmentId });

        expect(activities.length).to.equal(1);
      });
    });

    context(
      'when the user answered to the first challenge of an activity with a specific alternative version',
      function () {
        it('should return the second challenge with the same alternative version', async function () {
          // given
          assessmentId = databaseBuilder.factory.buildMissionAssessment({ missionId }).assessmentId;
          const activityVal = databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.VALIDATION,
            status: Activity.status.STARTED,
            createdAt: new Date('2022-04-07'),
            alternativeVersion,
          });

          databaseBuilder.factory.buildActivityAnswer({
            activityId: activityVal.id,
            challengeId: challengeVal1.id,
            result: 'ok',
          });
          await databaseBuilder.commit();

          // when
          const nextChallenge = await getNextChallenge({
            assessmentId,
            activityRepository,
            assessmentRepository,
            challengeRepository,
            activityAnswerRepository,
            missionAssessmentRepository,
          });

          // then
          expect(nextChallenge).to.be.instanceOf(Challenge);
          expect(nextChallenge.id).to.deep.equal(challengeAlterVal2.id);
        });
      },
    );
    context('when the user plays for the 2nd time an activity level which has an alternative version', function () {
      it('should return the first challenge of the activity with the alternative version', async function () {
        // given
        assessmentId = databaseBuilder.factory.buildMissionAssessment({ missionId }).assessmentId;
        databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.FAILED,
          createdAt: new Date('2021-04-07'),
          alternativeVersion: 0,
        });
        const trainingActivity = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.TRAINING,
          status: Activity.status.STARTED,
          createdAt: new Date('2022-04-09'),
          alternativeVersion: 1,
        });

        databaseBuilder.factory.buildActivityAnswer({
          activityId: trainingActivity.id,
          challengeId: challengeEn1.id,
          result: 'ok',
        });
        await databaseBuilder.commit();

        // when
        const nextChallenge = await getNextChallenge({
          assessmentId,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
        });

        // then
        expect(nextChallenge).to.be.instanceOf(Challenge);
        expect(nextChallenge.id).to.deep.equal(challengeAlterVal1.id);
        expect(nextChallenge.alternativeVersion).to.deep.equal(alternativeVersion);
      });
    });

    context('when the user finished a validation activity', function () {
      let activityVal;
      beforeEach(async function () {
        assessmentId = databaseBuilder.factory.buildMissionAssessment({ missionId }).assessmentId;
        activityVal = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.STARTED,
        });

        databaseBuilder.factory.buildActivityAnswer({
          activityId: activityVal.id,
          challengeId: challengeVal1.id,
          result: 'ok',
        });
        databaseBuilder.factory.buildActivityAnswer({
          activityId: activityVal.id,
          challengeId: challengeVal2.id,
          result: 'ko',
        });

        await databaseBuilder.commit();
      });

      it('should return the first challenge of the training level', async function () {
        // when
        const nextChallenge = await getNextChallenge({
          assessmentId,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
        });

        // then
        expect(nextChallenge).to.be.instanceOf(Challenge);
        expect(nextChallenge.id).to.deep.equal(challengeEn1.id);
      });
      it('should create a new activity for the training level', async function () {
        // when
        await getNextChallenge({
          assessmentId,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
        });

        // then
        const activities = await knex('activities');

        expect(activities.length).to.equal(2);
        expect(activities[1].level).to.equal(Activity.levels.TRAINING);
        expect(activities[1].status).to.equal(Activity.status.STARTED);
      });
    });

    context('when the user failed the last challenge of an activity', function () {
      it('should update the activity with the failed status ', async function () {
        assessmentId = databaseBuilder.factory.buildMissionAssessment({ missionId }).assessmentId;
        const activity = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.CHALLENGE,
          status: Activity.status.STARTED,
        });

        databaseBuilder.factory.buildActivityAnswer({
          activityId: activity.id,
          challengeId: challengeDefi.id,
          result: 'ko',
        });

        await databaseBuilder.commit();
        // when
        await getNextChallenge({
          assessmentId,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
        });

        // then
        const updatedActivities = await knex('activities').where({ id: activity.id });

        expect(updatedActivities[0].status).to.equal(Activity.status.FAILED);
      });
    });
    context('when the user skipped the last challenge of an activity', function () {
      it('should update the activity with the skipped status ', async function () {
        assessmentId = databaseBuilder.factory.buildMissionAssessment({ missionId }).assessmentId;
        const activity = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.CHALLENGE,
          status: Activity.status.STARTED,
        });

        databaseBuilder.factory.buildActivityAnswer({
          activityId: activity.id,
          challengeId: challengeDefi.id,
          result: 'aband',
        });

        await databaseBuilder.commit();
        // when
        await getNextChallenge({
          assessmentId,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
        });

        // then
        const updatedActivities = await knex('activities').where({ id: activity.id });

        expect(updatedActivities[0].status).to.equal(Activity.status.SKIPPED);
      });
    });
    context('when the user succeeded the last challenge of an activity', function () {
      it('should update the activity with the succeeded status ', async function () {
        assessmentId = databaseBuilder.factory.buildMissionAssessment({ missionId }).assessmentId;
        const activity = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.CHALLENGE,
          status: Activity.status.STARTED,
        });

        databaseBuilder.factory.buildActivityAnswer({
          activityId: activity.id,
          challengeId: challengeDefi.id,
          result: 'ok',
        });

        await databaseBuilder.commit();
        // when
        await getNextChallenge({
          assessmentId,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
        });

        // then
        const updatedActivities = await knex('activities').where({ id: activity.id });

        expect(updatedActivities[0].status).to.equal(Activity.status.SUCCEEDED);
      });
    });

    context('when the user finished the mission', function () {
      it('should complete the assessment', async function () {
        assessmentId = databaseBuilder.factory.buildMissionAssessment({ missionId }).assessmentId;

        const activityDefi = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.CHALLENGE,
          status: Activity.status.STARTED,
        });

        databaseBuilder.factory.buildActivityAnswer({
          activityId: activityDefi.id,
          challengeId: challengeDefi.id,
          result: 'ok',
        });

        await databaseBuilder.commit();
        // when
        await getNextChallenge({
          assessmentId,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
        });

        // then
        const updatedAssessment = await knex('assessments').where({ id: assessmentId }).first();

        expect(updatedAssessment.state).to.equal(Assessment.states.COMPLETED);
      });
    });
  });
});
