import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | campaigns/presentation/steps', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:CampaignsPresentationSteps');
    assert.ok(route);
  });
});
