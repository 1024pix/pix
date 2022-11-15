import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';
import sinon from 'sinon';

module('Unit | Component | action-chip', function (hooks) {
  setupTest(hooks);

  module('triggerAction', function () {
    test('should trigger the triggerAction when triggerAction is called and isTriggering is false', async function (assert) {
      // given
      const triggerAction = sinon.spy();
      const component = createGlimmerComponent('component:action-chip', { triggerAction });
      component.isTriggering = false;

      // when
      await component.triggerAction();

      // then
      sinon.assert.calledOnce(triggerAction);
      assert.ok(true);
    });

    test('should not trigger the triggerAction when triggerAction is called and isTriggering is true', async function (assert) {
      // given
      const triggerAction = sinon.spy();
      const component = createGlimmerComponent('component:action-chip', { triggerAction });
      component.isTriggering = true;

      // when
      await component.triggerAction();

      // then
      sinon.assert.notCalled(triggerAction);
      assert.ok(true);
    });
  });
});
