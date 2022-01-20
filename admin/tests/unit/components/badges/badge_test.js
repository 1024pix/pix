import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit |  Component | Badges | badge', function (hooks) {
  setupTest(hooks);

  module('isCertifiable', function () {
    test('returns color and text when is certifiable', function (assert) {
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: { isCertifiable: true },
      };

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.isCertifiableColor, 'green');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.isCertifiableText, 'Certifiable');
    });
  });

  module('isAlwaysVisible', function () {
    test('returns color and text when is always visible', function (assert) {
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: { isAlwaysVisible: true },
      };
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.isAlwaysVisibleColor, 'green');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.isAlwaysVisibleText, 'Lacunes');
    });
  });
});
