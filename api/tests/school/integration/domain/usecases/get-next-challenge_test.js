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

        const { id: activityId } = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
        });
        databaseBuilder.factory.buildActivityAnswer({ activityId, challengeId: 'first_va_challenge_id' });

        await databaseBuilder.commit();

        mockLearningContent({
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
        expect(challenge.id).to.equal('second_va_challenge_id');
        expect(challenge).to.be.instanceOf(Challenge);
        expect(updatedAssessment.lastChallengeId).to.equal('second_va_challenge_id');
      });
    });
  });
});
