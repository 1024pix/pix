import { ChallengeToPlay } from '../../../../../src/evaluation/domain/models/ChallengeToPlay.js';
import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { usecases } from '../../../../../src/school/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Integration | School | Usecase | get-next-challenge', function () {
  describe('#getNextChallenge', function () {
    context('when last activity is succeeded', function () {
      it('should return null', async function () {
        const { assessmentId } = databaseBuilder.factory.buildMissionAssessment({ state: Assessment.states.COMPLETED });
        databaseBuilder.factory.buildActivity({ assessmentId, status: Activity.status.SUCCEEDED });

        await databaseBuilder.commit();

        const challenge = await usecases.getNextChallenge({
          assessmentId,
        });
        expect(challenge).to.be.null;
      });
    });

    context('when last activity is started', function () {
      it('should return next challenge and update assessment', async function () {
        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();

        const { id: firstStepActivityId } = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.SUCCEEDED,
          stepIndex: 0,
          createdAt: new Date('2022-09-14'),
        });
        const { id: secondStepActivityId } = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.STARTED,
          stepIndex: 1,
          createdAt: new Date('2022-09-15'),
        });
        databaseBuilder.factory.buildActivityAnswer({
          activityId: firstStepActivityId,
          challengeId: 'first_va_challenge_id',
        });
        databaseBuilder.factory.buildActivityAnswer({
          activityId: firstStepActivityId,
          challengeId: 'second_va_challenge_id',
        });
        databaseBuilder.factory.buildActivityAnswer({
          activityId: secondStepActivityId,
          challengeId: 'first_va_challenge_on_step_1_id',
        });

        databaseBuilder.factory.learningContent.build({
          challenges: [
            learningContentBuilder.buildChallenge({ id: 'second_va_challenge_on_step_2_id', skillId: 'skill_id' }),
          ],
          skills: [learningContentBuilder.buildSkill({ id: 'skill_id' })],
          missions: [
            learningContentBuilder.buildMission({
              id: missionId,
              content: {
                steps: [
                  {
                    validationChallenges: [['first_va_challenge_id'], ['second_va_challenge_id']],
                  },
                  {
                    validationChallenges: [['first_va_challenge_on_step_1_id'], ['second_va_challenge_on_step_2_id']],
                  },
                ],
              },
            }),
          ],
        });
        await databaseBuilder.commit();

        const challenge = await usecases.getNextChallenge({
          assessmentId,
        });

        const updatedAssessment = await knex('assessments').where({ id: assessmentId }).first();
        expect(challenge.id).to.equal('second_va_challenge_on_step_2_id');
        expect(challenge).to.be.instanceOf(ChallengeToPlay);
        expect(updatedAssessment.lastChallengeId).to.equal('second_va_challenge_on_step_2_id');
      });
    });

    context('when last activity is started but all challenges have been answered', function () {
      it('should return null', async function () {
        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();

        const { id: activityId } = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.STARTED,
          stepIndex: 0,
        });
        databaseBuilder.factory.buildActivityAnswer({ activityId, challengeId: 'only_va_challenge_id' });

        databaseBuilder.factory.learningContent.build({
          challenges: [],
          skills: [],
          missions: [
            learningContentBuilder.buildMission({
              id: missionId,
              content: {
                steps: [
                  {
                    validationChallenges: [['only_va_challenge_id']],
                  },
                ],
              },
            }),
          ],
        });
        await databaseBuilder.commit();

        const challenge = await usecases.getNextChallenge({ assessmentId });

        expect(challenge).to.be.null;
      });
    });

    context('when last activity is started but has answer duplicate', function () {
      it('should return next challenge and update assessment', async function () {
        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();

        const { id: firstStepActivityId } = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.STARTED,
          stepIndex: 0,
          createdAt: new Date('2022-09-14'),
        });
        databaseBuilder.factory.buildActivityAnswer({
          activityId: firstStepActivityId,
          challengeId: 'first_va_challenge_id',
        });
        // Answer duplicate
        databaseBuilder.factory.buildActivityAnswer({
          activityId: firstStepActivityId,
          challengeId: 'first_va_challenge_id',
        });

        databaseBuilder.factory.learningContent.build({
          challenges: [learningContentBuilder.buildChallenge({ id: 'second_va_challenge_id', skillId: 'skill_id' })],
          skills: [learningContentBuilder.buildSkill({ id: 'skill_id' })],
          missions: [
            learningContentBuilder.buildMission({
              id: missionId,
              content: {
                steps: [
                  {
                    validationChallenges: [['first_va_challenge_id'], ['second_va_challenge_id']],
                  },
                ],
              },
            }),
          ],
        });
        await databaseBuilder.commit();

        const challenge = await usecases.getNextChallenge({
          assessmentId,
        });

        const updatedAssessment = await knex('assessments').where({ id: assessmentId }).first();
        expect(challenge.id).to.equal('second_va_challenge_id');
        expect(challenge).to.be.instanceOf(ChallengeToPlay);
        expect(updatedAssessment.lastChallengeId).to.equal('second_va_challenge_id');
      });
    });
  });
});
