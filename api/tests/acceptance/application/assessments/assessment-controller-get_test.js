const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Acceptance | API | assessment-controller-get', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  let userId;
  const courseId = 'courseId';

  beforeEach(async () => {
    userId = databaseBuilder.factory.buildUser({}).id;
    await databaseBuilder.commit();
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
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': FRENCH_SPOKEN,
        },
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

  describe('(when userId and assessmentId match) GET /api/assessments/:id', () => {

    let assessmentId;
    let options;

    beforeEach(async() => {
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
      assessmentId = databaseBuilder.factory.buildAssessment({ userId, courseId, state: 'completed' }).id;

      answer1 = databaseBuilder.factory.buildAnswer({ assessmentId });
      answer2 = databaseBuilder.factory.buildAnswer({ assessmentId });

      await databaseBuilder.commit();
    });

    it('should return 200 HTTP status code', () => {
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

    it('should return application/json', () => {
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

    it('should return the expected assessment', () => {
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

  describe('GET /api/assessments/', () => {
    let assessmentId;

    beforeEach(async () => {
      const campaignId = databaseBuilder.factory.buildCampaign({ code: 'TESTCODE', name: 'CAMPAIGN TEST' }).id;
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId });
      assessmentId = databaseBuilder.factory.buildAssessment(
        {
          userId,
          courseId: 'anyFromAirTable',
          type: 'CAMPAIGN',
          campaignParticipationId: campaignParticipation.id,
        }).id;

      await databaseBuilder.commit();
    });

    it('should return 200 HTTP status code', () => {
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

    it('should return application/json', () => {
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

    it('should return an array of assessments, with code campaign', () => {
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
