import { Assessment } from '../../../../../lib/domain/models/index.js';
import { createServer, databaseBuilder, expect, mockLearningContent } from '../../../../test-helper.js';
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
        const challenge = learningContentBuilder.buildChallenge();
        const skill = learningContentBuilder.buildSkill({ id: challenge.skillId });

        const learningContent = {
          challenges: [challenge],
          skills: [skill],
        };

        mockLearningContent(learningContent);

        const assessment = databaseBuilder.factory.buildAssessment({
          state: Assessment.states.STARTED,
          lastChallengeId: challenge.id,
        });

        databaseBuilder.factory.buildActivity({ assessmentId: assessment.id });
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
            assessmentId: `${assessment.id}`,
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

        mockLearningContent(learningContent);

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
                type: 'challenges',
              },
            },
          },
          id: 'preview-id',
          type: 'activity-answers',
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
