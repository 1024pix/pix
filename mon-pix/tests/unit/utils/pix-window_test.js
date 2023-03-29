import { module, test } from 'qunit';
import PixWindow from 'mon-pix/utils/pix-window';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Utilities | pix-window', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('GET window.location.href', function () {
    test('should return an URL', function (assert) {
      // given
      sinon.stub(PixWindow, 'getLocationHref').returns('http://domain.com/timely#hash');

      // when
      const url = PixWindow.getLocationHref();

      // then
      assert.strictEqual(url, 'http://domain.com/timely#hash');
    });
  });

  module('GET window.location.hash', function () {
    test('should return the hash found in the URL', function (assert) {
      // given
      sinon.stub(PixWindow, 'getLocationHash').returns('#hash');

      // when
      const hash = PixWindow.getLocationHash();

      // then
      assert.strictEqual(hash, '#hash');
    });
  });
});
