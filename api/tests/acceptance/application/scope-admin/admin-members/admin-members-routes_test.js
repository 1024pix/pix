const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../../test-helper');
const createServer = require('../../../../../server');
const { ROLES } = require('../../../../../lib/domain/constants').PIX_ADMIN;

describe('Acceptance | Application | Admin-members | Routes', function () {
  describe('POST /api/admin/admin-members', function () {
    context('when admin member has role "SUPER_ADMIN"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        const adminMemberWithRoleSuperAdmin = databaseBuilder.factory.buildUser.withRole({
          firstName: 'jaune',
          lastName: 'attends',
          email: 'jaune.attends@example.net',
          password: 'j@Un3@Tt3nds',
          role: ROLES.SUPER_ADMIN,
        });
        const user = databaseBuilder.factory.buildUser({
          id: 1101,
          firstName: '11',
          lastName: '01',
          email: '11.01@example.net',
        });
        await databaseBuilder.commit();
        const server = await createServer();

        // when
        const { statusCode } = await server.inject({
          headers: {
            authorization: generateValidRequestAuthorizationHeader(adminMemberWithRoleSuperAdmin.id),
          },
          method: 'POST',
          url: '/api/admin/admin-members',
          payload: {
            data: {
              attributes: {
                email: user.email,
                role: ROLES.CERTIF,
              },
            },
          },
        });

        // then
        expect(statusCode).to.equal(200);
      });
    });
  });
});
