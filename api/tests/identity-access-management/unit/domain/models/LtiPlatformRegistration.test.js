import sinon from 'sinon';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Identity Access Management | Domain | Model | LtiPlatformRegistration', function () {
  describe('#fetchPlatformOpenIdConfig', function () {
    it('should fetch platform config using httpAgent', async function () {
      // given
      const ltiPlatformRegistration = domainBuilder.identityAccessManagement.buildLtiPlatformRegistration();
      const platformOpenIdConfig = Symbol('platformOpenIdConfig');
      const httpAgent = {
        get: sinon.stub().resolves({ data: platformOpenIdConfig }),
      };

      // when
      await ltiPlatformRegistration.fetchPlatformOpenIdConfig({ httpAgent });

      // then
      expect(ltiPlatformRegistration.platformOpenIdConfig).to.equal(platformOpenIdConfig);
    });
  });
});
