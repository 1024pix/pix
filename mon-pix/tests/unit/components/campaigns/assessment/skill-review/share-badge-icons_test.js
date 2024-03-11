import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../../../helpers/create-glimmer-component';

module('Unit | Component | campaigns | assessment | skill-review | share-badge-icons', function (hooks) {
  setupTest(hooks);

  const possibleBadgesCombinations = [
    { id: 1, isAcquired: true, isCertifiable: true, isValid: true, isAlwaysVisible: true },
    { id: 2, isAcquired: true, isCertifiable: true, isValid: true, isAlwaysVisible: false },
    { id: 3, isAcquired: true, isCertifiable: true, isValid: false, isAlwaysVisible: true },
    { id: 4, isAcquired: true, isCertifiable: true, isValid: false, isAlwaysVisible: false },
    { id: 5, isAcquired: true, isCertifiable: false, isValid: true, isAlwaysVisible: true },
    { id: 6, isAcquired: true, isCertifiable: false, isValid: true, isAlwaysVisible: false },
    { id: 7, isAcquired: true, isCertifiable: false, isValid: false, isAlwaysVisible: true },
    { id: 8, isAcquired: true, isCertifiable: false, isValid: false, isAlwaysVisible: false },
    { id: 9, isAcquired: false, isCertifiable: true, isValid: true, isAlwaysVisible: true },
    { id: 10, isAcquired: false, isCertifiable: true, isValid: true, isAlwaysVisible: false },
    { id: 11, isAcquired: false, isCertifiable: true, isValid: false, isAlwaysVisible: true },
    { id: 12, isAcquired: false, isCertifiable: true, isValid: false, isAlwaysVisible: false },
    { id: 13, isAcquired: false, isCertifiable: false, isValid: true, isAlwaysVisible: true },
    { id: 14, isAcquired: false, isCertifiable: false, isValid: true, isAlwaysVisible: false },
    { id: 15, isAcquired: false, isCertifiable: false, isValid: false, isAlwaysVisible: true },
    { id: 16, isAcquired: false, isCertifiable: false, isValid: false, isAlwaysVisible: false },
  ];

  module('#acquiredAndValidBadges', function () {
    test('should return only acquired and valid badges', async function (assert) {
      // given
      const component = createGlimmerComponent('campaigns/assessment/skill-review/share-badge-icons');
      component.args.badges = possibleBadgesCombinations;

      // when
      const acquiredAndValidBadges = component.acquiredAndValidBadges;

      // then
      assert.deepEqual(acquiredAndValidBadges.length, 4);
      assert.true(acquiredAndValidBadges[0].isAcquired);
      assert.true(acquiredAndValidBadges[0].isValid);
    });

    test('should sort certifiable badges first', async function (assert) {
      // given
      const component = createGlimmerComponent('campaigns/assessment/skill-review/share-badge-icons');
      component.args.badges = possibleBadgesCombinations;

      // when
      const acquiredAndValidBadges = component.acquiredAndValidBadges;

      // then
      assert.deepEqual(acquiredAndValidBadges.length, 4);
      assert.true(acquiredAndValidBadges[0].isCertifiable);
      assert.true(acquiredAndValidBadges[1].isCertifiable);
      assert.false(acquiredAndValidBadges[2].isCertifiable);
      assert.false(acquiredAndValidBadges[3].isCertifiable);
    });
  });

  module('#showBadgeIcons', function () {
    test('should return true if it has at least one badge to show', async function (assert) {
      // given
      const component = createGlimmerComponent('campaigns/assessment/skill-review/share-badge-icons');
      component.args.badges = possibleBadgesCombinations;

      // when
      const showBadgeIcons = component.showBadgeIcons;

      // then
      assert.true(showBadgeIcons);
    });

    test('should return false if it has no acquired badge', async function (assert) {
      // given
      const component = createGlimmerComponent('campaigns/assessment/skill-review/share-badge-icons');
      component.args.badges = possibleBadgesCombinations.filter((badge) => !badge.isAcquired);

      // when
      const showBadgeIcons = component.showBadgeIcons;

      // then
      assert.false(showBadgeIcons);
    });

    test('should return false if it has no valid badge', async function (assert) {
      // given
      const component = createGlimmerComponent('campaigns/assessment/skill-review/share-badge-icons');
      component.args.badges = possibleBadgesCombinations.filter((badge) => !badge.isValid);

      // when
      const showBadgeIcons = component.showBadgeIcons;

      // then
      assert.false(showBadgeIcons);
    });
  });
});
