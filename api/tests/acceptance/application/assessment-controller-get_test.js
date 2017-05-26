const { describe, it, after, before, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | Assessments GET', function() {

  before(function(done) {

    nock.cleanAll();
    nock('https://api.airtable.com')
      .get('/v0/test-base/Tests/anyFromAirTable')
      .query(true)
      .times(5)
      .reply(200, {
        'id': 'the_adaptive_course_id',
        'fields': {
          // a bunch of fields
          'Adaptatif ?': true,
          '\u00c9preuves': [
            'y_third_challenge',
            'y_second_challenge',
            'y_first_challenge'
          ],
        },
      });

    nock('https://api.airtable.com')
    .get('/v0/test-base/Epreuves/y_first_challenge')
    .query(true)
    .reply(200, {
      'id': 'y_first_challenge',
      'fields': {
        'acquis': ['@web5']
      },
    });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/y_second_challenge')
      .query(true)
      .reply(200, {
        'id': 'y_second_challenge',
        'fields': {
          'acquis': ['@url1']
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/y_third_challenge')
      .query(true)
      .reply(200, {
        'id': 'y_third_challenge',
        'fields': {
          'acquis': ['@web4']
        },
      });

    done();

  });

  after(function(done) {
    server.stop(done);
  });

  describe('(no provided answer) GET /api/assessments/:id', function() {//

    let options;
    let inserted_assessment_id;

    const inserted_assessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'anyFromAirTable'
    };

    beforeEach(function(done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([inserted_assessment]).then((rows) => {
          inserted_assessment_id = rows[0];
          options = { method: 'GET', url: `/api/assessments/${inserted_assessment_id}` };
          done();
        });
      });
    });

    afterEach(function(done) {
      knex('assessments').delete().then(() => {
        done();
      });
    });

    it('should return 200 HTTP status code', function(done) {

      knex.select('id')
        .from('assessments')
        .limit(1)
        .then(function() {
          server.inject(options, (response) => {
            expect(response.statusCode).to.equal(200);
            done();
          });
        });

    });

    it('should return application/json', function(done) {

      knex.select('id')
        .from('assessments')
        .limit(1)
        .then(function() {
          server.inject(options, (response) => {
            const contentType = response.headers['content-type'];
            expect(contentType).to.contain('application/json');
            done();
          });
        });

    });

    it('should return the expected assessment', function(done) {
      knex.select('id')
        .from('assessments')
        .limit(1)
        .then(function() {
          server.inject(options, (response) => {
            const expectedAssessment = {
              'type': 'assessment',
              'id': inserted_assessment_id,
              'attributes': {
                'user-name': 'John Doe',
                'user-email': 'john.doe@mailmail.com',
                'estimated-level': undefined,
                'pix-score': undefined,
                'not-acquired-knowledge-tags': undefined,
                'acquired-knowledge-tags': undefined
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

  describe('(answers provided) GET /api/assessments/:id', function() {//

    let inserted_assessment_id = null;
    let inserted_answer_ids = null;

    const inserted_assessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'anyFromAirTable'
    };

    beforeEach(function(done) {
      inserted_answer_ids = [];
      knex('assessments').delete().then(() => {
        knex('assessments').insert([inserted_assessment]).then((rows) => {
          inserted_assessment_id = rows[0];

          const inserted_answers = [{
            value: 'any good answer',
            result: 'ok',
            challengeId: 'y_first_challenge',
            assessmentId: inserted_assessment_id
          }, {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'y_second_challenge',
            assessmentId: inserted_assessment_id
          }];
          knex('answers').delete().then(() => {
            knex('answers').insert([inserted_answers[0]]).then((rows) => { // Faut que je le fasse en deux temps sinon je n'ai que le dernier ID
              inserted_answer_ids.push(rows[0]);
              knex('answers').insert([inserted_answers[1]]).then((rows) => {
                inserted_answer_ids.push(rows[0]);
                done();
              });
            });
          });

        });
      });
    });

    afterEach(function(done) {
      knex('assessments').delete().then(() => {
        knex('answers').delete().then(() => {
          done();
        });
      });
    });

    it('should return 200 HTTP status code', function(done) {

      knex.select('id')
        .from('assessments')
        .limit(1)
        .then(function() {
          server.inject({ method: 'GET', url: `/api/assessments/${inserted_assessment_id}` }).then((response) => {
            expect(response.statusCode).to.equal(200);
            done();
          });
        });

    });

    it('should return application/json', function(done) {

      knex.select('id')
        .from('assessments')
        .limit(1)
        .then(function() {
          server.inject({ method: 'GET', url: `/api/assessments/${inserted_assessment_id}` }).then((response) => {
            const contentType = response.headers['content-type'];
            expect(contentType).to.contain('application/json');
            done();
          });
        });

    });

    it('should return the expected assessment', function(done) {
      knex.select('id')
        .from('assessments')
        .limit(1)
        .then(function() {
          server.inject({ method: 'GET', url: `/api/assessments/${inserted_assessment_id}` }).then((response) => {
            const expectedAssessment = {
              'type': 'assessment',
              'id': inserted_assessment_id,
              'attributes': {
                'user-name': 'John Doe',
                'user-email': 'john.doe@mailmail.com',
                'estimated-level': 3,
                'pix-score': 16,
                'not-acquired-knowledge-tags': ['@url1'],
                'acquired-knowledge-tags': ['@web5', '@web4']
              },
              'relationships': {
                'course': { 'data': { 'type': 'courses', 'id': 'anyFromAirTable' } },
                'answers': { 'data': [ { type: 'answers', id: inserted_answer_ids[0] }, { type: 'answers', id:  inserted_answer_ids[1] } ] }
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
