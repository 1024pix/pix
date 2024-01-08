import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';

describe('Acceptance | Controller | session-controller-get-attendance-sheet', function () {
  describe('GET /api/sessions/{id}/attendance-sheet', function () {
    it('should respond with a 200 when session can be found', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildOrganization({ externalId: 'EXT1234' });
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId: 'EXT1234' }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: user.id, certificationCenterId });

      const otherUserId = databaseBuilder.factory.buildUser().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: otherUserId,
        certificationCenterId: otherCertificationCenterId,
      });

      const sessionIdAllowed = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      databaseBuilder.factory.buildCertificationCandidate({ sessionId: sessionIdAllowed });

      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const options = {
        method: 'GET',
        url: `/api/sessions/${sessionIdAllowed}/attendance-sheet`,
        payload: {},
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
