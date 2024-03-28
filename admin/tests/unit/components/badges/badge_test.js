import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Badges | badge', function (hooks) {
  setupTest(hooks);

  module('isCertifiable', function () {
    test('returns color and text when is certifiable', function (assert) {
      // given & when
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: { isCertifiable: true },
      };

      // then
      assert.strictEqual(component.isCertifiableColor, 'tertiary');
      assert.strictEqual(component.isCertifiableText, 'Certifiable');
    });
  });

  module('isAlwaysVisible', function () {
    test('returns color and text when is always visible', function (assert) {
      // given & when
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: { isAlwaysVisible: true },
      };

      // then
      assert.strictEqual(component.isAlwaysVisibleColor, 'tertiary');
      assert.strictEqual(component.isAlwaysVisibleText, 'Lacunes');
    });
  });

  module('cappedTubesCriteriaTitleDisplayIndex', function () {
    test('returns 1 if campaign scope criterion exists', function (assert) {
      // given & when
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: {
          criteria: [{ isCampaignScope: true }, { isCappedTubesScope: true }],
        },
      };

      // then
      assert.strictEqual(component.cappedTubesCriteriaTitleDisplayIndex, 1);
    });

    test('returns 0 if campaign scope criterion does not exist', function (assert) {
      // given & when
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: {
          criteria: [{ isCappedTubesScope: true }],
        },
      };

      // then
      assert.strictEqual(component.cappedTubesCriteriaTitleDisplayIndex, 0);
    });
  });
});
