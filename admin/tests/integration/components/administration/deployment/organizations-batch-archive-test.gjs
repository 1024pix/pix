import { render } from '@1024pix/ember-testing-library';
import PixToastContainer from '@1024pix/pix-ui/components/pix-toast-container';
import { triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import OrganizationsBatchArchive from 'pix-admin/components/administration/deployment/organizations-batch-archive';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | administration/organizations-batch-archive', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    sinon.stub(window, 'fetch');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('when batch archive succeeds', function () {
    test('it displays a success notification', async function (assert) {
      // given
      const file = new Blob(['foo'], { type: `valid-file` });
      window.fetch.resolves(
        _fetchResponse({
          status: 204,
        }),
      );

      // when
      const screen = await render(<template><OrganizationsBatchArchive /><PixToastContainer /></template>);
      const input = await screen.findByLabelText(
        t('components.administration.organizations-batch-archive.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(
        await screen.findByText(t('components.administration.organizations-batch-archive.notifications.success')),
      );
    });
  });

  module('when batch archiving of organizations fails', function () {
    test('it displays an error notification', async function (assert) {
      // given
      const file = new Blob(['foo'], { type: `valid-file` });

      window.fetch.resolves(
        _fetchResponse({
          body: {
            errors: [
              {
                status: '422',
                title: "Un souci avec l'archivage des organisations",
                code: 'ARCHIVE_ORGANIZATIONS_IN_BATCH_ERROR',
                detail: `Erreur lors de l'archivage`,
                meta: {
                  currentLine: 2,
                  totalLines: 4,
                },
              },
            ],
          },
          status: 422,
        }),
      );

      // when
      const screen = await render(<template><OrganizationsBatchArchive /><PixToastContainer /></template>);
      const input = await screen.findByLabelText(
        t('components.administration.organizations-batch-archive.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(
        await screen.findByText(
          t('components.administration.organizations-batch-archive.notifications.errors.error-in-batch', {
            currentLine: 2,
            totalLines: 4,
          }),
        ),
      );
    });
  });
});

function _fetchResponse({ body, status }) {
  return new window.Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-type': 'application/json',
    },
  });
}
