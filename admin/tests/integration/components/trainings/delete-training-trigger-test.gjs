/* eslint-disable ember/template-no-let-reference */
import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import DeleteTrainingTrigger from 'pix-admin/components/trainings/delete-training-trigger';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Trainings | Delete training trigger', function (hooks) {
  let deleteTrainingTrigger, model;
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    deleteTrainingTrigger = sinon.stub().resolves(true);
    model = {
      goalTrigger: { id: Symbol('goal_id') },
      prerequisiteTrigger: { id: Symbol('prerequisite_id') },
    };
  });

  module('prerequisite trigger', function () {
    test('should render the delete on click delete prerequisite button', async function (assert) {
      // when
      const screen = await render(
        <template><DeleteTrainingTrigger @training={{model}} @onSubmit={{deleteTrainingTrigger}} /></template>,
      );
      const deletePrerequisiteButton = screen.getByRole('button', {
        name: t('pages.trainings.training.delete.button.prerequisite-label'),
      });
      await click(deletePrerequisiteButton);

      // then
      assert.dom(await screen.findByText(t('pages.trainings.training.delete.modal.prerequisite-title'))).exists();
      assert.dom(screen.getByText(t('pages.trainings.training.delete.modal.instruction'))).exists();

      assert.dom(await screen.findByRole('dialog')).exists();

      assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') })).exists();
      assert.dom(screen.getByRole('button', { name: t('common.actions.validate') })).exists();
    });

    test('should call deleteTrainingTrigger with right parameter', async function (assert) {
      // when
      const screen = await render(
        <template><DeleteTrainingTrigger @training={{model}} @onSubmit={{deleteTrainingTrigger}} /></template>,
      );
      const deletePrerequisiteButton = screen.getByRole('button', {
        name: t('pages.trainings.training.delete.button.prerequisite-label'),
      });
      await click(deletePrerequisiteButton);

      assert.dom(await screen.findByRole('dialog')).exists();

      await click(screen.getByRole('button', { name: t('common.actions.validate') }));

      sinon.assert.calledOnceWithExactly(deleteTrainingTrigger, model.prerequisiteTrigger.id);
      assert.ok(true);
      // then
    });
  });

  module('goal trigger', function () {
    test('it should render the delete on click delete goal button', async function (assert) {
      // when
      const screen = await render(
        <template><DeleteTrainingTrigger @training={{model}} @onSubmit={{deleteTrainingTrigger}} /></template>,
      );
      const deletePrerequisiteButton = screen.getByRole('button', {
        name: t('pages.trainings.training.delete.button.goal-label'),
      });
      await click(deletePrerequisiteButton);

      // then
      assert.dom(await screen.findByText(t('pages.trainings.training.delete.modal.goal-title'))).exists();
      assert.dom(screen.getByText(t('pages.trainings.training.delete.modal.instruction'))).exists();

      assert.dom(await screen.findByRole('dialog')).exists();

      assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') })).exists();
      assert.dom(screen.getByRole('button', { name: t('common.actions.validate') })).exists();
    });

    test('should call deleteTrainingTrigger with right parameter', async function (assert) {
      // when
      const screen = await render(
        <template><DeleteTrainingTrigger @training={{model}} @onSubmit={{deleteTrainingTrigger}} /></template>,
      );
      const deletePrerequisiteButton = screen.getByRole('button', {
        name: t('pages.trainings.training.delete.button.goal-label'),
      });
      await click(deletePrerequisiteButton);

      assert.dom(await screen.findByRole('dialog')).exists();

      await click(screen.getByRole('button', { name: t('common.actions.validate') }));

      sinon.assert.calledOnceWithExactly(deleteTrainingTrigger, model.goalTrigger.id);
      assert.ok(true);
      // then
    });
  });
});
/* eslint-enable ember/template-no-let-reference */
