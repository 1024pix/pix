const { describe, it, before, after, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const _ = require('lodash');
const Feedback = require('../../../../lib/domain/models/data/feedback');

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
      Feedback.prototype.save = sinon.stub();
      Feedback.prototype.save.resolves(persistedFeedback);
    });

    after(function() {
      sinon.restore(Feedback.prototype.save);
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

})
;
