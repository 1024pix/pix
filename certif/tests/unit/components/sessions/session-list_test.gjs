import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | session-list', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:sessions/session-list');
  });

  module('#currentLocale', function () {
    test('should set currentLocale to primaryLocale', async function (assert) {
      // given
      class IntlStub extends Service {
        primaryLocale = 'fr';
      }
      this.owner.register('service:intl', IntlStub);

      // when
      const locale = await component.currentLocale;

      // then
      assert.strictEqual(locale, 'fr');
    });
  });
});
