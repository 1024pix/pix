import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const accessToken = 'An access token';
const fileContent = 'foo';
const file = new Blob([fileContent], { type: `valid-file` });

module('Integration | Component |  administration/anonymize-gar-import', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    class SessionService extends Service {
      data = { authenticated: { access_token: accessToken } };
    }
    this.owner.register('service:session', SessionService);
    sinon.stub(window, 'fetch');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('when import fully succeeds', function () {
    test('it displays a success notification', async function (assert) {
      // given
      window.fetch.resolves(
        fetchMock({
          status: 200,
          body: {
            data: {
              type: 'anonymize-gar-results',
              attributes: {
                anonymized: 10,
                total: 10,
              },
            },
          },
        }),
      );

      // when
      const screen = await render(hbs`<Administration::AnonymizeGarImport /><NotificationContainer />`);
      const input = await screen.getByLabelText(
        this.intl.t('components.administration.anonymize-gar-import.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(
        await screen.findByText(
          this.intl.t('components.administration.anonymize-gar-import.notifications.success.full', { anonymized: 10 }),
        ),
      );
    });
  });

  module('when import partially succeeds', function () {
    test('it displays a warning notification', async function (assert) {
      // given
      window.fetch.resolves(
        fetchMock({
          status: 200,
          body: {
            data: {
              type: 'anonymize-gar-results',
              attributes: {
                anonymized: 5,
                total: 10,
              },
            },
          },
        }),
      );

      // when
      const screen = await render(hbs`<Administration::AnonymizeGarImport /><NotificationContainer />`);
      const input = await screen.getByLabelText(
        this.intl.t('components.administration.anonymize-gar-import.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(
        await screen.findByText(
          this.intl.t('components.administration.anonymize-gar-import.notifications.success.partial', {
            anonymized: 5,
            total: 10,
          }),
        ),
      );
    });
  });

  module('when import fails', function () {
    module('when file is too large', function () {
      test('it displays an error notification', async function (assert) {
        // given
        window.fetch.resolves(
          fetchMock({
            body: {
              errors: [{ code: 'PAYLOAD_TOO_LARGE', meta: { maxSize: '20' } }],
            },
            status: 413,
          }),
        );

        // when
        const screen = await render(hbs`<Administration::AnonymizeGarImport /><NotificationContainer />`);
        const input = await screen.findByLabelText(
          this.intl.t('components.administration.anonymize-gar-import.upload-button'),
        );
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.ok(
          await screen.findByText(
            this.intl.t('components.administration.anonymize-gar-import.notifications.error.payload-too-large', {
              maxSize: 20,
            }),
          ),
        );
      });
    });

    module('when file an unexpected error happens', function () {
      test('it displays an error notification', async function (assert) {
        // given
        window.fetch.resolves(fetchMock({ status: 500 }));

        // when
        const screen = await render(hbs`<Administration::AnonymizeGarImport /><NotificationContainer />`);
        const input = await screen.findByLabelText(
          this.intl.t('components.administration.anonymize-gar-import.upload-button'),
        );
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.ok(await screen.findByText(this.intl.t('common.notifications.generic-error')));
      });
    });
  });
});

function fetchMock({ body, status }) {
  return new window.Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-type': 'application/json',
    },
  });
}
