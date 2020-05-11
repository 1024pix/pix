const { expect, knex, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../test-helper');
const createServer = require('../../../server');
const Feedback = require('../../../lib/infrastructure/data/feedback');

describe('Acceptance | Controller | feedback-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/feedbacks', () => {

    let options;

    beforeEach(async () => {
      const assessmentId = databaseBuilder.factory.buildAssessment({ userId: null, courseId: 'rec' }).id;
      await databaseBuilder.commit();
      options = {
        method: 'POST',
        url: '/api/feedbacks',
        payload: {
          data: {
            type: 'feedbacks',
            attributes: {
              content: 'Some content'
            },
            relationships: {
              assessment: {
                data: {
                  type: 'assessment',
                  id: assessmentId
                }
              },
              challenge: {
                data: {
                  type: 'challenge',
                  id: 'challenge_id'
                }
              }
            }
          }
        },
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
    });

    afterEach(() => {
      return knex('feedbacks').delete();
    });

    it('should return 201 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
      });
    });

    it('should return 201 HTTP status code when missing authorization header', () => {
      // given
      options.headers = {};

      // when
      const promise = server.inject(options);

      // given
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
      });
    });

    it('should return application/json', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should add a new feedback into the database', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then(() => {
        return Feedback.count().then((afterFeedbacksNumber) => {
          expect(afterFeedbacksNumber).to.equal(1);
        });
      });
    });

    it('should return persisted feedback', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const feedback = response.result.data;
        return new Feedback()
          .fetch()
          .then((model) => {
            expect(model.id).to.be.a('number');
            expect(model.get('content')).to.equal(options.payload.data.attributes.content);
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
