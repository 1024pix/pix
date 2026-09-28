import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, triggerEvent } from '@ember/test-helpers';
import { waitForElementToBeRemoved } from '@testing-library/dom';
import { t } from 'ember-intl/test-support';
import Import from 'pix-orga/components/import/index';
import ENV from 'pix-orga/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Import', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');

    this.onImportSupStudents = sinon.stub();
    this.onImportScoStudents = sinon.stub();
    this.onReplaceStudents = sinon.stub();
    this.onImportLearners = sinon.stub();
  });

  module('when there is a import template', function () {
    test('it should display download template button for sup', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSUPManagingStudents = true;
        organization = { id: 1 };
      }

      this.owner.register('service:current-user', CurrentUserStub);
      class SessionStub extends Service {
        data = { authenticated: { access_token: 'something' } };
      }

      this.owner.register('service:session', SessionStub);
      const organizationImportDetailVal = null;
      const onImportSupStudents = this.onImportSupStudents;
      const onImportScoStudents = this.onImportScoStudents;
      const onReplaceStudents = this.onReplaceStudents;

      // when
      const screen = await render(
        <template>
          <Import
            @onImportSupStudents={{onImportSupStudents}}
            @onImportScoStudents={{onImportScoStudents}}
            @onReplaceStudents={{onReplaceStudents}}
            @organizationImportDetail={{organizationImportDetailVal}}
          />
        </template>,
      );

      // then
      const link = screen.getByText(t('pages.sup-organization-participants.actions.download-template'));
      assert
        .dom(link)
        .hasAttribute(
          'href',
          `${ENV.APP.API_HOST}/api/organizations/1/organization-learners/csv-template?accessToken=something&lang=fr`,
        );
    });
    test('it should display download template button for organization with import feature', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        hasLearnerImportFeature = true;
        organization = { id: 1 };
      }

      this.owner.register('service:current-user', CurrentUserStub);
      class SessionStub extends Service {
        data = { authenticated: { access_token: 'something' } };
      }

      this.owner.register('service:session', SessionStub);
      const organizationImportDetailVal = null;
      const onImportSupStudents = this.onImportSupStudents;
      const onImportScoStudents = this.onImportScoStudents;
      const onReplaceStudents = this.onReplaceStudents;

      // when
      const screen = await render(
        <template>
          <Import
            @onImportSupStudents={{onImportSupStudents}}
            @onImportScoStudents={{onImportScoStudents}}
            @onReplaceStudents={{onReplaceStudents}}
            @organizationImportDetail={{organizationImportDetailVal}}
          />
        </template>,
      );

      // then
      const link = screen.getByText(t('pages.sup-organization-participants.actions.download-template'));
      assert
        .dom(link)
        .hasAttribute(
          'href',
          `${ENV.APP.API_HOST}/api/organizations/1/organization-learners/csv-template?accessToken=something&lang=fr`,
        );
    });
  });

  module('when import is in progress', function () {
    test('sco upload button is disabled', async function (assert) {
      // given
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'UPLOADED',
        createdAt: new Date(2020, 10, 1),
        createdBy: { firstName: 'Richard', lastName: 'Aldana' },
        updatedAt: new Date(2020, 10, 2),
        importErrors: [{ code: 'UAI_MISMATCHED', meta: {} }],
      });

      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSCOManagingStudents = true;
        organization = {};
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const onImportSupStudents = this.onImportSupStudents;
      const onImportScoStudents = this.onImportScoStudents;
      const onReplaceStudents = this.onReplaceStudents;

      // when
      const screen = await render(
        <template>
          <Import
            @onImportSupStudents={{onImportSupStudents}}
            @onImportScoStudents={{onImportScoStudents}}
            @onReplaceStudents={{onReplaceStudents}}
            @organizationImportDetail={{organizationImportDetail}}
          />
        </template>,
      );

      // then
      const addButton = screen.getByRole('button', {
        name: t('pages.organization-participants-import.actions.participants.label'),
      });
      assert.ok(addButton.hasAttribute('aria-disabled'));
    });
    test('sup uploads buttons are disabled', async function (assert) {
      // given
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'UPLOADED',
        createdAt: new Date(2020, 10, 1),
        createdBy: { firstName: 'Richard', lastName: 'Aldana' },
        updatedAt: new Date(2020, 10, 2),
        importErrors: [{ code: 'UAI_MISMATCHED', meta: {} }],
      });

      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSUPManagingStudents = true;
        organization = {};
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const onImportSupStudents = this.onImportSupStudents;
      const onImportScoStudents = this.onImportScoStudents;
      const onReplaceStudents = this.onReplaceStudents;

      // when
      const screen = await render(
        <template>
          <Import
            @onImportSupStudents={{onImportSupStudents}}
            @onImportScoStudents={{onImportScoStudents}}
            @onReplaceStudents={{onReplaceStudents}}
            @organizationImportDetail={{organizationImportDetail}}
          />
        </template>,
      );

      // then
      const addButton = screen.getByRole('button', {
        name: t('pages.organization-participants-import.actions.add-sup.label'),
      });
      assert.ok(addButton.hasAttribute('aria-disabled'));
      const replaceButton = screen.getByRole('button', {
        name: t('pages.organization-participants-import.actions.replace.label'),
      });
      assert.ok(replaceButton.hasAttribute('aria-disabled'));
    });
  });

  module('when has errors', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSUPManagingStudents = true;
        organization = {};
      }

      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('display error heading information', async function (assert) {
      // given
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'VALIDATION_ERROR',
        createdAt: new Date(2020, 10, 1),
        createdBy: { firstName: 'Richard', lastName: 'Aldana' },
        updatedAt: new Date(2020, 10, 2),
        importErrors: [{ code: 'UAI_MISMATCHED', meta: {} }],
      });

      const onImportSupStudents = this.onImportSupStudents;
      const onImportScoStudents = this.onImportScoStudents;
      const onReplaceStudents = this.onReplaceStudents;
      const screen = await render(
        <template>
          <Import
            @onImportSupStudents={{onImportSupStudents}}
            @onImportScoStudents={{onImportScoStudents}}
            @onReplaceStudents={{onReplaceStudents}}
            @organizationImportDetail={{organizationImportDetail}}
          />
        </template>,
      );

      assert.ok(screen.getByRole('heading', { name: t('pages.organization-participants-import.error-panel.title') }));
      assert.strictEqual(screen.getAllByRole('listitem').length, 1);
    });
  });

  module('when user is from sup', function (hooks) {
    class CurrentUserSupStub extends Service {
      isAdminInOrganization = true;
      isSUPManagingStudents = true;
      organization = {};
    }

    hooks.beforeEach(function () {
      this.owner.register('service:current-user', CurrentUserSupStub);
    });

    test('it should display Import/Replace Component', async function (assert) {
      // given
      const isLoading = false;
      const onImportSupStudents = this.onImportSupStudents;
      const onImportScoStudents = this.onImportScoStudents;
      const onReplaceStudents = this.onReplaceStudents;

      // when
      const screen = await render(
        <template>
          <Import
            @onImportSupStudents={{onImportSupStudents}}
            @onImportScoStudents={{onImportScoStudents}}
            @onReplaceStudents={{onReplaceStudents}}
            @isLoading={{isLoading}}
            @organizatioImport={{null}}
          />
        </template>,
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
        const isLoading = false;
        const onImportSupStudents = this.onImportSupStudents;
        const onImportScoStudents = this.onImportScoStudents;
        const onReplaceStudents = this.onReplaceStudents;

        // when
        const screen = await render(
          <template>
            <Import
              @onImportSupStudents={{onImportSupStudents}}
              @onImportScoStudents={{onImportScoStudents}}
              @onReplaceStudents={{onReplaceStudents}}
              @isLoading={{isLoading}}
              @organizatioImport={{null}}
            />
          </template>,
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
        const isLoading = false;
        const onImportSupStudents = this.onImportSupStudents;
        const onImportScoStudents = this.onImportScoStudents;
        const onReplaceStudents = this.onReplaceStudents;

        // when
        const screen = await render(
          <template>
            <Import
              @onImportSupStudents={{onImportSupStudents}}
              @onImportScoStudents={{onImportScoStudents}}
              @onReplaceStudents={{onReplaceStudents}}
              @isLoading={{isLoading}}
              @organizatioImport={{null}}
            />
          </template>,
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
        const isLoading = false;
        const onImportSupStudents = this.onImportSupStudents;
        const onImportScoStudents = this.onImportScoStudents;
        const onReplaceStudents = this.onReplaceStudents;

        // when
        const screen = await render(
          <template>
            <Import
              @onImportSupStudents={{onImportSupStudents}}
              @onImportScoStudents={{onImportScoStudents}}
              @onReplaceStudents={{onReplaceStudents}}
              @isLoading={{isLoading}}
              @organizatioImport={{null}}
            />
          </template>,
        );

        const file = new Blob(['foo'], { type: 'valid-file' });

        const addButton = screen.getByLabelText(t('pages.organization-participants-import.actions.add-sup.label'));

        await triggerEvent(addButton, 'change', { files: [file] });

        // then
        assert.ok(onImportSupStudents.calledWithExactly([file]));
        assert.notOk(onReplaceStudents.called);
      });
    });
  });

  module('when user is from sco', (hooks) => {
    class CurrentUserScoStub extends Service {
      isAdminInOrganization = true;
      isSCOManagingStudents = true;
      organization = {};
    }

    hooks.beforeEach(async function () {
      this.owner.register('service:current-user', CurrentUserScoStub);
    });

    test('it should display title and not the loading state', async function (assert) {
      // given
      const isLoading = false;
      const onImportSupStudents = this.onImportSupStudents;
      const onImportScoStudents = this.onImportScoStudents;
      const onReplaceStudents = this.onReplaceStudents;

      // when
      const screen = await render(
        <template>
          <Import
            @onImportSupStudents={{onImportSupStudents}}
            @onImportScoStudents={{onImportScoStudents}}
            @onReplaceStudents={{onReplaceStudents}}
            @isLoading={{isLoading}}
            @organizatioImport={{null}}
          />
        </template>,
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
      const isLoading = false;
      const onImportSupStudents = this.onImportSupStudents;
      const onImportScoStudents = this.onImportScoStudents;
      const onReplaceStudents = this.onReplaceStudents;

      // when
      const screen = await render(
        <template>
          <Import
            @onImportSupStudents={{onImportSupStudents}}
            @onImportScoStudents={{onImportScoStudents}}
            @onReplaceStudents={{onReplaceStudents}}
            @isLoading={{isLoading}}
            @organizatioImport={{null}}
          />
        </template>,
      );

      // then
      assert.ok(
        await screen.findByText(t('pages.organization-participants-import.supported-formats', { types: '.xml, .zip' })),
      );
    });

    test('it trigger importStudentsSpy when clicking on the import button', async function (assert) {
      const isLoading = false;
      const onImportSupStudents = this.onImportSupStudents;
      const onImportScoStudents = this.onImportScoStudents;
      const onReplaceStudents = this.onReplaceStudents;

      const screen = await render(
        <template>
          <Import
            @onImportSupStudents={{onImportSupStudents}}
            @onImportScoStudents={{onImportScoStudents}}
            @onReplaceStudents={{onReplaceStudents}}
            @isLoading={{isLoading}}
            @organizatioImport={{null}}
          />
        </template>,
      );

      const file = new Blob(['foo'], { type: 'valid-file' });
      const input = screen.getByLabelText(t('pages.organization-participants-import.actions.participants.label'));

      await triggerEvent(input, 'change', { files: [file] });

      assert.ok(onImportScoStudents.called);
    });
  });

  module('when organization is SCO and tagged as Agriculture and CFA', (hooks) => {
    hooks.beforeEach(async function () {
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSCOManagingStudents = true;
        isAgriculture = true;
        organization = {};
      }

      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it trigger importStudentsSpy when clicking on the import button', async function (assert) {
      const isLoading = false;
      const onImportSupStudents = this.onImportSupStudents;
      const onImportScoStudents = this.onImportScoStudents;
      const onReplaceStudents = this.onReplaceStudents;

      const screen = await render(
        <template>
          <Import
            @onImportSupStudents={{onImportSupStudents}}
            @onImportScoStudents={{onImportScoStudents}}
            @onReplaceStudents={{onReplaceStudents}}
            @isLoading={{isLoading}}
            @organizatioImport={{null}}
          />
        </template>,
      );

      const file = new Blob(['foo'], { type: 'valid-file' });
      const input = screen.getByLabelText(t('pages.organization-participants-import.actions.participants.label'));

      await triggerEvent(input, 'change', { files: [file] });

      assert.ok(onImportScoStudents.called);
    });

    test('it specify that it require the right file type', async function (assert) {
      const isLoading = false;
      const onImportSupStudents = this.onImportSupStudents;
      const onImportScoStudents = this.onImportScoStudents;
      const onReplaceStudents = this.onReplaceStudents;
      const screen = await render(
        <template>
          <Import
            @onImportSupStudents={{onImportSupStudents}}
            @onImportScoStudents={{onImportScoStudents}}
            @onReplaceStudents={{onReplaceStudents}}
            @isLoading={{isLoading}}
            @organizatioImport={{null}}
          />
        </template>,
      );

      assert.ok(
        await screen.findByText(t('pages.organization-participants-import.supported-formats', { types: '.csv' })),
      );
    });
  });

  module('when user has import feature', function (hooks) {
    class CurrentUserImportFeatureStub extends Service {
      isAdminInOrganization = true;
      hasLearnerImportFeature = true;
      organization = {};
    }

    hooks.beforeEach(function () {
      this.owner.register('service:current-user', CurrentUserImportFeatureStub);
    });

    test('it trigger the importOrganizationLearners spy when clicking import button', async function (assert) {
      const onImportLearners = this.onImportLearners;
      const screen = await render(
        <template>
          <Import @onImportLearners={{onImportLearners}} @isLoading={{false}} @organizatioImport={{null}} />
        </template>,
      );

      const file = new Blob(['foo'], { type: 'valid-file' });
      const input = screen.getByLabelText(t('pages.organization-participants-import.actions.participants.label'));

      await triggerEvent(input, 'change', { files: [file] });
      assert.ok(onImportLearners.calledWithExactly([file]));
    });
  });
});
