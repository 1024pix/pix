import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapter | student information', function() {
  setupTest();

  describe('#urlForCreateRecord', () => {

    it('should call /api/schooling-registration-dependent-users/recover-account', async function() {
      // given
      const adapter = this.owner.lookup('adapter:student-information');

      // when
      const url = await adapter.urlForCreateRecord();

      // then
      expect(url.endsWith('/schooling-registration-dependent-users/recover-account')).to.be.true;
    });
  });
});
