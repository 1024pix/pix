const { expect, knex, nock, generateValidRequestAuhorizationHeader } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/cache');
const server = require('../../../server');

describe('Acceptance | API | assessment-controller-get', () => {

  before(() => {

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
      .get('/v0/test-base/Competences/competence_id')
      .query(true)
      .reply(200, {
        'id': 'competence_id',
        'fields': {
          'Référence': '1.1 Mener une recherche et une veille d’information',
          'Titre': 'Mener une recherche et une veille d’information',
          'Sous-domaine': '1.1',
          'Domaine': '1. Information et données',
          'Statut': 'validé',
          'Acquis': ['@web1']
        }
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves')
      .query({ view: '1.1 Mener une recherche et une veille d’information' })
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

    nock('https://api.airtable.com')
      .get('/v0/test-base/Acquis')
      .query({
        filterByFormula: 'FIND(\'1.1\', {Compétence})'
      })
      .reply(200, {
        'records': [
          { 'fields': { 'Nom': '@url1' } },
          { 'fields': { 'Nom': '@web1' } },
          { 'fields': { 'Nom': '@web4' } },
          { 'fields': { 'Nom': '@web5' } }
        ]
      });
  });

  after(() => {
    nock.cleanAll();
    cache.flushAll();
  });

  describe('(no provided answer) GET /api/assessments/:id', () => {

    let options;
    let inserted_assessment_id;

    const inserted_assessment_with_user_null = {
      courseId: 'anyFromAirTable',
      userId: 1234
    };

    beforeEach(() => {
      return knex('assessments').insert([inserted_assessment_with_user_null]).then((rows) => {
        inserted_assessment_id = rows[0];
        options = {
          method: 'GET',
          url: `/api/assessments/${inserted_assessment_id}`,
          headers: { authorization: generateValidRequestAuhorizationHeader() },
        };
      });
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return application/json', () => {
      return knex.select('id')
        .from('assessments')
        .limit(1)
        .then(() => {
          // when
          const promise = server.inject(options);

          // then
          return promise.then(response => {
            const contentType = response.headers['content-type'];
            expect(contentType).to.contain('application/json');
          });
        });

    });

    it('should return the expected assessment', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const expectedAssessment = {
          'type': 'assessment',
          'id': inserted_assessment_id,
          'attributes': {
            'estimated-level': 0,
            'pix-score': 0,
            'success-rate': null,
            'type': null,
            'certification-number': null
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

  describe('(when userId and assessmentId match) GET /api/assessments/:id', () => {
    const inserted_assessment = {
      courseId: 'anyFromAirTable',
      userId: 1234
    };
    let inserted_assessment_id;
    let options;

    const accessToken = generateValidRequestAuhorizationHeader();

    beforeEach(function() {
      return knex('assessments').insert([inserted_assessment]).then((rows) => {
        inserted_assessment_id = rows[0];
        options = {
          headers: {
            authorization: `Bearer ${accessToken}`
          },
          method: 'GET',
          url: `/api/assessments/${inserted_assessment_id}`
        };
      });
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should return 200 HTTP status code, when userId provided is linked to assessment', () => {
      // when
      const promise = server.inject(options);

      // then

      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('(answers provided) GET /api/assessments/:id', () => {

    let inserted_assessment_id = null;
    let inserted_answer_ids = null;

    const inserted_assessment_with_user_null = {
      courseId: 'anyFromAirTable',
      userId: 1234
    };

    beforeEach((done) => {
      inserted_answer_ids = [];

      knex('assessments').insert([inserted_assessment_with_user_null]).then((rows) => {
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
          knex('answers').insert([inserted_answers[0]]).then((rows) => {
            inserted_answer_ids.push(rows[0]);
            knex('answers').insert([inserted_answers[1]]).then((rows) => {
              inserted_answer_ids.push(rows[0]);
              done();
            });
          });
        });

      });
    });

    afterEach(() => {
      return Promise.all([
        knex('assessments').delete(),
        knex('answers').delete(),
      ]);
    });

    it('should return 200 HTTP status code', () => {
      return knex.select('id')
        .from('assessments')
        .limit(1)
        .then(() => {
          // given
          const options = {
            method: 'GET',
            url: `/api/assessments/${inserted_assessment_id}`,
            headers: { authorization: generateValidRequestAuhorizationHeader() },
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(200);
          });
        });
    });

    it('should return application/json', () => {
      return knex.select('id')
        .from('assessments')
        .limit(1)
        .then(() => {
          // given
          const options = {
            method: 'GET',
            url: `/api/assessments/${inserted_assessment_id}`,
            headers: { authorization: generateValidRequestAuhorizationHeader() },
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            const contentType = response.headers['content-type'];
            expect(contentType).to.contain('application/json');
          });
        });

    });

    it('should return the expected assessment', () => {
      // given
      const options = {
        method: 'GET',
        url: `/api/assessments/${inserted_assessment_id}`,
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const expectedAssessment = {
          'type': 'assessment',
          'id': inserted_assessment_id,
          'attributes': {
            'estimated-level': 1,
            'pix-score': 8,
            'success-rate': 50,
            'type': null,
            'certification-number': null
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
