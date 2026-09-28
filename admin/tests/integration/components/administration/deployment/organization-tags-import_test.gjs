import { render } from '@1024pix/ember-testing-library';
import { PixToastContainer } from '@1024pix/nebulix-ember';
import { triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import OrganizationTagsImport from 'pix-admin/components/administration/deployment/organization-tags-import';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | administration/organization-tags-import', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  module('when import succeeds', function () {
    test('it displays a success notification', async function (assert) {
      // given
      this.server.post('/admin/organizations/import-tags-csv', () => new Response(204));
      const file = new Blob(['foo'], { type: `valid-file` });

      // when
      const screen = await render(
        <template><OrganizationTagsImport /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
      );
      const input = await screen.findByLabelText(t('components.administration.organization-tags-import.upload-button'));
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(await screen.findByText(t('components.administration.organization-tags-import.notifications.success')));
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
      const screen = await render(
        <template><OrganizationTagsImport /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
      );
      const input = await screen.findByLabelText(t('components.administration.organization-tags-import.upload-button'));
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(await screen.findByText(t('common.notifications.generic-error')));
    });
  });
});
