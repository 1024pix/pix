import { setupTest } from 'ember-qunit';
import Location from 'pix-admin/utils/location';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../helpers/setup-intl';

module('Unit | Service | url', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  hooks.afterEach(function () {
    Location.getHref.restore();
  });

  module('getApplicationHost', function () {
    module('When Pix App is running on production', function (hooks) {
      hooks.beforeEach(function () {
        sinon.stub(Location, 'getHref').returns('https://admin.pix.fr/');
      });

      test('returns applicationHost app.pix.fr', function (assert) {
        // given
        const service = this.owner.lookup('service:url');

        // when
        const result = service.getApplicationHost('app', '.fr');

        // then
        assert.strictEqual(result, 'app.pix.fr');
      });
    });
  });

  module('When Pix App is running on dev', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(Location, 'getHref').returns('https://admin.dev.pix.fr/');
    });

    test('returns applicationHost app.dev.pix.fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const result = service.getApplicationHost('app', '.fr');

      // then
      assert.strictEqual(result, 'app.dev.pix.fr');
    });
  });
});
