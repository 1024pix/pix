import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const accessToken = 'An access token';
const fileContent = 'foo';
const file = new Blob([fileContent], { type: `valid-file` });

module('Integration | Component |  administration/add-organization-features-in-batch', function (hooks) {
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
        .withArgs(`${ENV.APP.API_HOST}/api/admin/organizations/add-organization-features`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'text/csv',
            Accept: 'application/json',
          },
          method: 'POST',
          body: fileContent,
        })
        .resolves(fetchResponse({ status: 204 }));
    });

    test('it displays a success notification', async function (assert) {
      // given
      const notificationSuccessStub = sinon.stub();
      class NotificationsStub extends Service {
        success = notificationSuccessStub;
        clearAll = sinon.stub();
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      const screen = await render(hbs`<Administration::AddOrganizationFeaturesInBatch />`);
      const input = await screen.getByLabelText(
        this.intl.t('components.administration.add-organization-features-in-batch.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(true);
      sinon.assert.calledWith(
        notificationSuccessStub,
        this.intl.t('components.administration.add-organization-features-in-batch.notifications.success'),
      );
    });
  });

  module('when import fails', function (hooks) {
    hooks.beforeEach(function () {
      fetchStub
        .withArgs(`${ENV.APP.API_HOST}/api/admin/organizations/add-organization-features`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'text/csv',
            Accept: 'application/json',
          },
          method: 'POST',
          body: fileContent,
        })
        .returns(
          fetchResponse({
            body: {
              errors: [{ status: '412', title: "Un soucis avec l'import", code: '412', detail: 'Erreur d’import' }],
            },
            status: 400,
          }),
        );
    });

    test('it displays an error notification', async function (assert) {
      // given
      const file = new Blob(['foo'], { type: `valid-file` });
      const notificationErrorStub = sinon.stub().returns();
      class NotificationsStub extends Service {
        error = notificationErrorStub;
        clearAll = sinon.stub();
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      const screen = await render(hbs`<Administration::AddOrganizationFeaturesInBatch />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.add-organization-features-in-batch.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(notificationErrorStub.called);
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

  return Promise.resolve(mockResponse);
}
