const { describe, it, before, after, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const server = require('../../../server');
const Answer = require('../../../lib/domain/models/data/answer');

describe('Acceptance | Controller | answer-controller', function () {

  after(function (done) {
    server.stop(done);
  });

  describe('POST /api/answers', function () {

    beforeEach(function (done) {
      knex('answers').delete().then(() => done());
    });

    afterEach(function (done) {
      knex('answers').delete().then(() => done());
    });

    before(function (done) {
      nock('https://api.airtable.com')
        .get('/v0/test-base/Epreuves/a_challenge_id')
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
      done();
    });

    after(function (done) {
      nock.cleanAll();
      done();
    });

    let options;

    beforeEach(function () {
      options = {
        method: 'POST',
        url: '/api/answers',
        payload: {
          data: {
            type: 'answer',
            attributes: {
              value: '1'
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
                  id: 'a_challenge_id'
                }
              }
            }
          }
        }
      };
    });

    it('should return 201 HTTP status code', function (done) {
      server.inject(options, (response) => {
        expect(response.statusCode).to.equal(201);
        done();
      });
    });

    it('should return application/json', function (done) {
      server.inject(options, (response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should add a new answer into the database', function (done) {
      server.inject(options, () => {
        Answer.count().then(function (afterAnswersNumber) {
          expect(afterAnswersNumber).to.equal(1);
          done();
        });
      });
    });

    it('should return persisted answer', function (done) {
      // when
      server.inject(options, (response) => {
        const answer = response.result.data;

        // then
        new Answer()
          .fetch()
          .then(function (model) {
            expect(model.id).to.be.a('number');
            expect(model.get('value')).to.equal(options.payload.data.attributes.value);
            expect(model.get('result')).to.equal('ok');
            expect(model.get('assessmentId')).to.equal(options.payload.data.relationships.assessment.data.id);
            expect(model.get('challengeId')).to.equal(options.payload.data.relationships.challenge.data.id);

            expect(answer.id).to.equal(model.id);
            expect(answer.id).to.equal(response.result.data.id);
            expect(answer.attributes.value).to.equal(model.get('value'));
            expect(answer.attributes.result).to.equal(model.get('result'));
            expect(answer.relationships.assessment.data.id).to.equal(model.get('assessmentId'));
            expect(answer.relationships.challenge.data.id).to.equal(model.get('challengeId'));

            done();
          });
      });
    });

    it('should persist long text for column "answers.value"', function (done) {
      // given
      options.payload.data.attributes.value = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?';

      // when
      server.inject(options, () => {

        // then
        Answer.count().then(function (afterAnswersNumber) {
          expect(afterAnswersNumber).to.equal(1);
          done();
        });
      });
    });

  });

});
