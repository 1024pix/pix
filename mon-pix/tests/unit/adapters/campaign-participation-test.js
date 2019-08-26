import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | campaign-participation', function() {
  setupTest();

  let adapter;

  beforeEach(function() {
    adapter = this.owner.lookup('adapter:campaign-participation');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#urlForUpdateRecord', () => {
    it('should build update url from campaign-participation id', async function() {
      // when
      const options = { adapterOptions: { } };
      const url = await adapter.urlForUpdateRecord(123, 'campaign-participation', options);

      // then
      expect(url.endsWith('/campaign-participations/123')).to.be.true;
    });

    it('should redirect to start-improvement', async function() {
      // when
      const options = { adapterOptions: { startImprovement: true } };
      const url = await adapter.urlForUpdateRecord(123, 'campaign-participation', options);

      // then
      expect(url.endsWith('/campaign-participations/123/start-improvement')).to.be.true;
    });

  });

});
