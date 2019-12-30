const { databaseBuilder, expect, generateValidRequestAuthorizationHeader } = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | sessions-controller', () => {

  let options;
  let server;
  let session;
  const examinerComment = 'It was a fine session my dear';

  beforeEach(async () => {
    server = await createServer();
    session = databaseBuilder.factory.buildSession({ status: 'started' });
    const candidate1Id = databaseBuilder.factory.buildCertificationCandidate({ sessionId: session.id }).id;
    const candidate2Id = databaseBuilder.factory.buildCertificationCandidate({ sessionId: session.id }).id;

    options = {
      method: 'PUT',
      payload: {
        data: {
          attributes: {
            'examiner-comment': examinerComment,
          },
          included: [
            {
              id: candidate1Id,
              type: 'certification-candidates',
              attributes: {
                'has-seen-end-test-screen': false,
                'examiner-comment': 'What a fine lad this one',
              },
            },
            {
              id: candidate2Id,
              type: 'certification-candidates',
              attributes: {
                'has-seen-end-test-screen': true,
                'examiner-comment': 'What a fine lad this two',
              },
            },
          ],
        },
      },
      headers: {},
      url: `/api/sessions/${session.id}/finalization`,
    };

    return databaseBuilder.commit();
  });

  describe('PUT /sessions/{id}/finalization', () => {

    describe('Resource access management', () => {

      it('should respond with a 401 Forbidden if the user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 404 NotFound the if user is not authorized (to keep opacity on whether forbidden or not found)', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    describe('Success case', () => {

      it('should return the serialized updated session', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId: session.certificationCenterId });
        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        const expectedSessionJSONAPI = {
          data: {
            type: 'sessions',
            id: session.id.toString(),
            attributes: {
              'access-code': session.accessCode,
              'address': session.address,
              'certification-center': session.certificationCenter,
              'description': session.description,
              'examiner': session.examiner,
              'date': session.date,
              'time': session.time,
              'room': session.room,
              'status': 'finalized',
              'examiner-comment': examinerComment,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data).to.deep.equal(expectedSessionJSONAPI.data);
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
