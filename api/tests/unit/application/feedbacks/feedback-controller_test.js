const { expect, sinon, hFake } = require('../../../test-helper');
const Hapi = require('hapi');
const _ = require('lodash');
const Feedback = require('../../../../lib/infrastructure/data/feedback');
const feedbackController = require('../../../../lib/application/feedbacks/feedback-controller');
const feedbackRepository = require('../../../../lib/infrastructure/repositories/feedback-repository');
const feedbackSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/feedback-serializer');

describe('Unit | Controller | feedback-controller', function() {

  let server;

  before(function() {
    server = Hapi.server();
    return server.register(require('../../../../lib/application/feedbacks'));
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

    before(function() {
      sinon.stub(Feedback.prototype, 'save').resolves(persistedFeedback);
    });

    after(function() {
      Feedback.prototype.save.restore();
    });

    it('should return a successful response with HTTP code 201 when feedback was saved', async function() {
      // when
      const res = await server.inject({ method: 'POST', url: '/api/feedbacks', payload: jsonFeedback });

      // then
      expect(res.statusCode).to.equal(201);
    });

    it('should return an error 400 if feedback content is missing or empty', async function() {
      // given
      const payload = _.clone(jsonFeedback);
      payload.data.attributes.content = '   ';

      // when
      const res = await server.inject({ method: 'POST', url: '/api/feedbacks', payload });

      // then
      expect(res.statusCode).to.equal(400);
    });

    it('should persist feedback data into the Feedback Repository', async function() {
      // given
      const payload = _.clone(jsonFeedback);

      // when
      await server.inject({ method: 'POST', url: '/api/feedbacks', payload });

      // then
      expect(Feedback.prototype.save).to.have.been.calledOnce;
    });

  });

  describe('#find', () => {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(feedbackRepository, 'find');
      sandbox.stub(feedbackSerializer, 'serialize');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should fetch all the feedbacks from the DB when no query params are passed', async function() {
      // given
      feedbackRepository.find.resolves(Feedback.collection());
      const request = { query: {} };

      // when
      await feedbackController.find(request, hFake);

      // then
      sinon.assert.calledOnce(feedbackRepository.find);
      sinon.assert.calledWithExactly(feedbackRepository.find, { startDate: undefined, endDate: undefined });
    });

    it('should fetch only the matching feedbacks from the DB when query params "start_date" and "end_date" params are passed', async () => {
      // given
      feedbackRepository.find.resolves(Feedback.collection());
      const startDate = '2017-09-05';
      const endDate = '2017-09-07';
      const request = {
        query: {
          start_date: startDate,
          end_date: endDate
        }
      };

      // when
      await feedbackController.find(request, hFake);

      // then
      sinon.assert.calledOnce(feedbackRepository.find);
      sinon.assert.calledWithExactly(feedbackRepository.find, { startDate, endDate });
    });

    it('should reply with a serialized array of feedbacks', async function() {
      // given
      const simpleFeedback = new Feedback({
        id: 'simple_feedback',
        content: 'Simple feedback',
        createdAt: '2015-09-06 15:00:00',
        assessmentId: 1,
        challengeId: 11
      });
      const otherFeedback = new Feedback({
        id: 'other_feedback',
        content: 'Other feedback',
        createdAt: '2016-09-06 16:00:00',
        assessmentId: 1,
        challengeId: 12
      });
      const persistedFeedbacks = Feedback.collection([simpleFeedback, otherFeedback]);
      feedbackRepository.find.resolves(persistedFeedbacks);
      feedbackSerializer.serialize.returns({ serialized: persistedFeedbacks });
      const request = { query: {} };

      // when
      const response = await feedbackController.find(request, hFake);

      // then
      expect(response).to.deep.equal({ serialized: persistedFeedbacks });
    });

  });
});
