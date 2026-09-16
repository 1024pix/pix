import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import OrganizationsImport from 'pix-admin/components/administration/deployment/organizations-import';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component |  administration/organizations-import', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  let store, adapter, notificationSuccessStub, saveAdapterStub, notificationErrorStub;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    adapter = store.adapterFor('organizations-import');
    saveAdapterStub = sinon.stub(adapter, 'addOrganizationsCsv');
    notificationSuccessStub = sinon.stub();
    notificationErrorStub = sinon.stub().returns();
  });

  module('when import succeeds', function () {
    test('it displays a success notification', async function (assert) {
      // given
      const file = new Blob(['foo'], { type: `valid-file` });
      class NotificationsStub extends Service {
        sendSuccessNotification = notificationSuccessStub;
      }
      this.owner.register('service:pixToast', NotificationsStub);
      saveAdapterStub.withArgs([file]).resolves({
        data: [{ id: '1' }, { id: '2' }, { id: '3' }],
      });

      // when
      const screen = await render(<template><OrganizationsImport /></template>);
      const input = await screen.findByLabelText(t('components.administration.organizations-import.upload-button'));
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.true(
        notificationSuccessStub.calledWith({
          message: t('components.administration.organizations-import.notifications.success', { count: 3 }),
        }),
      );
    });
  });

  module('when import fails', function () {
    module('when response error contains no errors property', function () {
      test('it displays a generic error notification', async function (assert) {
        // given
        const file = new Blob(['foo'], { type: `valid-file` });
        class NotificationsStub extends Service {
          sendErrorNotification = notificationErrorStub;
        }
        this.owner.register('service:pixToast', NotificationsStub);

        saveAdapterStub.withArgs([file]).rejects();

        // when
        const screen = await render(<template><OrganizationsImport /></template>);
        const input = await screen.findByLabelText(t('components.administration.organizations-import.upload-button'));
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.ok(notificationErrorStub.calledWithExactly({ message: t('common.notifications.generic-error') }));
      });
    });

    module('when error code is "PARENT_ORGANIZATION_NOT_IN_NETWORK"', function () {
      test('it displays a correct error notification', async function (assert) {
        // given
        const file = new Blob(['foo'], { type: `valid-file` });
        class NotificationsStub extends Service {
          sendErrorNotification = notificationErrorStub;
        }
        this.owner.register('service:pixToast', NotificationsStub);

        saveAdapterStub.withArgs([file]).rejects({
          errors: [
            { code: 'PARENT_ORGANIZATION_NOT_IN_NETWORK', meta: { parentOrganizationId: 1234, currentLine: 2 } },
          ],
        });

        // when
        const screen = await render(<template><OrganizationsImport /></template>);
        const input = await screen.findByLabelText(t('components.administration.organizations-import.upload-button'));
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.ok(notificationErrorStub.calledOnce);
        const [{ message }] = notificationErrorStub.firstCall.args;
        const errorMessage = message.toString();

        assert.true(
          errorMessage.includes(
            t('components.administration.organizations-import.notifications.errors.no-organization-created'),
          ),
        );
        assert.true(errorMessage.includes('parentOrganizationId'));
        assert.true(errorMessage.includes('1234'));
        assert.true(errorMessage.includes('2'));
      });
    });

    module('when error code is "STRUCTURE_CATEGORY_NOT_FOUND"', function () {
      test('it displays a correct error notification', async function (assert) {
        // given
        const file = new Blob(['foo'], { type: `valid-file` });
        class NotificationsStub extends Service {
          sendErrorNotification = notificationErrorStub;
        }
        this.owner.register('service:pixToast', NotificationsStub);

        saveAdapterStub.withArgs([file]).rejects({
          errors: [{ code: 'STRUCTURE_CATEGORY_NOT_FOUND', meta: { structureCategoryId: 80, currentLine: 2 } }],
        });

        // when
        const screen = await render(<template><OrganizationsImport /></template>);
        const input = await screen.findByLabelText(t('components.administration.organizations-import.upload-button'));
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.ok(notificationErrorStub.calledOnce);
        const [{ message }] = notificationErrorStub.firstCall.args;
        const errorMessage = message.toString();

        assert.true(
          errorMessage.includes(
            t('components.administration.organizations-import.notifications.errors.no-organization-created'),
          ),
        );
        assert.true(errorMessage.includes('categoryId'));
        assert.true(errorMessage.includes('80'));
        assert.true(errorMessage.includes('2'));
      });
    });

    module('when error code is "MISSING_REQUIRED_FIELD_NAMES"', function () {
      test('it displays the correct error notification', async function (assert) {
        // given
        const file = new Blob(['foo'], { type: `valid-file` });
        class NotificationsStub extends Service {
          sendErrorNotification = notificationErrorStub;
        }
        this.owner.register('service:pixToast', NotificationsStub);

        const error = { code: 'MISSING_REQUIRED_FIELD_NAMES', meta: "Erreur lors de l'import." };

        saveAdapterStub.withArgs([file]).rejects({
          errors: [error],
        });

        // when
        const screen = await render(<template><OrganizationsImport /></template>);
        const input = await screen.findByLabelText(t('components.administration.organizations-import.upload-button'));
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.ok(notificationErrorStub.calledOnce);
        const [{ message }] = notificationErrorStub.firstCall.args;
        const errorMessage = message.toString();

        assert.true(errorMessage.includes(error.meta.toString()));
      });
    });
  });
});
