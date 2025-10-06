import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../helpers/setup-intl';

module('Acceptance | authentication | SSO selection', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let domainService;

  hooks.beforeEach(function () {
    domainService = this.owner.lookup('service:currentDomain');
    sinon.stub(domainService, 'getExtension');
  });

  module('When on France domain (.fr)', function (hooks) {
    hooks.beforeEach(function () {
      domainService.getExtension.returns('fr');
    });

    module('When the user logs in', function () {
      test('it displays the sso selection page and displays the sign up section', async function (assert) {
        // given
        const screen = await visit('/connexion/sso-selection');

        // when
        await clickByName(t('components.authentication.oidc-provider-selector.label'));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Partenaire OIDC' }));

        // then
        const heading = await screen.findByRole('heading', { name: t('pages.sign-in.first-title') });
        assert.dom(heading).exists();

        const signUpLink = await screen.findByRole('link', {
          name: t('pages.authentication.sso-selection.signup.link'),
        });
        assert.dom(signUpLink).exists();
      });

      test('it goes back to the signin page', async function (assert) {
        // given
        await visit('/connexion/sso-selection');

        // when
        await clickByName(t('common.actions.back'));

        // then
        assert.strictEqual(currentURL(), '/connexion');
      });
    });

    module('When the user signs up', function () {
      test('it displays the sso selection page and hides the sign up section', async function (assert) {
        // given
        const screen = await visit('/inscription/sso-selection');

        // when
        await clickByName(t('components.authentication.oidc-provider-selector.label'));

        // then
        const heading = await screen.findByRole('heading', { name: t('pages.signup.first-title') });
        assert.dom(heading).exists();

        const signUpLink = await screen.queryByRole('link', {
          name: t('pages.authentication.sso-selection.signup.link'),
        });
        assert.dom(signUpLink).doesNotExist();
      });

      test('it goes back to the signup page', async function (assert) {
        // given
        await visit('/inscription/sso-selection');

        // when
        await clickByName(t('common.actions.back'));

        // then
        assert.strictEqual(currentURL(), '/inscription');
      });
    });

    module('When on international domain (.org)', function (hooks) {
      hooks.beforeEach(function () {
        domainService.getExtension.returns('org');
      });

      module('When the user signs in', function () {
        test('it redirects to the authentication page', async function (assert) {
          // when
          await visit('/connexion/sso-selection');

          // then
          assert.strictEqual(currentURL(), '/connexion');
        });
      });

      module('When the user signs up', function () {
        test('it redirects to the authentication page', async function (assert) {
          // when
          await visit('/inscription/sso-selection');

          // then
          assert.strictEqual(currentURL(), '/connexion');
        });
      });
    });
  });
});
