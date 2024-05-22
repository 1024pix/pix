import { Examiner, Validation, ValidatorAlwaysOK } from '../../../../../lib/domain/models/index.js';
import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { handleActivityAnswer } from '../../../../../src/school/domain/usecases/handle-activity-answer.js';
import * as activityAnswerRepository from '../../../../../src/school/infrastructure/repositories/activity-answer-repository.js';
import * as activityRepository from '../../../../../src/school/infrastructure/repositories/activity-repository.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import * as missionRepository from '../../../../../src/school/infrastructure/repositories/mission-repository.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as challengeRepository from '../../../../../src/shared/infrastructure/repositories/challenge-repository.js';
import {
  catchErr,
  databaseBuilder,
  domainBuilder,
  expect,
  knex,
  mockLearningContent,
} from '../../../../test-helper.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Integration | UseCase | handle activity answer', function () {
  const alwaysTrueExaminer = new Examiner({ validator: new ValidatorAlwaysOK() });
  const alwaysFalseExaminer = new Examiner({
    validator: {
      assess: () =>
        new Validation({
          result: AnswerStatus.KO,
          resultDetails: null,
        }),
    },
  });
  context('when last answer is ko', function () {
    context('and mission is not finished', function () {
      it('last activity is started with accurate level in started assessment', async function () {
        const activityAnswer = domainBuilder.buildAnswer.uncorrected({
          id: null,
          challengeId: 'va_challenge_id',
        });

        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment({
          lastChallengeId: activityAnswer.challengeId,
        });
        databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.STARTED,
          createdAt: new Date(),
          stepIndex: 0,
        });
        await databaseBuilder.commit();

        mockLearningContentForMission(missionId);

        await handleActivityAnswer({
          activityAnswer,
          assessmentId,
          examiner: alwaysFalseExaminer,
          challengeRepository,
          assessmentRepository,
          activityRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        await expectStatesAndLevel({
          assessmentId,
          activityLevel: Activity.levels.TRAINING,
          activityStatus: Activity.status.STARTED,
          assessmentState: Assessment.states.STARTED,
        });
      });
    });
    context('and mission is finished', function () {
      it('last activity keeps its level and its status is failed in completed assessment', async function () {
        const activityAnswer = domainBuilder.buildAnswer.uncorrected({
          id: null,
          challengeId: 'de_challenge_id',
        });

        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment({
          lastChallengeId: activityAnswer.challengeId,
        });
        databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.CHALLENGE,
          status: Activity.status.STARTED,
          stepIndex: 0,
          createdAt: new Date(),
        });
        await databaseBuilder.commit();

        mockLearningContentForMission(missionId);

        await handleActivityAnswer({
          activityAnswer,
          assessmentId,
          examiner: alwaysFalseExaminer,
          challengeRepository,
          assessmentRepository,
          activityRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        await expectStatesAndLevel({
          assessmentId,
          activityLevel: Activity.levels.CHALLENGE,
          activityStatus: Activity.status.FAILED,
          assessmentState: Assessment.states.COMPLETED,
        });
      });
    });
  });
  context('when last answer is ok', function () {
    context('when activity is not finished', function () {
      it('last activity keeps its level and status in started assessment', async function () {
        const activityAnswer = domainBuilder.buildAnswer.uncorrected({
          id: null,
          challengeId: 'va_challenge_id',
        });
        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment({
          lastChallengeId: activityAnswer.challengeId,
        });
        databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.STARTED,
          stepIndex: 0,
        });

        await databaseBuilder.commit();

        mockLearningContentForMission(missionId);

        await handleActivityAnswer({
          activityAnswer,
          assessmentId,
          examiner: alwaysTrueExaminer,
          challengeRepository,
          assessmentRepository,
          activityRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        await expectStatesAndLevel({
          assessmentId,
          activityLevel: Activity.levels.VALIDATION,
          activityStatus: Activity.status.STARTED,
          assessmentState: Assessment.states.STARTED,
        });
      });
    });
    context('when activity is finished', function () {
      context('and mission is not finished', function () {
        it('last activity is started with accurate level in started assessment', async function () {
          const activityAnswer = domainBuilder.buildAnswer.uncorrected({
            id: null,
            challengeId: 'va_next_challenge_id',
          });
          const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment({
            lastChallengeId: activityAnswer.challengeId,
          });
          const activity = databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.VALIDATION,
            status: Activity.status.STARTED,
            stepIndex: 0,
            createdAt: new Date(),
          });
          databaseBuilder.factory.buildActivityAnswer({
            challengeId: 'va_challenge_id',
            activityId: activity.id,
          });

          await databaseBuilder.commit();

          mockLearningContentForMission(missionId);

          await handleActivityAnswer({
            activityAnswer,
            assessmentId,
            examiner: alwaysTrueExaminer,
            challengeRepository,
            assessmentRepository,
            activityRepository,
            activityAnswerRepository,
            missionAssessmentRepository,
            missionRepository,
          });

          await expectStatesAndLevel({
            assessmentId,
            activityLevel: Activity.levels.CHALLENGE,
            activityStatus: Activity.status.STARTED,
            assessmentState: Assessment.states.STARTED,
          });
        });
      });
      context('and mission is finished', function () {
        it('last activity keeps its level and its status is succeeded in completed assessment', async function () {
          const activityAnswer = domainBuilder.buildAnswer.uncorrected({
            id: null,
            challengeId: 'de_challenge_id',
          });

          const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment({
            lastChallengeId: activityAnswer.challengeId,
          });
          databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.CHALLENGE,
            status: Activity.status.STARTED,
            stepIndex: 0,
            createdAt: new Date(),
          });
          await databaseBuilder.commit();

          mockLearningContentForMission(missionId);

          await handleActivityAnswer({
            activityAnswer,
            assessmentId,
            examiner: alwaysTrueExaminer,
            challengeRepository,
            assessmentRepository,
            activityRepository,
            activityAnswerRepository,
            missionAssessmentRepository,
            missionRepository,
          });

          await expectStatesAndLevel({
            assessmentId,
            activityLevel: Activity.levels.CHALLENGE,
            activityStatus: Activity.status.SUCCEEDED,
            assessmentState: Assessment.states.COMPLETED,
          });
        });
      });
    });
  });
  context('when challenge has been skipped', function () {
    context('and mission is not finished', function () {
      it('last activity is started with accurate level in started assessment', async function () {
        const activityAnswer = domainBuilder.buildAnswer.uncorrected({
          value: '#ABAND#',
          challengeId: 'va_challenge_id',
        });
        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment({
          lastChallengeId: activityAnswer.challengeId,
        });
        databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.STARTED,
          stepIndex: 0,
          createdAt: new Date(),
        });

        await databaseBuilder.commit();

        mockLearningContentForMission(missionId);

        await handleActivityAnswer({
          activityAnswer,
          assessmentId,
          examiner: new Examiner(),
          challengeRepository,
          assessmentRepository,
          activityRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        await expectStatesAndLevel({
          assessmentId,
          activityLevel: Activity.levels.TRAINING,
          activityStatus: Activity.status.STARTED,
          assessmentState: Assessment.states.STARTED,
        });
      });
    });
    context('and mission is finished', function () {
      it('last activity keeps its level and its status is skipped in completed assessment', async function () {
        const activityAnswer = domainBuilder.buildAnswer.uncorrected({
          value: '#ABAND#',
          challengeId: 'de_challenge_id',
        });

        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment({
          lastChallengeId: activityAnswer.challengeId,
        });
        databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.CHALLENGE,
          status: Activity.status.STARTED,
          stepIndex: 0,
          createdAt: new Date(),
        });
        await databaseBuilder.commit();

        mockLearningContentForMission(missionId);

        await handleActivityAnswer({
          activityAnswer,
          assessmentId,
          examiner: new Examiner(),
          challengeRepository,
          assessmentRepository,
          activityRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        await expectStatesAndLevel({
          assessmentId,
          activityLevel: Activity.levels.CHALLENGE,
          activityStatus: Activity.status.SKIPPED,
          assessmentState: Assessment.states.COMPLETED,
        });
      });
    });
  });
  context('when challenge belongs to unfinished tutorial and whatever answer it is', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { name: 'correct answer', examiner: alwaysTrueExaminer },
      {
        name: 'wrong answer',
        examiner: alwaysFalseExaminer,
      },
    ].forEach(({ name, examiner }) =>
      it(`last activity is still the started tutorial with ${name}`, async function () {
        const activityAnswer = domainBuilder.buildAnswer.uncorrected({
          id: null,
          challengeId: 'va_challenge_id',
        });
        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment({
          lastChallengeId: activityAnswer.challengeId,
        });
        databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.TUTORIAL,
          status: Activity.status.STARTED,
          stepIndex: 0,
        });

        await databaseBuilder.commit();

        mockLearningContentForMission(missionId);

        await handleActivityAnswer({
          activityAnswer,
          assessmentId,
          examiner,
          challengeRepository,
          assessmentRepository,
          activityRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        await expectStatesAndLevel({
          assessmentId,
          activityLevel: Activity.levels.TUTORIAL,
          activityStatus: Activity.status.STARTED,
          assessmentState: Assessment.states.STARTED,
        });
      }),
    );
  });

  it('does not record activity answer when error occurs on update mission status', async function () {
    const initialActivityAnswerIds = await knex('activity-answers').select('id');

    const activityAnswer = domainBuilder.buildAnswer.uncorrected({
      id: null,
      challengeId: 'va_challenge_id',
    });
    const { assessmentId } = databaseBuilder.factory.buildMissionAssessment({
      lastChallengeId: activityAnswer.challengeId,
    });
    databaseBuilder.factory.buildActivity({
      assessmentId,
      level: Activity.levels.VALIDATION,
      status: Activity.status.STARTED,
      stepIndex: 0,
    });

    await databaseBuilder.commit();
    mockLearningContent({
      skills: [
        learningContentBuilder.buildSkill({
          id: 'skill_id',
        }),
      ],
      challenges: [
        learningContentBuilder.buildChallenge({
          id: 'va_challenge_id',
          skillId: 'skill_id',
        }),
      ],
    });

    await catchErr(handleActivityAnswer)({
      activityAnswer,
      assessmentId,
      examiner: alwaysTrueExaminer,
      challengeRepository,
      assessmentRepository,
      activityRepository,
      activityAnswerRepository,
      missionAssessmentRepository,
      missionRepository,
    });
    const currentActivityAnswerIds = await knex('activity-answers').select('id');
    expect(currentActivityAnswerIds).to.deep.equal(initialActivityAnswerIds);
  });
});

