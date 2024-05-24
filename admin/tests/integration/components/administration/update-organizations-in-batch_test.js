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

module('Integration | Component |  administration/update-organizations-in-batch', function (hooks) {
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

  module('when import succeeds', function () {
    test('it displays a success notification', async function (assert) {
      // given
      window.fetch.resolves(fetchResponse({ status: 204 }));
      const notificationSuccessStub = sinon.stub();
      class NotificationsStub extends Service {
        success = notificationSuccessStub;
        clearAll = sinon.stub();
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      const screen = await render(hbs`<Administration::UpdateOrganizationsInBatch />`);
      const input = await screen.getByLabelText(
        this.intl.t('components.administration.update-organizations-in-batch.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(true);
      sinon.assert.calledWith(
        notificationSuccessStub,
        this.intl.t('components.administration.update-organizations-in-batch.notifications.success'),
      );
    });
  });

  module('when import fails', function () {
    test('it displays an error notification', async function (assert) {
      // given
      window.fetch.resolves(
        fetchResponse({
          body: {
            errors: [{ status: '412', title: "Un soucis avec l'import", code: '412', detail: 'Erreur d’import' }],
          },
          status: 400,
        }),
      );
      const notificationErrorStub = sinon.stub().returns();
      class NotificationsStub extends Service {
        error = notificationErrorStub;
        clearAll = sinon.stub();
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      const screen = await render(hbs`<Administration::UpdateOrganizationsInBatch />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.update-organizations-in-batch.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(true);
      sinon.assert.calledWith(notificationErrorStub, 'Les préconditions ne sont pas réunies.');
    });
  });
});

function fetchResponse({ body, status }) {
  return new window.Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-type': 'application/json',
    },
  });
}
