const {
  expect, generateValidRequestAuthorizationHeader, databaseBuilder,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('PUT /api/sessions/:id/results-sent-to-prescriber', () => {
  let server;
  const options = { method: 'PUT' };
  let userId;

  beforeEach(async () => {
    server = await createServer();
  });

  context('when user does not have the role PIX MASTER', () => {

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    it('should return a 403 error code', async () => {
      // given
      options.url = '/api/sessions/12/results-sent-to-prescriber';
      options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

  });

  context('when user has role PixMaster', () => {

    beforeEach(() => {
      // given
      userId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
      return databaseBuilder.commit();
    });

    context('when the session id has an invalid format', () => {

      it('should return a 400 error code', async () => {
        // given
        options.url = '/api/sessions/any/results-sent-to-prescriber';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when the session id is a number', () => {

      context('when the session does not exist', () => {

        it('should return a 404 error code', async () => {
          // given
          options.url = '/api/sessions/1/results-sent-to-prescriber';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when the session exists', () => {
        let sessionId;

        context('when the session results were already flagged as sent to prescriber', () => {
          const date = new Date();

          beforeEach(() => {
            // given
            sessionId = databaseBuilder.factory.buildSession({ resultsSentToPrescriberAt: date }).id;
            options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
            return databaseBuilder.commit();
          });

          it('should return a 200 status code', async () => {
            // given
            options.url = `/api/sessions/${sessionId}/results-sent-to-prescriber`;

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(200);
          });

          it('should return the serialized session with an untouched resultsSentToPrescriberAt date', async () => {
            // given
            options.url = `/api/sessions/${sessionId}/results-sent-to-prescriber`;

            // when
            const response = await server.inject(options);

            // then
            expect(response.result.data.attributes['results-sent-to-prescriber-at']).to.deep.equal(date);
          });
        });

        context('when the session results were not flagged as sent to prescriber', () => {

          beforeEach(() => {
            // given
            sessionId = databaseBuilder.factory.buildSession({ resultsSentToPrescriberAt: null }).id;
            options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
            return databaseBuilder.commit();
          });

          it('should return a 201 status code', async () => {
            // given
            options.url = `/api/sessions/${sessionId}/results-sent-to-prescriber`;

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(201);
          });

          it('should return the serialized session with a defined resultsSentToPrescriberAt date', async () => {
            // given
            options.url = `/api/sessions/${sessionId}/results-sent-to-prescriber`;

            // when
            const response = await server.inject(options);

            // then
            expect(response.result.data.attributes['results-sent-to-prescriber-at']).to.be.an.instanceOf(Date);
          });
        });
      });
    });
  });
});
