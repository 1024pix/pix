import { expect } from 'chai';
import sinon from 'sinon';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | LTI | Domain | Model | LtiPlatformRegistration', function () {
  describe('#fetchPlatformOpenIdConfig', function () {
    it('should fetch platform config using httpAgent', async function () {
      // given
      const ltiPlatformRegistration = domainBuilder.lti.buildLtiPlatformRegistration();
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

  describe('#frameAncestorsForCspHeader', function () {
    it('returns frame-ancestors for Content-Security-Policy header', async function () {
      // given
      const ltiPlatformRegistration = domainBuilder.lti.buildLtiPlatformRegistration({
        platform: domainBuilder.lti.buildLtiPlatform({
          issuer: 'https://moodle.example.com/issuer/path',
        }),
      });

      // when
      const frameAncestors = ltiPlatformRegistration.frameAncestorsForCspHeader;

      // then
      expect(frameAncestors).to.equal('frame-ancestors https://moodle.example.com;');
    });
  });
});
