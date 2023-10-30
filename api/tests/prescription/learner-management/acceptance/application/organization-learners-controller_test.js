import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';

describe('Acceptance | Controller | organization-learners-management', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('DELETE /organizations/{id}/organization-learners', function () {
    let options;

    it('should return a 200 status after having successfully deleted organization learners', async function () {
      // given
      const { id: firstOrganizationLearnerId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
      const secondOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId, organizationRole: 'ADMIN' });

      await databaseBuilder.commit();

      options = {
        method: 'DELETE',
        url: `/api/organizations/${organizationId}/organization-learners`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
        payload: {
          listLearners: [firstOrganizationLearnerId, secondOrganizationLearnerId],
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
