const { expect, knex } = require('../../test-helper');
const server = require('../../../server');
const Feedback = require('../../../lib/infrastructure/data/feedback');

describe('Acceptance | Controller | feedback-controller', function() {

  after(function(done) {
    server.stop(done);
  });

  describe('POST /api/feedbacks', function() {

    beforeEach((done) => {
      knex('feedbacks').delete().then(() => done());
    });

    afterEach((done) => {
      knex('feedbacks').delete().then(() => done());
    });

    const options = {
      method: 'POST', url: '/api/feedbacks', payload: {
        data: {
          type: 'feedbacks',
          attributes: {
            email: 'shi@fu.me',
            content: 'Some content'
          },
          relationships: {
            assessment: {
              data: {
                type: 'assessment',
                id: 'assessment_id'
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
      }
    };

    it('should return 201 HTTP status code', function(done) {
      server.inject(options, (response) => {
        expect(response.statusCode).to.equal(201);
        done();
      });
    });

    it('should return application/json', function(done) {
      server.inject(options, (response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should add a new feedback into the database', function(done) {
      server.inject(options, () => {
        Feedback.count().then((afterFeedbacksNumber) => {
          expect(afterFeedbacksNumber).to.equal(1);
          done();
        });
      });
    });

    it('should return persisted feedback', function(done) {
      // when
      server.inject(options, (response) => {
        const feedback = response.result.data;

        // then
        new Feedback()
          .fetch()
          .then(function(model) {
            expect(model.id).to.be.a('number');
            expect(model.get('email')).to.equal(options.payload.data.attributes.email);
            expect(model.get('content')).to.equal(options.payload.data.attributes.content);
            expect(model.get('assessmentId')).to.equal(options.payload.data.relationships.assessment.data.id);
            expect(model.get('challengeId')).to.equal(options.payload.data.relationships.challenge.data.id);

            expect(feedback.id).to.equal(model.id.toString());
            expect(feedback.id).to.equal(response.result.data.id);
            expect(feedback.attributes.content).to.equal(model.get('content'));
            expect(feedback.relationships.assessment.data.id).to.equal(model.get('assessmentId'));
            expect(feedback.relationships.challenge.data.id).to.equal(model.get('challengeId'));

            done();
          });
      });
    });

  });

});
