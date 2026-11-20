import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import PlacesLotCreationForm from 'pix-admin/components/organizations/places-lot-creation-form';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/places-lot-creation-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('Should send add organization places set request to API', async function (assert) {
    // given
    const create = sinon.stub();

    const screen = await render(<template><PlacesLotCreationForm @create={{create}} /></template>);

    // when
    await fillIn(screen.getByLabelText('Nombre : *', { exact: false }), 10);
    await fillIn(screen.getByLabelText("Date d'activation *", { exact: false }), '2022-10-20');
    await fillIn(screen.getByLabelText("Date d'expiration *", { exact: false }), '2022-10-20');

    const select = screen.getByRole('button', { name: /Catégorie/ });

    await click(select);

    await click(await screen.findByRole('option', { name: 'Tarif gratuit' }));

    await fillIn(screen.getByLabelText('Référence *', { exact: false }), '123ABC');
    await click(screen.getByRole('button', { name: 'Ajouter' }));
    // then
    sinon.assert.calledOnce(create);
    assert.ok(true);
  });

  test('Should cannot click twice on validate button', async function (assert) {
    // given
    const create = sinon.stub().returns(new Promise(() => {}));

    const screen = await render(<template><PlacesLotCreationForm @create={{create}} /></template>);

    // when
    await fillIn(screen.getByLabelText('Nombre : *', { exact: false }), 10);
    await fillIn(screen.getByLabelText("Date d'activation *", { exact: false }), '2022-10-20');
    await fillIn(screen.getByLabelText("Date d'expiration *", { exact: false }), '2022-12-20');

    const select = screen.getByRole('button', { name: /Catégorie/ });

    await click(select);

    await screen.findByRole('listbox');

    await click(await screen.findByRole('option', { name: 'Tarif gratuit' }));

    await fillIn(screen.getByLabelText('Référence *', { exact: false }), '123ABC');
    await click(screen.getByRole('button', { name: 'Ajouter' }));

    assert.throws(function () {
      screen.getByRole('button', { name: 'Ajouter' });
    });
  });

  module('errors', function () {
    module('when required fields are not filled in', function () {
      test('should not submit form', async function (assert) {
        // given
        const create = sinon.stub();

        const screen = await render(<template><PlacesLotCreationForm @create={{create}} /></template>);

        // when
        await click(screen.getByRole('button', { name: t('common.actions.add') }));

        // then
        assert.ok(create.notCalled);
      });
    });

    test('should display error toast and display specific error messages on required fields', async function (assert) {
      // given
      const errorNotificationStub = sinon.stub();
      class NotificationsStub extends Service {
        sendErrorNotification = errorNotificationStub;
      }
      this.owner.register('service:pixToast', NotificationsStub);

      const screen = await render(<template><PlacesLotCreationForm /></template>);

      // when
      await click(screen.getByRole('button', { name: t('common.actions.add') }));

      // then
      const countErrorMessage = screen.getByText(t('components.organizations.places.creation.error-messages.count'));
      const expirationDateErrorMessage = screen.getByText(
        t('components.organizations.places.creation.error-messages.expiration-date'),
      );
      const referenceErrorMessage = screen.getByText(
        t('components.organizations.places.creation.error-messages.reference'),
      );
      const categoryErrorMessage = screen.getByText(
        t('components.organizations.places.creation.error-messages.category'),
      );

      assert.ok(countErrorMessage);
      assert.ok(expirationDateErrorMessage);
      assert.ok(referenceErrorMessage);
      assert.ok(categoryErrorMessage);
      assert.ok(
        errorNotificationStub.calledWithExactly({
          message: t('components.organizations.places.creation.error-messages.submit'),
        }),
      );
    });
  });
});
