import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import UiDeletionModal from 'pix-orga/components/ui/deletion-modal';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::DeletionModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.title = 'Coucou';
    this.content = 'Juste du texte';
    this.triggerActionStub = sinon.stub();
    this.onCloseModalStub = sinon.stub();
  });

  test('it displays title, content and action buttons', async function (assert) {
    // when
    const screen = await render(
      <template>
        <UiDeletionModal
          @title={{this.title}}
          @showModal={{true}}
          @count={{0}}
          @onTriggerAction={{this.triggerActionStub}}
          @onCloseModal={{this.onCloseModalStub}}
        >
          <:content>
            {{this.content}}
          </:content>
        </UiDeletionModal>
      </template>,
    );

    // then
    assert.ok(screen.getByText(this.content));
    assert.ok(screen.getByText(this.title));
    assert.ok(screen.getByRole('button', { name: t('common.actions.cancel') }));
    assert.ok(screen.getByRole('button', { name: t('components.ui.deletion-modal.confirm-deletion') }));
  });

  test('it displays checkbox for confirmation', async function (assert) {
    //given
    const count = 3;

    // when
    const screen = await render(
      <template>
        <UiDeletionModal
          @title={{this.title}}
          @showModal={{true}}
          @count={{count}}
          @onTriggerAction={{this.triggerActionStub}}
          @onCloseModal={{this.onCloseModalStub}}
        >
          <:content>
            {{this.content}}
          </:content>
        </UiDeletionModal>
      </template>,
    );

    //then
    assert.ok(
      screen.getByRole('checkbox', {
        name: t('components.ui.deletion-modal.confirmation-checkbox', { count }),
      }),
    );
  });

  test('it prevents button from being clickable if confirmation checkbox is not checked', async function (assert) {
    // when
    const screen = await render(
      <template>
        <UiDeletionModal
          @title={{this.title}}
          @showModal={{true}}
          @count={{3}}
          @onTriggerAction={{this.triggerActionStub}}
          @onCloseModal={{this.onCloseModalStub}}
        >
          <:content>
            {{this.content}}
          </:content>
        </UiDeletionModal>
      </template>,
    );

    const confirmButton = screen.getByRole('button', {
      name: t('components.ui.deletion-modal.confirm-deletion'),
    });

    // then
    assert.dom(confirmButton).hasAttribute('aria-disabled');
  });

  test('it calls onTriggerAction after confirmation when click on confirm', async function (assert) {
    //given
    const count = 2;

    // when
    const screen = await render(
      <template>
        <UiDeletionModal
          @title={{this.title}}
          @showModal={{true}}
          @count={{count}}
          @onTriggerAction={{this.triggerActionStub}}
          @onCloseModal={{this.onCloseModalStub}}
        >
          <:content>
            {{this.content}}
          </:content>
        </UiDeletionModal>
      </template>,
    );

    const confirmationCheckbox = screen.getByRole('checkbox', {
      name: t('components.ui.deletion-modal.confirmation-checkbox', { count }),
    });
    const confirmButton = screen.getByRole('button', {
      name: t('components.ui.deletion-modal.confirm-deletion'),
    });

    await click(confirmationCheckbox);
    await click(confirmButton);

    // then
    assert.ok(this.triggerActionStub.called);
  });

  test('it calls onCloseModal when click on annuler', async function (assert) {
    // when
    const screen = await render(
      <template>
        <UiDeletionModal
          @title={{this.title}}
          @showModal={{true}}
          @count={{1}}
          @onTriggerAction={{this.triggerActionStub}}
          @onCloseModal={{this.onCloseModalStub}}
        >
          <:content>
            {{this.content}}
          </:content>
        </UiDeletionModal>
      </template>,
    );

    const cancelButton = screen.getByRole('button', {
      name: t('common.actions.cancel'),
    });

    await click(cancelButton);

    // then
    assert.ok(this.onCloseModalStub.called);
  });

  module('confirmation checkbox', function () {
    test('it resets confirmation checkbox on confirmation button click', async function (assert) {
      //given
      const count = 2;

      // when
      const screen = await render(
        <template>
          <UiDeletionModal
            @title={{this.title}}
            @showModal={{true}}
            @count={{count}}
            @onTriggerAction={{this.triggerActionStub}}
            @onCloseModal={{this.onCloseModalStub}}
          >
            <:content>
              {{this.content}}
            </:content>
          </UiDeletionModal>
        </template>,
      );

      const confirmationCheckbox = screen.getByRole('checkbox', {
        name: t('components.ui.deletion-modal.confirmation-checkbox', { count }),
      });
      const confirmButton = screen.getByRole('button', {
        name: t('components.ui.deletion-modal.confirm-deletion'),
      });

      await click(confirmationCheckbox);
      await click(confirmButton);

      // then
      assert.dom(confirmationCheckbox).isNotChecked();
    });

    test('it resets confirmation checkbox on cancel button click', async function (assert) {
      //given
      const count = 2;

      // when
      const screen = await render(
        <template>
          <UiDeletionModal
            @title={{this.title}}
            @showModal={{true}}
            @count={{count}}
            @onTriggerAction={{this.triggerActionStub}}
            @onCloseModal={{this.onCloseModalStub}}
          >
            <:content>
              {{this.content}}
            </:content>
          </UiDeletionModal>
        </template>,
      );

      const confirmationCheckbox = screen.getByRole('checkbox', {
        name: t('components.ui.deletion-modal.confirmation-checkbox', { count }),
      });
      const cancelButton = screen.getByRole('button', {
        name: t('common.actions.cancel'),
      });

      await click(confirmationCheckbox);
      await click(cancelButton);

      // then
      assert.dom(confirmationCheckbox).isNotChecked();
    });

    test('it resets confirmation checkbox on exit button click', async function (assert) {
      //given
      const count = 2;

      // when
      const screen = await render(
        <template>
          <UiDeletionModal
            @title={{this.title}}
            @showModal={{true}}
            @count={{count}}
            @onTriggerAction={{this.triggerActionStub}}
            @onCloseModal={{this.onCloseModalStub}}
          >
            <:content>
              {{this.content}}
            </:content>
          </UiDeletionModal>
        </template>,
      );

      const confirmationCheckbox = screen.getByRole('checkbox', {
        name: t('components.ui.deletion-modal.confirmation-checkbox', { count }),
      });
      const exitButton = screen.getByRole('button', {
        name: 'Fermer',
      });

      await click(confirmationCheckbox);
      await click(exitButton);

      // then
      assert.dom(confirmationCheckbox).isNotChecked();
    });
  });
});
