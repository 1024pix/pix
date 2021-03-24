const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Acceptance | API | assessment-controller-get', function() {

  let server;

  beforeEach(async function() {
    server = await createServer();
  });

  let userId;
  const courseId = 'courseId';

  beforeEach(async function() {
    userId = databaseBuilder.factory.buildUser({}).id;
    await databaseBuilder.commit();
  });

  describe('(no provided answer) GET /api/assessments/:id', function() {

    let options;
    let assessmentId;

    beforeEach(async function() {
      assessmentId = databaseBuilder.factory.buildAssessment({ userId, courseId, state: null }).id;
      await databaseBuilder.commit();
      options = {
        method: 'GET',
        url: `/api/assessments/${assessmentId}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': FRENCH_SPOKEN,
        },
      };
    });

    it('should return 200 HTTP status code', function() {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return application/json', function() {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });

    });

    it('should return the expected assessment', function() {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const expectedAssessment = {
          'type': 'assessments',
          'id': assessmentId.toString(),
          'attributes': {
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
                type: 'courses',
              },
            },
            'answers': {
              'data': [],
              links: {
                related: `/api/answers?assessmentId=${assessmentId}`,
              },
            },
          },
        };
        const assessment = response.result.data;
        expect(assessment).to.deep.equal(expectedAssessment);
      });
    });
  });

  describe('(when userId and assessmentId match) GET /api/assessments/:id', function() {

    let assessmentId;
    let options;

    beforeEach(async function() {
      assessmentId = databaseBuilder.factory.buildAssessment({ userId, courseId, state: null }).id;
      await databaseBuilder.commit();
      options = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': FRENCH_SPOKEN,
        },
        method: 'GET',
        url: `/api/assessments/${assessmentId}`,
      };
    });

    it('should return 200 HTTP status code, when userId provided is linked to assessment', function() {
      // when
      const promise = server.inject(options);

      // then

      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('(answers provided, assessment completed) GET /api/assessments/:id', function() {
    let assessmentId, answer1, answer2;

    beforeEach(async function() {
      assessmentId = databaseBuilder.factory.buildAssessment({ userId, courseId, state: 'completed' }).id;

      answer1 = databaseBuilder.factory.buildAnswer({ assessmentId });
      answer2 = databaseBuilder.factory.buildAnswer({ assessmentId });

      await databaseBuilder.commit();
    });

    it('should return 200 HTTP status code', function() {
      const options = {
        method: 'GET',
        url: `/api/assessments/${assessmentId}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': FRENCH_SPOKEN,
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return application/json', function() {
      const options = {
        method: 'GET',
        url: `/api/assessments/${assessmentId}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': FRENCH_SPOKEN,
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should return the expected assessment', function() {
      // given
      const options = {
        method: 'GET',
        url: `/api/assessments/${assessmentId}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': FRENCH_SPOKEN,
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const expectedAssessment = {
          'type': 'assessments',
          'id': assessmentId.toString(),
          'attributes': {
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

  describe('GET /api/assessments/', function() {
    let assessmentId;

    beforeEach(async function() {
      const campaignId = databaseBuilder.factory.buildCampaign({ code: 'TESTCODE', name: 'CAMPAIGN TEST' }).id;
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId });
      assessmentId = databaseBuilder.factory.buildAssessment(
        {
          userId,
          courseId: 'anyFromLearningContent',
          type: 'CAMPAIGN',
          campaignParticipationId: campaignParticipation.id,
        }).id;

      await databaseBuilder.commit();
    });

    it('should return 200 HTTP status code', function() {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments/',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': FRENCH_SPOKEN,
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });

    });

    it('should return application/json', function() {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments/',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': FRENCH_SPOKEN,
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should return an array of assessments, with code campaign', function() {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments?filter[codeCampaign]=TESTCODE',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': FRENCH_SPOKEN,
        },
      };
      const expectedFirstAssessment = {
        'type': 'assessment',
        'id': assessmentId,
        'attributes': {
          'state': 'completed',
          'title': undefined,
          'type': 'CAMPAIGN',
          'certification-number': null,
          'code-campaign': 'TESTCODE',
          'competence-id': 'recCompetenceId',
        },
        'relationships': {
          'course': { 'data': { 'type': 'courses', 'id': 'anyFromLearningContent' } },
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

    it('should return an empty array since no user is logged', function() {
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
