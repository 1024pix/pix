const { expect, generateValidRequestAuthorizationHeader, nock, databaseBuilder } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | Progressions', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/progressions/:id', () => {

    let assessmentId;
    let userId;

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

      userId = databaseBuilder.factory.buildUser({}).id;
      assessmentId = databaseBuilder.factory.buildAssessment(
        {
          userId: userId,
          type: 'SMART_PLACEMENT',
          state: 'completed',
        }).id;
      const campaignId = databaseBuilder.factory.buildCampaign(
        {
          name: 'Campaign',
        }).id;
      databaseBuilder.factory.buildCampaignParticipation(
        {
          campaignId,
          assessmentId,
        });
      await databaseBuilder.commit();
    });

    afterEach(() => {
      nock.cleanAll();
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
          const progressionId = assessmentId + 1;
          const options = {
            method: 'GET',
            url: `/api/progressions/${progressionId}`,
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId)
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
              authorization: generateValidRequestAuthorizationHeader(userId)
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
