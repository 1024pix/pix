import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  administration/oidc-providers-import', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  module('when import succeeds', function () {
    test('it displays a success notification', async function (assert) {
      // given
      this.server.post('/admin/oidc-providers/import', () => new Response(204));
      const file = new Blob(['foo'], { type: `valid-file` });
      const notificationSuccessStub = sinon.stub();
      class NotificationsStub extends Service {
        clearAll = sinon.stub();
        success = notificationSuccessStub;
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      const screen = await render(hbs`<Administration::OidcProvidersImport />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.oidc-providers-import.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      sinon.assert.calledWith(
        notificationSuccessStub,
        this.intl.t('components.administration.oidc-providers-import.notifications.success'),
      );
      assert.ok(true);
    });
  });

  module('when import fails', function () {
    test('it displays an error notification', async function (assert) {
      // given
      this.server.post(
        '/admin/oidc-providers/import',
        () =>
          new Response(
            400,
            {},
            { errors: [{ status: '400', title: "Un soucis avec l'import", code: '400', detail: 'Erreur d’import' }] },
          ),
        400,
      );
      const file = new Blob(['foo'], { type: `invalid-file` });
      const notificationErrorStub = sinon.stub().returns();
      class NotificationsStub extends Service {
        error = notificationErrorStub;
        clearAll = sinon.stub();
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      const screen = await render(hbs`<Administration::OidcProvidersImport />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.oidc-providers-import.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(notificationErrorStub.called);
    });
  });
});
