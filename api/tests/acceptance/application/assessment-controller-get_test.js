const { describe, it, after, before, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/cache');
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
          'Competence': ['competence_id'],
          '\u00c9preuves': [
            'y_third_challenge',
            'y_second_challenge',
            'y_first_challenge'
          ],
        },
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves')
      .query(true)
      .times(3)
      .reply(200, {
        'records': [
          {
            'id': 'y_first_challenge',
            'fields': {
              'Statut': 'validé',
              'competences': ['competence_id'],
              'acquis': ['@web5']
            }
          },
          {
            'id': 'y_second_challenge',
            'fields': {
              'Statut': 'validé',
              'competences': ['competence_id'],
              'acquis': ['@url1']
            },
          },
          {
            'id': 'y_third_challenge',
            'fields': {
              'Statut': 'validé',
              'competences': ['competence_id'],
              'acquis': ['@web4']
            },
          }
        ]
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/y_first_challenge')
      .query(true)
      .reply(200, {
        'id': 'y_first_challenge',
        'fields': {
          'competences': ['competence_id'],
          'acquis': ['@web5']
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/y_second_challenge')
      .query(true)
      .reply(200, {
        'id': 'y_second_challenge',
        'fields': {
          'competences': ['competence_id'],
          'acquis': ['@url1']
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/y_third_challenge')
      .query(true)
      .reply(200, {
        'id': 'y_third_challenge',
        'fields': {
          'competences': ['competence_id'],
          'acquis': ['@web4']
        },
      });

    done();

  });

  after(function(done) {
    cache.flushAll();
    server.stop(done);
  });

  describe('(no provided answer) GET /api/assessments/:id', function() {

    let options;
    let inserted_assessment_id;

    const inserted_assessment = {
      courseId: 'anyFromAirTable',
      userId: 1234
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

    it('should return the expected assessment', function() {
      // When
      const promise = server.injectThen(options);

      // Then
      return promise.then((response) => {
        const expectedAssessment = {
          'type': 'assessment',
          'id': inserted_assessment_id,
          'attributes': {
            'estimated-level': 0,
            'pix-score': 0,
          },
          'relationships': {
            'course': { 'data': { 'type': 'courses', 'id': 'anyFromAirTable' } },
            'answers': { 'data': [] }
          }
        };
        const assessment = response.result.data;
        expect(assessment).to.deep.equal(expectedAssessment);
      });
    });
  });

  describe('(answers provided) GET /api/assessments/:id', function() {

    let inserted_assessment_id = null;
    let inserted_answer_ids = null;

    const inserted_assessment = {
      courseId: 'anyFromAirTable',
      userId: 1234
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

    it('should return the expected assessment', function() {
      // When
      const promise = server.injectThen({ method: 'GET', url: `/api/assessments/${inserted_assessment_id}` });

      // Then
      return promise.then((response) => {
        const expectedAssessment = {
          'type': 'assessment',
          'id': inserted_assessment_id,
          'attributes': {
            'estimated-level': 1,
            'pix-score': 8
          },
          'relationships': {
            'course': { 'data': { 'type': 'courses', 'id': 'anyFromAirTable' } },
            'answers': {
              'data': [{ type: 'answers', id: inserted_answer_ids[0] }, {
                type: 'answers',
                id: inserted_answer_ids[1]
              }]
            }
          }
        };
        const assessment = response.result.data;
        expect(assessment).to.deep.equal(expectedAssessment);
      });
    });
  });
});
