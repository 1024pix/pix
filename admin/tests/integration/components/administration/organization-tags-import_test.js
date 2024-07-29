import { render } from '@1024pix/ember-testing-library';
import { triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | administration/organization-tags-import', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  module('when import succeeds', function () {
    test('it displays a success notification', async function (assert) {
      // given
      this.server.post('/admin/organizations/import-tags-csv', () => new Response(204));
      const file = new Blob(['foo'], { type: `valid-file` });

      // when
      const screen = await render(hbs`<Administration::OrganizationTagsImport /><NotificationContainer />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.organization-tags-import.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(
        await screen.findByText(
          this.intl.t('components.administration.organization-tags-import.notifications.success'),
        ),
      );
    });
  });

  module('when import fails', function () {
    test('it displays an error notification', async function (assert) {
      // given
      this.server.post(
        '/admin/organizations/import-tags-csvt',
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
      const screen = await render(hbs`<Administration::OrganizationTagsImport /><NotificationContainer />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.organization-tags-import.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(await screen.findByText(this.intl.t('common.notifications.generic-error')));
    });
  });
});
