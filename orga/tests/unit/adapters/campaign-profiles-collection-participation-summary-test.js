import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | campaign-profiles-collection-participation-summary', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:campaign-profiles-collection-participation-summary');
    ajaxStub = sinon.stub().resolves();
    adapter.ajax = ajaxStub;
  });

  module('#query', function () {
    test('should call url with campaign id, without it in query filter', async function (assert) {
      // given
      const query = { filter: { campaignId: 1, divisions: ['3A'] }, page: { number: 2 } };

      // when
      await adapter.query(null, { modelName: 'campaign-profiles-collection-participation-summary' }, query);

      // then
      const [url, method, options] = ajaxStub.firstCall.args;
      assert.true(url.endsWith('/campaigns/1/profiles-collection-participations'));
      assert.strictEqual(method, 'GET');
      assert.deepEqual(options, { data: { filter: { divisions: ['3A'] }, page: { number: 2 } } });
      assert.deepEqual(query, { filter: { campaignId: 1, divisions: ['3A'] }, page: { number: 2 } });
    });
  });
});
