import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import PasswordResetDemandForm from 'mon-pix/components/authentication/password-reset-demand-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Authentication | password-reset-demand-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays a contact us link', async function (assert) {
    // when
    const screen = await render(<template><PasswordResetDemandForm /></template>);

    // then
    const link = await screen.findByRole('link', {
      name: t('components.authentication.password-reset-demand.contact-us-link.link-text'),
    });
    assert.dom(link).exists();
    assert.strictEqual(link.getAttribute('href'), 'https://pix.fr/support');
  });

  module('demand sending', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(window, 'fetch');
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    module('when demand succeeds', function () {
      test('it doesn’t display any error message', async function (assert) {
        // given
        const email = 'someone@example.net';
        window.fetch.resolves(
          fetchMock({
            status: 201,
          }),
        );

        // when
        const screen = await render(<template><PasswordResetDemandForm /></template>);
        await fillByLabel(t('pages.password-reset-demand.fields.email.label'), email);
        await click(
          screen.getByRole('button', {
            name: t('components.authentication.password-reset-demand.actions.receive-reset-button'),
          }),
        );

        // then
        assert.dom(screen.queryByRole('alert')).doesNotExist();
      });
    });

    module('when demand fails', function () {
      test('it displays an error message', async function (assert) {
        // given
        const email = 'someone@example.net';
        window.fetch.resolves(
          fetchMock({
            status: 404,
            body: {
              errors: [{ title: 'Not Found' }],
            },
          }),
        );

        // when
        const screen = await render(<template><PasswordResetDemandForm /></template>);
        await fillByLabel(t('pages.password-reset-demand.fields.email.label'), email);
        await click(
          screen.getByRole('button', {
            name: t('components.authentication.password-reset-demand.actions.receive-reset-button'),
          }),
        );

        // then
        assert.dom(screen.queryByText(t('pages.password-reset-demand.error.message'))).exists();
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
