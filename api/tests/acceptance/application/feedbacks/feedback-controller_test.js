import { expect, knex, databaseBuilder } from '../../../test-helper';
import createServer from '../../../../server';
import Feedback from '../../../../lib/infrastructure/orm-models/Feedback';

describe('Acceptance | Controller | feedback-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/feedbacks', function () {
    let options;

    beforeEach(async function () {
      const assessmentId = databaseBuilder.factory.buildAssessment({ userId: null, courseId: 'rec' }).id;
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

    it('should return application/json', function () {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should add a new feedback into the database', function () {
      // when
      const promise = server.inject(options);

      // then
      return promise.then(() => {
        return Feedback.count().then((afterFeedbacksNumber) => {
          expect(afterFeedbacksNumber).to.equal(1);
        });
      });
    });

    it('should return persisted feedback', function () {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const feedback = response.result.data;
        return new Feedback().fetch().then((model) => {
          expect(model.id).to.be.a('number');
          expect(model.get('content')).to.equal(options.payload.data.attributes.content);
          expect(model.get('userAgent')).to.equal(
            'Mozilla/5.0 (Linux; Android 10; MGA-AL00 Build/HUAWEIMGA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4343 MMWEBSDK/20221011 Mobile Safari/537.36 MMWEBID/7309 MicroMessenger/8.0.30.2260(0x28001E3B) WeChat/arm64 Wei'
          );
          expect(model.get('assessmentId')).to.equal(options.payload.data.relationships.assessment.data.id);
          expect(model.get('challengeId')).to.equal(options.payload.data.relationships.challenge.data.id);

          expect(feedback.id).to.equal(model.id.toString());
          expect(feedback.id).to.equal(response.result.data.id);
          expect(feedback.attributes.content).to.equal(model.get('content'));
          expect(feedback.relationships.assessment.data.id).to.equal(model.get('assessmentId').toString());
          expect(feedback.relationships.challenge.data.id).to.equal(model.get('challengeId'));
        });
      });
    });
  });
});
