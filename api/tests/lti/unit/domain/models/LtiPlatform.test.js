import { expect } from 'chai';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | LTI | Domain | Model | LtiPlatform', function () {
  describe('get issuerOrigin', function () {
    it('returns platform’s issuer origin', async function () {
      // given
      const ltiPlatform = domainBuilder.lti.buildLtiPlatform({ issuer: 'https://some.platform.net/issuer/path' });

      // when
      const { issuerOrigin } = ltiPlatform;

      // then
      expect(issuerOrigin).to.equal('https://some.platform.net');
    });
  });
});
