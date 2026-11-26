import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import UiDeletionModal from 'pix-admin/components/ui/deletion-modal';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::DeletionModal', function (hooks) {
  setupIntlRenderingTest(hooks);

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
        >
          <:content>
            {{content}}
          </:content>
        </UiDeletionModal>
      </template>,
    );

    // then
    assert.ok(screen.getByText(content));
    assert.ok(screen.getByText(title));
    assert.ok(screen.getByRole('checkbox', { name: t('common.actions.are-you-sure') }));
    assert.ok(screen.getByRole('button', { name: t('common.actions.cancel') }));
    assert.ok(screen.getByRole('button', { name: t('common.actions.confirm-deletion') }));
  });

  test('it should call onTriggerAction after confirmation when click on confirm', async function (assert) {
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
          @onTriggerAction={{triggerActionStub}}
          @onCloseModal={{onCloseModalStub}}
        >
          <:content>
            {{content}}
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
    assert.ok(triggerActionStub.called);
  });

  test('it should call onCloseModal when click on cancel button', async function (assert) {
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
        >
          <:content>
            {{content}}
          </:content>
        </UiDeletionModal>
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
