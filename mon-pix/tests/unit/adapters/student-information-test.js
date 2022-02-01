import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapter | student information', function () {
  setupTest();

  describe('#buildURL', function () {
    it('should build recover account base URL when called with according requestType', function () {
      // when
      const adapter = this.owner.lookup('adapter:student-information');
      const url = adapter.buildURL(123, 'student-information', null, 'account-recovery');

      // then
      expect(url.endsWith('/schooling-registration-dependent-users/')).to.be.true;
    });
  });
});
