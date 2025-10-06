import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { authenticate } from '../../helpers/authentication';
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
    domainService = this.owner.lookup('service:currentDomain');
    sinon.stub(domainService, 'getExtension');
  });

  test('user signs up to Pix and is logged in', async function (assert) {
    // given
    const firstName = 'John';
    const lastName = 'Doe';
    const email = 'john.doe@email.com';
    const password = 'JeMeLoggue1024';

    // when
    const screen = await visit('/inscription');

    //then
    const signupHeading = screen.getByRole('heading', { name: t('pages.signup.first-title') });
    assert.dom(signupHeading).exists();
    const loginButton = screen.queryByRole('link', { name: t('pages.signup.actions.login') });
    assert.dom(loginButton).exists();
    const otherAuthenticationProvidersTitle = screen.queryByText(
      t('components.authentication.other-authentication-providers.signup.heading'),
    );
    assert.dom(otherAuthenticationProvidersTitle).exists();

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

  module('when real user is authenticated', function () {
    test('he can not access to the sign up page and is redirected to his dashboard', async function (assert) {
      // given
      const firstName = 'John';
      const lastName = 'Doe';
      const email = 'john.doe@email.com';

      const user = server.create('user', { firstName, lastName, email, isAnonymous: false });
      await authenticate(user);

      // when
      const screen = await visit('/inscription');

      // then
      const homepageHeading = screen.getByRole('heading', { name: t('pages.dashboard.title') });
      assert.dom(homepageHeading).exists();
    });
  });

  module('when anonymous user is authenticated', function (hooks) {
    let user;
    let screen;

    hooks.beforeEach(async function () {
      user = server.create('user', { isAnonymous: true });
      await authenticate(user);
    });

    test('he can access the sign up page', async function (assert) {
      // given/when
      screen = await visit('/inscription');

      // then
      const signupHeading = screen.getByRole('heading', { name: t('pages.signup.first-title') });
      assert.dom(signupHeading).exists();
      const loginButton = screen.queryByRole('link', { name: t('pages.signup.actions.login') });
      assert.dom(loginButton).doesNotExist();
      const otherAuthenticationProvidersTitle = screen.queryByText(
        t('components.authentication.other-authentication-providers.signup.heading'),
      );
      assert.dom(otherAuthenticationProvidersTitle).doesNotExist();
    });

    test('then he signs up and is redirected to dashboard', async function (assert) {
      // given
      server.patch('/users/:id', (schema, request) => {
        const { id } = request.params;
        const { data } = JSON.parse(request.requestBody);
        user = schema.users.find(id);
        return user.update(data.attributes);
      });

      // when
      screen = await visit('/inscription');

      await fillByLabel(t(I18N_KEYS.firstNameInput), 'Jane');
      await fillByLabel(t(I18N_KEYS.lastNameInput), 'Doe');
      await fillByLabel(t(I18N_KEYS.emailInput), 'jane.doe@example.net');
      await fillByLabel(t(I18N_KEYS.passwordInput), 'p@ssW0rd');
      await clickByName(t(I18N_KEYS.cguCheckbox));

      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const homepageHeading = screen.queryByRole('heading', { name: t('pages.dashboard.title') });
      assert.dom(homepageHeading).exists();
      assert.dom(screen.getByText('Jane')).exists();

      const session = this.owner.lookup('service:session');
      assert.strictEqual(session.data.authenticated.authenticator, 'authenticator:oauth2');
    });
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
      await fillByLabel(`${t('pages.fill-in-campaign-code.label')} *`, campaign.code);
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
