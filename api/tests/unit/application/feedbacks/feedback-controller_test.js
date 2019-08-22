
const { expect, sinon, hFake } = require('../../../test-helper');
const Hapi = require('hapi');
const _ = require('lodash');
const Feedback = require('../../../../lib/infrastructure/data/feedback');
const feedbackController = require('../../../../lib/application/feedbacks/feedback-controller');
const feedbackRepository = require('../../../../lib/infrastructure/repositories/feedback-repository');
const feedbackSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/feedback-serializer');
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

  describe('#find', () => {

    beforeEach(() => {
      sinon.stub(feedbackRepository, 'find');
      sinon.stub(feedbackSerializer, 'serialize');
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
        createdAt: new Date('2015-09-06T15:00:00Z'),
        assessmentId: 1,
        challengeId: 11
      });
      const otherFeedback = new Feedback({
        id: 'other_feedback',
        content: 'Other feedback',
        createdAt: new Date('2016-09-06T16:00:00Z'),
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
