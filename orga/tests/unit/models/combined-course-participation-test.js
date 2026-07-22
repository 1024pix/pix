import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Unit | Model | combined-course-participation', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('displayedRewardStatus', function () {
    [
      {
        rewardStatus: 'NOT_STARTED',
        statusTested: 'in progress',
        expectedTranslationKey: 'pages.combined-course.table.rewards.in-progress',
        expectedIcon: 'acute',
        expectedClass: 'reward reward--in-progress',
      },
      {
        rewardStatus: 'STARTED',
        statusTested: 'in progress',
        expectedTranslationKey: 'pages.combined-course.table.rewards.in-progress',
        expectedIcon: 'acute',
        expectedClass: 'reward reward--in-progress',
      },
      {
        rewardStatus: 'OBTAINED',
        statusTested: 'obtained',
        expectedTranslationKey: 'pages.combined-course.table.rewards.obtained',
        expectedIcon: 'checkCircle',
        expectedClass: 'reward reward--obtained',
      },
      {
        rewardStatus: 'NOT_OBTAINED',
        statusTested: 'not obtained',
        expectedTranslationKey: 'pages.combined-course.table.rewards.not-obtained',
        expectedIcon: 'cancel',
        expectedClass: 'reward reward--not-obtained',
      },
    ].forEach(function ({ rewardStatus, statusTested, expectedTranslationKey, expectedIcon, expectedClass }) {
      test(`it should return ${statusTested} reward status for ${rewardStatus} participation`, function (assert) {
        const store = this.owner.lookup('service:store');

        const participation = store.createRecord('combined-course-participation', { rewardStatus });

        assert.strictEqual(participation.get('rewardStatusDisplay').text, expectedTranslationKey);
        assert.strictEqual(participation.get('rewardStatusDisplay').icon, expectedIcon);
        assert.strictEqual(participation.get('rewardStatusDisplay').class, expectedClass);
      });
    });
  });
});
