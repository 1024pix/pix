import { render } from '@1024pix/ember-testing-library';
import PixToastContainer from '@1024pix/pix-ui/components/pix-toast-container';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import UpsertQuestsInBatch from 'pix-admin/components/administration/common/upsert-quests-in-batch';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const accessToken = 'An access token';
const fileContent = 'foo';
const file = new Blob([fileContent], { type: `valid-file` });

module('Integration | Component |  administration/upsert-quests-in-batch', function (hooks) {
  setupIntlRenderingTest(hooks);

  let fetchStub;

  hooks.beforeEach(function () {
    class SessionService extends Service {
      data = { authenticated: { access_token: accessToken } };
    }
    this.owner.register('service:session', SessionService);

    fetchStub = sinon.stub(window, 'fetch');
  });

  hooks.afterEach(function () {
    window.fetch.restore();
  });

  module('when import succeeds', function (hooks) {
    hooks.beforeEach(function () {
      fetchStub
        .withArgs(`${ENV.APP.API_HOST}/api/admin/quests`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'text/csv',
            Accept: 'application/json',
          },
          method: 'POST',
          body: file,
        })
        .resolves(fetchResponse({ status: 204 }));
    });

    test('it displays a success notification', async function (assert) {
      // when
      const screen = await render(<template><UpsertQuestsInBatch /><PixToastContainer /></template>);
      const input = await screen.getByLabelText(t('components.administration.upsert-quests-in-batch.upload-button'));
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(await screen.findByText(t('components.administration.upsert-quests-in-batch.notifications.success')));
    });
  });

  module('when import fails', function () {
    test('it displays an error notification by status', async function (assert) {
      // given
      fetchStub
        .withArgs(`${ENV.APP.API_HOST}/api/admin/quests`, {
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
              errors: [{ status: '412', title: "Un soucis avec l'import", code: '412', detail: 'Erreur d’import' }],
            },
            status: 412,
          }),
        );

      // when
      const screen = await render(<template><UpsertQuestsInBatch /><PixToastContainer /></template>);
      const input = await screen.findByLabelText(t('components.administration.upsert-quests-in-batch.upload-button'));
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(await screen.findByText('Les préconditions ne sont pas réunies.'));
    });

    test('it displays an error notification', async function (assert) {
      // given
      fetchStub
        .withArgs(`${ENV.APP.API_HOST}/api/admin/quests`, {
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
      const screen = await render(<template><UpsertQuestsInBatch /><PixToastContainer /></template>);
      const input = await screen.findByLabelText(t('components.administration.upsert-quests-in-batch.upload-button'));
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(await screen.findByText(t('common.notifications.generic-error')));
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
