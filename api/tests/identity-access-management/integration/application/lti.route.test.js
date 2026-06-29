import querystring from 'node:querystring';

import sinon from 'sinon';

import { identityAccessManagementRoutes } from '../../../../src/identity-access-management/application/routes.js';
import { usecases } from '../../../../src/identity-access-management/domain/usecases/index.js';
import { expect } from '../../../test-helper.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

describe('Integration | Identity Access Management | Application | Route | lti', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(identityAccessManagementRoutes);
  });

  describe('when query params are set and use case rejects', function () {
    it('returns HTTP status code 400 with HTML displaying error', async function () {
      // given
      const registerLtiPlatformStub = sinon.stub(usecases, 'registerLtiPlatform');
      const platformConfigurationUrl = 'http://platform/config';
      const registrationToken = 'jwtToken';
      const query = querystring.stringify({
        openid_configuration: platformConfigurationUrl,
        registration_token: registrationToken,
      });
      registerLtiPlatformStub.rejects(new Error('test error'));

      // when
      const response = await httpTestServer.request('GET', `/api/lti/registration?${query}`);

      // then
      expect(response.statusCode).to.equal(400);
      expect(response.result).to.equal(`<!DOCTYPE html>
<html>
  <body>
    <h1>Registration error</h1>
    <p>test error</p>
  </body>
</html>
`);
      expect(registerLtiPlatformStub).to.have.been.calledOnceWithExactly({
        platformConfigurationUrl,
        registrationToken,
      });
    });
  });

  describe('when query params are missing', function () {
    it('returns a response with HTTP status code 400', async function () {
      const response = await httpTestServer.request('GET', '/api/lti/registration');

      expect(response.statusCode).to.equal(400);
    });
  });
});
