import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | campaign-participation-overviews', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:campaign-participation-overview');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForQueryRecord', function () {
    test('should query campaign-participation-overviews with adapterOptions', async function (assert) {
      // given
      const params = {
        userId: 1,
        'page[number]': 1,
        'page[size]': 5,
        'filter[states][]': 'ONGOING',
      };

      const paramsAfterQuery = {
        'page[number]': 1,
        'page[size]': 5,
        'filter[states][]': 'ONGOING',
      };

      // when
      const url = await adapter.urlForQuery(params, 'campaign-participation-overview');

      // then
      assert.deepEqual(params, paramsAfterQuery);
      assert.true(url.endsWith('/api/users/1/campaign-participation-overviews'));
    });
  });
});
