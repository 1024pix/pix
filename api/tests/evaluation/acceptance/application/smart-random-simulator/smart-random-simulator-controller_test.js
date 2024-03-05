import {
  expect,
  generateValidRequestAuthorizationHeader,
  createServer,
  databaseBuilder,
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
          'knowledge-elements': [
            {
              source: 'direct',
              status: 'validated',
              'answer-id': 12345678,
              'skill-id': 'rec45678765',
            },
          ],
          answers: [
            {
              result: 'ok',
              'challenge-id': 'rec1234567',
            },
          ],
          skills: [
            {
              id: 'recoaijndozia123',
              difficulty: 3,
              name: '@skillname3',
            },
          ],
          challenges: [
            {
              id: 'challengerec1234567',
              skill: {
                id: 'recoaijndozia123',
                name: '@skillname3',
              },
              locales: withChallengesMatchingUserLocale ? ['fr-fr'] : ['en'],
            },
          ],
          locale: 'fr-fr',
          'assessment-id': 12346,
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
          expect(JSON.parse(response.payload).id).to.equal('challengerec1234567');
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

        it('should return a 204 status code', async function () {
          expect(response.statusCode).to.equal(204);
        });
        it('should return an empty payload', async function () {
          expect(response.payload).to.be.empty;
        });
      });
    });
  });
});
