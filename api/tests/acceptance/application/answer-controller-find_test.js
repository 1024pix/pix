const { describe, it, after, beforeEach, afterEach, expect, knex } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | answer-controller', function () {

  after(function (done) {
    server.stop(done);
  });

  /* Find
   –––––––––––––––––––––––––––––––––––––––––––––––––– */
  describe('Find /api/answers?challengeId=Y&assessmentId=Z', function () {

    let inserted_answer_id = null;

    const queryUrl = '/api/answers?challenge=recLt9uwa2dR3IYpi&assessment=12345';

    const inserted_answer = {
      value: '1,2',
      result: 'ok',
      challengeId: 'recLt9uwa2dR3IYpi',
      assessmentId: '12345'
    };

    beforeEach(function (done) {
      knex('answers').delete().then(() => {
        knex('answers').insert([inserted_answer]).then((id) => {
          inserted_answer_id = id;
          done();
        });
      });
    });

    afterEach(function (done) {
      knex('answers').delete().then(() => {
        done();
      });
    });

    it('should return 200 HTTP status code', function (done) {
      server.inject({ method: 'GET', url: queryUrl }, (response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function (done) {
      server.inject({ method: 'GET', url: queryUrl }, (response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should return required answer', function (done) {
      server.inject({ method: 'GET', url: queryUrl }, (response) => {
        const answer = response.result.data;

        expect(answer.id.toString()).to.equal(inserted_answer_id.toString());
        expect(answer.attributes.value.toString()).to.equal(inserted_answer.value.toString());
        expect(answer.attributes.result.toString()).to.equal(inserted_answer.result.toString());
        expect(answer.relationships.assessment.data.id.toString()).to.equal(inserted_answer.assessmentId.toString());
        expect(answer.relationships.challenge.data.id.toString()).to.equal(inserted_answer.challengeId.toString());

        done();
      });
    });

    it('should return 200 with "null" data if not found answer', function (done) {
      server.inject({
        method: 'GET',
        url: '/api/answers?challenge=nothing&assessment=nothing'
      }, (response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.be.null;

        done();
      });
    });
  });

});
