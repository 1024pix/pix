import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import UiDeletionModal from 'pix-orga/components/ui/deletion-modal';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::DeletionModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Nominal case', function () {
    test('it should display title, content and action buttons', async function (assert) {
      //given
      const noop = () => {};
      const title = 'Coucou';
      const content = 'Juste du texte';

      // when
      const screen = await render(
        <template>
          <UiDeletionModal
            @title={{title}}
            @showModal={{true}}
            @count={{0}}
            @onTriggerAction={{noop}}
            @onCloseModal={{noop}}
          ><:content>
              {{content}}</:content></UiDeletionModal>
        </template>,
      );

      // then
      assert.ok(screen.getByText(content));
      assert.ok(screen.getByText(title));
      assert.ok(screen.getByRole('button', { name: t('common.actions.cancel') }));
      assert.ok(screen.getByRole('button', { name: t('components.ui.deletion-modal.confirm-deletion') }));
    });

    test('it should call onTriggerAction when click on confirm', async function (assert) {
      //given
      const triggerActionStub = sinon.stub();
      const onCloseModalStub = sinon.stub();
      const title = 'Coucou';
      const content = 'Juste du texte';

      // when
      const screen = await render(
        <template>
          <UiDeletionModal
            @title={{title}}
            @showModal={{true}}
            @count={{1}}
            @onTriggerAction={{triggerActionStub}}
            @onCloseModal={{onCloseModalStub}}
          ><:content>
              {{content}}</:content></UiDeletionModal>
        </template>,
      );

      const confirmButton = screen.getByRole('button', {
        name: t('components.ui.deletion-modal.confirm-deletion'),
      });

      await click(confirmButton);

      // then
      assert.ok(triggerActionStub.called);
    });

    test('it should call onTriggerAction after confirmation when click on confirm', async function (assert) {
      //given
      const triggerActionStub = sinon.stub();
      const onCloseModalStub = sinon.stub();
      const title = 'Coucou';
      const content = 'Juste du texte';
      const count = 2;

      // when
      const screen = await render(
        <template>
          <UiDeletionModal
            @title={{title}}
            @showModal={{true}}
            @count={{count}}
            @onTriggerAction={{triggerActionStub}}
            @onCloseModal={{onCloseModalStub}}
          ><:content>
              {{content}}</:content></UiDeletionModal>
        </template>,
      );

      const confirmationCheckbox = screen.getByRole('checkbox', {
        name: t('components.ui.deletion-modal.confirmation-checkbox', { count }),
      });

      await click(confirmationCheckbox);

      const confirmButton = screen.getByRole('button', {
        name: t('components.ui.deletion-modal.confirm-deletion'),
      });

      await click(confirmButton);

      // then
      assert.ok(triggerActionStub.called);
    });

    test('it should call onCloseModal when click on annuler', async function (assert) {
      //given
      const triggerActionStub = sinon.stub();
      const onCloseModalStub = sinon.stub();
      const title = 'Coucou';
      const content = 'Juste du texte';

      // when
      const screen = await render(
        <template>
          <UiDeletionModal
            @title={{title}}
            @showModal={{true}}
            @count={{1}}
            @onTriggerAction={{triggerActionStub}}
            @onCloseModal={{onCloseModalStub}}
          ><:content>
              {{content}}</:content></UiDeletionModal>
        </template>,
      );

      const cancelButton = screen.getByRole('button', {
        name: t('common.actions.cancel'),
      });

      await click(cancelButton);

      // then
      assert.ok(onCloseModalStub.called);
    });
  });

  module('when there is multiple elements', function () {
    test('it should display checkbox for confirmation', async function (assert) {
      //given
      const triggerActionStub = sinon.stub();
      const onCloseModalStub = sinon.stub();
      const count = 3;
      const title = 'Coucou';
      const content = 'Juste du texte';

      // when
      const screen = await render(
        <template>
          <UiDeletionModal
            @title={{title}}
            @showModal={{true}}
            @count={{count}}
            @onTriggerAction={{triggerActionStub}}
            @onCloseModal={{onCloseModalStub}}
          ><:content>
              {{content}}</:content></UiDeletionModal>
        </template>,
      );

      //then
      assert.ok(
        screen.getByRole('checkbox', {
          name: t('components.ui.deletion-modal.confirmation-checkbox', { count }),
        }),
      );
    });

    test('confirm button should not be clickable if checkbox is not checked', async function (assert) {
      //given
      const triggerActionStub = sinon.stub();
      const onCloseModalStub = sinon.stub();
      const count = 3;
      const title = 'Coucou';
      const content = 'Juste du texte';

      // when
      const screen = await render(
        <template>
          <UiDeletionModal
            @title={{title}}
            @showModal={{true}}
            @count={{count}}
            @onTriggerAction={{triggerActionStub}}
            @onCloseModal={{onCloseModalStub}}
          ><:content>
              {{content}}</:content></UiDeletionModal>
        </template>,
      );

      const confirmButton = screen.getByRole('button', {
        name: t('components.ui.deletion-modal.confirm-deletion'),
      });

      // then
      assert.dom(confirmButton).isDisabled();
    });
  });
});
