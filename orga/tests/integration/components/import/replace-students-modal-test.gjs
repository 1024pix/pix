import { render } from '@1024pix/ember-testing-library';
import { click, triggerEvent } from '@ember/test-helpers';
import ImportReplaceStudentsModal from 'pix-orga/components/import/replace-students-modal';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Import::ReplaceStudentsModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should not display modal', async function (assert) {
    // given
    const display = false;
    const onReplaceStudents = sinon.stub();
    const onClose = sinon.stub();

    // when
    const screen = await render(
      <template>
        <ImportReplaceStudentsModal
          @display={{display}}
          @onReplaceStudents={{onReplaceStudents}}
          @onClose={{onClose}}
        />
      </template>,
    );

    // then
    assert
      .dom(
        screen.queryByRole('heading', {
          level: 1,
          name: t('pages.sup-organization-participants.replace-students-modal.title'),
        }),
      )
      .doesNotExist();
  });

  test('it should display modal', async function (assert) {
    // given
    const display = true;
    const onReplaceStudents = sinon.stub();
    const onClose = sinon.stub();

    // when
    const screen = await render(
      <template>
        <ImportReplaceStudentsModal
          @display={{display}}
          @onReplaceStudents={{onReplaceStudents}}
          @onClose={{onClose}}
        />
      </template>,
    );

    // then
    assert
      .dom(
        await screen.findByRole('heading', {
          level: 1,
          name: t('pages.sup-organization-participants.replace-students-modal.title'),
        }),
      )
      .exists();

    assert.dom(screen.getByText(t('pages.sup-organization-participants.replace-students-modal.main-content'))).exists();

    assert
      .dom(screen.getByText(t('pages.sup-organization-participants.replace-students-modal.footer-content')))
      .exists();

    assert.dom(screen.getByText(t('pages.sup-organization-participants.replace-students-modal.last-warning'))).exists();

    assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') }));
  });

  test('it should not be able to replace student if confirmation is not checked', async function (assert) {
    // given
    const display = true;
    const onReplaceStudents = sinon.stub();
    const onClose = sinon.stub();

    // when
    const screen = await render(
      <template>
        <ImportReplaceStudentsModal
          @display={{display}}
          @onReplaceStudents={{onReplaceStudents}}
          @onClose={{onClose}}
        />
      </template>,
    );

    // then
    assert.ok(
      screen
        .getByRole('button', {
          name: t('pages.sup-organization-participants.replace-students-modal.confirm'),
        })
        .hasAttribute('aria-disabled'),
    );
  });

  test('it should be able to replace student if confirmation is checked', async function (assert) {
    // given
    const display = true;
    const onReplaceStudents = sinon.stub();
    const onClose = sinon.stub();

    // when
    const screen = await render(
      <template>
        <ImportReplaceStudentsModal
          @display={{display}}
          @onReplaceStudents={{onReplaceStudents}}
          @onClose={{onClose}}
        />
      </template>,
    );

    const confirmation = await screen.getByRole('checkbox', {
      name: t('pages.sup-organization-participants.replace-students-modal.confirmation-checkbox'),
    });

    await click(confirmation);

    // then
    assert
      .dom(screen.getByLabelText(t('pages.sup-organization-participants.replace-students-modal.confirm')))
      .isEnabled();
  });

  test('it should replace by confirming and clicking on replace button', async function (assert) {
    // given
    const display = true;
    const onReplaceStudents = sinon.stub();
    const onClose = sinon.stub();

    // when
    const screen = await render(
      <template>
        <ImportReplaceStudentsModal
          @display={{display}}
          @onReplaceStudents={{onReplaceStudents}}
          @onClose={{onClose}}
        />
      </template>,
    );

    const confirmation = await screen.getByRole('checkbox', {
      name: t('pages.sup-organization-participants.replace-students-modal.confirmation-checkbox'),
    });

    await click(confirmation);

    const file = new Blob(['foo'], { type: 'valid-file' });

    const uploadButton = screen.getByLabelText(t('pages.sup-organization-participants.replace-students-modal.confirm'));

    await triggerEvent(uploadButton, 'change', { files: [file] });

    // then
    assert.ok(onReplaceStudents.calledWithExactly([file]));
  });
});
