import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | CampaignAssessmentResultMinimal', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:campaign-assessment-result-minimal');
    ajaxStub = sinon.stub().resolves();
    adapter.ajax = ajaxStub;
  });

  module('#query', function () {
    test('should call url with campaign id, without it in query params', async function (assert) {
      // given
      const query = { campaignId: 1, filter: { divisions: ['3A'] } };

      // when
      await adapter.query(null, { modelName: 'campaign-assessment-result-minimal' }, query);

      // then
      const [url, method, options] = ajaxStub.firstCall.args;
      assert.true(url.endsWith('/campaigns/1/assessment-results'));
      assert.strictEqual(method, 'GET');
      assert.deepEqual(options, { data: { filter: { divisions: ['3A'] } } });
      assert.deepEqual(query, { campaignId: 1, filter: { divisions: ['3A'] } });
    });
  });
});
