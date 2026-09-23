import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ImportBanner from 'pix-orga/components/import/banner';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Import::Banner', function (hooks) {
  setupIntlRenderingTest(hooks);
  let intlService;

  hooks.beforeEach(function () {
    intlService = this.owner.lookup('service:intl');
  });

  module('inProgress', function () {
    test('it should display loading message', async function (assert) {
      // when
      const isLoading = true;
      const screen = await render(
        <template><ImportBanner @isLoading={{isLoading}} @organizationImportDetail={{null}} /></template>,
      );

      // then
      assert.ok(screen.getByText(t('pages.organization-participants-import.banner.upload-in-progress')));
    });

    test('it should display loading message when upload is finished but job has not started', async function (assert) {
      // when
      const store = this.owner.lookup('service:store');
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'UPLOADING',
        createdAt: new Date(2023, 10, 2),
        createdBy: { firstName: 'Obi', lastName: 'Wan' },
      });
      const isLoading = false;
      const screen = await render(
        <template>
          <ImportBanner @isLoading={{isLoading}} @organizationImportDetail={{organizationImportDetail}} />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('pages.organization-participants-import.banner.upload-in-progress')));
    });

    test('it should display loading message when there is already an import', async function (assert) {
      // when
      const store = this.owner.lookup('service:store');
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'UPLOADED',
        createdAt: new Date(2023, 10, 2),
        createdBy: { firstName: 'Obi', lastName: 'Wan' },
      });
      const isLoading = true;
      const screen = await render(
        <template>
          <ImportBanner @isLoading={{isLoading}} @organizationImportDetail={{organizationImportDetail}} />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('pages.organization-participants-import.banner.upload-in-progress')));
    });

    test('display validation in progress banner', async function (assert) {
      //given
      const store = this.owner.lookup('service:store');
      const createdAt = new Date(2023, 1, 10);
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'UPLOADED',
        createdAt,
        createdBy: { firstName: 'Obi', lastName: 'Wan' },
      });

      // when
      const isLoading = false;
      const screen = await render(
        <template>
          <ImportBanner @isLoading={{isLoading}} @organizationImportDetail={{organizationImportDetail}} />
        </template>,
      );
      assert.ok(
        screen.getByText(t('pages.organization-participants-import.banner.validation-in-progress'), {
          exact: false,
        }),
      );
      assert.ok(
        screen.getByText(
          t('pages.organization-participants-import.banner.upload-completed', {
            firstName: 'Obi',
            lastName: 'Wan',
            date: intlService.formatDate(createdAt, { format: 'LLL' }),
          }),
          { exact: false },
        ),
      );
      assert.ok(
        screen.getByText(t('pages.organization-participants-import.banner.in-progress-text'), {
          exact: false,
        }),
      );
    });

    test('display import in progress banner', async function (assert) {
      //given
      const store = this.owner.lookup('service:store');
      const createdAt = new Date(2023, 1, 10);
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'VALIDATED',
        createdAt,
        createdBy: { firstName: 'Obi', lastName: 'Wan' },
      });

      // when
      const isLoading = false;
      const screen = await render(
        <template>
          <ImportBanner @isLoading={{isLoading}} @organizationImportDetail={{organizationImportDetail}} />
        </template>,
      );
      assert.ok(
        screen.getByText(t('pages.organization-participants-import.banner.import-in-progress'), {
          exact: false,
        }),
      );
      assert.ok(
        screen.getByText(
          t('pages.organization-participants-import.banner.upload-completed', {
            firstName: 'Obi',
            lastName: 'Wan',
            date: intlService.formatDate(createdAt, { format: 'LLL' }),
          }),
          { exact: false },
        ),
      );
      assert.ok(
        screen.getByText(t('pages.organization-participants-import.banner.in-progress-text'), {
          exact: false,
        }),
      );
    });
  });

  module('success', function () {
    test('display success banner with warnings', async function (assert) {
      const store = this.owner.lookup('service:store');
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'IMPORTED',
        createdBy: { firstName: 'Richard', lastName: 'Aldana' },
        createdAt: new Date(2020, 10, 1),
        updatedAt: new Date(2020, 10, 2),
        importErrors: [{ code: 'UAI_MISMATCHED', meta: {} }],
      });
      // when
      const isLoading = false;
      const screen = await render(
        <template>
          <ImportBanner @isLoading={{isLoading}} @organizationImportDetail={{organizationImportDetail}} />
        </template>,
      );

      assert.ok(
        screen.getByText(
          t('pages.organization-participants-import.global-success', {
            firstName: 'Richard',
            lastName: 'Aldana',
            date: intlService.formatDate(organizationImportDetail.updatedAt, { format: 'LLL' }),
          }),
        ),
      );
      assert.ok(screen.getByRole('link', 'mailto:sup@pix.fr'));
    });

    test('display success banner without warning', async function (assert) {
      const store = this.owner.lookup('service:store');
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'IMPORTED',
        createdBy: { firstName: 'Richard', lastName: 'Aldana' },
        updatedAt: new Date(2020, 10, 2),
      });
      // when
      const isLoading = false;
      const screen = await render(
        <template>
          <ImportBanner @isLoading={{isLoading}} @organizationImportDetail={{organizationImportDetail}} />
        </template>,
      );

      assert.ok(
        screen.getByText(
          t('pages.organization-participants-import.global-success', {
            firstName: 'Richard',
            lastName: 'Aldana',
            date: intlService.formatDate(organizationImportDetail.updatedAt, { format: 'LLL' }),
          }),
        ),
      );
      assert.notOk(screen.queryByRole('link', 'mailto:sup@pix.fr'));
    });

    test('hide action message when there is warning', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'IMPORTED',
        createdBy: { firstName: 'Richard', lastName: 'Aldana' },
        updatedAt: new Date(2020, 10, 2),
        importErrors: [{ code: 'warning', meta: {} }],
      });
      // when
      const screen = await render(
        <template>
          <ImportBanner @isLoading={{false}} @organizationImportDetail={{organizationImportDetail}} />
        </template>,
      );
      // then
      assert.notOk(
        screen.queryByText(t('pages.organization-participants-import.banner.error-text'), {
          exact: false,
        }),
      );
    });
  });

  module('errors', function () {
    test('display validation error banner when validation failed (fix)', async function (assert) {
      const store = this.owner.lookup('service:store');
      const createdAt = new Date(2023, 1, 10);
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'VALIDATION_ERROR',
        createdAt,
        createdBy: { firstName: 'Dark', lastName: 'Vador' },
        importErrors: [{ meta: [{ code: 'UAI_MISMATCHED' }], name: 'AggregateImportError' }],
        hasFixableErrors: true,
      });
      // when
      const isLoading = false;
      const screen = await render(
        <template>
          <ImportBanner
            @isLoading={{isLoading}}
            @organizationImportDetail={{organizationImportDetail}}
            @errorPanelId="error-panel"
          />
        </template>,
      );

      assert.ok(
        screen.getByText(t('pages.organization-participants-import.banner.validation-error'), {
          exact: false,
        }),
      );
      assert.ok(screen.getByRole('link', { name: t('pages.organization-participants-import.banner.anchor-error') }));
      assert.ok(
        screen.getByText(
          t('pages.organization-participants-import.banner.upload-completed', {
            firstName: 'Dark',
            lastName: 'Vador',
            date: intlService.formatDate(createdAt, { format: 'LLL' }),
          }),
          { exact: false },
        ),
      );

      assert.ok(screen.getByText(t('pages.organization-participants-import.banner.fix-error-text'), { exact: false }));
    });

    test('display import error banner when import failed (retry)', async function (assert) {
      const store = this.owner.lookup('service:store');
      const createdAt = new Date(2023, 1, 10);
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'IMPORT_ERROR',
        createdAt,
        createdBy: { firstName: 'Dark', lastName: 'Vador' },
        importErrors: [
          {
            name: 'OrganizationLearnersCouldNotBeSavedError',
            message: 'An error occurred during process',
          },
        ],
        hasFixableErrors: false,
      });
      // when
      const isLoading = false;
      const screen = await render(
        <template>
          <ImportBanner @isLoading={{isLoading}} @organizationImportDetail={{organizationImportDetail}} />
        </template>,
      );

      assert.ok(
        screen.getByText(t('pages.organization-participants-import.banner.import-error'), {
          exact: false,
        }),
      );
      assert.notOk(
        screen.queryByRole('link', { name: t('pages.organization-participants-import.banner.anchor-error') }),
      );
      assert.ok(
        screen.getByText(
          t('pages.organization-participants-import.banner.upload-completed', {
            firstName: 'Dark',
            lastName: 'Vador',
            date: intlService.formatDate(createdAt, { format: 'LLL' }),
          }),
          { exact: false },
        ),
      );
      assert.ok(
        screen.getByText(t('pages.organization-participants-import.banner.retry-error-text'), { exact: false }),
      );
    });
  });

  module('anchor banner', function () {
    test('display error anchor when import is in error', async function (assert) {
      const store = this.owner.lookup('service:store');
      const createdAt = new Date(2023, 1, 10);
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'IMPORT_ERROR',
        createdAt,
        createdBy: { firstName: 'Dark', lastName: 'Vador' },
        importErrors: [{ code: 'ERROR', meta: {} }],
        hasFixableErrors: true,
      });
      // when
      const isLoading = false;
      const screen = await render(
        <template>
          <ImportBanner @isLoading={{isLoading}} @organizationImportDetail={{organizationImportDetail}} />
        </template>,
      );
      assert.ok(
        screen.getByRole('link', {
          name: t('pages.organization-participants-import.banner.anchor-error'),
          href: '#error-panel',
        }),
      );
    });
    test('not display error anchor when import is not in error', async function (assert) {
      //given
      const store = this.owner.lookup('service:store');
      const createdAt = new Date(2023, 1, 10);
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'VALIDATED',
        createdAt,
        createdBy: { firstName: 'Obi', lastName: 'Wan' },
      });

      // when
      const screen = await render(
        <template>
          <ImportBanner @isLoading={{false}} @organizationImportDetail={{organizationImportDetail}} />
        </template>,
      );
      assert.notOk(
        screen.queryByRole('link', {
          name: t('pages.organization-participants-import.banner.anchor-error'),
          href: '#error-panel',
        }),
      );
    });
  });
});
