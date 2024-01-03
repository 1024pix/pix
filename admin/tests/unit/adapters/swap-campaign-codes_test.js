import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | SwapCampaignCode', function (hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:swap-campaign-code');
    adapter.ajax = sinon.stub();
  });

  module('#swap', function () {
    test('should add organization IDs inside the request', function (assert) {
      // when
      const payload = { firstCampaignId: 10, secondCampaignId: 18 };
      adapter.swap(payload);
      // then
      assert.ok(
        adapter.ajax.calledWithExactly('http://localhost:3000/api/admin/campaigns/swap-codes', 'POST', {
          data: payload,
        }),
      );
    });
  });
});
