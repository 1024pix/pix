const { expect, knex, nock } = require('../../../test-helper');
const createServer = require('../../../../server');
const Answer = require('../../../../lib/infrastructure/data/answer');

describe('Acceptance | Controller | answer-controller', () => {

  describe('PATCH /api/answers/:id', () => {

    let server;
    let options;
    let insertedAnswerId;
    let inserted_assessment_id;

    const inserted_assessment = {
      type: 'PLACEMENT',
      userId: null,
      courseId: 'rec',
    };
    const insertedAnswer = {
      value: '2',
      elapsedTime: 100,
      timeout: 0,
      result: 'ok',
      resultDetails: null,
      challengeId: 'recLt9uwa2dR3IYpi',
    };
    const updatedAnswerAttributes = {
      'value': '1',
      'elapsed-time': 200,
      'timeout': 0,
      'result': 'ok',
      'result-details': null
    };

    before(() => {
      nock('https://api.airtable.com')
        .get(`/v0/test-base/Epreuves/${insertedAnswer.challengeId}`)
        .query(true)
        .times(5)
        .reply(200, {
          'id': 'recLt9uwa2dR3IYpi',
          'fields': {
            'Type d\'épreuve': 'QCU',
            'Bonnes réponses': '1'
            //other fields not represented
          }
        });

      return knex('assessments').insert(inserted_assessment,'id')
        .then(([id]) => inserted_assessment_id = id);
    });

    beforeEach(async () => {
      server = await createServer();
      insertedAnswer.assessmentId = inserted_assessment_id;
      return knex('answers').insert([insertedAnswer])
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
            },
          };
        });
    });

    after(() => {
      nock.cleanAll();
      return knex('assessments').delete();
    });

    afterEach(() => {
      return knex('answers').delete();
    });

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
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

    it('should not create a new answer into the database', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then(() => {
        return Answer.count().then((afterAnswersNumber) => {
          expect(afterAnswersNumber).to.equal(1);
        });
      });
    });

    it('should update the answer in the database', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then(() => {
        new Answer()
          .fetch()
          .then((model) => {
            expect(model.id).to.be.a('number');
            expect(model.get('value')).to.equal(options.payload.data.attributes['value']);
            expect(model.get('elapsedTime')).to.equal(options.payload.data.attributes['elapsed-time']);
            expect(model.get('timeout')).to.equal(options.payload.data.attributes['timeout']);
            expect(model.get('result')).to.equal(options.payload.data.attributes['result']);
            expect(model.get('resultDetails')).to.equal('null\n');
            expect(model.get('assessmentId')).to.equal(options.payload.data.relationships.assessment.data.id);
            expect(model.get('challengeId')).to.equal(options.payload.data.relationships.challenge.data.id);
          });
      });
    });

    it('should return the updated answer', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const answer = response.result.data;

        new Answer()
          .fetch()
          .then((model) => {
            expect(answer.id).to.equal(model.id);
            expect(answer.id).to.equal(response.result.data.id);
            expect(answer.attributes['value']).to.equal(model.get('value'));
            expect(answer.attributes['elapsed-time']).to.equal(model.get('elapsedTime'));
            expect(answer.attributes['timeout']).to.equal(model.get('timeout'));
            expect(answer.attributes['result']).to.equal(model.get('result'));
            expect(answer.relationships.assessment.data.id).to.equal(model.get('assessmentId').toString());
            expect(answer.relationships.challenge.data.id).to.equal(model.get('challengeId'));
          });
      });
    });

  });

});
