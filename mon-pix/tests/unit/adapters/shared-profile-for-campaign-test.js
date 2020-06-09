import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | shared-profile-for-campaign', function() {
  setupTest();

  let adapter;

  beforeEach(function() {
    adapter = this.owner.lookup('adapter:shared-profile-for-campaign');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#urlForQueryRecord', () => {
    it('should build query url from campaign and user ids', async function() {
      const query = { campaignId: 'campaignId1', userId: 'userId1' };
      const url = await adapter.urlForQueryRecord(query);

      expect(url.endsWith('/api/users/userId1/campaigns/campaignId1/profile')).to.be.true;
      expect(query).to.be.empty;
    });
    it('should build default url if no campaign and user ids', async function() {
      const query = { };
      const url = await adapter.urlForQueryRecord(query);

      expect(url.endsWith('/api')).to.be.true;
    });

  });

});
