const { expect } = require('chai');
const createServer = require('../../../../server');
const { databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const {
  ROLES: { SUPER_ADMIN },
} = require('../../../../lib/domain/constants').PIX_ADMIN;

describe('Acceptance | Controller | scoring-simulator-controller', function () {
  let server;
  let adminAuthorization;

  beforeEach(async function () {
    server = await createServer();

    const { id: adminId } = databaseBuilder.factory.buildUser.withRole({
      role: SUPER_ADMIN,
    });
    adminAuthorization = generateValidRequestAuthorizationHeader(adminId);
    await databaseBuilder.commit();
  });

  describe('#calculateOldScores', function () {
    let options;

    beforeEach(async function () {
      options = {
        method: 'POST',
        url: `/api/scoring-simulator/old`,
        payload: {},
        headers: {},
      };
    });

    it('should return status code 200', async function () {
      // given
      options.headers.authorization = adminAuthorization;

      // when
      const response = await server.inject(options);

      // then
      expect(response).to.have.property('statusCode', 200);
    });

    describe('when there is no connected user', function () {
      it('should return status code 401', async function () {
        // given
        options.headers.authorization = undefined;

        // when
        const response = await server.inject(options);

        // then
        expect(response).to.have.property('statusCode', 401);
      });
    });

    describe('when connected user does not have role SUPER_ADMIN', function () {
      it('should return status code 403', async function () {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response).to.have.property('statusCode', 403);
      });
    });
  });
});
