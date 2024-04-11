import { render } from '@1024pix/ember-testing-library';
import dayjs from 'dayjs';
import ImportInformationBanner from 'pix-orga/components/import-information-banner';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | ImportInformationBanner', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it show nothing when there is no import', async function (assert) {
    // when
    const screen = await render(<template><ImportInformationBanner /></template>);

    // then
    assert.notOk(screen.queryByText(this.intl.t('components.import-information-banner.success')));
    assert.notOk(screen.queryByText(this.intl.t('components.import-information-banner.error')));
    assert.notOk(screen.queryByText(this.intl.t('components.import-information-banner.in-progress')));
  });

  test('it show nothing when there is no import since 14 days', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const updatedAt = dayjs().subtract(16, 'day').toDate();
    const importDetail = store.createRecord('organization-import-detail', {
      status: 'IMPORTED',
      updatedAt,
    });
    // when
    const screen = await render(<template><ImportInformationBanner @importDetail={{importDetail}} /></template>);

    // then
    assert.notOk(screen.queryByText(this.intl.t('components.import-information-banner.success')));
    assert.notOk(screen.queryByText(this.intl.t('components.import-information-banner.error')));
    assert.notOk(screen.queryByText(this.intl.t('components.import-information-banner.in-progress')));
  });
  ['UPLOADED', 'VALIDATED'].forEach(async function (status) {
    test(`display import in progress banner when status is ${status}`, async function (assert) {
      //given
      const store = this.owner.lookup('service:store');
      const importDetail = store.createRecord('organization-import-detail', {
        status,
        updatedAt: dayjs().toDate(),
      });

      // when
      const screen = await render(<template><ImportInformationBanner @importDetail={{importDetail}} /></template>);
      assert.ok(
        screen.getByText(this.intl.t('components.import-information-banner.in-progress'), {
          exact: false,
        }),
      );

      assert.ok(
        screen.getByRole(
          'link',
          { name: this.intl.t('components.import-information-banner.in-progress-link') },
          { exact: false },
        ),
      );
    });
  });

  test('display success banner', async function (assert) {
    const store = this.owner.lookup('service:store');
    const importDetail = store.createRecord('organization-import-detail', {
      status: 'IMPORTED',
      updatedAt: dayjs().toDate(),
    });
    // when
    const screen = await render(<template><ImportInformationBanner @importDetail={{importDetail}} /></template>);

    assert.ok(
      screen.getByText(this.intl.t('components.import-information-banner.success'), {
        exact: false,
      }),
    );
  });

  ['UPLOAD_ERROR', 'IMPORT_ERROR', 'VALIDATION_ERROR'].forEach(async function (status) {
    test(`display import error banner when status is ${status}`, async function (assert) {
      const store = this.owner.lookup('service:store');
      const importDetail = store.createRecord('organization-import-detail', {
        status,
        updatedAt: dayjs().toDate(),
        errors: [{ code: 'some_error' }],
      });
      // when
      const screen = await render(<template><ImportInformationBanner @importDetail={{importDetail}} /></template>);

      assert.ok(
        screen.getByText(this.intl.t('components.import-information-banner.error'), {
          exact: false,
        }),
      );
      assert.ok(
        screen.getByRole(
          'link',
          { name: this.intl.t('components.import-information-banner.error-link') },
          { exact: false },
        ),
      );
    });
  });
});
