import { samlController } from '../../../../../src/identity-access-management/application/saml/saml.controller.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { RequestedApplication } from '../../../../../src/identity-access-management/infrastructure/utils/network.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | Authentication', function () {
  describe('#authenticateForSaml', function () {
    it('returns an access token', async function () {
      // given
      const accessToken = 'jwt.access.token';
      const user = {
        username: 'saml.jackson1234',
        password: 'Pix123',
      };
      const externalUserToken = 'SamlJacksonToken';
      const expectedUserId = 1;
      const audience = 'https://app.pix.fr';
      const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.fr' });

      const request = {
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.pix.fr',
        },
        payload: {
          data: {
            attributes: {
              username: user.username,
              password: user.password,
              'external-user-token': externalUserToken,
              'expected-user-id': expectedUserId,
            },
            type: 'external-user-authentication-requests',
          },
        },
      };

      sinon
        .stub(usecases, 'authenticateForSaml')
        .withArgs({
          username: user.username,
          password: user.password,
          externalUserToken,
          expectedUserId,
          audience,
          requestedApplication,
        })
        .resolves(accessToken);

      // when
      const response = await samlController.authenticateForSaml(request, hFake);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.source.data.attributes['access-token']).to.equal(accessToken);
    });
  });
});
