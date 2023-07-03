import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { PIX_ADMIN } from '../../../../lib/domain/constants.js';

const { ROLES } = PIX_ADMIN;

let server;

describe('Acceptance | Application | campaign-controller-create-campaigns', function () {
  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/campaigns', function () {
    context('when user is SuperAdmin', function () {
      let userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPER_ADMIN }).id;
        await databaseBuilder.commit();
      });

      it('creates campaigns', async function () {
        const options = {
          method: 'POST',
          url: '/api/admin/campaigns',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(204);
      });
    });

    context('when user is not SuperAdmin', function () {
      let userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.METIER }).id;
        await databaseBuilder.commit();
      });

      it('does not create campaigns', async function () {
        const options = {
          method: 'POST',
          url: '/api/admin/campaigns',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
