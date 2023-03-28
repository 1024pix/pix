import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import setupIntl from '../../../helpers/setup-intl';
import EmberObject from '@ember/object';

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
      assert.strictEqual(controller.nextPageButtonText, 'Continuer');
    });

    test('should propose to see the results of the assessment if it is the final checkpoint', function (assert) {
      // when
      controller.set('finalCheckpoint', true);

      // then
      assert.strictEqual(controller.nextPageButtonText, 'Voir mes résultats');
    });
  });

  module('#finalCheckpoint', function () {
    test('should equal false by default', function (assert) {
      // then
      assert.false(controller.finalCheckpoint);
    });
  });

  module('#completionPercentage', function () {
    test('should equal 100 if it is the final checkpoint', function (assert) {
      // when
      controller.set('finalCheckpoint', true);

      // then
      assert.strictEqual(controller.completionPercentage, 100);
    });

    test('should equal the progression completionPercentage', function (assert) {
      // when
      const model = EmberObject.create({
        progression: {
          completionPercentage: 73,
        },
      });
      controller.set('model', model);

      // then
      assert.strictEqual(controller.completionPercentage, 73);
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
});
