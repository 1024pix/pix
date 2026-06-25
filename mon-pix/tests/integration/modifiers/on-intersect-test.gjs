import { render } from '@1024pix/ember-testing-library';
import { clearRender } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import onIntersect from 'mon-pix/modifiers/on-intersect';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Modifier | on-intersect', function (hooks) {
  setupRenderingTest(hooks);

  let observerCallback;
  let observerInstance;

  hooks.beforeEach(function () {
    observerInstance = {
      observe: sinon.stub(),
      disconnect: sinon.stub(),
    };

    window.IntersectionObserver = function (callback) {
      observerCallback = callback;
      return observerInstance;
    };
  });

  hooks.afterEach(function () {
    delete window.IntersectionObserver;
    sinon.restore();
  });

  test('it observes the element on insertion', async function (assert) {
    // given
    const callback = sinon.stub();

    // when
    await render(
      <template>
        <div {{onIntersect callback}}></div>
      </template>,
    );

    // then
    sinon.assert.calledOnce(observerInstance.observe);
    assert.ok(true);
  });

  module('when the element enters the viewport', function () {
    test('it calls the callback', async function (assert) {
      // given
      const callback = sinon.stub();
      await render(
        <template>
          <div {{onIntersect callback}}></div>
        </template>,
      );

      // when
      observerCallback([{ isIntersecting: true }]);

      // then
      sinon.assert.calledOnce(callback);
      assert.ok(true);
    });

    test('it disconnects after the first intersection', async function (assert) {
      // given
      const callback = sinon.stub();
      await render(
        <template>
          <div {{onIntersect callback}}></div>
        </template>,
      );

      // when
      observerCallback([{ isIntersecting: true }]);

      // then
      sinon.assert.calledOnce(observerInstance.disconnect);
      assert.ok(true);
    });
  });

  module('when the element does not intersect the viewport', function () {
    test('it does not call the callback', async function (assert) {
      // given
      const callback = sinon.stub();
      await render(
        <template>
          <div {{onIntersect callback}}></div>
        </template>,
      );

      // when
      observerCallback([{ isIntersecting: false }]);

      // then
      sinon.assert.notCalled(callback);
      assert.ok(true);
    });
  });

  module('when the element is removed from the DOM', function () {
    test('it disconnects the observer', async function (assert) {
      // given
      const callback = sinon.stub();
      await render(
        <template>
          <div {{onIntersect callback}}></div>
        </template>,
      );

      // when
      await clearRender();

      // then
      sinon.assert.calledOnce(observerInstance.disconnect);
      assert.ok(true);
    });
  });
});
