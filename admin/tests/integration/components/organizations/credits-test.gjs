import { render, within } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { click } from '@ember/test-helpers';
import Credits from 'pix-admin/components/organizations/credits';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | organizations/credits', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store, pixToast, router;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');

    pixToast = this.owner.lookup('service:pixToast');
    sinon.stub(pixToast, 'sendSuccessNotification').resolves();
    sinon.stub(pixToast, 'sendErrorNotification').resolves();

    router = this.owner.lookup('service:router');
    sinon.stub(router, 'refresh');
  });

  module('Layout', function () {
    test('it displays page title', async function (assert) {
      // given
      const creditsLot = [];

      // when
      const screen = await render(<template><Credits @creditsLot={{creditsLot}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { name: t('pages.organization.credits.title') })).exists();
    });
  });

  module('when there are no credits lots', function () {
    test('it displays an empty table message', async function (assert) {
      // given
      const creditsLot = [];
      const organization = EmberObject.create({
        id: 9999,
      });

      // when
      const screen = await render(
        <template><Credits @creditsLot={{creditsLot}} @organization={{organization}} /></template>,
      );

      // then
      assert.dom(screen.getByText(t('components.organizations.credits.table.empty'))).exists();
      assert
        .dom(screen.queryByRole('table', { name: t('components.organizations.credits.table.caption') }))
        .doesNotExist();
    });

    module('when there are credits lots', function () {
      test('it displays the table with caption and column headers and cells', async function (assert) {
        // given
        const creditsLot = [
          store.createRecord('credits-lot', {
            id: '123',
            count: 456,
            reference: 'REF123',
            activationDate: '2026-01-01',
            expirationDate: '2027-12-12',
            creatorFullName: 'Peter Parker',
            status: 'ACTIVE',
          }),
        ];

        // when
        const screen = await render(<template><Credits @creditsLot={{creditsLot}} /></template>);

        // then
        assert
          .dom(
            screen.getByRole('table', {
              name: t('components.organizations.credits.table.caption'),
            }),
          )
          .exists();

        assert
          .dom(
            screen.getByRole('columnheader', {
              name: t('components.organizations.credits.table.headers.count'),
            }),
          )
          .exists();
        assert
          .dom(
            screen.getByRole('cell', {
              name: 456,
            }),
          )
          .exists();

        assert
          .dom(
            screen.getByRole('columnheader', {
              name: t('components.organizations.credits.table.headers.reference'),
            }),
          )
          .exists();
        assert
          .dom(
            screen.getByRole('cell', {
              name: 'REF123',
            }),
          )
          .exists();

        assert
          .dom(
            screen.getByRole('columnheader', {
              name: t('components.organizations.credits.table.headers.activationDate'),
            }),
          )
          .exists();
        assert
          .dom(
            screen.getByRole('cell', {
              name: '01/01/2026',
            }),
          )
          .exists();

        assert
          .dom(
            screen.getByRole('columnheader', {
              name: t('components.organizations.credits.table.headers.expirationDate'),
            }),
          )
          .exists();
        assert
          .dom(
            screen.getByRole('cell', {
              name: '12/12/2027',
            }),
          )
          .exists();

        assert
          .dom(
            screen.getByRole('columnheader', {
              name: t('components.organizations.credits.table.headers.status'),
            }),
          )
          .exists();
        assert
          .dom(
            screen.getByRole('cell', {
              name: t('components.organizations.credits.table.status.ACTIVE'),
            }),
          )
          .exists();

        assert
          .dom(
            screen.getByRole('columnheader', {
              name: t('components.organizations.credits.table.headers.creatorFullName'),
            }),
          )
          .exists();
        assert
          .dom(
            screen.getByRole('cell', {
              name: 'Peter Parker',
            }),
          )
          .exists();
      });

      test('it opens a modal when clicking the create button', async function (assert) {
        // when
        const creditsLot = [];
        const screen = await render(<template><Credits @creditsLot={{creditsLot}} /></template>);
        await click(
          screen.getByRole('button', {
            name: t('components.organizations.credits.creation.open-button'),
          }),
        );
        const modal = await screen.findByRole('dialog');

        // then
        assert
          .dom(
            within(modal).getByRole('heading', {
              name: t('components.organizations.credits.creation.modal-title'),
            }),
          )
          .exists();
      });

      test('it does not render the form when the modal is hidden', async function (assert) {
        // given
        const creditsLot = [];

        // when
        const screen = await render(<template><Credits @creditsLot={{creditsLot}} /></template>);

        // then
        assert
          .dom(
            screen.queryByLabelText(t('components.organizations.credits.creation.labels.count'), {
              hidden: true,
              exact: false,
            }),
          )
          .doesNotExist();
      });
    });
  });
});
