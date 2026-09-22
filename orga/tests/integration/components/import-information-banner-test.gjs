import { render } from '@1024pix/ember-testing-library';
import dayjs from 'dayjs';
import { t } from 'ember-intl/test-support';
import ImportInformationBanner from 'pix-orga/components/import-information-banner';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | ImportInformationBanner', function (hooks) {
  setupIntlRenderingTest(hooks);
  let clock;

  hooks.beforeEach(function () {
    clock = sinon.useFakeTimers({ now: new Date('2024-07-07') });
  });

  hooks.afterEach(function () {
    clock.restore();
  });

  test('it show nothing when there is no import', async function (assert) {
    // when
    const screen = await render(<template><ImportInformationBanner /></template>);

    // then
    const banner = screen.queryByRole('paragraph');
    assert.dom(banner).doesNotExist();
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
    const banner = screen.queryByRole('paragraph');
    assert.dom(banner).doesNotExist();
  });

  ['UPLOADING', 'UPLOADED', 'VALIDATED'].forEach(async function (status) {
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
        screen.getByText(t('components.import-information-banner.in-progress'), {
          exact: false,
        }),
      );

      // then
      const banner = screen.queryByRole('paragraph');
      assert.dom(banner).exists();

      assert.ok(
        screen.getByRole(
          'link',
          { name: t('components.import-information-banner.in-progress-link') },
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
      createdBy: {
        firstName: 'Alain',
        lastName: 'Terieur',
      },
    });
    // when
    const screen = await render(<template><ImportInformationBanner @importDetail={{importDetail}} /></template>);
    assert.ok(
      screen.getByText(
        t('components.import-information-banner.success', {
          firstname: importDetail.createdBy.firstName,
          lastname: importDetail.createdBy.lastName,
          date: dayjs(importDetail.updatedAt).format('D MMM YYYY'),
        }),
      ),
    );
  });

  ['UPLOAD_ERROR', 'IMPORT_ERROR', 'VALIDATION_ERROR'].forEach(async function (status) {
    test(`display import error banner when status is ${status}`, async function (assert) {
      const store = this.owner.lookup('service:store');
      const importDetail = store.createRecord('organization-import-detail', {
        status,
        updatedAt: dayjs().toDate(),
        importErrors: [{ code: 'some_error' }],
      });
      // when
      const screen = await render(<template><ImportInformationBanner @importDetail={{importDetail}} /></template>);

      assert.ok(
        screen.getByText(t('components.import-information-banner.error'), {
          exact: false,
        }),
      );
      assert.ok(
        screen.getByRole('link', { name: t('components.import-information-banner.error-link') }, { exact: false }),
      );
    });
  });
});
