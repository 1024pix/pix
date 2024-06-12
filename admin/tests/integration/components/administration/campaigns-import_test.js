import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  administration/campaigns-import', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  let store, adapter, notificationSuccessStub, clearAllStub, saveAdapterStub, notificationErrorStub;
  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    adapter = store.adapterFor('campaigns-import');
    saveAdapterStub = sinon.stub(adapter, 'addCampaignsCsv');
    notificationSuccessStub = sinon.stub();
    notificationErrorStub = sinon.stub().returns();

    clearAllStub = sinon.stub();
  });

  module('when import succeeds', function () {
    test('it displays a success notification', async function (assert) {
      // given
      const file = new Blob(['foo'], { type: `valid-file` });
      class NotificationsStub extends Service {
        success = notificationSuccessStub;
        clearAll = clearAllStub;
      }
      this.owner.register('service:notifications', NotificationsStub);
      saveAdapterStub.withArgs(file).resolves();

      // when
      const screen = await render(hbs`<Administration::CampaignsImport />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.campaigns-import.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(true);
      sinon.assert.calledWith(
        notificationSuccessStub,
        this.intl.t('components.administration.campaigns-import.notifications.success'),
      );
    });
  });

  module('when import fails', function () {
    test('it displays an error notification', async function (assert) {
      // given
      this.server.post(
        '/admin/campaigns/import-csv',
        () =>
          new Response(
            422,
            {},
            { errors: [{ status: '422', title: "Un soucis avec l'import", code: '422', detail: 'Erreur d’import' }] },
          ),
        422,
      );
      const file = new Blob(['foo'], { type: `valid-file` });
      class NotificationsStub extends Service {
        error = notificationErrorStub;
        clearAll = clearAllStub;
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      const screen = await render(hbs`<Administration::CampaignsImport />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.campaigns-import.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(notificationErrorStub.called);
    });
  });
});
