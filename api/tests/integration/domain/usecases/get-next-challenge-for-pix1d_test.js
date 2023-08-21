import { domainBuilder, expect, mockLearningContent, databaseBuilder, knex } from '../../../test-helper.js';
import { Challenge } from '../../../../lib/domain/models/Challenge.js';
import { Activity } from '../../../../lib/domain/models/Activity.js';
import { Assessment } from '../../../../lib/domain/models/Assessment.js';
import * as activityRepository from '../../../../lib/infrastructure/repositories/activity-repository.js';
import * as assessmentRepository from '../../../../lib/infrastructure/repositories/assessment-repository.js';
import * as challengeRepository from '../../../../lib/infrastructure/repositories/challenge-repository.js';
import * as activityAnswerRepository from '../../../../lib/infrastructure/repositories/activity-answer-repository.js';
import { getNextChallengeForPix1d } from '../../../../lib/domain/usecases/get-next-challenge-for-pix1d.js';

describe('Integration | Usecase | get-next-challenge-for-pix1d', function () {
  describe('#getNextChallengeForPix1d', function () {
    const missionId = 'recCHAL1';
    let challengeVal1;
    let challengeAlterVal2;
    let challengeVal2;
    let challengeEn1;
    let challengeDefi;
    let assessment;
    const alternativeVersion = 2;

    beforeEach(async function () {
      const tubeIdVal = 'tubeIdVal';
      const tubeIdEn = 'tubeIdEn';
      const tubeIdDefi = 'tubeIdDefi';
      const skillVal1 = domainBuilder.buildSkill({ id: 'recSkillVal1', name: '@rechercher_va1', tubeId: tubeIdVal });
      const skillVal2 = domainBuilder.buildSkill({ id: 'recSkillVal2', name: '@rechercher_va2', tubeId: tubeIdVal });
      const skillEn1 = domainBuilder.buildSkill({ id: 'recSkillEn2', name: '@rechercher_en1', tubeId: tubeIdEn });
      const skillDefi = domainBuilder.buildSkill({ id: 'recSkillDefi', name: '@rechercher_de1', tubeId: tubeIdDefi });

      const tubeVal = domainBuilder.buildTube({
        id: tubeIdVal,
        thematicId: missionId,
        name: '@rechercher_val',
        skills: [skillVal1, skillVal2],
      });
      const tubeEn = domainBuilder.buildTube({
        id: tubeIdEn,
        thematicId: missionId,
        name: '@rechercher_en',
        skills: [skillEn1],
      });
      const tubeDefi = domainBuilder.buildTube({
        id: tubeIdDefi,
        thematicId: missionId,
        name: '@rechercher_en',
        skills: [skillDefi],
      });

      challengeVal1 = _buildChallenge({ id: 'challengeVal1', skillId: skillVal1.id });
      challengeVal2 = _buildChallenge({ id: 'challengeVal2', skillId: skillVal2.id });
      challengeAlterVal2 = _buildChallenge({ id: 'challengeAlterVal2', skillId: skillVal2.id, alternativeVersion });
      challengeEn1 = _buildChallenge({ id: 'challengeEn1', skillId: skillEn1.id });
      challengeDefi = _buildChallenge({ id: 'challengeDefi1', skillId: skillDefi.id });

      const learningContent = {
        tubes: [tubeDefi, tubeVal, tubeEn],
        skills: [skillDefi, skillVal1, skillVal2, skillEn1],
        challenges: [challengeDefi, challengeVal1, challengeVal2, challengeAlterVal2, challengeEn1],
      };

      mockLearningContent(learningContent);
    });

    afterEach(async function () {
      await knex('activity-answers').delete();
      await knex('activities').delete();
      await knex('assessments').where({ id: assessment.id }).delete();
    });

    context('when the user starts a mission', function () {
      beforeEach(async function () {
        assessment = databaseBuilder.factory.buildPix1dAssessment({ missionId });
        await databaseBuilder.commit();
      });

      it('should return the first challenge for the level Validation', async function () {
        // when
        const nextChallenge = await getNextChallengeForPix1d({
          assessmentId: assessment.id,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
        });

        // then
        expect(nextChallenge).to.be.instanceOf(Challenge);
        expect(nextChallenge.id).to.deep.equal(challengeVal1.id);
      });

      it('should create an activity with status started', async function () {
        // when
        await getNextChallengeForPix1d({
          assessmentId: assessment.id,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
        });

        // then
        const activities = await knex('activities').where({ assessmentId: assessment.id });

        expect(activities.length).to.equal(1);
        expect(activities[0].status).to.equal(Activity.status.STARTED);
      });
    });

    context('when the user reloads the first challenge of an activity', function () {
      beforeEach(async function () {
        assessment = databaseBuilder.factory.buildPix1dAssessment({ missionId });
        databaseBuilder.factory.buildActivity({
          assessmentId: assessment.id,
          level: Activity.levels.TRAINING,
          status: Activity.status.STARTED,
        });
        await databaseBuilder.commit();
      });

      it('should return the first challenge', async function () {
        // when
        const nextChallenge = await getNextChallengeForPix1d({
          assessmentId: assessment.id,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
        });

        // then
        expect(nextChallenge).to.be.instanceOf(Challenge);
        expect(nextChallenge.id).to.deep.equal(challengeEn1.id);
      });
      it('should not create a new activity', async function () {
        // when
        await getNextChallengeForPix1d({
          assessmentId: assessment.id,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
        });

        // then
        const activities = await knex('activities').where({ assessmentId: assessment.id });

        expect(activities.length).to.equal(1);
      });
    });

    context(
      'when the user answered to the first challenge of an activity with a specific alternative version',
      function () {
        it('should return the second challenge with the same alternative version', async function () {
          // given
          assessment = databaseBuilder.factory.buildPix1dAssessment({ missionId });
          const activityVal = databaseBuilder.factory.buildActivity({
            assessmentId: assessment.id,
            level: Activity.levels.VALIDATION,
            status: Activity.status.FAILED,
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
          const nextChallenge = await getNextChallengeForPix1d({
            assessmentId: assessment.id,
            activityRepository,
            assessmentRepository,
            challengeRepository,
            activityAnswerRepository,
          });

          // then
          expect(nextChallenge).to.be.instanceOf(Challenge);
          expect(nextChallenge.id).to.deep.equal(challengeAlterVal2.id);
        });
      },
    );

    context('when the user finished a validation activity', function () {
      let activityVal;
      beforeEach(async function () {
        assessment = databaseBuilder.factory.buildPix1dAssessment({ missionId });
        activityVal = databaseBuilder.factory.buildActivity({
          assessmentId: assessment.id,
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
        const nextChallenge = await getNextChallengeForPix1d({
          assessmentId: assessment.id,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
        });

        // then
        expect(nextChallenge).to.be.instanceOf(Challenge);
        expect(nextChallenge.id).to.deep.equal(challengeEn1.id);
      });
      it('should create a new activity for the training level', async function () {
        // when
        await getNextChallengeForPix1d({
          assessmentId: assessment.id,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
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
        assessment = databaseBuilder.factory.buildPix1dAssessment({ missionId });
        const activity = databaseBuilder.factory.buildActivity({
          assessmentId: assessment.id,
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
        await getNextChallengeForPix1d({
          assessmentId: assessment.id,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
        });

        // then
        const updatedActivities = await knex('activities').where({ id: activity.id });

        expect(updatedActivities[0].status).to.equal(Activity.status.FAILED);
      });
    });
    context('when the user skipped the last challenge of an activity', function () {
      it('should update the activity with the skipped status ', async function () {
        assessment = databaseBuilder.factory.buildPix1dAssessment({ missionId });
        const activity = databaseBuilder.factory.buildActivity({
          assessmentId: assessment.id,
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
        await getNextChallengeForPix1d({
          assessmentId: assessment.id,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
        });

        // then
        const updatedActivities = await knex('activities').where({ id: activity.id });

        expect(updatedActivities[0].status).to.equal(Activity.status.SKIPPED);
      });
    });
    context('when the user succeeded the last challenge of an activity', function () {
      it('should update the activity with the succeeded status ', async function () {
        assessment = databaseBuilder.factory.buildPix1dAssessment({ missionId });
        const activity = databaseBuilder.factory.buildActivity({
          assessmentId: assessment.id,
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
        await getNextChallengeForPix1d({
          assessmentId: assessment.id,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
        });

        // then
        const updatedActivities = await knex('activities').where({ id: activity.id });

        expect(updatedActivities[0].status).to.equal(Activity.status.SUCCEEDED);
      });
    });

    context('when the user finished the mission', function () {
      it('should complete the assessment', async function () {
        assessment = databaseBuilder.factory.buildPix1dAssessment({ missionId });

        const activityDefi = databaseBuilder.factory.buildActivity({
          assessmentId: assessment.id,
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
        await getNextChallengeForPix1d({
          assessmentId: assessment.id,
          activityRepository,
          assessmentRepository,
          challengeRepository,
          activityAnswerRepository,
        });

        // then
        const updatedAssessment = await knex('assessments').where({ id: assessment.id }).first();

        expect(updatedAssessment.state).to.equal(Assessment.states.COMPLETED);
      });
    });
  });
  function _buildChallenge({ id, skillId, status = 'validé', alternativeVersion }) {
    return {
      id,
      attachments: ['URL pièce jointe'],
      format: 'petit',
      illustrationUrl: "Une URL vers l'illustration",
      illustrationAlt: "Le texte de l'illustration",
      instruction: 'Des instructions',
      alternativeInstruction: 'Des instructions alternatives',
      proposals: 'Une proposition',
      status,
      timer: '',
      focusable: true,
      type: Challenge.Type.QCM,
      locales: ['fr'],
      autoReply: false,
      discriminant: 1,
      difficulty: 0,
      answer: undefined,
      responsive: 'Smartphone/Tablette',
      competenceId: 'recCOMP1',
      skillId,
      alpha: 1,
      delta: 0,
      shuffled: false,
      alternativeVersion: alternativeVersion || 1,
    };
  }
});
