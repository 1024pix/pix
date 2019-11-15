const { databaseBuilder, expect, generateValidRequestAuthorizationHeader } = require('../../test-helper');

const createServer = require('../../../server');

describe('Acceptance | Controller | sessions-controller', () => {

  let options;
  let server;
  let userId;
  let certificationCenterId;
  let sessionId;

  const sessionDomain = {
    accessCode: 'ABC123',
    address: '42 rue des anges',
    certificationCenter: 'Tour Gamma',
    date: '2012-12-12',
    description: 'Désobéissance civile',
    examiner: 'Forster Nakamura',
    room: 'B',
    time: '14:40:00',
    status: 'created',
  };

  beforeEach(async () => {
    server = await createServer();

    options = {
      method: 'PUT',
      payload: {},
      headers: {},
    };
  });

  afterEach(() => {
    return databaseBuilder.clean();
  });

  describe('PUT /sessions/{id}/finalization', () => {

    describe('Resource access management', () => {

      it('should respond with a 401 Forbidden if the user is not authenticated', async () => {
        // given
        userId = databaseBuilder.factory.buildUser().id;
        sessionId = databaseBuilder.factory.buildSession(sessionDomain).id;

        options.headers.authorization = 'invalid.access.token';
        options.url = `/api/sessions/${sessionId}/finalization`;

        await databaseBuilder.commit();

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

      it('should respond with a 403 Unauthorized the if user is not authorized', async () => {
        // given
        userId = databaseBuilder.factory.buildUser().id;
        sessionId = databaseBuilder.factory.buildSession(sessionDomain).id;

        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.url = `/api/sessions/${sessionId}/finalization`;

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    describe('Success case', () => {

      it('should return the serialized updated session', async () => {
        // given
        userId = databaseBuilder.factory.buildUser().id;
        certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        sessionId = databaseBuilder.factory.buildSession({ ...sessionDomain, ...{ certificationCenterId } }).id;

        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.url = `/api/sessions/${sessionId}/finalization`;

        // when
        const promise = server.inject(options);

        const expectedSessionJSONAPI = {
          data: {
            type: 'sessions',
            id: sessionId + '',
            attributes: {
              'access-code': sessionDomain.accessCode,
              'address': sessionDomain.address,
              'certification-center': sessionDomain.certificationCenter,
              'description': sessionDomain.description,
              'examiner': sessionDomain.examiner,
              'date': sessionDomain.date,
              'time': sessionDomain.time,
              'room': sessionDomain.room,
              'status': 'completed',
            },
          },
        };

        // then
        return promise.then((response) => {
          expect(response.result.data).to.deep.equal(expectedSessionJSONAPI.data);
          expect(response.statusCode).to.equal(200);
        });
      });
    });
  });
});
