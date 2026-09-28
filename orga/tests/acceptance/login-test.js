import { clickByName, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { Response } from 'miragejs';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl, { waitLanguageChanged } from '../helpers/setup-intl';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

module('Acceptance | Login', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let domainService;

  hooks.beforeEach(function () {
    domainService = this.owner.lookup('service:currentDomain');
    sinon.stub(domainService, 'getExtension');
  });

  test('renders layout', async function (assert) {
    // given & when
    const screen = await visit('/connexion');

    // then
    const authenticationLayoutImageContainer = document.querySelector('.authentication-layout__image');
    const image = within(authenticationLayoutImageContainer).getByAltText('');
    assert.dom(image).hasAttribute('src', '/images/authentication.svg');

    assert.dom(screen.queryByRole('link', { name: t('navigation.footer.legal-notice') })).exists();
  });

  module('When on french domain (.fr)', function () {
    test('does not display locale switcher', async function (assert) {
      // given
      domainService.getExtension.returns('fr');

      // when
      const screen = await visit('/connexion');

      // then
      assert.dom(screen.queryByRole('button', { name: t('components.locale-switcher.label') })).doesNotExist();
    });
  });

  module('When on international domain (.org)', function () {
    module('when the user changes locale with the locale switcher', function () {
      test('displays the login page with the selected language', async function (assert) {
        // given
        domainService.getExtension.returns('org');

        // when
        const screen = await visit('/connexion?lang=en');
        await click(screen.getByRole('button', { name: t('components.locale-switcher.label') }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Français' }));
        await waitLanguageChanged('fr');

        // then
        assert.strictEqual(currentURL(), '/connexion');
        assert.dom(screen.getByRole('heading', { name: 'Connectez-vous', level: 1 })).exists();
      });
    });
  });

  module('when the Pix account exists and the password is correct', function () {
    test('user logs in', async function (assert) {
      // given
      domainService.getExtension.returns('fr');
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });

      const screen = await visit('/connexion');

      // when
      await fillByLabel(t('pages.login-form.email.label'), user.email);
      await fillByLabel(t('pages.login-form.password'), 'secret');
      await clickByName(t('pages.login-form.login'));

      // then
      const homepageHeading = screen.getByRole('heading', {
        name: t('components.index.organization-information.title'),
      });
      assert.dom(homepageHeading).exists();
    });
  });

  module('when the Pix account does not exist or the password is incorrect', function () {
    test('the login form displays a missing or invalid credentials error message', async function (assert) {
      // given
      domainService.getExtension.returns('fr');
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });

      const screen = await visit('/connexion');

      // when
      await fillByLabel(t('pages.login-form.email.label'), user.email);
      await fillByLabel(t('pages.login-form.password'), 'incorrect-password');
      await clickByName(t('pages.login-form.login'));

      // then
      assert.dom(screen.getByText(t('common.api-error-messages.login-unauthorized-error'))).exists();
    });
  });

  module('when there is an unexpected error', function () {
    test('the login form displays a generic error message', async function (assert) {
      // given
      domainService.getExtension.returns('fr');
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });

      this.server.post('/token', () => {
        return new Response(500);
      });

      const screen = await visit('/connexion');

      // when
      await fillByLabel(t('pages.login-form.email.label'), user.email);
      await fillByLabel(t('pages.login-form.password'), 'incorrect-password');
      await clickByName(t('pages.login-form.login'));

      // Translation common.api-error-messages.login-unexpected-error contains HTML
      // so it’s not possible to use the translation key.
      assert.dom(screen.getByText(new RegExp('Impossible de se connecter.'))).exists();
    });
  });
});
