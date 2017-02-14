const { describe, it, after, beforeEach, afterEach, expect, knex } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | Assessments GET', function () {

  after(function (done) {
    server.stop(done);
  });

  describe('GET /api/assessments/:id', function () {//

    let options;
    let inserted_assessment_id;

    const inserted_assessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'anyFromAirTable'
    };

    beforeEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([inserted_assessment]).then((rows) => {
          inserted_assessment_id = rows[0];
          options = { method: 'GET', url: `/api/assessments/${inserted_assessment_id}` };
          done();
        });
      });
    });

    afterEach(function (done) {
      knex('assessments').delete().then(() => {
        done();
      });
    });

    it('should return 200 HTTP status code', function (done) {

      knex.select('id')
        .from('assessments')
        .limit(1)
        .then(function () {
          server.inject(options, (response) => {
            expect(response.statusCode).to.equal(200);
            done();
          });
        });

    });

    it('should return application/json', function (done) {

      knex.select('id')
        .from('assessments')
        .limit(1)
        .then(function () {
          server.inject(options, (response) => {
            const contentType = response.headers['content-type'];
            expect(contentType).to.contain('application/json');
            done();
          });
        });

    });

    it('should return the expected assessment', function (done) {
      // XXX: incomplete test, should also demonstrate that it returns the whole answer grape.
      // See https://github.com/sgmap/pix/issues/205
      knex.select('id')
        .from('assessments')
        .limit(1)
        .then(function () {
          server.inject(options, (response) => {
            const expectedAssessment = {
              'type': 'assessments',
              'id': inserted_assessment_id,
              'attributes': {
                'user-name': 'John Doe',
                'user-email': 'john.doe@mailmail.com'
              },
              'relationships': {
                'course': { 'data': { 'type': 'courses', 'id': 'anyFromAirTable' } },
                'answers': { 'data': [] }
              }
            };
            const assessment = response.result.data;
            expect(assessment).to.deep.equal(expectedAssessment);
            done();
          });
        });
    });
  });
});
