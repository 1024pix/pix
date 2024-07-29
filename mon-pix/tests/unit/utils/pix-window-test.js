import { setupTest } from 'ember-qunit';
import PixWindow from 'mon-pix/utils/pix-window';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Utilities | pix-window', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('GET window.location.hash', function () {
    test('returns the hash found in the URL', function (assert) {
      // given
      sinon.stub(PixWindow, 'getLocationHash').returns('#hash');

      // when
      const hash = PixWindow.getLocationHash();

      // then
      assert.strictEqual(hash, '#hash');
    });
  });

  module('GET window.location.hostname', function () {
    test('returns the hostname', function (assert) {
      // given
      sinon.stub(PixWindow, 'getLocationHostname').returns('pix.fr');

      // when
      const hash = PixWindow.getLocationHostname();

      // then
      assert.strictEqual(hash, 'pix.fr');
    });
  });

  module('GET window.location.href', function () {
    test('returns an URL', function (assert) {
      // given
      sinon.stub(PixWindow, 'getLocationHref').returns('http://domain.com/timely#hash');

      // when
      const url = PixWindow.getLocationHref();

      // then
      assert.strictEqual(url, 'http://domain.com/timely#hash');
    });
  });
});
