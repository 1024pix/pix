import { createServer } from '../../../../../server.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | session-controller-get-invigilator-kit-pdf', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/sessions/{id}/invigilator-kit', function () {
    let user, sessionIdAllowed;

    beforeEach(async function () {
      // given
      user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildOrganization({ externalId: 'EXT1234' });
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId: 'EXT1234' }).id;

      const otherUserId = databaseBuilder.factory.buildUser().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: otherUserId,
        certificationCenterId: otherCertificationCenterId,
      });

      sessionIdAllowed = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      databaseBuilder.factory.buildInvigilatorAccess({ userId: user.id, sessionId: sessionIdAllowed });

      await databaseBuilder.commit();
    });

    it('should respond with a 200 when session can be found', async function () {
      // when
      const options = {
        method: 'GET',
        url: `/api/sessions/${sessionIdAllowed}/invigilator-kit`,
        payload: {},
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
