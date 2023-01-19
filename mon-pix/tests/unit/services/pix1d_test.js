import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | pix1d', function (hooks) {
  setupTest(hooks);
  let pix1dService;

  hooks.beforeEach(async function () {
    // given
    pix1dService = this.owner.lookup('service:pix1d');
    sinon.stub(pix1dService.router, 'transitionTo');
  });

  module('#transition', function () {
    test('When the code campaign exists', async function (assert) {
      await pix1dService.transition('NTNSFE441', 50);
      sinon.assert.calledWith(pix1dService.router.transitionTo, 'campaigns');
      assert.ok(true);
    });

    test('When the code campaign does not exist', async function (assert) {
      await pix1dService.transition('null', 50);
      sinon.assert.calledWith(pix1dService.router.transitionTo, 'fill-in-campaign-code');
      assert.ok(true);
    });
  });
});
