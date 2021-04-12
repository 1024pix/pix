import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit |  Component | Badges | badge', function(hooks) {
  setupTest(hooks);

  module('isCertifiable', function() {
    test('returns color and text when is certifiable', function(assert) {
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: { isCertifiable: true },
      };

      assert.equal(component.isCertifiableColor, 'green');
      assert.equal(component.isCertifiableText, 'Certifiable');
    });

    test('returns color and text when is not certifiable', function(assert) {
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: { isCertifiable: false },
      };

      assert.equal(component.isCertifiableColor, 'yellow');
      assert.equal(component.isCertifiableText, 'Non certifiable');
    });
  });
});
