import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import PixWindow from 'pix-certif/utils/pix-window';
import sinon from 'sinon';

module('Unit | Utilities | pix-window', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('GET window.location', function () {
    test('should return an object', function (assert) {
      // given
      sinon.stub(PixWindow, 'getLocation').returns({});

      // when
      const location = PixWindow.getLocation();

      // then
      assert.deepEqual(location, {});
    });
  });
});
