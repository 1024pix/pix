import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapter | account recovery demand', function() {
  setupTest();

  describe('#urlForCreateRecord', function() {

    it('should build recover account base URL when called with according requestType', async function() {
      // when
      const adapter = this.owner.lookup('adapter:student-information');
      const url = await adapter.urlForCreateRecord('account-recovery');
      console.log(url);
      // then
      expect(url.endsWith('/account-recovery')).to.be.true;
    });
  });
});
