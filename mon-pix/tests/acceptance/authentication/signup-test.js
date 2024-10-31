import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
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
  passwordInput: 'common.password',
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
