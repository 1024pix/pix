const { describe, it, before, after, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const _ = require('lodash');
const Feedback = require('../../../../lib/infrastructure/data/feedback');
const feedbackController = require('../../../../lib/application/feedbacks/feedback-controller');
const feedbackRepository = require('../../../../lib/infrastructure/repositories/feedback-repository');
const feedbackSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/feedback-serializer');

describe('Unit | Controller | feedback-controller', function() {

  let server;

  before(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/feedbacks') });
  });

  describe('#save', function() {

    const jsonFeedback = {
      data: {
        type: 'feedbacks',
        attributes: {
          email: 'shi@fu.me',
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
      email: 'shi@fu.me',
      content: 'Lorem ipsum dolor sit amet consectetur adipiscet.'
    });

    before(function() {
      sinon.stub(Feedback.prototype, 'save').resolves(persistedFeedback);
    });

    after(function() {
      Feedback.prototype.save.restore();
    });

    function executeRequest(payload, callback) {
      server.inject({ method: 'POST', url: '/api/feedbacks', payload }, (res) => {
        callback(res);
      });
    }

    it('should return a successful response with HTTP code 201 when feedback was saved', function(done) {
      // when
      executeRequest(jsonFeedback, (res) => {
        // then
        expect(res.statusCode).to.equal(201);
        done();
      });
    });

    it('should return an error 400 if feedback content is missing or empty', function(done) {
      // given
      const payload = _.clone(jsonFeedback);
      payload.data.attributes.content = '   ';

      // when
      executeRequest(payload, (res) => {
        // then
        expect(res.statusCode).to.equal(400);
        done();
      });
    });

    it('should persist feedback data into the Feedback Repository', function(done) {
      // given
      const payload = _.clone(jsonFeedback);

      // when
      executeRequest(payload, () => {
        // then
        expect(Feedback.prototype.save.calledOnce).to.be.true;
        done();
      });
    });

  });

  describe('#find', () => {

    let sandbox;
    let reply;

    beforeEach(() => {
      reply = sinon.stub().returns(true);
      sandbox = sinon.sandbox.create();
      sandbox.stub(feedbackRepository, 'find');
      sandbox.stub(feedbackSerializer, 'serialize');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should fetch all the feedbacks from the DB when no query params are passed', function() {
      // given
      feedbackRepository.find.resolves(Feedback.collection());
      const request = { query: {} };

      // when
      const promise = feedbackController.find(request, reply);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(feedbackRepository.find);
        sinon.assert.calledWithExactly(feedbackRepository.find, { startDate: undefined, endDate: undefined });
      });
    });

    it('should fetch only the matching feedbacks from the DB when query params "start_date" and "end_date" params are passed', () => {
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
      const promise = feedbackController.find(request, reply);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(feedbackRepository.find);
        sinon.assert.calledWithExactly(feedbackRepository.find, { startDate, endDate });
      });
    });

    it('should reply with a serialized array of feedbacks', function() {
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
      const serializedFeedback = 'The Dragon and The Wolf';
      feedbackSerializer.serialize.returns(serializedFeedback);
      const request = { query: {} };

      // when
      const promise = feedbackController.find(request, reply);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(reply);
        sinon.assert.calledWith(reply, serializedFeedback);
        sinon.assert.calledOnce(feedbackSerializer.serialize);
        sinon.assert.calledWithExactly(feedbackSerializer.serialize, persistedFeedbacks.toJSON());
      });

    });

  });
});
