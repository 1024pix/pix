import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { expect } from 'chai';

describe('Unit | Adapters | reset-expired-password-demand', function () {
  setupTest();

  describe('#buildUrl', function () {
    it('should build url', function () {
      // when
      const adapter = this.owner.lookup('adapter:reset-expired-password-demand');
      const url = adapter.buildURL();

      // then
      expect(url.endsWith('api/')).to.be.true;
    });
  });
});
