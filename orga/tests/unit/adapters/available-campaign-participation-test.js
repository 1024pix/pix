import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | AvailableCampaignParticipation', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:available-campaign-participation');
    ajaxStub = sinon.stub().resolves();
    adapter.ajax = ajaxStub;
  });

  module('#query', function () {
    test('should call url with campaign id and organization learner id, without them in query params', async function (assert) {
      // given
      const query = { campaignId: 1, organizationLearnerId: 2, page: { number: 1 } };

      // when
      await adapter.query(null, { modelName: 'available-campaign-participation' }, query);

      // then
      const [url, method, options] = ajaxStub.firstCall.args;
      assert.true(url.endsWith('/campaigns/1/organization-learners/2/participations'));
      assert.strictEqual(method, 'GET');
      assert.deepEqual(options, { data: { page: { number: 1 } } });
      assert.deepEqual(query, { campaignId: 1, organizationLearnerId: 2, page: { number: 1 } });
    });
  });
});
