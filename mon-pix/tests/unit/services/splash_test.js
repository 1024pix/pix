import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

function createSplash() {
  const splash = document.createElement('div');
  splash.setAttribute('id', 'app-splash');
  document.body.appendChild(splash);
}

function removeSplash() {
  const splash = document.getElementById('app-splash');
  if (splash) {
    splash.parentNode.removeChild(splash);
  }
}

function hasSplash() {
  return document.getElementById('app-splash') != null;
}

module('Unit | Service | splash', function (hooks) {
  setupTest(hooks);

  module('#hide', function (hooks) {
    module('when a splash is present in the DOM', function () {
      test('removes the splash from the DOM', function (assert) {
        // Given
        const splash = this.owner.lookup('service:splash');
        createSplash();
        assert.true(hasSplash());
        // When
        splash.hide();
        // Then
        assert.false(hasSplash());
      });
    });

    module('when there is no splash', function () {
      test('does nothing', function (assert) {
        // Given
        const splash = this.owner.lookup('service:splash');
        assert.false(hasSplash());
        // When
        splash.hide();
        // Then
        assert.false(hasSplash());
      });
    });

    hooks.afterEach(function () {
      removeSplash();
    });
  });
});
