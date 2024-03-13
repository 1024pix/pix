import { setupTest } from 'ember-qunit';
import PixWindow from 'pix-certif/utils/pix-window';
import { module, test } from 'qunit';
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

  module('GET window.location.pathname', function () {
    test('should return the path of the URL', function (assert) {
      // given
      sinon.stub(PixWindow, 'getLocation').returns({ pathname: '/path/name' });

      // when
      const location = PixWindow.getLocation();

      // then
      assert.strictEqual(location.pathname, '/path/name');
    });
  });
});
