import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | CampaignAssessmentResultMinimal', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:campaign-assessment-result-minimal');
    const ajaxStub = () => resolve();
    adapter.ajax = ajaxStub;
  });

  module('#urlForQuery', function () {
    test('should build url with filter and campaign id', async function (assert) {
      // when
      const query = { campaignId: 1 };
      const url = await adapter.urlForQuery(query);

      // then
      assert.true(url.endsWith(`/campaigns/${1}/assessment-results`));
      assert.strictEqual(query.campaignId, undefined);
    });
  });
});
