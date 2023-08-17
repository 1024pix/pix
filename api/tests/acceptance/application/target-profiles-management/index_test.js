import { createServer } from '../../../../server.js';
import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';

describe('Acceptance | Route | target-profiles-management', function () {
  describe('DELETE /api/admin/target-profiles/{id}/detach-organizations', function () {
    it('should return 200 after successfully detaching organizations from target profile', async function () {
      // given
      const server = await createServer();
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const user = databaseBuilder.factory.buildUser.withRole();
      const organization1Id = databaseBuilder.factory.buildOrganization().id;
      const organization2Id = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId: organization1Id });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId: organization2Id });

      await databaseBuilder.commit();

      const options = {
        method: 'DELETE',
        url: `/api/admin/target-profiles/${targetProfileId}/detach-organizations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            attributes: {
              'organization-ids': [organization1Id, organization2Id],
            },
          },
        },
      };

      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
