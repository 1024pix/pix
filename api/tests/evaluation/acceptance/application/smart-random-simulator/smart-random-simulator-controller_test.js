import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | API | Smart Random Simulator', function () {
  let userId;
  let server;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser.withRole().id;
    await databaseBuilder.commit();
    server = await createServer();
  });

  const buildPayload = (withChallengesMatchingUserLocale = true) => {
    return {
      data: {
        attributes: {
          knowledgeElements: [
            {
              source: 'direct',
              status: 'validated',
              answerId: 12345678,
              skillId: 'rec45678765',
            },
          ],
          answers: [
            {
              id: '1245',
              result: 'ok',
              challengeId: 'rec1234567',
            },
          ],
          skills: [
            {
              id: 'recoaijndozia123',
              name: '@skillname3',
              difficulty: 3,
            },
          ],
          challenges: [
            {
              id: 'challengerec1234567',
              skill: {
                id: 'recoaijndozia123',
                name: '@skillname3',
                difficulty: 3,
              },
              locales: withChallengesMatchingUserLocale ? ['fr-fr'] : ['en'],
            },
          ],
          locale: 'fr-fr',
          assessmentId: 12346,
        },
      },
    };
  };

  describe('POST /api/admin/smart-random-simulator/get-next-challenge', function () {
    context('when user is authenticated and has a role', function () {
      context('when the route should return a challenge', function () {
        let options, response;

        beforeEach(async function () {
          options = {
            method: 'POST',
            url: '/api/admin/smart-random-simulator/get-next-challenge',
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
            payload: buildPayload(),
          };
          response = await server.inject(options);
        });

        it('should return a 200 status code', async function () {
          expect(response.statusCode).to.equal(200);
        });
        it('should return a challenge', async function () {
          expect(JSON.parse(response.payload).challenge.id).to.equal('challengerec1234567');
        });
        it('should return smart random details', async function () {
          expect(JSON.parse(response.payload).smartRandomDetails).to.exist;
        });
      });
      context('when the route should not return a challenge', function () {
        let options, response;

        beforeEach(async function () {
          options = {
            method: 'POST',
            url: '/api/admin/smart-random-simulator/get-next-challenge',
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
            payload: buildPayload(false),
          };
          response = await server.inject(options);
        });

        it('should return a 200 status code', async function () {
          expect(response.statusCode).to.equal(200);
        });
        it('should return smart random details and no challenge', async function () {
          expect(JSON.parse(response.payload).challenge).to.be.null;
          expect(JSON.parse(response.payload).smartRandomDetails).to.exist;
        });
      });
    });
  });
});
