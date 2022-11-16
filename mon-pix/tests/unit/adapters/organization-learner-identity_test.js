import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | organization-learner-identity', function () {
  setupTest();

  let adapter;

  beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization-learner-identity');
  });

  describe('#urlForQueryRecord', function () {
    it('should redirect to /api/organization-learners', async function () {
      // when
      const url = await adapter.urlForQueryRecord();
      // then
      expect(url.endsWith('/organization-learners')).to.be.true;
    });
  });
});
