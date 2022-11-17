import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';
import sinon from 'sinon';

describe('Unit | Component | action-chip', function () {
  setupTest();

  describe('triggerAction', function () {
    it('should trigger the triggerAction when triggerAction is called and isTriggering is false', async function () {
      // given
      const triggerAction = sinon.spy();
      const component = createGlimmerComponent('component:action-chip', { triggerAction });
      component.isTriggering = false;

      // when
      await component.triggerAction();

      // then
      sinon.assert.calledOnce(triggerAction);
    });

    it('should not trigger the triggerAction when triggerAction is called and isTriggering is true', async function () {
      // given
      const triggerAction = sinon.spy();
      const component = createGlimmerComponent('component:action-chip', { triggerAction });
      component.isTriggering = true;

      // when
      await component.triggerAction();

      // then
      sinon.assert.notCalled(triggerAction);
    });
  });
});
