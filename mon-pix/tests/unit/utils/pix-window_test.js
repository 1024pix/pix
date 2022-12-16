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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(url, 'http://domain.com/timely#hash');
    });
  });

  module('GET window.location.hash', function () {
    test('should return the hash found in the URL', function (assert) {
      // given
      sinon.stub(PixWindow, 'getLocationHash').returns('#hash');

      // when
      const hash = PixWindow.getLocationHash();

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(hash, '#hash');
    });
  });
});
