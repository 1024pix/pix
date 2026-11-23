import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import UpdateOrganizationImportFormat from 'pix-admin/components/administration/organizations/update-organization-import-format';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | administration/update-organization-import-format', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  let store, adapter, notificationSuccessStub, saveAdapterStub, notificationErrorStub;
  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    adapter = store.adapterFor('import-files');
    saveAdapterStub = sinon.stub(adapter, 'updateOrganizationImportFormat');
    notificationSuccessStub = sinon.stub();
    notificationErrorStub = sinon.stub().returns();
  });

  module('when import succeeds', function () {
    test('it displays a success notification', async function (assert) {
      // given
      const files = Symbol('file');
      class NotificationsStub extends Service {
        sendSuccessNotification = notificationSuccessStub;
        sendErrorNotification = notificationErrorStub;
      }
      this.owner.register('service:pixToast', NotificationsStub);
      saveAdapterStub.withArgs([files]).resolves();

      // when
      const screen = await render(<template><UpdateOrganizationImportFormat /></template>);
      const input = await screen.findByLabelText(
        t('components.administration.organization-import-format.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [files] });

      // then
      assert.ok(true);
      assert.ok(notificationErrorStub.notCalled);
      assert.ok(
        notificationSuccessStub.calledWith({
          message: t('components.administration.organization-import-format.notifications.success'),
        }),
      );
    });
  });

  module('when import fails', function () {
    test('it displays a specific error notification on missing required field', async function (assert) {
      // given
      const files = Symbol('file');
      class NotificationsStub extends Service {
        sendErrorNotification = notificationErrorStub;
        sendSuccessNotification = notificationSuccessStub;
      }
      saveAdapterStub.withArgs([files]).rejects({
        errors: [{ status: '422', meta: 'POUET', code: 'MISSING_REQUIRED_FIELD_NAMES' }],
      });
      this.owner.register('service:pixToast', NotificationsStub);

      // when
      const screen = await render(<template><UpdateOrganizationImportFormat /></template>);
      const input = await screen.findByLabelText(
        t('components.administration.organization-import-format.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [files] });

      // then
      assert.ok(notificationSuccessStub.notCalled);
      assert.ok(notificationErrorStub.calledWithExactly({ message: 'POUET' }));
    });

    test('it displays an error notification', async function (assert) {
      // given
      const files = Symbol('file');
      class NotificationsStub extends Service {
        sendErrorNotification = notificationErrorStub;
        sendSuccessNotification = notificationSuccessStub;
      }
      saveAdapterStub.withArgs([files]).rejects({
        errors: [{ status: '422', title: "Un soucis avec l'import", code: '422', detail: 'Erreur d’import' }],
      });
      this.owner.register('service:pixToast', NotificationsStub);

      // when
      const screen = await render(<template><UpdateOrganizationImportFormat /></template>);
      const input = await screen.findByLabelText(
        t('components.administration.organization-import-format.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [files] });

      // then
      assert.ok(notificationSuccessStub.notCalled);
      assert.ok(notificationErrorStub.called);
    });
  });
});
