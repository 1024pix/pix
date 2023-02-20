import {
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  databaseBuilder,
  sinon,
} from '../../../test-helper';

import createServer from '../../../../server';

describe('Acceptance | API | Certification Center Membership', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('DELETE /api/admin/certification-center-memberships/{id}', function () {
    it('should return 200 HTTP status', async function () {
      // given
      const now = new Date();
      const clock = sinon.useFakeTimers({
        now,
        toFake: ['Date'],
      });
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      }).id;
      await databaseBuilder.commit();

      const options = {
        method: 'DELETE',
        url: `/api/admin/certification-center-memberships/${certificationCenterMembershipId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
      clock.restore();
    });
  });
});
