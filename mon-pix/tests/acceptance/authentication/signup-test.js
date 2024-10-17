import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../helpers/setup-intl';

const I18N_KEYS = {
  firstNameInput: 'components.authentication.signup-form.fields.firstname.label',
  lastNameInput: 'components.authentication.signup-form.fields.lastname.label',
  emailInput: 'components.authentication.signup-form.fields.email.label',
  passwordInput: 'components.authentication.new-password-input.label',
  cguCheckbox: 'common.cgu.label',
  submitButton: 'components.authentication.signup-form.actions.submit',
};

module('Acceptance | authentication | Signup', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let domainService;

  hooks.beforeEach(function () {
    server.create('feature-toggle', { id: 0, isNewAuthenticationDesignEnabled: true });

    domainService = this.owner.lookup('service:currentDomain');
    sinon.stub(domainService, 'getExtension');
  });

  module('when "New authentication design" feature toggle is disabled', function (hooks) {
    hooks.beforeEach(function () {
      server.create('feature-toggle', { id: 0, isNewAuthenticationDesignEnabled: false });
    });

    module('When on International domain (.org)', function (hooks) {
      hooks.beforeEach(function () {
        domainService.getExtension.returns('org');
      });

      module('when accessing the inscription page with "Français" as default language', function () {
        test('displays the inscription page with "Français" as selected language', async function (assert) {
          // given & when
          const screen = await visit('/inscription');

          // then
          assert.strictEqual(currentURL(), '/inscription');
          assert.dom(screen.getByRole('heading', { name: 'Inscrivez-vous', level: 1 })).exists();
          assert.dom(screen.getByRole('button', { name: 'Sélectionnez une langue' })).exists();
        });

        module('when the user select "English" as his language', function () {
          test('displays the inscription page with "English" as selected language', async function (assert) {
            // given & when
            const screen = await visit('/inscription');
            await click(screen.getByRole('button', { name: 'Sélectionnez une langue' }));
            await screen.findByRole('listbox');
            await click(screen.getByRole('option', { name: 'English' }));

            // then
            assert.strictEqual(currentURL(), '/inscription');
            assert.dom(screen.getByRole('heading', { name: 'Sign up', level: 1 })).exists();
            assert.dom(screen.getByRole('button', { name: 'Select a language' })).exists();
          });
        });
      });

      module('when accessing the inscription page with "English" as selected language', function () {
        test('displays the inscription page with "English"', async function (assert) {
          // given && when
          const screen = await visit('/inscription?lang=en');

          // then
          assert.strictEqual(currentURL(), '/inscription?lang=en');
          assert.dom(screen.getByRole('heading', { name: 'Sign up', level: 1 })).exists();
          assert.dom(screen.getByRole('button', { name: 'Select a language' })).exists();
        });

        module('when the user select "Français" as his language', function () {
          test('displays the inscription page with "Français" as selected language', async function (assert) {
            // given & when
            const screen = await visit('/inscription?lang=en');
            await click(screen.getByRole('button', { name: 'Select a language' }));
            await screen.findByRole('listbox');
            await click(screen.getByRole('option', { name: 'Français' }));

            // then
            assert.strictEqual(currentURL(), '/inscription');
            assert.dom(screen.getByRole('heading', { name: 'Inscrivez-vous', level: 1 })).exists();
            assert.dom(screen.getByRole('button', { name: 'Sélectionnez une langue' })).exists();
          });
        });
      });
    });
  });

  module('when "New authentication design" feature toggle is enabled', function (hooks) {
    hooks.beforeEach(function () {
      server.create('feature-toggle', { id: 0, isNewAuthenticationDesignEnabled: true });
    });

    test('user signs up to Pix and is logged in', async function (assert) {
      // given
      const firstName = 'John';
      const lastName = 'Doe';
      const email = 'john.doe@email.com';
      const password = 'JeMeLoggue1024';

      const screen = await visit('/inscription');

      // when
      await fillByLabel(t(I18N_KEYS.firstNameInput), firstName);
      await fillByLabel(t(I18N_KEYS.lastNameInput), lastName);
      await fillByLabel(t(I18N_KEYS.emailInput), email);
      await fillByLabel(t(I18N_KEYS.passwordInput), password);
      await clickByName(t(I18N_KEYS.cguCheckbox));
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const homepageHeading = screen.getByRole('heading', { name: t('pages.dashboard.title') });
      assert.dom(homepageHeading).exists();
    });

    module('when a new user join a campaign', function () {
      test('it is redirected to the campaign after signup', async function (assert) {
        // given
        const firstName = 'John';
        const lastName = 'Doe';
        const email = 'john.doe@email.com';
        const password = 'JeMeLoggue1024';
        const campaign = server.create('campaign', { isRestricted: false });

        // when
        const screen = await visit('/campagnes');
        await fillByLabel(t('pages.fill-in-campaign-code.label'), campaign.code);
        await clickByName(t('pages.fill-in-campaign-code.start'), campaign.code);
        await clickByName(t('pages.campaign-landing.assessment.action'));

        assert.strictEqual(currentURL(), '/inscription');
        await fillByLabel(t(I18N_KEYS.firstNameInput), firstName);
        await fillByLabel(t(I18N_KEYS.lastNameInput), lastName);
        await fillByLabel(t(I18N_KEYS.emailInput), email);
        await fillByLabel(t(I18N_KEYS.passwordInput), password);
        await clickByName(t(I18N_KEYS.cguCheckbox));
        await clickByName(t(I18N_KEYS.submitButton));

        // then
        const homepageHeading = screen.getByRole('heading', { name: t('pages.tutorial.title') });
        assert.dom(homepageHeading).exists();
      });
    });
  });
});
