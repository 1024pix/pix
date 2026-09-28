import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | campaign-profile', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:campaign-profile');
    ajaxStub = sinon.stub().resolves();
    adapter.ajax = ajaxStub;
  });

  module('#queryRecord', function () {
    test('should call url with campaign and campaign participation, without them in query params', async function (assert) {
      // given
      const query = { campaignId: 'campaignId1', campaignParticipationId: 'campaignParticipationId1' };

      // when
      await adapter.queryRecord(null, { modelName: 'campaign-profile' }, query);

      // then
      const [url, method, options] = ajaxStub.firstCall.args;
      assert.true(
        url.endsWith('/api/campaigns/campaignId1/profiles-collection-participations/campaignParticipationId1'),
      );
      assert.strictEqual(method, 'GET');
      assert.deepEqual(options, { data: {} });
      assert.deepEqual(query, { campaignId: 'campaignId1', campaignParticipationId: 'campaignParticipationId1' });
    });
  });
});
