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

      // when
      const screen = await render(hbs`<Administration::UpdateOrganizationsInBatch /><NotificationContainer />`);
      const input = await screen.getByLabelText(
        this.intl.t('components.administration.update-organizations-in-batch.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(
        await screen.findByText(
          this.intl.t('components.administration.update-organizations-in-batch.notifications.success'),
        ),
      );
    });
  });

  module('when import fails', function () {
    test('it displays an error when organization not found', async function (assert) {
      // given
      window.fetch.resolves(
        fetchResponse({
          body: {
            errors: [{ code: 'ORGANIZATION_NOT_FOUND', meta: { organizationId: '123' } }],
          },
          status: 404,
        }),
      );

      // when
      const screen = await render(hbs`<Administration::UpdateOrganizationsInBatch /><NotificationContainer />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.update-organizations-in-batch.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(
        await screen.findByText(
          this.intl.t(
            'components.administration.update-organizations-in-batch.notifications.errors.organization-not-found',
            { organizationId: '123' },
          ),
        ),
      );
    });

    test('it displays an error when parent organization not found', async function (assert) {
      // given
      window.fetch.resolves(
        fetchResponse({
          body: {
            errors: [
              {
                code: 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_PARENT_ORGANIZATION',
                meta: { organizationId: '123' },
              },
            ],
          },
          status: 409,
        }),
      );

      // when
      const screen = await render(hbs`<Administration::UpdateOrganizationsInBatch /><NotificationContainer />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.update-organizations-in-batch.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(
        await screen.findByText(
          this.intl.t(
            'components.administration.update-organizations-in-batch.notifications.errors.parent-organization-not-found',
            { organizationId: '123' },
          ),
        ),
      );
    });

    test('it displays an error when DPO email invalid', async function (assert) {
      // given
      window.fetch.resolves(
        fetchResponse({
          body: {
            errors: [
              {
                code: 'DPO_EMAIL_INVALID',
                meta: { organizationId: '123', value: 'foo' },
              },
            ],
          },
          status: 422,
        }),
      );

      // when
      const screen = await render(hbs`<Administration::UpdateOrganizationsInBatch /><NotificationContainer />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.update-organizations-in-batch.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(
        await screen.findByText(
          this.intl.t(
            'components.administration.update-organizations-in-batch.notifications.errors.data-protection-email-invalid',
            { organizationId: '123', value: 'foo' },
          ),
        ),
      );
    });

    test('it displays an error when an unexpected issue happend during import', async function (assert) {
      // given
      window.fetch.resolves(
        fetchResponse({
          body: {
            errors: [{ code: 'ORGANIZATION_BATCH_UPDATE_ERROR', meta: { organizationId: '123' } }],
          },
          status: 422,
        }),
      );

      // when
      const screen = await render(hbs`<Administration::UpdateOrganizationsInBatch /><NotificationContainer />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.update-organizations-in-batch.upload-button'),
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(
        await screen.findByText(
          this.intl.t(
            'components.administration.update-organizations-in-batch.notifications.errors.organization-batch-update-error',
            { organizationId: '123' },
          ),
        ),
      );
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
