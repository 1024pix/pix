import { render, waitForElementToBeRemoved } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | Import', function (hooks) {
  setupIntlRenderingTest(hooks);
  let organizationImportDetail;
  hooks.beforeEach(function () {
    this.set('onImportSupStudents', sinon.stub());
    this.set('onImportScoStudents', sinon.stub());
    this.set('onReplaceStudents', sinon.stub());
  });

  module('when has errors', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSUPManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      const store = this.owner.lookup('service:store');
      organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'VALIDATION_ERROR',
        createdBy: { firstName: 'Richard', lastName: 'Aldana' },
        updatedAt: new Date(2020, 10, 2),
        errors: [{ code: 'UAI_MISMATCHED', meta: {} }],
      });
    });

    test('display error heading information', async function (assert) {
      this.set('organizationImportDetail', organizationImportDetail);
      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @organizationImportDetail={{this.organizationImportDetail}}
/>`,
      );

      assert.ok(
        screen.getByRole('heading', { name: this.intl.t('pages.organization-participants-import.error-panel.title') }),
      );
      assert.strictEqual(screen.getAllByRole('listitem').length, 1);
    });
  });
  module('inProgress', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSUPManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      const store = this.owner.lookup('service:store');
      organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'UPLOADED',
        createdBy: { firstName: 'Richard', lastName: 'Aldana' },
        updatedAt: new Date(2020, 10, 2),
      });
    });

    test('display inProgress banner', async function (assert) {
      // when
      this.set('organizationImportDetail', organizationImportDetail);
      const screen = await render(hbs`<Import
        @onImportSupStudents={{this.onImportSupStudents}}
        @onImportScoStudents={{this.onImportScoStudents}}
        @onReplaceStudents={{this.onReplaceStudents}}
        @organizationImportDetail={{this.organizationImportDetail}}
      />`);

      assert.ok(screen.getByText(this.intl.t('pages.organization-participants-import.validation-in-progress')));
    });
  });

  module('success', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSUPManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      const store = this.owner.lookup('service:store');
      organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'IMPORTED',
        createdBy: { firstName: 'Richard', lastName: 'Aldana' },
        updatedAt: new Date(2020, 10, 2),
        errors: [{ code: 'UAI_MISMATCHED', meta: {} }],
      });
    });

    test('display success banner with warnings', async function (assert) {
      // when
      this.set('organizationImportDetail', organizationImportDetail);
      const screen = await render(hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @organizationImportDetail={{this.organizationImportDetail}}
/>`);
      assert.ok(
        screen.getByText(
          this.intl.t('pages.organization-participants-import.global-success', {
            firstName: 'Richard',
            lastName: 'Aldana',
            date: new Date(2020, 10, 2).toLocaleDateString(),
          }),
        ),
      );
      assert.ok(screen.getByRole('link', 'mailto:sup@pix.fr'));
    });
    test('display success banner wihout warning', async function (assert) {
      // when
      const store = this.owner.lookup('service:store');
      this.set(
        'organizationImportDetail',
        store.createRecord('organization-import-detail', {
          status: 'IMPORTED',
          createdBy: { firstName: 'Richard', lastName: 'Aldana' },
          updatedAt: new Date(2020, 10, 2),
        }),
      );
      const screen = await render(hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @organizationImportDetail={{this.organizationImportDetail}}
/>`);
      assert.ok(
        screen.getByText(
          this.intl.t('pages.organization-participants-import.global-success', {
            firstName: 'Richard',
            lastName: 'Aldana',
            date: new Date(2020, 10, 2).toLocaleDateString(),
          }),
        ),
      );
      assert.notOk(screen.queryByRole('link', 'mailto:sup@pix.fr'));
    });
  });
  module('when user is from sup', function (hooks) {
    class CurrentUserStub extends Service {
      isAdminInOrganization = true;
      isSUPManagingStudents = true;
    }

    hooks.beforeEach(function () {
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it should display Import/Replace Component', async function (assert) {
      // given
      this.set('isLoading', false);

      // when
      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
      );

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: this.intl.t('pages.organization-participants-import.sup.title'),
          level: 1,
        }),
      );

      assert.strictEqual(
        screen.getAllByText(this.intl.t('pages.organization-participants-import.supported-formats', { types: '.csv' }))
          .length,
        2,
      );
      assert.notOk(screen.queryByText(this.intl.t('pages.organization-participants-import.upload-in-progress')));
    });

    test('it should display loading message', async function (assert) {
      // given
      this.set('isLoading', true);

      // when
      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
      );

      // then
      assert.ok(await screen.findByText(this.intl.t('pages.organization-participants-import.upload-in-progress')));
    });

    module('replaceStudents', function () {
      test('it should open the modal on replace button click', async function (assert) {
        // given
        this.set('isLoading', false);

        // when
        const screen = await render(
          hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
        );

        const replaceButton = screen.getByRole('button', {
          name: this.intl.t('pages.organization-participants-import.actions.replace.label'),
        });

        await click(replaceButton);

        // then
        assert.ok(
          await screen.findByRole('heading', {
            level: 1,
            name: this.intl.t('pages.sup-organization-participants.replace-students-modal.title'),
          }),
        );
      });

      test('it should close the modal if the action is canceled', async function (assert) {
        // given
        this.set('isLoading', false);

        // when
        const screen = await render(
          hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
        );

        const replaceButton = screen.getByRole('button', {
          name: this.intl.t('pages.organization-participants-import.actions.replace.label'),
        });

        await click(replaceButton);

        const cancelButton = await screen.findByRole('button', { name: this.intl.t('common.actions.cancel') });

        await Promise.all([waitForElementToBeRemoved(() => screen.queryByRole('dialog')), click(cancelButton)]);

        // then
        assert.notOk(
          screen.queryByRole('heading', {
            level: 1,
            name: this.intl.t('pages.sup-organization-participants.replace-students-modal.title'),
          }),
        );
      });
    });

    module('importSupStudents', function () {
      test('it should import by confirming and clicking on import button', async function (assert) {
        // given
        this.set('isLoading', false);

        // when
        const screen = await render(
          hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
        );

        const file = new Blob(['foo'], { type: 'valid-file' });

        const addButton = screen.getByLabelText(
          this.intl.t('pages.organization-participants-import.actions.add-sup.label'),
        );

        await triggerEvent(addButton, 'change', { files: [file] });

        // then
        assert.ok(this.onImportSupStudents.calledWithExactly([file]));
        assert.notOk(this.onReplaceStudents.called);
      });
    });
  });

  module('when user is from sco', (hooks) => {
    class CurrentUserStub extends Service {
      isAdminInOrganization = true;
      isSCOManagingStudents = true;
    }

    hooks.beforeEach(async function () {
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it should display title and not the loading state', async function (assert) {
      // given
      this.set('isLoading', false);

      // when
      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
      );

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: this.intl.t('pages.organization-participants-import.sco.title'),
          level: 1,
        }),
      );

      assert.notOk(screen.queryByText(this.intl.t('common.loading')));
    });

    test('it specify that it require the right file type', async function (assert) {
      // given
      this.set('isLoading', false);

      // when
      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
      );

      // then
      assert.ok(
        await screen.findByText(
          this.intl.t('pages.organization-participants-import.supported-formats', { types: '.xml, .zip' }),
        ),
      );
    });

    test('it should display loading message', async function (assert) {
      // given
      this.set('isLoading', true);

      // when
      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
      );

      // then
      assert.ok(await screen.findByText(this.intl.t('pages.organization-participants-import.upload-in-progress')));
    });

    test('it trigger importStudentsSpy when clicking on the import button', async function (assert) {
      this.set('isLoading', false);

      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
      );

      const file = new Blob(['foo'], { type: 'valid-file' });
      const input = screen.getByLabelText(this.intl.t('pages.organization-participants-import.actions.add-sco.label'));

      await triggerEvent(input, 'change', { files: [file] });

      assert.ok(this.onImportScoStudents.called);
    });

    test('a message should be display when importing ', async function (assert) {
      this.set('isLoading', true);
      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
      );
      assert.ok(await screen.findByText(this.intl.t('pages.organization-participants-import.upload-in-progress')));
    });
  });

  module('when organization is SCO and tagged as Agriculture and CFA', (hooks) => {
    hooks.beforeEach(async function () {
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSCOManagingStudents = true;
        isAgriculture = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('a message should be display when importing', async function (assert) {
      this.set('isLoading', true);
      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
      );

      assert.ok(await screen.findByText(this.intl.t('pages.organization-participants-import.upload-in-progress')));
    });

    test('it trigger importStudentsSpy when clicking on the import button', async function (assert) {
      this.set('isLoading', false);

      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
      );

      const file = new Blob(['foo'], { type: 'valid-file' });
      const input = screen.getByLabelText(this.intl.t('pages.organization-participants-import.actions.add-sco.label'));

      await triggerEvent(input, 'change', { files: [file] });

      assert.ok(this.onImportScoStudents.called);
    });

    test('a message should be display when importing ', async function (assert) {
      this.set('isLoading', true);
      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
      );
      assert.ok(await screen.findByText(this.intl.t('pages.organization-participants-import.upload-in-progress')));
    });

    test('it specify that it require the right file type', async function (assert) {
      this.set('isLoading', false);
      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @isLoading={{this.isLoading}}
  @organizatioImport={{null}}
/>`,
      );

      assert.ok(
        await screen.findByText(
          this.intl.t('pages.organization-participants-import.supported-formats', { types: '.csv' }),
        ),
      );
    });
  });
});
