import { render, waitForElementToBeRemoved } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
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
    this.set('onImportLearners', sinon.stub());
  });

  module('when import is in progress', function (hooks) {
    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'UPLOADED',
        createdAt: new Date(2020, 10, 1),
        createdBy: { firstName: 'Richard', lastName: 'Aldana' },
        updatedAt: new Date(2020, 10, 2),
        errors: [{ code: 'UAI_MISMATCHED', meta: {} }],
      });
    });

    test('sco upload button is disabled', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSCOManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      this.set('organizationImportDetail', organizationImportDetail);

      // when
      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @organizationImportDetail={{this.organizationImportDetail}}
/>`,
      );

      // then
      const addButton = screen.getByRole('button', {
        name: t('pages.organization-participants-import.actions.participants.label'),
      });
      assert.ok(addButton.hasAttribute('disabled'));
    });
    test('sup uploads buttons are disabled', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSUPManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      this.set('organizationImportDetail', organizationImportDetail);

      // when
      const screen = await render(
        hbs`<Import
  @onImportSupStudents={{this.onImportSupStudents}}
  @onImportScoStudents={{this.onImportScoStudents}}
  @onReplaceStudents={{this.onReplaceStudents}}
  @organizationImportDetail={{this.organizationImportDetail}}
/>`,
      );

      // then
      const addButton = screen.getByRole('button', {
        name: t('pages.organization-participants-import.actions.add-sup.label'),
      });
      assert.ok(addButton.hasAttribute('disabled'));
      const replaceButton = screen.getByRole('button', {
        name: t('pages.organization-participants-import.actions.replace.label'),
      });
      assert.ok(replaceButton.hasAttribute('disabled'));
    });
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
        createdAt: new Date(2020, 10, 1),
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

      assert.ok(screen.getByRole('heading', { name: t('pages.organization-participants-import.error-panel.title') }));
      assert.strictEqual(screen.getAllByRole('listitem').length, 1);
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
          name: t('pages.organization-participants-import.sup.title'),
          level: 1,
        }),
      );

      assert.strictEqual(
        screen.getAllByText(t('pages.organization-participants-import.supported-formats', { types: '.csv' })).length,
        2,
      );
      assert.notOk(screen.queryByText(t('pages.organization-participants-import.banner.upload-in-progress')));
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
          name: t('pages.organization-participants-import.actions.replace.label'),
        });

        await click(replaceButton);

        // then
        assert.ok(
          await screen.findByRole('heading', {
            level: 1,
            name: t('pages.sup-organization-participants.replace-students-modal.title'),
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
          name: t('pages.organization-participants-import.actions.replace.label'),
        });

        await click(replaceButton);

        const cancelButton = await screen.findByRole('button', { name: t('common.actions.cancel') });

        await Promise.all([waitForElementToBeRemoved(() => screen.queryByRole('dialog')), click(cancelButton)]);

        // then
        assert.notOk(
          screen.queryByRole('heading', {
            level: 1,
            name: t('pages.sup-organization-participants.replace-students-modal.title'),
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

        const addButton = screen.getByLabelText(t('pages.organization-participants-import.actions.add-sup.label'));

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
          name: t('pages.organization-participants-import.sco.title'),
          level: 1,
        }),
      );

      assert.notOk(screen.queryByText(t('common.loading')));
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
        await screen.findByText(t('pages.organization-participants-import.supported-formats', { types: '.xml, .zip' })),
      );
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
      const input = screen.getByLabelText(t('pages.organization-participants-import.actions.participants.label'));

      await triggerEvent(input, 'change', { files: [file] });

      assert.ok(this.onImportScoStudents.called);
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
      const input = screen.getByLabelText(t('pages.organization-participants-import.actions.participants.label'));

      await triggerEvent(input, 'change', { files: [file] });

      assert.ok(this.onImportScoStudents.called);
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
        await screen.findByText(t('pages.organization-participants-import.supported-formats', { types: '.csv' })),
      );
    });
  });

  module('when user has import feature', function (hooks) {
    class CurrentUserStub extends Service {
      isAdminInOrganization = true;
      hasLearnerImportFeature = true;
    }

    hooks.beforeEach(function () {
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it trigger the importOrganizationLearners spy when clicking import button', async function (assert) {
      const screen = await render(
        hbs`<Import @onImportLearners={{this.onImportLearners}} @isLoading={{false}} @organizatioImport={{null}} />`,
      );

      const file = new Blob(['foo'], { type: 'valid-file' });
      const input = screen.getByLabelText(t('pages.organization-participants-import.actions.participants.label'));

      await triggerEvent(input, 'change', { files: [file] });
      assert.ok(this.onImportLearners.calledWithExactly([file]));
    });
  });
});