async function expectStatesAndLevel({ assessmentId, activityLevel, activityStatus, assessmentState }) {
  const currentActivity = await knex('activities').where({ assessmentId }).orderBy('createdAt', 'DESC').first();
  const currentAssessment = await knex('assessments').where({ id: assessmentId }).first();

  expect(currentActivity.level).to.equal(activityLevel);
  expect(currentActivity.status).to.equal(activityStatus);
  expect(currentAssessment.state).to.equal(assessmentState);
}

function mockLearningContentForMission(missionId) {
  mockLearningContent({
    skills: [
      learningContentBuilder.buildSkill({
        id: 'skill_id',
      }),
    ],
    challenges: [
      learningContentBuilder.buildChallenge({
        id: 'di_challenge_id',
        skillId: 'skill_id',
      }),
      learningContentBuilder.buildChallenge({
        id: 'di_next_challenge_id',
        skillId: 'skill_id',
      }),
      learningContentBuilder.buildChallenge({
        id: 'va_challenge_id',
        skillId: 'skill_id',
      }),
      learningContentBuilder.buildChallenge({
        id: 'va_next_challenge_id',
        skillId: 'skill_id',
      }),
      learningContentBuilder.buildChallenge({
        id: 'de_challenge_id',
        skillId: 'skill_id',
      }),
    ],
    missions: [
      learningContentBuilder.buildMission({
        id: missionId,
        content: {
          steps: [
            {
              tutorialChallenges: [['di_challenge_id'], ['di_next_challenge_id']],
              validationChallenges: [['va_challenge_id'], ['va_next_challenge_id']],
            },
          ],
          dareChallenges: [['de_challenge_id']],
        },
      }),
    ],
  });
}
