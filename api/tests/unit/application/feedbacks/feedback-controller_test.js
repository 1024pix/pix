const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const { cloneDeep } = require('lodash');

const Feedback = require('../../../../lib/infrastructure/data/feedback');

const moduleUnderTest = require('../../../../lib/application/feedbacks');

describe('Unit | Controller | feedback-controller', function() {

  let httpTestServer;

  beforeEach(async function() {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('#save', function() {

    const method = 'POST';
    const url = '/api/feedbacks';

    const jsonFeedback = {
      data: {
        type: 'feedbacks',
        attributes: {
          content: 'Lorem ipsum dolor sit amet consectetur adipiscet.',
        },
        relationships: {
          assessment: {
            data: {
              type: 'assessments',
              id: 'assessment_id',
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
    };

    const persistedFeedback = new Feedback({
      id: 'feedback_id',
      content: 'Lorem ipsum dolor sit amet consectetur adipiscet.',
    });

    beforeEach(function() {
      sinon.stub(Feedback.prototype, 'save').resolves(persistedFeedback);
    });

    it('should return a successful response with HTTP code 201 when feedback was saved', async function() {
      // given
      const payload = jsonFeedback;

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should persist feedback data into the Feedback Repository', async function() {
      // given
      const payload = cloneDeep(jsonFeedback);

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(Feedback.prototype.save).to.have.been.calledOnce;
    });
  });
});
