import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Trainings::CreateTrainingTriggers', function (hooks) {
  setupIntlRenderingTest(hooks);

  module("If a goal trigger exists and a prerequisite trigger doesn't exist", function (nestedHook) {
    nestedHook.beforeEach(function () {
      this.set('training', {
        goalTrigger: {
          type: 'goal',
        },
      });
    });

    test('it should display the prerequisite creation link', async function (assert) {
      // when
      const screen = await render(hbs`<Trainings::CreateTrainingTriggers @training={{this.training}} />`);

      // then
      assert
        .dom(screen.queryByLabelText(this.intl.t('pages.trainings.training.triggers.prerequisite.alternative-title')))
        .exists();
    });

    test('it should not display the goal creation link', async function (assert) {
      // when
      const screen = await render(hbs`<Trainings::CreateTrainingTriggers @training={{this.training}} />`);

      // then
      assert
        .dom(screen.queryByLabelText(this.intl.t('pages.trainings.training.triggers.goal.alternative-title')))
        .doesNotExist();
    });
  });

  module("If a prerequisite trigger exists and a goal trigger doesn't exist", function (nestedHook) {
    nestedHook.beforeEach(function () {
      this.set('training', {
        prerequisiteTrigger: {
          type: 'prerequisite',
        },
      });
    });

    test('it should not display the prerequisite creation link', async function (assert) {
      // when
      const screen = await render(hbs`<Trainings::CreateTrainingTriggers @training={{this.training}} />`);

      // then
      assert
        .dom(screen.queryByLabelText(this.intl.t('pages.trainings.training.triggers.prerequisite.alternative-title')))
        .doesNotExist();
    });

    test('it should display the goal creation link', async function (assert) {
      // when
      const screen = await render(hbs`<Trainings::CreateTrainingTriggers @training={{this.training}} />`);

      // then
      assert
        .dom(screen.queryByLabelText(this.intl.t('pages.trainings.training.triggers.goal.alternative-title')))
        .exists();
    });
  });
});
