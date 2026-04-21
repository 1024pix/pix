import { createServer } from '../../../../../server.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Team | Application | Route | organization-member-identities', function () {
  let server;

  describe('GET /api/organizations/{id}/member-identities', function () {
    it('returns the members identities as JSON API', async function () {
      // given
      server = await createServer();
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const member1 = databaseBuilder.factory.buildUser();
      const member2 = databaseBuilder.factory.buildUser();
      const otherOrganizationMember = databaseBuilder.factory.buildUser();

      databaseBuilder.factory.buildMembership({ userId: member1.id, organizationId });
      databaseBuilder.factory.buildMembership({ userId: member2.id, organizationId });
      databaseBuilder.factory.buildMembership({
        userId: otherOrganizationMember.id,
        organizationId: otherOrganizationId,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/organizations/${organizationId}/member-identities`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: member1.id }),
      });

      // then
      const expectedResult = {
        data: [
          {
            attributes: {
              'first-name': member1.firstName,
              'last-name': member1.lastName,
            },
            id: member1.id.toString(),
            type: 'member-identities',
          },
          {
            attributes: {
              'first-name': member2.firstName,
              'last-name': member2.lastName,
            },
            id: member2.id.toString(),
            type: 'member-identities',
          },
        ],
      };
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedResult);
    });
  });
});
