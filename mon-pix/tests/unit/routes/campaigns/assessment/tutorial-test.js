import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | campaigns | evaluation | tutorial', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    test('should initialize tutorial page with the first one', async function (assert) {
      // given
      const route = this.owner.lookup('route:campaigns.assessment.tutorial');
      const params = { code: 'AZERTY' };
      route.paramsFor = sinon.stub().returns(params);

      // when
      const tutorialPageModel = route.model();

      // then
      assert.strictEqual(tutorialPageModel.campaignCode, 'AZERTY');
    });
  });
});
