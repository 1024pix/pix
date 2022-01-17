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

      assert.equal(component.isCertifiableColor, 'green');
      assert.equal(component.isCertifiableText, 'Certifiable');
    });
  });

  module('isAlwaysVisible', function () {
    test.only('returns color and text when is always visible', function (assert) {
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: { isAlwaysVisible: true },
      };

      assert.equal(component.isAlwaysVisibleColor, 'green');
      assert.equal(component.isAlwaysVisibleText, 'Lacunes');
    });
  });
});
