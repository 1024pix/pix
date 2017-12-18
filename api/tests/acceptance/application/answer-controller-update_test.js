const { describe, it, before, after, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const server = require('../../../server');
const Answer = require('../../../lib/domain/models/data/answer');

describe('Acceptance | Controller | answer-controller', function() {

  after((done) => {
    server.stop(done);
  });

  describe('PATCH /api/answers/:id', function() {

    let options;
    let insertedAnswerId;

    const insertedAnswer = {
      value: '2',
      elapsedTime: 100,
      timeout: 0,
      result: 'pending',
      resultDetails: null,
      challengeId: 'recLt9uwa2dR3IYpi',
      assessmentId: '12345'
    };
    const updatedAnswerAttributes = {
      'value': '1',
      'elapsed-time': 200,
      'timeout': 0,
      'result': 'ok',
      'result-details': null
    };

    beforeEach(() => {
      return knex('answers').delete()
        .then(() => knex('answers').insert([insertedAnswer]))
        .then((id) => {
          insertedAnswerId = id;
          options = {
            method: 'PATCH',
            url: `/api/answers/${insertedAnswerId}`,
            payload: {
              data: {
                type: 'answer',
                id: insertedAnswerId,
                attributes: updatedAnswerAttributes,
                relationships: {
                  assessment: {
                    data: {
                      type: 'assessment',
                      id: insertedAnswer.assessmentId
                    }
                  },
                  challenge: {
                    data: {
                      type: 'challenge',
                      id: insertedAnswer.challengeId
                    }
                  }
                }
              }
            }
          };
        });
    });

    afterEach(() => {
      return knex('answers').delete();
    });

    before(() => {
      nock('https://api.airtable.com')
        .get(`/v0/test-base/Epreuves/${insertedAnswer.challengeId}?`)
        .times(5)
        .reply(200, {
          'id': 'recLt9uwa2dR3IYpi',
          'fields': {
            'Type d\'épreuve': 'QCU',
            'Bonnes réponses': '1'
            //other fields not represented
          }
        });
    });

    it('should return 200 HTTP status code', (done) => {
      server.inject(options, (response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', (done) => {
      server.inject(options, (response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should not create a new answer into the database', (done) => {
      server.inject(options, () => {
        Answer.count().then((afterAnswersNumber) => {
          expect(afterAnswersNumber).to.equal(1);
          done();
        });
      });
    });

    it('should update the answer in the database', (done) => {
      // when
      server.inject(options, () => {
        new Answer()
          .fetch()
          .then(function(model) {

            // then
            expect(model.id).to.be.a('number');
            expect(model.get('value')).to.equal(options.payload.data.attributes['value']);
            expect(model.get('elapsedTime')).to.equal(options.payload.data.attributes['elapsed-time']);
            expect(model.get('timeout')).to.equal(options.payload.data.attributes['timeout']);
            expect(model.get('result')).to.equal(options.payload.data.attributes['result']);
            expect(model.get('resultDetails')).to.equal('null\n');
            expect(model.get('assessmentId').toString()).to.equal(options.payload.data.relationships.assessment.data.id);
            expect(model.get('challengeId')).to.equal(options.payload.data.relationships.challenge.data.id);
            done();
          });
      });
    });

    it('should return the updated answer', (done) => {
      // when
      server.inject(options, (response) => {
        const answer = response.result.data;

        new Answer()
          .fetch()
          .then(function(model) {

            // then
            expect(answer.id).to.equal(model.id.toString());
            expect(answer.id).to.equal(response.result.data.id);
            expect(answer.attributes['value']).to.equal(model.get('value'));
            expect(answer.attributes['elapsed-time']).to.equal(model.get('elapsedTime'));
            expect(answer.attributes['timeout']).to.equal(model.get('timeout'));
            expect(answer.attributes['result']).to.equal(model.get('result'));
            expect(answer.relationships.assessment.data.id).to.equal(model.get('assessmentId').toString());
            expect(answer.relationships.challenge.data.id).to.equal(model.get('challengeId'));

            done();
          });
      });
    });

  });

});
