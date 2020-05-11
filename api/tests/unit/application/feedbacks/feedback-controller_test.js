const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const _ = require('lodash');
const Feedback = require('../../../../lib/infrastructure/data/feedback');
const route = require('../../../../lib/application/feedbacks');

describe('Unit | Controller | feedback-controller', function() {

  let server;

  beforeEach(function() {
    server = Hapi.server();
    return server.register(route);
  });

  describe('#save', function() {

    const jsonFeedback = {
      data: {
        type: 'feedbacks',
        attributes: {
          content: 'Lorem ipsum dolor sit amet consectetur adipiscet.'
        },
        relationships: {
          assessment: {
            data: {
              type: 'assessments',
              id: 'assessment_id'
            }
          },
          challenge: {
            data: {
              type: 'challenges',
              id: 'challenge_id'
            }
          }
        }
      }
    };

    const persistedFeedback = new Feedback({
      id: 'feedback_id',
      content: 'Lorem ipsum dolor sit amet consectetur adipiscet.'
    });

    beforeEach(function() {
      sinon.stub(Feedback.prototype, 'save').resolves(persistedFeedback);
    });

    it('should return a successful response with HTTP code 201 when feedback was saved', async function() {
      // when
      const res = await server.inject({ method: 'POST', url: '/api/feedbacks', payload: jsonFeedback });

      // then
      expect(res.statusCode).to.equal(201);
    });

    it('should persist feedback data into the Feedback Repository', async function() {
      // given
      const payload = _.cloneDeep(jsonFeedback);

      // when
      await server.inject({ method: 'POST', url: '/api/feedbacks', payload });

      // then
      expect(Feedback.prototype.save).to.have.been.calledOnce;
    });

  });
});
