const { expect, knex, generateValidRequestAuhorizationHeader, nock, databaseBuilder } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | Progressions', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  before(() => {
    return knex('target-profiles').delete();
  });

  describe('GET /api/progressions/:id', () => {

    const userIdOfUserWithAssessment = 9999;
    const insertedAssessment = {
      id: 12,
      courseId: 1,
      userId: userIdOfUserWithAssessment,
      type: 'SMART_PLACEMENT',
      state: 'completed',
    };
    const insertedCampaign = {
      id: 14,
      name: 'Campaign',
      organizationId: null,
      targetProfileId:1
    };
    const insertedCampaignParticipation = {
      campaignId: insertedCampaign.id,
      assessmentId: insertedAssessment.id
    };
    const insertedTargetProfile = {
      id: 1,
      name: 'PIC Diagnostic',
      isPublic: true
    };

    let assessmentId;

    beforeEach(async () => {
      nock.cleanAll();

      nock('https://api.airtable.com')
        .get('/v0/test-base/Epreuves')
        .query(true)
        .times(3)
        .reply(200, {});

      nock('https://api.airtable.com')
        .get('/v0/test-base/Acquis')
        .query(true)
        .reply(200, {});

      const assessment = databaseBuilder.factory.buildAssessment(insertedAssessment);
      assessmentId = assessment.id;
      databaseBuilder.factory.buildTargetProfile(insertedTargetProfile);
      databaseBuilder.factory.buildCampaign(insertedCampaign);
      databaseBuilder.factory.buildCampaignParticipation(insertedCampaignParticipation);
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      nock.cleanAll();
      await databaseBuilder.clean();
    });

    context('without authorization token', () => {

      it('should return 401 HTTP status code', () => {
        // given
        const progressionId = assessmentId;
        const options = {
          method: 'GET',
          url: `/api/progressions/${progressionId}`,
          headers: {
            authorization: 'invalid.access.token'
          }
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    context('with authorization token', () => {

      context('when the assessment does not exists', () => {
        it('should respond with a 404', () => {
          // given
          const userIdOfUserWithoutAssessment = 8888;
          const progressionId = -1;
          const options = {
            method: 'GET',
            url: `/api/progressions/${progressionId}`,
            headers: {
              authorization: generateValidRequestAuhorizationHeader(userIdOfUserWithoutAssessment)
            }
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(404);
          });
        });
      });

      context('allowed to access the progression', () => {

        it('should respond with a 200', () => {
          // given
          const progressionId = assessmentId;
          const options = {
            method: 'GET',
            url: `/api/progressions/${progressionId}`,
            headers: {
              authorization: generateValidRequestAuhorizationHeader(userIdOfUserWithAssessment)
            }
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(200);
          });
        });
      });
    });
  });
});
