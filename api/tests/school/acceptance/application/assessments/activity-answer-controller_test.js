import { createServer } from '../../../../../server.js';
import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Acceptance | Controller | activity-answer-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /activity-answers', function () {
    context('when not isPreview', function () {
      it('should return a 201 HTTP status code', async function () {
        // given
        const challengeId = 'va_challenge_id';
        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment({
          lastChallengeId: challengeId,
        });
        databaseBuilder.factory.buildActivity({ assessmentId, stepIndex: 0, level: Activity.levels.VALIDATION });
        await databaseBuilder.commit();

        await mockLearningContentForMission(missionId);

        const payload = {
          data: {
            attributes: {
              value: '',
              result: null,
              'result-details': null,
            },
            relationships: {
              challenge: {
                data: {
                  id: challengeId,
                },
              },
            },
          },
          meta: {
            assessmentId: `${assessmentId}`,
          },
        };
        const options = {
          method: 'POST',
          url: `/api/pix1d/activity-answers`,
          payload,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('when isPreview', function () {
      it('should return a 200 HTTP status code and an activity answer', async function () {
        // given
        const challenge = learningContentBuilder.buildChallenge();
        const skill = learningContentBuilder.buildSkill({ id: challenge.skillId });

        const learningContent = {
          challenges: [challenge],
          skills: [skill],
        };

        databaseBuilder.factory.learningContent.build(learningContent);
        await databaseBuilder.commit();

        const payload = {
          data: {
            attributes: {
              value: '',
              result: null,
              'result-details': null,
            },
            relationships: {
              challenge: {
                data: {
                  id: challenge.id,
                },
              },
            },
          },
          meta: {
            isPreview: true,
          },
        };
        const options = {
          method: 'POST',
          url: `/api/pix1d/activity-answers`,
          payload,
        };

        const expectedBody = {
          attributes: {
            result: 'ko',
            'result-details': null,
            value: '',
          },
          relationships: {
            challenge: {
              data: {
                id: 'recCHAL1',
                type: 'challenge',
              },
            },
          },
          id: 'preview-id',
          type: 'activity-answer',
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal(expectedBody);
      });
    });
  });
});

async function mockLearningContentForMission(missionId) {
  databaseBuilder.factory.learningContent.build({
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
    missions: [
      learningContentBuilder.buildMission({
        id: missionId,
        content: {
          steps: [
            {
              validationChallenges: [['va_challenge_id']],
            },
          ],
        },
      }),
    ],
  });
  await databaseBuilder.commit();
}
