import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapter | account recovery demand', function () {
  setupTest();

  describe('#buildURL', function () {
    it('should build recovery account demand base URL when called with according requestType', function () {
      // when
      const adapter = this.owner.lookup('adapter:account-recovery-demand');
      const url = adapter.buildURL(123, 'account-recovery-demand', null, 'send-account-recovery-demand');

      // then
      expect(url.endsWith('api/')).to.be.true;
    });
  });
});
