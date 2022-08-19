import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { expect } from 'chai';

describe('Unit | Adapters | user-oidc-authentication-request', function () {
  setupTest();

  describe('#buildUrl', function () {
    it('should build url', function () {
      // when
      const adapter = this.owner.lookup('adapter:user-oidc-authentication-request');
      const url = adapter.buildURL();

      // then
      expect(url.endsWith('user/')).to.be.true;
    });
  });
});
