import EmberObject from '@ember/object';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';

import setupIntl from '../../../helpers/setup-intl';

module('Unit | Controller | Assessments | Checkpoint', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:assessments/checkpoint');
  });

  module('#nextPageButtonText', function () {
    test('should propose to continue the assessment if it is not the final checkpoint', function (assert) {
      // when
      controller.set('finalCheckpoint', false);

      // then
      assert.strictEqual(controller.nextPageButtonText, t('pages.checkpoint.actions.next-page.continue'));
    });

    test('should propose to see the results of the assessment if it is the final checkpoint', function (assert) {
      // when
      controller.set('finalCheckpoint', true);

      // then
      assert.strictEqual(controller.nextPageButtonText, t('pages.checkpoint.actions.next-page.results'));
    });
  });

  module('#finalCheckpoint', function () {
    test('should equal false by default', function (assert) {
      // then
      assert.false(controller.finalCheckpoint);
    });
  });

  module('#completionRate', function () {
    test('should equal 1 if it is the final checkpoint', function (assert) {
      // when
      controller.set('finalCheckpoint', true);

      // then
      assert.strictEqual(controller.completionRate, 1);
    });

    test('should equal the progression completionRate', function (assert) {
      // when
      const model = EmberObject.create({
        progression: {
          completionRate: 0.73,
        },
      });
      controller.set('model', model);

      // then
      assert.strictEqual(controller.completionRate, 0.73);
    });
  });

  module('#shouldDisplayAnswers', function () {
    test('should be true when answers are present', function (assert) {
      // when
      const model = {
        answersSinceLastCheckpoints: [0, 1, 2],
      };
      controller.set('model', model);
      // then
      assert.true(controller.shouldDisplayAnswers);
    });

    test('should be false when answers are absent', function (assert) {
      // when
      const model = {
        answersSinceLastCheckpoints: [],
      };
      controller.set('model', model);
      // then
      assert.false(controller.shouldDisplayAnswers);
    });
  });

  module('#displayHomeLink', function () {
    test('should not display home link when user is anonymous', function (assert) {
      // given
      controller.currentUser = Service.create({ user: { isAnonymous: true } });

      // when
      controller.displayHomeLink;

      // then
      assert.false(controller.displayHomeLink);
    });

    test('should display home link when user is not anonymous', function (assert) {
      // given
      controller.currentUser = Service.create({ user: { isAnonymous: false } });

      // when
      controller.displayHomeLink;

      // then
      assert.true(controller.displayHomeLink);
    });
  });

  module('#showLevelup', function () {
    test('should display level up pop-in when user has level up', function (assert) {
      // given
      controller.newLevel = true;
      const model = { showLevelup: true };
      controller.model = model;

      // then
      assert.true(controller.showLevelup);
    });

    test('should not display level up pop-in when user has not leveled up', function (assert) {
      // given
      controller.newLevel = false;
      const model = { showLevelup: true };
      controller.model = model;

      // then
      assert.false(controller.showLevelup);
    });

    test('should not display level up pop-in when it is not in assessment with level up', function (assert) {
      // given
      controller.newLevel = true;
      const model = { showLevelup: false };
      controller.model = model;

      // then
      assert.false(controller.showLevelup);
    });
  });

  module('#displayShareResultsBanner', function () {
    test('should return false when assessment is not for campaign', function (assert) {
      // given
      ENV.APP.AUTO_SHARE_AFTER_DATE = '2024-01-01';
      const model = { isForCampaign: false, createdAt: new Date('2023-01-01') };
      controller.model = model;
      controller.finalCheckpoint = true;

      // then
      assert.false(controller.displayShareResultsBanner);
    });

    test('should return true when it is final checkpoint and when assessment created is before auto share date', function (assert) {
      // given
      ENV.APP.AUTO_SHARE_AFTER_DATE = '2024-01-01';
      const model = { createdAt: new Date('2023-01-01'), isForCampaign: true };
      controller.model = model;
      controller.finalCheckpoint = true;

      // then
      assert.true(controller.displayShareResultsBanner);
    });

    test('should return false when assessment created is after auto share date', function (assert) {
      // given
      ENV.APP.AUTO_SHARE_AFTER_DATE = '2024-01-01';
      const model = { createdAt: new Date('2025-01-01'), isForCampaign: true };
      controller.model = model;
      controller.finalCheckpoint = true;

      // then
      assert.false(controller.displayShareResultsBanner);
    });

    test('should return false when it is not final checkpoint', function (assert) {
      // given
      ENV.APP.AUTO_SHARE_AFTER_DATE = '2024-01-01';
      const model = { createdAt: new Date('2023-01-01'), isForCampaign: true };
      controller.model = model;
      controller.finalCheckpoint = false;

      // then
      assert.false(controller.displayShareResultsBanner);
    });
  });
});
