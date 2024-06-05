import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  administration/organizations-import', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  let store, adapter, notificationSuccessStub, clearAllStub, saveAdapterStub, notificationErrorStub;
  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    adapter = store.adapterFor('organizations-import');
    saveAdapterStub = sinon.stub(adapter, 'addOrganizationsCsv');
    notificationSuccessStub = sinon.stub();
    notificationErrorStub = sinon.stub().returns();

    clearAllStub = sinon.stub();
  });

  module('when import succeeds', function () {
    test.skip('it displays a success notification', async function (assert) {
      // given
      const file = new Blob(['foo'], { type: `valid-file` });
      class NotificationsStub extends Service {
        success = notificationSuccessStub;
        clearAll = clearAllStub;
      }
      this.owner.register('service:notifications', NotificationsStub);
      saveAdapterStub.withArgs(file).resolves();

      // when
      const screen = await render(hbs`<Administration::OrganizationsImport />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.organizations-import.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(true);
      sinon.assert.calledWith(
        notificationSuccessStub,
        this.intl.t('components.administration.organizations-import.notifications.success'),
      );
    });
  });

  module('when import fails', function () {
    test('it displays an error notification', async function (assert) {
      // given
      this.server.post(
        '/admin/organizations/import-csv',
        () =>
          new Response(
            412,
            {},
            { errors: [{ status: '412', title: "Un soucis avec l'import", code: '412', detail: 'Erreur d’import' }] },
          ),
        412,
      );
      const file = new Blob(['foo'], { type: `valid-file` });
      class NotificationsStub extends Service {
        error = notificationErrorStub;
        clearAll = sinon.stub();
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      const screen = await render(hbs`<Administration::OrganizationsImport />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.organizations-import.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(notificationErrorStub.called);
    });
  });
});
