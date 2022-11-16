import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | dependent-user', function () {
  setupTest();

  let adapter;

  beforeEach(function () {
    adapter = this.owner.lookup('adapter:dependent-user');
  });

  describe('#urlForCreateRecord', function () {
    it('should redirect to /api/sco-organization-learners/dependent', async function () {
      // when
      const url = await adapter.urlForCreateRecord();

      // then
      expect(url.endsWith('/sco-organization-learners/dependent')).to.be.true;
    });
  });
});
