import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import CreationForm from 'pix-admin/components/networks/creation-form';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | networks/creation-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store, pixToast;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    sinon.stub(store, 'createRecord').returns({
      save: sinon.stub().resolves(),
      rollbackAttributes: sinon.stub(),
    });

    pixToast = this.owner.lookup('service:pixToast');
    sinon.stub(pixToast, 'sendSuccessNotification');
    sinon.stub(pixToast, 'sendErrorNotification');

    const router = this.owner.lookup('service:router');
    sinon.stub(router, 'transitionTo');
  });

  test('it renders the form fields and submit button', async function (assert) {
    // when
    const screen = await render(<template><CreationForm /></template>);

    // then
    assert.ok(screen.getByRole('textbox', { name: `${t('components.networks.creation.name.label')} *` }));
    assert.ok(screen.getByRole('textbox', { name: `${t('components.networks.creation.organization-id.label')} *` }));
    assert.ok(screen.getByRole('button', { name: t('components.networks.creation.actions.submit') }));
  });

  module('when submitting a valid form', function () {
    test('creates the network and shows a success notification', async function (assert) {
      // given
      const screen = await render(<template><CreationForm /></template>);

      // when
      await fillByLabel(`${t('components.networks.creation.name.label')} *`, 'Mon super réseau');
      await fillByLabel(`${t('components.networks.creation.organization-id.label')} *`, '123');
      await click(screen.getByRole('button', { name: t('components.networks.creation.actions.submit') }));

      // then
      assert.ok(store.createRecord.calledOnce);

      const [modelName, attrs] = store.createRecord.getCall(0).args;
      assert.strictEqual(modelName, 'network');
      assert.deepEqual(attrs, { name: 'Mon super réseau', organizationId: '123' });
      assert.ok(
        pixToast.sendSuccessNotification.calledOnceWith({
          message: t('components.networks.creation.notifications.success'),
        }),
      );
    });
  });

  module('when the save fails', function () {
    test('displays an error notification and rollbacks the record', async function (assert) {
      // given
      const networkRecord = { save: sinon.stub().rejects(), rollbackAttributes: sinon.stub() };
      store.createRecord.returns(networkRecord);

      const screen = await render(<template><CreationForm /></template>);

      // when
      await fillByLabel(`${t('components.networks.creation.name.label')} *`, 'Mon super réseau');
      await fillByLabel(`${t('components.networks.creation.organization-id.label')} *`, '123');
      await click(screen.getByRole('button', { name: t('components.networks.creation.actions.submit') }));

      // then
      assert.ok(
        pixToast.sendErrorNotification.calledOnceWith({
          message: t('components.networks.creation.notifications.error'),
        }),
      );
      assert.ok(networkRecord.rollbackAttributes.calledOnce);
    });
  });

  module('when submitting an empty form', function () {
    test('does not create a network', async function (assert) {
      // given
      const screen = await render(<template><CreationForm /></template>);

      // when
      await click(screen.getByRole('button', { name: t('components.networks.creation.actions.submit') }));

      // then
      assert.ok(store.createRecord.notCalled);
    });

    test('shows a validation error notification', async function (assert) {
      // given
      const screen = await render(<template><CreationForm /></template>);

      // when
      await click(screen.getByRole('button', { name: t('components.networks.creation.actions.submit') }));

      // then
      assert.ok(pixToast.sendErrorNotification.calledOnce);
    });

    test('focuses on the first field in error', async function (assert) {
      // given
      const screen = await render(<template><CreationForm /></template>);

      // when
      await click(screen.getByRole('button', { name: t('components.networks.creation.actions.submit') }));

      // then
      const nameInput = screen.getByRole('textbox', { name: `${t('components.networks.creation.name.label')} *` });
      assert.strictEqual(document.activeElement, nameInput);
    });
  });
});
