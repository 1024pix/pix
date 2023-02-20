import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Route | Users', function () {
  describe('GET /api/admin/users/{id}/certification-center-memberships', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const adminUser = databaseBuilder.factory.buildUser.withRole();
      const userId = databaseBuilder.factory.buildUser().id;

      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
        name: 'Centre Takeo',
        type: 'SCO',
        externalId: '1234',
      });

      const certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId,
        disabledAt: null,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/users/${userId}/certification-center-memberships`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUser.id),
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.be.instanceOf(Array);
      expect(response.result.data).to.have.length(1);
      expect(response.result.data[0]).to.have.property('id', certificationCenterMembership.id.toString());
    });
  });
});
