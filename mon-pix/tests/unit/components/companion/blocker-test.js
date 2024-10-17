import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Component | Companion | Blocker', function (hooks) {
  setupTest(hooks);

  module('#constructor', function () {
    test('should start checking extension is enabled', function (assert) {
      // given
      const startCheckingExtensionIsEnabledStub = sinon.stub();
      class PixCompanionStub extends Service {
        startCheckingExtensionIsEnabled = startCheckingExtensionIsEnabledStub;
        stopCheckingExtensionIsEnabled = sinon.stub();
        isExtensionEnabled = true;
        addEventListener = sinon.stub();
        removeEventListener = sinon.stub();
      }
      this.owner.register('service:pix-companion', PixCompanionStub);

      // when
      createGlimmerComponent('companion/blocker', { onBlock: undefined });

      // then
      sinon.assert.calledOnce(startCheckingExtensionIsEnabledStub);
      assert.ok(true);
    });

    module('when no onBlock callback is given', function () {
      test('should not add block event listener', function (assert) {
        // given
        const addEventListenerStub = sinon.stub();
        class PixCompanionStub extends Service {
          startCheckingExtensionIsEnabled = sinon.stub();
          stopCheckingExtensionIsEnabled = sinon.stub();
          isExtensionEnabled = true;
          addEventListener = addEventListenerStub;
          removeEventListener = sinon.stub();
        }
        this.owner.register('service:pix-companion', PixCompanionStub);

        // when
        createGlimmerComponent('companion/blocker', { onBlock: undefined });

        // then
        sinon.assert.notCalled(addEventListenerStub);
        assert.ok(true);
      });
    });

    module('when onBlock callback is given', function () {
      test('should add block event listener', function (assert) {
        // given
        const addEventListenerStub = sinon.stub();
        class PixCompanionStub extends Service {
          startCheckingExtensionIsEnabled = sinon.stub();
          stopCheckingExtensionIsEnabled = sinon.stub();
          isExtensionEnabled = true;
          addEventListener = addEventListenerStub;
          removeEventListener = sinon.stub();
        }
        this.owner.register('service:pix-companion', PixCompanionStub);
        const onBlock = sinon.stub();

        // when
        createGlimmerComponent('companion/blocker', { onBlock });

        // then
        sinon.assert.calledWith(addEventListenerStub, 'block', onBlock);
        assert.ok(true);
      });
    });
  });

  module('#willDestroy', function () {
    test('should stop checking extension is enabled', function (assert) {
      // given
      const stopCheckingExtensionIsEnabledStub = sinon.stub();
      class PixCompanionStub extends Service {
        startCheckingExtensionIsEnabled = sinon.stub();
        stopCheckingExtensionIsEnabled = stopCheckingExtensionIsEnabledStub;
        isExtensionEnabled = true;
        addEventListener = sinon.stub();
        removeEventListener = sinon.stub();
      }
      this.owner.register('service:pix-companion', PixCompanionStub);
      const component = createGlimmerComponent('companion/blocker', { onBlock: undefined });

      // when
      component.willDestroy();

      // then
      sinon.assert.calledOnce(stopCheckingExtensionIsEnabledStub);
      assert.ok(true);
    });

    module('when no onBlock callback is given', function () {
      test('should not remove block event listener', function (assert) {
        // given
        const removeEventListenerStub = sinon.stub();
        class PixCompanionStub extends Service {
          startCheckingExtensionIsEnabled = sinon.stub();
          stopCheckingExtensionIsEnabled = sinon.stub();
          isExtensionEnabled = true;
          addEventListener = sinon.stub();
          removeEventListener = removeEventListenerStub;
        }
        this.owner.register('service:pix-companion', PixCompanionStub);
        const component = createGlimmerComponent('companion/blocker', { onBlock: undefined });

        // when
        component.willDestroy();

        // then
        sinon.assert.notCalled(removeEventListenerStub);
        assert.ok(true);
      });
    });

    module('when onBlock callback is given', function () {
      test('should remove block event listener', function (assert) {
        // given
        const removeEventListenerStub = sinon.stub();
        class PixCompanionStub extends Service {
          startCheckingExtensionIsEnabled = sinon.stub();
          stopCheckingExtensionIsEnabled = sinon.stub();
          isExtensionEnabled = true;
          addEventListener = sinon.stub();
          removeEventListener = removeEventListenerStub;
        }
        this.owner.register('service:pix-companion', PixCompanionStub);
        const onBlock = sinon.stub();
        const component = createGlimmerComponent('companion/blocker', { onBlock });

        // when
        component.willDestroy();

        // then
        sinon.assert.calledWith(removeEventListenerStub, 'block', onBlock);
        assert.ok(true);
      });
    });
  });
});
