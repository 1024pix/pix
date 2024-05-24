import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated', function (hooks) {
  setupTest(hooks);

  test('should call send method', async function (assert) {
    // given
    const controller = this.owner.lookup('controller:authenticated');
    controller.send = sinon.stub();

    // when
    controller.reloadPlaceStatistics();
    // then
    assert.true(controller.send.calledWithExactly('refreshModel'));
  });
});
