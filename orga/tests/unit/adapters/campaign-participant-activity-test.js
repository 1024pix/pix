import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | campaign-participant-activity', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:campaign-participant-activity');
    ajaxStub = sinon.stub().resolves();
    adapter.ajax = ajaxStub;
  });

  module('#query', () => {
    test('should call url with campaign id, without it in query params', async function (assert) {
      // given
      const query = { campaignId: 'campaignId1', page: { number: 2 } };

      // when
      await adapter.query(null, { modelName: 'campaign-participant-activity' }, query);

      // then
      const [url, method, options] = ajaxStub.firstCall.args;
      assert.true(url.endsWith('/api/campaigns/campaignId1/participants-activity'));
      assert.strictEqual(method, 'GET');
      assert.deepEqual(options, { data: { page: { number: 2 } } });
      assert.deepEqual(query, { campaignId: 'campaignId1', page: { number: 2 } });
    });
  });

  module('#urlForDeleteRecord', () => {
    test('should build query url from adapterOptions', async function (assert) {
      const adapterOptions = { campaignId: 'campaignId1', campaignParticipationId: 'campaignParticipationId1' };
      const url = await adapter.urlForDeleteRecord(null, null, { adapterOptions });

      assert.ok(url.endsWith('/api/campaigns/campaignId1/campaign-participations/campaignParticipationId1'));
    });
  });
});
