import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | external-user', function () {
  setupTest();

  let adapter;

  beforeEach(function () {
    adapter = this.owner.lookup('adapter:external-user');
  });

  describe('#urlForCreateRecord', function () {
    it('should redirect to /api/sco-organization-learners/external', async function () {
      // when
      const url = await adapter.urlForCreateRecord();

      // then
      expect(url.endsWith('/sco-organization-learners/external')).to.be.true;
    });
  });
});
