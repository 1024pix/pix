const {
  expect, generateValidRequestAuthorizationHeader, databaseBuilder,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('PUT /api/sessions/:id/sent-to-prescriber', () => {

  let server;
  let options;

  beforeEach(async () => {
    server = await createServer();
  });

  context('User does not have the role PIX MASTER', () => {

    beforeEach(async () => {
      // given
      const user = databaseBuilder.factory.buildUser();
      const authHeader = generateValidRequestAuthorizationHeader(user.id);
      const token = authHeader.replace('Bearer ', '');
      const headers = { 'authorization': `Bearer ${token}` };
      options = {
        method: 'PUT',
        url: '/api/sessions/1/sent-to-prescriber',
        headers,
      };

      return databaseBuilder.commit();
    });

    it('will shut me down ', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

  });

  context('User has role PixMaster', () => {
    let sessionWithAlreadyADateId;
    let sessionWithoutADateId;

    beforeEach(async () => {
      // given
      const user = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      sessionWithAlreadyADateId = databaseBuilder.factory.buildSession({ sentToPrescriberAt: new Date() }).id;
      sessionWithoutADateId = databaseBuilder.factory.buildSession().id;

      const authHeader = generateValidRequestAuthorizationHeader(user.id);
      const token = authHeader.replace('Bearer ', '');
      const headers = Object.assign({}, { 'authorization': `Bearer ${token}` });
      options = {
        method: 'PUT',
        headers,
      };

      return databaseBuilder.commit();
    });

    it('should return an 404 status when the session doesn\'t exist', async () => {
      // given
      options.url = `/api/sessions/${sessionWithAlreadyADateId + sessionWithoutADateId}/sent-to-prescriber`;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return an 201 status when the session sentToPrescriberAt already exists', async () => {
      // given 
      options.url = `/api/sessions/${sessionWithAlreadyADateId}/sent-to-prescriber`;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should return an 200 status when the session sentToPrescriberAt does not exist', async () => {
      // given 
      options.url = `/api/sessions/${sessionWithoutADateId}/sent-to-prescriber`;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

});
