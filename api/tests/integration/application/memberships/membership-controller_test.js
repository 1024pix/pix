import * as moduleUnderTest from '../../../../lib/application/memberships/index.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { domainBuilder, expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Integration | Application | Memberships | membership-controller', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(usecases, 'disableMembership');
    sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('#disable', function () {
    it('should return a 204 HTTP response', async function () {
      // given
      const membershipId = domainBuilder.buildMembership().id;
      usecases.disableMembership.resolves();
      securityPreHandlers.checkUserIsAdminInOrganization.callsFake((request, h) => h.response(true));

      // when
      const response = await httpTestServer.request('POST', `/api/memberships/${membershipId}/disable`);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
