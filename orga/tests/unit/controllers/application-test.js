import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | application', function (hooks) {
  setupTest(hooks);

  test('should call send method', async function (assert) {
    // given
    const controller = this.owner.lookup('controller:application');
    controller.send = sinon.stub();

    // when
    controller.onChangeOrganization();
    // then
    assert.true(controller.send.calledWithExactly('refreshAuthenticatedModel'));
  });
});
