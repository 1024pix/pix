import { render } from '@1024pix/ember-testing-library';
import { PixToastContainer } from '@1024pix/nebulix-ember';
import { triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CertificationCentersBatchArchive from 'pix-admin/components/administration/deployment/certification-centers-batch-archive';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | administration/certification-centers-batch-archive', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    sinon.stub(window, 'fetch');
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
      const screen = await render(
        <template><CertificationCentersBatchArchive /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
      );
      const input = await screen.findByLabelText(
        t('components.administration.certification-centers-batch-archive.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(
        await screen.findByText(
          t('components.administration.certification-centers-batch-archive.notifications.success'),
        ),
      );
    });
  });

  module('when batch archiving of certification center fails', function () {
    test('it displays an error notification', async function (assert) {
      // given
      const file = new Blob(['foo'], { type: `valid-file` });

      window.fetch.resolves(
        _fetchResponse({
          body: {
            errors: [
              {
                status: '422',
                title: "Un souci avec l'archivage des centres de certification",
                code: 'ARCHIVE_CERTIFICATION_CENTERS_IN_BATCH_ERROR',
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
      const screen = await render(
        <template><CertificationCentersBatchArchive /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
      );
      const input = await screen.findByLabelText(
        t('components.administration.certification-centers-batch-archive.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(
        await screen.findByText(
          t('components.administration.certification-centers-batch-archive.notifications.errors.error-in-batch', {
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
