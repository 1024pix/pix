const { expect, knex } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | answer-controller', function() {

  after((done) => {
    server.stop(done);
  });

  describe('GET /api/answers/:id', function() {

    let options;
    let inserted_answer_id;

    const inserted_answer = {
      value: '1,2',
      result: 'ok',
      challengeId: 'recLt9uwa2dR3IYpi',
      assessmentId: '12345'
    };

    beforeEach(() => {
      return knex('answers').delete().then(() => {
        return knex('answers').insert([inserted_answer]).then((ids) => {
          inserted_answer_id = ids[0];
          options = { method: 'GET', url: `/api/answers/${inserted_answer_id}` };
        });
      });
    });

    afterEach(() => {
      return knex('answers').delete();
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

    it('should return required answer', (done) => {
      server.inject(options, (response) => {
        const answer = response.result.data;

        expect(answer.id).to.equal(inserted_answer_id);
        expect(answer.attributes.value.toString()).to.equal(inserted_answer.value.toString());
        expect(answer.attributes.result.toString()).to.equal(inserted_answer.result.toString());
        expect(answer.relationships.assessment.data.id.toString()).to.equal(inserted_answer.assessmentId.toString());
        expect(answer.relationships.challenge.data.id.toString()).to.equal(inserted_answer.challengeId.toString());

        done();
      });
    });

  });

});
