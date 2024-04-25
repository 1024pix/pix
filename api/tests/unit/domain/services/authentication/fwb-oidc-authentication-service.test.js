import { FwbOidcAuthenticationService } from '../../../../../lib/domain/services/authentication/fwb-oidc-authentication-service.js';
import { config as settings } from '../../../../../src/shared/config.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Services | fwb-oidc-authentication-service', function () {
  describe('#constructor', function () {
    describe('when additionalRequiredProperties is not defined', function () {
      it('is not ready', async function () {
        // when
        const fwbOidcAuthenticationService = new FwbOidcAuthenticationService({
          ...settings.oidcExampleNet,
          identityProvider: 'FWB',
          organizationName: 'Fédération Wallonie-Bruxelles',
          shouldCloseSession: true,
          slug: 'fwb',
          source: 'fwb',
        });

        // then
        expect(fwbOidcAuthenticationService.isReady).to.be.false;
      });
    });
  });
});
