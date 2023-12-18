import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render, waitForElementToBeRemoved } from '@1024pix/ember-testing-library';
import { click, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | SupOrganizationParticipant::Import', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display Import/Replace Component', async function (assert) {
    // given
    this.set('onImportStudents', sinon.stub());
    this.set('onReplaceStudents', sinon.stub());
    this.set('isLoading', false);

    // when
    const screen = await render(
      hbs`<SupOrganizationParticipant::Import
  @onImportStudents={{this.onImportStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
/>`,
    );

    // then
    assert
      .dom(
        screen.getByRole('heading', {
          name: this.intl.t('pages.sup-organization-participants-import.title'),
          level: 1,
        }),
      )
      .exists();

    assert.dom(screen.getByText(this.intl.t('pages.sup-organization-participants-import.description'))).exists();
    assert.dom(screen.getByText(this.intl.t('pages.sup-organization-participants-import.supported-formats'))).exists();
    assert.dom(screen.queryByText(this.intl.t('common.loading'))).doesNotExist();
  });

  test('it should display loading message', async function (assert) {
    // given
    this.set('onImportStudents', sinon.stub());
    this.set('onReplaceStudents', sinon.stub());
    this.set('isLoading', true);

    // when
    const screen = await render(
      hbs`<SupOrganizationParticipant::Import
  @onImportStudents={{this.onImportStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
/>`,
    );

    // then
    assert.dom(screen.getByText(this.intl.t('common.loading'))).exists();
  });

  module('replaceStudents', function () {
    test('it should open the modal on replace button click', async function (assert) {
      // given
      this.set('onImportStudents', sinon.stub());
      this.set('onReplaceStudents', sinon.stub());
      this.set('isLoading', false);

      // when
      const screen = await render(
        hbs`<SupOrganizationParticipant::Import
  @onImportStudents={{this.onImportStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
/>`,
      );

      const replaceButton = screen.getByRole('button', {
        name: this.intl.t('pages.sup-organization-participants-import.actions.replace.label'),
      });

      await click(replaceButton);

      // then
      assert
        .dom(
          await screen.findByRole('heading', {
            level: 1,
            name: this.intl.t('pages.sup-organization-participants.replace-students-modal.title'),
          }),
        )
        .exists();
    });

    test('it should close the modal if the action is canceled', async function (assert) {
      // given
      this.set('onImportStudents', sinon.stub());
      this.set('onReplaceStudents', sinon.stub());
      this.set('isLoading', false);

      // when
      const screen = await render(
        hbs`<SupOrganizationParticipant::Import
  @onImportStudents={{this.onImportStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
/>`,
      );

      const replaceButton = screen.getByRole('button', {
        name: this.intl.t('pages.sup-organization-participants-import.actions.replace.label'),
      });

      await click(replaceButton);

      const cancelButton = await screen.findByRole('button', { name: this.intl.t('common.actions.cancel') });

      await Promise.all([waitForElementToBeRemoved(() => screen.queryByRole('dialog')), click(cancelButton)]);

      // then
      assert
        .dom(
          screen.queryByRole('heading', {
            level: 1,
            name: this.intl.t('pages.sup-organization-participants.replace-students-modal.title'),
          }),
        )
        .doesNotExist();
    });
  });

  module('importStudents', function () {
    test('it should import by confirming and clicking on import button', async function (assert) {
      // given
      const onImportStudents = sinon.stub();
      this.set('onImportStudents', onImportStudents);
      const onReplaceStudents = sinon.stub();
      this.set('onReplaceStudents', onReplaceStudents);
      this.set('isLoading', false);

      // when
      const screen = await render(
        hbs`<SupOrganizationParticipant::Import
  @onImportStudents={{this.onImportStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
/>`,
      );

      const file = new Blob(['foo'], { type: 'valid-file' });

      const addButton = screen.getByLabelText(
        this.intl.t('pages.sup-organization-participants-import.actions.add.label'),
      );

      await triggerEvent(addButton, 'change', { files: [file] });

      // then
      assert.ok(onImportStudents.calledWithExactly([file]));
      assert.notOk(onReplaceStudents.called);
    });
  });
});
