const { airtableBuilder, expect, knex, nock, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/cache');
const server = require('../../../../server');

describe('Acceptance | API | assessment-controller-get', () => {

  let userId;
  const inserted_user = {
    firstName: 'Jar Jar',
    lastName: 'Binks',
    email: 'jj.binks@save.us',
    password: '123missa',
    cgu: true,
  };
  const courseId = 'adaptativeCourseId';
  const skillurl1Name = '@url1';
  const skillWeb1Name = '@web1';
  const skillWeb4Name = '@web4';
  const skillWeb5Name = '@web5';

  const skillWeb1 = airtableBuilder.factory.buildSkill({
    id: 'recSkillWeb1',
    nom: skillWeb1Name,
  });
  const skillWeb4 = airtableBuilder.factory.buildSkill({
    id: 'recSkillWeb4',
    nom: skillWeb4Name,
  });
  const skillWeb5 = airtableBuilder.factory.buildSkill({
    id: 'recSkillWeb5',
    nom: skillWeb5Name,
  });
  const skillurl1 = airtableBuilder.factory.buildSkill({
    id: 'recSkillurl1',
    nom: skillurl1Name,
  });
  const competence = airtableBuilder.factory.buildCompetence({
    acquis: [skillurl1Name, skillWeb1Name, skillWeb4Name, skillWeb5Name],
    acquisIdentifiants: [skillurl1.id, skillWeb1.id, skillWeb4.id, skillWeb5.id],
    acquisViaTubes: [skillurl1.id, skillWeb1.id, skillWeb4.id, skillWeb5.id],
  });
  const course = airtableBuilder.factory.buildCourse({
    id: courseId,
    adaptatif: true,
    competence: [competence.id],
  });
  const firstChallenge = airtableBuilder.factory.buildChallenge({
    id: 'recFirstChallenge',
    competences: [competence.id],
    status: 'validé',
    acquis: [skillWeb5Name],
    acquix: [skillWeb5.id],
  });
  const secondChallenge = airtableBuilder.factory.buildChallenge({
    id: 'recSecondChallenge',
    competences: [competence.id],
    status: 'validé',
    acquis: [skillurl1Name],
    acquix: [skillurl1.id],
  });
  const thirdChallenge = airtableBuilder.factory.buildChallenge({
    id: 'recThirdChallenge',
    competences: [competence.id],
    status: 'validé',
    acquis: [skillWeb4Name],
    acquix: [skillWeb4.id],
  });

  const inserted_assessment = {
    courseId,
  };

  before(() => {
    nock.cleanAll();

    return knex('answers').delete()
      .then(() => knex('assessments').delete())
      .then(() => knex('users').delete())
      .then(() => knex('users').insert(inserted_user).returning('id'))
      .then(([id]) => {
        userId = id;
        inserted_assessment.userId = userId;
      });
  });

  beforeEach(() => {
    airtableBuilder
      .mockGet({ tableName: 'Tests' })
      .returns(course)
      .activate();

    airtableBuilder
      .mockGet({ tableName: 'Competences' })
      .returns(competence)
      .activate();

    airtableBuilder
      .mockList({ tableName: 'Epreuves' })
      .respondsToQuery({ view: '1.1 Mener une recherche et une veille d’information' })
      .returns([firstChallenge, secondChallenge, thirdChallenge])
      .activate();

    airtableBuilder
      .mockGet({ tableName: 'Epreuves' })
      .returns(firstChallenge)
      .activate();

    airtableBuilder
      .mockGet({ tableName: 'Epreuves' })
      .returns(secondChallenge)
      .activate();

    airtableBuilder
      .mockGet({ tableName: 'Epreuves' })
      .returns(thirdChallenge)
      .activate();

    airtableBuilder
      .mockList({ tableName: 'Acquis' })
      .respondsToQuery({ filterByFormula: 'FIND(\'1.1\', {Compétence})' })
      .returns([skillurl1, skillWeb1, skillWeb4, skillWeb5])
      .activate();
  });

  afterEach(() => {
    airtableBuilder.cleanAll();
  });

  after(() => {
    nock.cleanAll();
    cache.flushAll();
    return knex('users').delete();
  });

  describe('(no provided answer) GET /api/assessments/:id', () => {

    let options;
    let inserted_assessment_id;

    beforeEach(() => {
      return knex('assessments').insert(inserted_assessment).returning('id').then(([id]) => {
        inserted_assessment_id = id;
        options = {
          method: 'GET',
          url: `/api/assessments/${inserted_assessment_id}`,
          headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
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
      return promise.then((response) => {
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
          return promise.then((response) => {
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
            'certification-number': null,
          },
          'relationships': {
            'course': { 'data': { 'type': 'courses', 'id': courseId } },
            'answers': { 'data': [] },
          },
        };
        const assessment = response.result.data;
        expect(assessment).to.deep.equal(expectedAssessment);
      });
    });
  });

  describe('(when userId and assessmentId match) GET /api/assessments/:id', () => {

    let inserted_assessment_id;
    let options;

    beforeEach(function() {
      return knex('assessments').insert([inserted_assessment]).returning('id').then(([id]) => {
        inserted_assessment_id = id;
        options = {
          headers: {
            authorization: generateValidRequestAuhorizationHeader(userId),
          },
          method: 'GET',
          url: `/api/assessments/${inserted_assessment_id}`,
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

    let inserted_assessment_id;
    let inserted_good_answer_id;
    let inserted_bad_answer_id;

    beforeEach(() => {
      return knex('assessments').insert([inserted_assessment]).returning('id').then(([id]) => {
        inserted_assessment_id = id;

        const inserted_good_answer = {
          value: 'any good answer',
          result: 'ok',
          challengeId: firstChallenge.id,
          assessmentId: inserted_assessment_id,
        };
        const inserted_bad_answer = {
          value: 'any bad answer',
          result: 'ko',
          challengeId: secondChallenge.id,
          assessmentId: inserted_assessment_id,
        };

        return knex('answers').delete()
          .then(() => knex('answers').insert(inserted_good_answer).returning('id'))
          .then(([id]) => inserted_good_answer_id = id)
          .then(() => knex('answers').insert(inserted_bad_answer).returning('id'))
          .then(([id]) => inserted_bad_answer_id = id);
      });
    });

    afterEach(() => {
      return knex('answers').delete()
        .then(() => knex('assessments').delete());
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
            headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
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
            headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
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
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
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
            'certification-number': null,
          },
          'relationships': {
            'course': { 'data': { 'type': 'courses', 'id': courseId } },
            'answers': {
              'data': [
                {
                  type: 'answers',
                  id: inserted_good_answer_id,
                },
                {
                  type: 'answers',
                  id: inserted_bad_answer_id,
                },
              ],
            },
          },
        };
        const assessment = response.result.data;
        expect(assessment).to.deep.equal(expectedAssessment);
      });
    });
  });

  describe('GET /api/assessments/', () => {
    let assessmentId;

    beforeEach(() => {
      return knex('assessments').insert([inserted_assessment], 'id')
        .then(([id]) => {
          assessmentId = id;
          return knex('campaigns').insert({ code: 'TESTCODE', name: 'CAMPAIGN TEST' }, 'id');
        }).then(([id]) => {
          return knex('campaign-participations').insert({ assessmentId, campaignId: id });
        });
    });

    afterEach(() => {
      return knex('campaign-participations').delete()
        .then(() => knex('assessments').delete())
        .then(() => knex('campaigns').delete());
    });

    it('should return 200 HTTP status code', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments/',
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });

    });

    it('should return application/json', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments/',
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should return an array of assessments, with related campaign', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments/',
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
      };
      const expectedFirstAssessment = {
        'type': 'assessment',
        'id': assessmentId,
        'attributes': {
          'estimated-level': undefined,
          'pix-score': undefined,
          'success-rate': undefined,
          'type': null,
          'certification-number': null,
          'code-campaign': 'TESTCODE',
        },
        'relationships': {
          'course': { 'data': { 'type': 'courses', 'id': courseId } },
          'answers': {
            'data': [],
          },
        },
      };
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.result.data).to.be.an('array');
        const assessment = response.result.data[0];
        expect(assessment).to.deep.equal(expectedFirstAssessment);
      });
    });
  });
});
