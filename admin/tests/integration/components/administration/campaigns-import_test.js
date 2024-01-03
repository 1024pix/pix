import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { triggerEvent } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import sinon from 'sinon';
import Service from '@ember/service';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  administration/campaigns-import', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  module('when import succeeds', function () {
    test('it displays a success notification', async function (assert) {
      // given
      const file = new Blob(['foo'], { type: `valid-file` });
      const notificationSuccessStub = sinon.stub();
      class NotificationsStub extends Service {
        success = notificationSuccessStub;
        clearAll = sinon.stub();
      }
      this.owner.register('service:notifications', NotificationsStub);

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
      const notificationErrorStub = sinon.stub().returns();
      class NotificationsStub extends Service {
        error = notificationErrorStub;
        clearAll = sinon.stub();
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
