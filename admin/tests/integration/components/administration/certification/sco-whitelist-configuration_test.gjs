import { render } from '@1024pix/ember-testing-library';
import { PixToastContainer } from '@1024pix/nebulix-ember';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ScoWhitelistConfiguration from 'pix-admin/components/administration/certification/sco-whitelist-configuration';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const accessToken = 'An access token';
const fileContent = 'foo';
const file = new Blob([fileContent], { type: `valid-file` });

module('Integration | Component | administration/certification/sco-whitelist-configuration', function (hooks) {
  setupIntlRenderingTest(hooks);

  let fetchStub, fileSaverStub;

  hooks.beforeEach(function () {
    class SessionService extends Service {
      data = { authenticated: { access_token: accessToken } };
    }
    this.owner.register('service:session', SessionService);

    class FileSaver extends Service {
      save = fileSaverStub;
    }

    this.owner.register('service:file-saver', FileSaver);

    fetchStub = sinon.stub(window, 'fetch');
    fileSaverStub = sinon.stub();
  });

  hooks.afterEach(function () {
    window.fetch.restore();
  });

  module('Export', function () {
    module('when export succeeds', function () {
      test('it succeeds', async function (assert) {
        // given
        fileSaverStub.resolves();
        // when
        const screen = await render(
          <template><ScoWhitelistConfiguration /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
        );
        const input = await screen.findByText(t('pages.administration.certification.sco-whitelist.export.button'));
        await triggerEvent(input, 'click');

        // then
        assert
          .dom(await screen.queryByText(t('pages.administration.certification.sco-whitelist.export.error')))
          .doesNotExist();
      });
    });

    module('when export fails', function () {
      test('it displays an error notification', async function (assert) {
        // given
        fileSaverStub.rejects();
        // when
        const screen = await render(
          <template><ScoWhitelistConfiguration /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
        );
        const input = await screen.findByText(t('pages.administration.certification.sco-whitelist.export.button'));
        await triggerEvent(input, 'click');

        // then
        assert.dom(await screen.getByText(t('pages.administration.certification.sco-whitelist.export.error'))).exists();
      });
    });
  });

  module('Import', function () {
    module('when import succeeds', function (hooks) {
      hooks.beforeEach(function () {
        fetchStub
          .withArgs(`${ENV.APP.API_HOST}/api/admin/sco-whitelist`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'text/csv',
              Accept: 'application/json',
            },
            method: 'POST',
            body: file,
          })
          .resolves(fetchResponse({ status: 201 }));
      });

      test('it displays a success notification', async function (assert) {
        // when
        const screen = await render(
          <template><ScoWhitelistConfiguration /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
        );
        const input = await screen.getByLabelText(t('pages.administration.certification.sco-whitelist.import.button'));
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert
          .dom(await screen.getByText(t('pages.administration.certification.sco-whitelist.import.success')))
          .exists();
      });
    });

    module('when import fails', function () {
      module('when it is a generic error', function () {
        test('it displays an error notification', async function (assert) {
          // given
          fetchStub
            .withArgs(`${ENV.APP.API_HOST}/api/admin/sco-whitelist`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'text/csv',
                Accept: 'application/json',
              },
              method: 'POST',
              body: file,
            })
            .rejects();
          // when
          const screen = await render(
            <template><ScoWhitelistConfiguration /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
          );
          const input = await screen.findByLabelText(
            t('pages.administration.certification.sco-whitelist.import.button'),
          );
          await triggerEvent(input, 'change', { files: [file] });

          // then
          assert
            .dom(await screen.getByText(t('pages.administration.certification.sco-whitelist.import.error')))
            .exists();
        });
      });

      module('when there are incorrect lines in the csv', function () {
        test('it displays an error notification', async function (assert) {
          // given
          const errorLines = [3, 5];

          fetchStub
            .withArgs(`${ENV.APP.API_HOST}/api/admin/sco-whitelist`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'text/csv',
                Accept: 'application/json',
              },
              method: 'POST',
              body: file,
            })
            .resolves(
              fetchResponse({
                body: {
                  errors: [
                    { code: 'CERTIFICATION_INVALID_SCO_WHITELIST_ERROR', meta: { lineNumbersWithError: errorLines } },
                  ],
                },
                status: 422,
              }),
            );

          // when
          const screen = await render(
            <template><ScoWhitelistConfiguration /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
          );
          const input = await screen.findByLabelText(
            t('pages.administration.certification.sco-whitelist.import.button'),
          );
          await triggerEvent(input, 'change', { files: [file] });

          // then
          assert
            .dom(
              await screen.getByText(
                t('pages.administration.certification.sco-whitelist.import.error-csv', {
                  errorLines: errorLines.join(', '),
                }),
              ),
            )
            .exists();
        });
      });
    });
  });
});

function fetchResponse({ body, status }) {
  const mockResponse = new window.Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-type': 'application/json',
    },
  });

  return mockResponse;
}
