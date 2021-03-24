import { reject, resolve } from 'rsvp';
import hbs from 'htmlbars-inline-precompile';

import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

import EmberObject from '@ember/object';
import Service from '@ember/service';

import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/login-form', (hooks) => {

  setupIntlRenderingTest(hooks);

  class SessionStub extends Service {}
  class StoreStub extends Service {}

  let emailInputLabel;
  let passwordInputLabel;
  let loginLabel;

  hooks.beforeEach(function() {
    this.owner.register('service:session', SessionStub);
    this.owner.unregister('service:store');
    this.owner.register('service:store', StoreStub);

    emailInputLabel = this.intl.t('pages.login-form.email');
    loginLabel = this.intl.t('pages.login-form.login');
    passwordInputLabel = this.intl.t('pages.login-form.password');
  });

  test('it should ask for email and password', async function(assert) {
    // when
    await render(hbs`<Routes::LoginForm/>`);

    // then
    assert.dom('#login-email').exists();
    assert.dom('#login-password').exists();
  });

  test('it should not display error message', async function(assert) {
    // when
    await render(hbs`<Routes::LoginForm/>`);

    // then
    assert.dom('#login-form-error-message').doesNotExist();
  });

  module('When there is no invitation', (hooks) => {

    hooks.beforeEach(() => {
      SessionStub.prototype.authenticate = function(authenticator, email, password, scope) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    test('it should call authentication service with appropriate parameters', async function(assert) {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await render(hbs`<Routes::LoginForm @organizationInvitationId=1 @organizationInvitationCode='C0D3'/>`);
      await fillInByLabel(emailInputLabel, 'pix@example.net');
      await fillInByLabel(passwordInputLabel, 'JeMeLoggue1024');

      // when
      await clickByLabel(loginLabel);

      // then
      assert.dom('.alert-input--error').doesNotExist();
      assert.equal(sessionServiceObserver.authenticator, 'authenticator:oauth2');
      assert.equal(sessionServiceObserver.email, 'pix@example.net');
      assert.equal(sessionServiceObserver.password, 'JeMeLoggue1024');
      assert.equal(sessionServiceObserver.scope, 'pix-orga');
    });
  });

  module('When there is an invitation', (hooks) => {

    hooks.beforeEach(() => {
      StoreStub.prototype.createRecord = () => {
        return EmberObject.create({
          save() {
            return resolve();
          },
        });
      };
      SessionStub.prototype.authenticate = function(authenticator, email, password, scope) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    test('it should be ok and call authentication service with appropriate parameters', async function(assert) {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await render(hbs`<Routes::LoginForm @isWithInvitation=true @organizationInvitationId=1 @organizationInvitationCode='C0D3'/>`);
      await fillInByLabel(emailInputLabel, 'pix@example.net');
      await fillInByLabel(passwordInputLabel, 'JeMeLoggue1024');

      //  when
      await clickByLabel(loginLabel);

      // then
      assert.dom('.alert-input--error').doesNotExist();
      assert.equal(sessionServiceObserver.authenticator, 'authenticator:oauth2');
      assert.equal(sessionServiceObserver.email, 'pix@example.net');
      assert.equal(sessionServiceObserver.password, 'JeMeLoggue1024');
      assert.equal(sessionServiceObserver.scope, 'pix-orga');
    });
  });

  test('it should display an invalid credentials message when authentication fails', async function(assert) {
    // given
    const expectedErrorMessages = this.intl.t('pages.login-form.errors.status.401');
    const errorResponse = {
      errors: [{ status: '401' }],
    };

    SessionStub.prototype.authenticate = () => reject(errorResponse);

    await render(hbs`<Routes::LoginForm/>`);
    await fillInByLabel(emailInputLabel, 'pix@example.net');
    await fillInByLabel(passwordInputLabel, 'Mauvais mot de passe');

    //  when
    await clickByLabel(loginLabel);

    // then
    assert.dom('#login-form-error-message').exists();
    assert.dom('#login-form-error-message').hasText(expectedErrorMessages);
  });

  test('it should display an not linked organisation message when authentication fails', async function(assert) {
    // given
    const expectedErrorMessages = this.intl.t('pages.login-form.errors.status.403');
    const errorResponse = {
      errors: [{ status: '403' }],
    };

    SessionStub.prototype.authenticate = () => reject(errorResponse);

    await render(hbs`<Routes::LoginForm/>`);
    await fillInByLabel(emailInputLabel, 'pix@example.net');
    await fillInByLabel(passwordInputLabel, 'pix123');

    //  when
    await clickByLabel(loginLabel);

    // then
    assert.dom('#login-form-error-message').exists();
    assert.dom('#login-form-error-message').hasText(expectedErrorMessages);
  });

  test('it should not display context message', async function(assert) {
    assert.dom('login-form__information').doesNotExist();
  });

  module('when password is hidden', (hooks) => {

    let showButtonText;

    hooks.beforeEach(async function() {
      // given
      showButtonText = this.intl.t('pages.login-form.show-password');
      await render(hbs`<Routes::LoginForm/>`);
    });

    test('it should display password when user click', async function(assert) {
      // when
      await clickByLabel(showButtonText);

      // then
      assert.dom('#login-password').hasAttribute('type', 'text');
    });

    test('it should change icon when user click on it', async function(assert) {
      // when
      await clickByLabel(showButtonText);

      // then
      assert.dom('.fa-eye').exists();
    });

    test('it should not change icon when user keeps typing his password', async function(assert) {
      // given
      await fillInByLabel(passwordInputLabel, 'début du mot de passe');

      // when
      await clickByLabel(showButtonText);
      await fillInByLabel(passwordInputLabel, 'fin du mot de passe');

      // then
      assert.dom('.fa-eye').exists();
    });
  });
});
