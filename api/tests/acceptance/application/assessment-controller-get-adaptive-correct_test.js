const { describe, it, before, after, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | Assessments', function() {

  before(function(done) {

    nock.cleanAll();
    nock('https://api.airtable.com')
      .get('/v0/test-base/Tests/w_adaptive_course_id')
      .query(true)
      .times(4)
      .reply(200, {
        'id': 'w_adaptive_course_id',
        'fields': {
          'Adaptatif ?': true,
          'Competence': ['competence_id']
        }
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves')
      .query(true)
      .times(3)
      .reply(200, {
        'records': [
          {
            'id': 'w_first_challenge',
            'fields': {
              'Statut': 'validé',
              'competences': ['competence_id'],
              'acquis': ['@web2']
            }
          },
          {
            'id': 'w_second_challenge',
            'fields': {
              'Statut': 'validé',
              'competences': ['competence_id'],
              'acquis': ['@web3']
            },
          },
          {
            'id': 'w_third_challenge',
            'fields': {
              'Statut': 'validé',
              'competences': ['competence_id'],
              'acquis': ['@web1']
            },
          }
        ]
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/w_first_challenge')
      .query(true)
      .reply(200, {
        'id': 'w_first_challenge',
        'fields': {
          'Statut': 'validé',
          'acquis': ['@web2']
        }
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/w_second_challenge')
      .query(true)
      .reply(200, {
        'id': 'w_second_challenge',
        'fields': {
          'Statut': 'validé',
          'acquis': ['@web3']
        }
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/w_third_challenge')
      .query(true)
      .reply(200, {
        'id': 'w_third_challenge',
        'fields': {
          'Statut': 'validé',
          'acquis': ['@web1']
        }
      });

    done();
  });

  after(function(done) {
    nock.cleanAll();
    server.stop(done);
  });

  describe('(adaptive correct answer) GET /api/assessments/:assessment_id/next/:current_challenge_id', function() {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      courseId: 'w_adaptive_course_id'
    };

    beforeEach(function(done) {
      knex('assessments').insert([insertedAssessment])
        .then((rows) => {
          insertedAssessmentId = rows[0];

          return {
            value: 'any good answer',
            result: 'ok',
            challengeId: 'w_first_challenge',
            assessmentId: insertedAssessmentId
          };
        })
        .then((inserted_answer) => {
          return knex('answers').insert([inserted_answer]);
        })
        .then(() => {
          done();
        });
    });

    afterEach(function(done) {
      knex('assessments').delete()
        .then(() => knex('assessments').delete())
        .then(() => done());
    });

    it('should return the second challenge if the first answer is correct', function(done) {

      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/w_first_challenge' };
      server.inject(options, (response) => {
        expect(response.result.data.id).to.equal('w_second_challenge');
        done();
      });
    });
  });

  describe('(adaptive incorrect answer) GET /api/assessments/:assessment_id/next/:current_challenge_id', function() {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      courseId: 'w_adaptive_course_id'
    };

    beforeEach(function(done) {
      knex('assessments').insert([insertedAssessment])
        .then((rows) => {
          insertedAssessmentId = rows[0];

          return {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'w_first_challenge',
            assessmentId: insertedAssessmentId
          };
        })
        .then((inserted_answer) => {
          return knex('answers').insert([inserted_answer]);
        })
        .then(() => {
          done();
        });
    });

    afterEach(function(done) {
      knex('assessments').delete()
        .then(() => knex('assessments').delete())
        .then(() => done());
    });

    it('should return the third challenge if the first answer is incorrect', function(done) {

      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/w_first_challenge' };
      server.inject(options, (response) => {
        expect(response.result.data.id).to.equal('w_third_challenge');
        done();
      });
    });
  });

  describe('(end of adaptive test) GET /api/assessments/:assessment_id/next/:current_challenge_id', function() {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      courseId: 'w_adaptive_course_id'
    };

    beforeEach(function(done) {
      knex('assessments').insert([insertedAssessment])
        .then((rows) => {
          insertedAssessmentId = rows[0];

          return [{
            value: 'any good answer',
            result: 'ok',
            challengeId: 'w_first_challenge',
            assessmentId: insertedAssessmentId
          }, {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'w_second_challenge',
            assessmentId: insertedAssessmentId
          }];
        })
        .then((insertedAnswers) => {
          return knex('answers').insert(insertedAnswers);
        })
        .then(() => {
          done();
        });
    });

    afterEach(function(done) {
      knex('assessments').delete()
        .then(() => knex('assessments').delete())
        .then(() => done());
    });

    it('should finish the test if there is no next challenge', function(done) {

      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/w_second_challenge' };
      server.inject(options, (response) => {
        expect(response.result.data).to.equal(undefined);
        done();
      });
    });
  });

})
;
