const { airtableBuilder, expect, nock, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const createServer = require('../../../../server');

describe('Acceptance | API | assessment-controller-get', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  let userId;
  const courseId = 'courseId';
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

  before(() => {
    nock.cleanAll();
  });

  beforeEach(async () => {
    airtableBuilder
      .mockList({ tableName: 'Tests' })
      .returns([course])
      .activate();

    airtableBuilder
      .mockList({ tableName: 'Domaines' })
      .returns([airtableBuilder.factory.buildArea()])
      .activate();

    airtableBuilder
      .mockList({ tableName: 'Competences' })
      .returns([competence])
      .activate();

    airtableBuilder
      .mockList({ tableName: 'Epreuves' })
      .returns([firstChallenge, secondChallenge, thirdChallenge])
      .activate();

    airtableBuilder
      .mockList({ tableName: 'Acquis' })
      .returns([skillurl1, skillWeb1, skillWeb4, skillWeb5])
      .activate();

    userId = databaseBuilder.factory.buildUser({}).id;
    await databaseBuilder.commit();
  });

  afterEach(() => {
    return airtableBuilder.cleanAll();
  });

  after(() => {
    nock.cleanAll();
    return cache.flushAll();
  });

  describe('(no provided answer) GET /api/assessments/:id', () => {

    let options;
    let assessmentId;

    beforeEach(async () => {
      assessmentId = databaseBuilder.factory.buildAssessment({ userId, courseId, state: null }).id;
      await databaseBuilder.commit();
      options = {
        method: 'GET',
        url: `/api/assessments/${assessmentId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
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
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });

    });

    it('should return the expected assessment', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const expectedAssessment = {
          'type': 'assessments',
          'id': assessmentId.toString(),
          'attributes': {
            'estimated-level': null,
            'pix-score': null,
            'state': null,
            'title': '',
            'type': null,
            'certification-number': null,
            'competence-id': 'recCompetenceId',
          },
          'relationships': {
            'course': {
              data: {
                id: 'courseId',
                type: 'courses'
              }
            },
            'answers': {
              'data': [],
              links: {
                related: `/api/answers?assessmentId=${assessmentId}`,
              }
            },
          },
        };
        const assessment = response.result.data;
        expect(assessment).to.deep.equal(expectedAssessment);
      });
    });
  });

  describe('(when userId and assessmentId match) GET /api/assessments/:id', () => {

    let assessmentId;
    let options;

    beforeEach(async() => {
      assessmentId = databaseBuilder.factory.buildAssessment({ userId, courseId, state: null }).id;
      await databaseBuilder.commit();
      options = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
        method: 'GET',
        url: `/api/assessments/${assessmentId}`,
      };
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
    let assessmentId, answer1, answer2;

    beforeEach(async () => {
      const juryId = databaseBuilder.factory.buildUser({}).id;
      assessmentId = databaseBuilder.factory.buildAssessment({ userId, courseId, state: 'completed' }).id;
      databaseBuilder.factory.buildAssessmentResult({
        level: 1,
        pixScore: 12,
        assessmentId: assessmentId,
        juryId,
      });

      answer1 = databaseBuilder.factory.buildAnswer({ assessmentId });
      answer2 = databaseBuilder.factory.buildAnswer({ assessmentId });

      await databaseBuilder.commit();
    });

    it('should return 200 HTTP status code', () => {
      const options = {
        method: 'GET',
        url: `/api/assessments/${assessmentId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
        url: `/api/assessments/${assessmentId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
        url: `/api/assessments/${assessmentId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const expectedAssessment = {
          'type': 'assessments',
          'id': assessmentId.toString(),
          'attributes': {
            'estimated-level': 1,
            'pix-score': 12,
            'state': 'completed',
            'title': '',
            'type': null,
            'certification-number': null,
            'competence-id': 'recCompetenceId',
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

    beforeEach(async () => {
      const campaignId = databaseBuilder.factory.buildCampaign({ code: 'TESTCODE', name: 'CAMPAIGN TEST' }).id;
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({  campaignId });
      assessmentId = databaseBuilder.factory.buildAssessment(
        {
          userId,
          courseId: 'anyFromAirTable',
          type: 'SMART_PLACEMENT',
          campaignParticipationId: campaignParticipation.id
        }).id;

      await databaseBuilder.commit();
    });

    it('should return 200 HTTP status code', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments/',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
          'competence-id': 'recCompetenceId',
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
