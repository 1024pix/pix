import { Challenge } from '../../../../../lib/domain/models/index.js';
import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { getNextChallenge } from '../../../../../src/school/domain/usecases/get-next-challenge.js';
import * as activityAnswerRepository from '../../../../../src/school/infrastructure/repositories/activity-answer-repository.js';
import * as activityRepository from '../../../../../src/school/infrastructure/repositories/activity-repository.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import * as missionRepository from '../../../../../src/school/infrastructure/repositories/mission-repository.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as challengeRepository from '../../../../../src/shared/infrastructure/repositories/challenge-repository.js';
import { databaseBuilder, expect, knex, mockLearningContent } from '../../../../test-helper.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Integration | Usecase | get-next-challenge', function () {
  describe('#getNextChallenge', function () {
    context('when last activity is succeeded', function () {
      it('should return null', async function () {
        const { assessmentId } = databaseBuilder.factory.buildMissionAssessment({ state: Assessment.states.COMPLETED });
        databaseBuilder.factory.buildActivity({ assessmentId, status: Activity.status.SUCCEEDED });

        await databaseBuilder.commit();

        const challenge = await getNextChallenge({
          assessmentId,
          activityRepository,
          activityAnswerRepository,
          challengeRepository,
          assessmentRepository,
          missionAssessmentRepository,
          missionRepository,
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

        await databaseBuilder.commit();

        mockLearningContent({
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

        const challenge = await getNextChallenge({
          assessmentId,
          activityRepository,
          activityAnswerRepository,
          challengeRepository,
          assessmentRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        const updatedAssessment = await knex('assessments').where({ id: assessmentId }).first();
        expect(challenge.id).to.equal('second_va_challenge_on_step_2_id');
        expect(challenge).to.be.instanceOf(Challenge);
        expect(updatedAssessment.lastChallengeId).to.equal('second_va_challenge_on_step_2_id');
      });
    });
  });
});
