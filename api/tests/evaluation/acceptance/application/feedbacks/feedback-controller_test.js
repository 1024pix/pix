import lodash from 'lodash';
import { expect, knex, databaseBuilder } from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

const { cloneDeep } = lodash;

describe('Acceptance | Controller | feedback-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/feedbacks', function () {
    let options;

    beforeEach(async function () {
      const assessmentId = databaseBuilder.factory.buildAssessment({ userId: null, courseId: 'rec', id: 1 }).id;
      await databaseBuilder.commit();
      options = {
        method: 'POST',
        url: '/api/feedbacks',
        payload: {
          data: {
            type: 'feedbacks',
            attributes: {
              content: 'Some content',
            },
            relationships: {
              assessment: {
                data: {
                  type: 'assessments',
                  id: assessmentId,
                },
              },
              challenge: {
                data: {
                  type: 'challenges',
                  id: 'challenge_id',
                },
              },
            },
          },
        },
        headers: {
          'user-agent':
            'Mozilla/5.0 (Linux; Android 10; MGA-AL00 Build/HUAWEIMGA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4343 MMWEBSDK/20221011 Mobile Safari/537.36 MMWEBID/7309 MicroMessenger/8.0.30.2260(0x28001E3B) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64',
        },
      };
    });

    afterEach(function () {
      return knex('feedbacks').delete();
    });

    it('should return 201 HTTP status code', function () {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
      });
    });

    it('should return 201 HTTP status code with empty content', function () {
      // when
      const optionsWithEmptyContent = cloneDeep(options);
      optionsWithEmptyContent.payload.data.attributes.content = '';
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
      });
    });

    it('should return application/json', function () {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should add a new feedback into the database', async function () {
      // when
      await server.inject(options);
      const { count: feedbacksCount } = await knex('feedbacks').count().first();

      // then
      expect(feedbacksCount).to.equal(1);
    });

    it('should return persisted feedback', async function () {
      // given
      const expectedFeedback = domainBuilder.buildFeedback({});
      const expectedChallengeId = '1';
      const expectedAssessmentId = '1';
      options.payload.data.attributes = expectedFeedback;
      options.payload.data.relationships.challenge.data.id = expectedChallengeId;
      options.payload.data.relationships.assessment.data.id = expectedAssessmentId;

      // when
      const response = await server.inject(options);
      const feedback = response.result.data;
      const challenge = response.result.data.relationships.challenge.data;
      const assessment = response.result.data.relationships.assessment.data;

      // then
      expect(feedback.attributes.content).to.deep.equal(expectedFeedback.content);
      expect(challenge.id).to.deep.equal(expectedChallengeId);
      expect(assessment.id).to.deep.equal(expectedAssessmentId);
    });
  });
});
