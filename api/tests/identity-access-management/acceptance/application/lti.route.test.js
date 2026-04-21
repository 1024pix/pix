import querystring from 'node:querystring';

import * as jose from 'jose';
import nock from 'nock';

import { createServer } from '../../../../server.js';
import { cryptoService } from '../../../../src/shared/domain/services/crypto-service.js';

import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';

describe('Acceptance | Identity Access Management | Route | Admin | lti', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/lti/keys', function () {
    it('returns the list of all active public keys with an HTTP status code 200', async function () {
      // given
      const { publicKey } = databaseBuilder.factory.buildLtiPlatformRegistration();
      const keyPair2 = await cryptoService.generateJSONWebKeyPair();
      databaseBuilder.factory.buildLtiPlatformRegistration({
        clientId: 'pending_client',
        status: 'pending',
        publicKey: keyPair2.publicKey,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: '/api/lti/keys',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal([publicKey]);
    });
  });

  describe('GET /api/lti/registration', function () {
    it('returns an html page acknowledging platform registration with an HTTP status code 200', async function () {
      //given
      const { clientId, platformOpenIdConfig, platformOpenIdConfigUrl, toolConfig } =
        domainBuilder.identityAccessManagement.buildLtiPlatformRegistrationWithPlatformConfig();

      const platformJwt = new jose.UnsecuredJWT({
        sub: clientId,
        scope: 'reg',
      })
        .setIssuedAt()
        .setExpirationTime('1h');

      const { origin: platformOrigin, pathname: platformConfigPath } = new URL(platformOpenIdConfigUrl);
      const platformConfigScope = nock(platformOrigin).get(platformConfigPath).reply(200, platformOpenIdConfig);

      const { pathname: registrationPath } = new URL(platformOpenIdConfig.registration_endpoint);
      const registrationScope = nock(platformOrigin).post(registrationPath).reply(200, toolConfig);

      const query = querystring.stringify({
        openid_configuration: platformOpenIdConfigUrl,
        registration_token: platformJwt.encode(),
      });

      const options = {
        method: 'GET',
        url: `/api/lti/registration?${query}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(
        `<!DOCTYPE html>
<html>
  <body>
    Registration successfull, please wait...
    <script type="text/javascript">
      (window.opener ?? window.parent).postMessage({ subject:'org.imsglobal.lti.close' }, '*');
    </script>
  </body>
</html>
`,
      );

      const registrations = await knex
        .select('clientId', 'platformOrigin', 'status')
        .from('lti_platform_registrations');
      expect(registrations).to.deep.equal([
        { clientId, platformOrigin: platformOpenIdConfig.issuer, status: 'pending' },
      ]);

      expect(platformConfigScope.isDone()).to.be.true;
      expect(registrationScope.isDone()).to.be.true;
    });
  });
});
