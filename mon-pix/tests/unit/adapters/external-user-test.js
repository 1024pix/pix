import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | external-user', function() {
  setupTest();

  let adapter;

  beforeEach(function() {
    adapter = this.owner.lookup('adapter:external-user');
  });

  describe('#urlForCreateRecord', () => {

    it('should redirect to /api/schooling-registration-dependent-users/external-user-token', async function() {
      // when
      const url = await adapter.urlForCreateRecord();

      // then
      expect(url.endsWith('/schooling-registration-dependent-users/external-user-token')).to.be.true;
    });
  });
});
