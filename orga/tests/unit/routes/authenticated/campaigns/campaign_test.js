import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/campaign', function (hooks) {
  setupTest(hooks);

  test('should redirect to not-found page', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/campaigns/campaign');
    const store = this.owner.lookup('service:store');
    const params = { campaign_id: 'liste' };
    const expectedRedirection = 'not-found';

    sinon.stub(store, 'findRecord');
    store.findRecord.rejects({ errors: [{ status: '400' }] });
    sinon.stub(route.router, 'replaceWith');

    // when
    await route.model(params);

    // then
    assert.ok(route.router.replaceWith.calledWith(expectedRedirection));
  });
});
