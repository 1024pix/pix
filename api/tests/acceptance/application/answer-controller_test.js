const { expect, knex, nock, databaseBuilder } = require('../../test-helper');
const server = require('../../../server');
const BookshelfAnswer = require('../../../lib/infrastructure/data/answer');
const Assessment = require('../../../lib/domain/models/Assessment');

describe('Acceptance | Controller | answer-controller-save', () => {

  describe('POST /api/answers', () => {

    let insertedAssessmentId;

    beforeEach(() => {
      insertedAssessmentId = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
      }).id;

      return databaseBuilder.commit();
    });

    afterEach(() => {
      nock.cleanAll();

      return knex('answers').delete()
        .then(() => databaseBuilder.clean());
    });

    describe('when the save succeeds', () => {

      let options;
      let promise;
      const challengeId = 'a_challenge_id';

      beforeEach(() => {
        // given
        nock('https://api.airtable.com')
          .get(`/v0/test-base/Epreuves/${challengeId}`)
          .query(true)
          .reply(200, {
            'id': challengeId,
            'fields': {
              'Type d\'épreuve': 'QCU',
              'Bonnes réponses': '1',
              //other fields not represented
            },
          });

        options = {
          method: 'POST',
          url: '/api/answers',
          payload: {
            data: {
              type: 'answers',
              attributes: {
                value: '1',
                'elapsed-time': 100,
              },
              relationships: {
                assessment: {
                  data: {
                    type: 'assessments',
                    id: insertedAssessmentId,
                  },
                },
                challenge: {
                  data: {
                    type: 'challenges',
                    id: challengeId,
                  },
                },
              },
            },
          },
        };

        // when
        promise = server.inject(options);
      });

      it('should return 201 HTTP status code', () => {
        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(201);
        });
      });
      it('should return application/json', () => {
        // then
        return promise.then((response) => {
          const contentType = response.headers['content-type'];
          expect(contentType).to.contain('application/json');
        });
      });
      it('should add a new answer into the database', () => {
        // then
        return promise
          .then(() => BookshelfAnswer.count())
          .then((afterAnswersNumber) => {
            expect(afterAnswersNumber).to.equal(1);
          });
      });
      it('should return persisted answer', () => {
        // then
        return promise.then((response) => {
          const answer = response.result.data;

          new BookshelfAnswer().fetch()
            .then((model) => {
              expect(model.id).to.be.a('number');
              expect(model.get('value')).to.equal(options.payload.data.attributes.value);
              expect(model.get('result')).to.equal('ok');
              expect(model.get('resultDetails')).to.equal('null\n');
              expect(model.get('assessmentId')).to.equal(options.payload.data.relationships.assessment.data.id);
              expect(model.get('challengeId')).to.equal(options.payload.data.relationships.challenge.data.id);

              expect(answer.id).to.equal(model.id);
              expect(answer.id).to.equal(response.result.data.id);
              expect(answer.attributes.value).to.equal(model.get('value'));
              expect(answer.attributes.result).to.equal(model.get('result'));
              expect(answer.attributes['result-details']).to.equal(model.get('resultDetails'));
              expect(answer.relationships.assessment.data.id).to.equal(model.get('assessmentId').toString());
              expect(answer.relationships.challenge.data.id).to.equal(model.get('challengeId'));
            });
        });
      });
      it('should return persisted answer with elapsedTime', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then(() => {
          new BookshelfAnswer()
            .fetch()
            .then((model) => {
              expect(model.get('elapsedTime')).to.equal(options.payload.data.attributes['elapsed-time']);
            });
        });
      });
    });
  });
});
