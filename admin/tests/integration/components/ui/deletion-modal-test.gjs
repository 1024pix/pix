import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import UiDeletionModal from 'pix-admin/components/ui/deletion-modal';
import { t } from 'pix-admin/tests/helpers/setup-intl';
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
    assert.ok(screen.getByRole('checkbox', { name: t('common.actions.are-you-sure') }));
    assert.ok(screen.getByRole('button', { name: t('common.actions.cancel') }));
    assert.ok(screen.getByRole('button', { name: t('common.actions.confirm-deletion') }));
  });

  test('it prevents button from being clickable if confirmation checkbox is not checked', async function (assert) {
    // when
    const screen = await render(
      <template>
        <UiDeletionModal
          @title={{this.title}}
          @showModal={{true}}
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
      name: t('common.actions.confirm-deletion'),
    });

    // then
    assert.dom(confirmButton).hasAttribute('aria-disabled');
  });

  test('it calls onTriggerAction after confirmation when click on confirm', async function (assert) {
    // when
    const screen = await render(
      <template>
        <UiDeletionModal
          @title={{this.title}}
          @showModal={{true}}
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
      name: t('common.actions.are-you-sure'),
    });
    const confirmButton = screen.getByRole('button', {
      name: t('common.actions.confirm-deletion'),
    });

    await click(confirmationCheckbox);
    await click(confirmButton);

    // then
    assert.ok(this.triggerActionStub.called);
  });

  test('it calls onCloseModal when click on cancel button', async function (assert) {
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
});
