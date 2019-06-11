const { airtableBuilder, expect, knex, nock, generateValidRequestAuhorizationHeader, databaseBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/cache');
const createServer = require('../../../../server');

describe('Acceptance | API | assessment-controller-get', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

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
    compétenceViaTube: [ 'recCompetence' ],
  });
  const skillWeb4 = airtableBuilder.factory.buildSkill({
    id: 'recSkillWeb4',
    nom: skillWeb4Name,
    compétenceViaTube: [ 'recCompetence' ],
  });
  const skillWeb5 = airtableBuilder.factory.buildSkill({
    id: 'recSkillWeb5',
    nom: skillWeb5Name,
    compétenceViaTube: [ 'recCompetence' ],
  });
  const skillurl1 = airtableBuilder.factory.buildSkill({
    id: 'recSkillurl1',
    nom: skillurl1Name,
    compétenceViaTube: [ 'recCompetence' ],
  });
  const competence = airtableBuilder.factory.buildCompetence({
    id: 'recCompetence',
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
    type: 'PLACEMENT'
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
      .mockList({ tableName: 'Domaines' })
      .returns([airtableBuilder.factory.buildArea()])
      .activate();

    airtableBuilder
      .mockGet({ tableName: 'Competences' })
      .returns(competence)
      .activate();

    airtableBuilder
      .mockList({ tableName: 'Epreuves' })
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
          'type': 'assessments',
          'id': inserted_assessment_id.toString(),
          'attributes': {
            'estimated-level': null,
            'pix-score': null,
            'state': null,
            'title': undefined,
            'type': 'PLACEMENT',
            'certification-number': null,
          },
          'relationships': {
            'course': {
              data: {
                id: 'adaptativeCourseId',
                type: 'courses'
              }
            },
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

  describe('(answers provided, assessment completed) GET /api/assessments/:id', () => {

    let inserted_assessment_id, answer1, answer2;

    beforeEach(() => {
      inserted_assessment_id = databaseBuilder.factory.buildAssessment({
        ...inserted_assessment, state: 'completed' }).id;

      databaseBuilder.factory.buildAssessmentResult({
        level: 1,
        pixScore: 12,
        assessmentId: inserted_assessment_id
      });

      answer1 = databaseBuilder.factory.buildAnswer({ assessmentId: inserted_assessment_id });
      answer2 = databaseBuilder.factory.buildAnswer({ assessmentId: inserted_assessment_id });

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should return 200 HTTP status code', () => {
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

    it('should return application/json', () => {
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
          'type': 'assessments',
          'id': inserted_assessment_id.toString(),
          'attributes': {
            'estimated-level': 1,
            'pix-score': 12,
            'state': 'completed',
            'title': undefined,
            'type': 'PLACEMENT',
            'certification-number': null,
          },
          'relationships': {
            'course': { 'data': { 'type': 'courses', 'id': courseId } },
            'answers': {
              'data': [
                {
                  type: 'answers',
                  id: answer1.id.toString(),
                },
                {
                  type: 'answers',
                  id: answer2.id.toString(),
                },
              ],
            },
          },
        };
        const assessment = response.result.data;
        expect(assessment.attributes).to.deep.equal(expectedAssessment.attributes);
        expect(assessment.relationships.answers.data).to.have.deep.members(expectedAssessment.relationships.answers.data);
      });
    });
  });

  describe('GET /api/assessments/', () => {
    let assessmentId;
    let inserted_assessment_placement;

    beforeEach(() => {
      inserted_assessment_placement = databaseBuilder.factory.buildAssessment({
        userId,
        courseId: 'anyFromAirTable',
        type: 'SMART_PLACEMENT',
      });
      return knex('assessments').insert(inserted_assessment_placement, 'id')
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

    it('should return an array of assessments, with code campaign', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments?filter[codeCampaign]=TESTCODE',
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
      };
      const expectedFirstAssessment = {
        'type': 'assessment',
        'id': assessmentId,
        'attributes': {
          'state': 'completed',
          'title': undefined,
          'type': 'SMART_PLACEMENT',
          'certification-number': null,
          'code-campaign': 'TESTCODE',
        },
        'relationships': {
          'course': { 'data': { 'type': 'courses', 'id': 'anyFromAirTable' } },
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
        expect(assessment.attributes).to.deep.equal(expectedFirstAssessment.attributes);
      });
    });

    it('should return an empty array since no user is logged', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments?filter[codeCampaign]=TESTCODE',
      };
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.result.data).to.be.an('array');
        expect(response.result.data).to.be.empty;
      });
    });
  });
});
