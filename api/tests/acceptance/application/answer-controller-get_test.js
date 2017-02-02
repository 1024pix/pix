/* global describe, before, beforeEach, after, afterEach, knex, it, expect */
const server = require('../../../server');

server.register(require('inject-then'));

describe('Acceptance | API | Answers', function () {

  after(function (done) {
    server.stop(done);
  });

  /* Get
  –––––––––––––––––––––––––––––––––––––––––––––––––– */
  describe('Get /api/answers/:id (single answer)', function () {

    let inserted_answer_id = null;

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
      knex('answers').delete().then(() => {done();});
    });

    it('should return 200 HTTP status code', function (done) {
      server.injectThen({method: 'GET', url: `/api/answers/${inserted_answer_id}`}).then((response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function (done) {
      server.injectThen({method: 'GET', url: `/api/answers/${inserted_answer_id}`}).then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should return required answer', function (done) {
      server.injectThen({method: 'GET', url: `/api/answers/${inserted_answer_id}`}).then((response) => {
        const answer = response.result.data;

        expect(answer.id.toString()).to.equal(inserted_answer_id.toString());
        expect(answer.attributes.value.toString()).to.equal(inserted_answer.value.toString());
        expect(answer.attributes.result.toString()).to.equal(inserted_answer.result.toString());
        expect(answer.relationships.assessment.data.id.toString()).to.equal(inserted_answer.assessmentId.toString());
        expect(answer.relationships.challenge.data.id.toString()).to.equal(inserted_answer.challengeId.toString());

        done();
      });
    });

  });

});
