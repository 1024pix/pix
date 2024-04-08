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

  module('campaignScopeCriterion', function () {
    test('returns null if campaign scope criterion does not exist', function (assert) {
      // given & when
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: {
          criteria: [{ isCappedTubesScope: true }],
        },
      };

      // then
      assert.strictEqual(component.campaignScopeCriterion, null);
    });

    test('returns the badge criterion if it exists', function (assert) {
      // given & when
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: {
          criteria: [{ isCampaignScope: true }, { isCappedTubesScope: true }],
        },
      };

      // then
      assert.deepEqual(component.campaignScopeCriterion, component.args.badge.criteria[0]);
    });
  });

  module('cappedTubesCriteria', function () {
    test('returns an empty array if capped tubes criterion does not exist', function (assert) {
      // given & when
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: {
          criteria: [{ isCampaignScope: true }],
        },
      };

      // then
      assert.deepEqual(component.cappedTubesCriteria, []);
    });

    test('returns an array of cappedTubesCriteria if they exist', function (assert) {
      // given & when
      const component = createComponent('component:badges/badge');
      component.args = {
        badge: {
          criteria: [{ isCappedTubesScope: true }, { isCappedTubesScope: true }, { isCampaignScope: true }],
        },
      };

      // then
      assert.deepEqual(component.cappedTubesCriteria, [
        component.args.badge.criteria[0],
        component.args.badge.criteria[1],
      ]);
    });
  });
});
