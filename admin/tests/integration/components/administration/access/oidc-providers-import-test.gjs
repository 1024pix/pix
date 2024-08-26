import NotificationContainer from '@1024pix/ember-cli-notifications/components/notification-container';
import { render } from '@1024pix/ember-testing-library';
import { triggerEvent } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import OidcProvidersImport from 'pix-admin/components/administration/access/oidc-providers-import';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | administration/oidc-providers-import', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  module('when import succeeds', function () {
    test('it displays a success notification', async function (assert) {
      // given
      this.server.post('/admin/oidc-providers/import', () => new Response(204));
      const file = new Blob(['foo'], { type: `valid-file` });

      // when
      const screen = await render(<template><OidcProvidersImport /><NotificationContainer /></template>);
      const input = await screen.findByLabelText(t('components.administration.oidc-providers-import.upload-button'));
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(await screen.findByText(t('components.administration.oidc-providers-import.notifications.success')));
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

      // when
      const screen = await render(<template><OidcProvidersImport /><NotificationContainer /></template>);
      const input = await screen.findByLabelText(t('components.administration.oidc-providers-import.upload-button'));
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(await screen.findByText(t('common.notifications.generic-error')));
    });
  });
});
