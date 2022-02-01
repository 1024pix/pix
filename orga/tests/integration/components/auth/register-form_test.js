import { module, test } from 'qunit';
import { resolve } from 'rsvp';
import { fillByLabel, clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const EMPTY_FIRSTNAME_ERROR_MESSAGE = 'pages.login-or-register.register-form.fields.first-name.error';
const EMPTY_LASTNAME_ERROR_MESSAGE = 'pages.login-or-register.register-form.fields.last-name.error';
const EMPTY_EMAIL_ERROR_MESSAGE = 'pages.login-or-register.register-form.fields.email.error';
const INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE = 'pages.login-or-register.register-form.fields.password.error';

module('Integration | Component | Auth::RegisterForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  class SessionStub extends Service {}
  class StoreStub extends Service {}

  let firstNameInputLabel;
  let lastNameInputLabel;
  let emailInputLabel;
  let passwordInputLabel;
  let cguAriaLabel;
  let registerButtonLabel;

  hooks.beforeEach(function () {
    this.set('user', EmberObject.create({}));

    this.owner.register('service:session', SessionStub);

    firstNameInputLabel = this.intl.t('pages.login-or-register.register-form.fields.first-name.label');
    lastNameInputLabel = this.intl.t('pages.login-or-register.register-form.fields.last-name.label');
    emailInputLabel = this.intl.t('pages.login-or-register.register-form.fields.email.label');
    passwordInputLabel = this.intl.t('pages.login-or-register.register-form.fields.password.label');
    cguAriaLabel = this.intl.t('pages.login-or-register.register-form.fields.cgu.aria-label');
    registerButtonLabel = this.intl.t('pages.login-or-register.register-form.fields.button.label');
  });

  test('it renders', async function (assert) {
    // when
    await renderScreen(hbs`<Auth::RegisterForm/>`);

    //then
    assert.dom('.register-form').exists();
  });

  test('[a11y] it should display a message that all inputs are required', async function (assert) {
    // when
    const screen = await renderScreen(hbs`<Auth::RegisterForm/>`);

    // then
    assert.dom(screen.getByText('Tous les champs sont obligatoires.')).exists();
  });

  module('successful cases', function (hooks) {
    hooks.beforeEach(function () {
      this.owner.unregister('service:store');
      this.owner.register('service:store', StoreStub);
      StoreStub.prototype.createRecord = () => {
        return EmberObject.create({
          save() {
            return resolve();
          },
          unloadRecord() {
            return resolve();
          },
        });
      };
      SessionStub.prototype.authenticate = function (authenticator, email, password, scope) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    test('it should call authentication service with appropriate parameters, when all things are ok and form is submitted', async function (assert) {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await renderScreen(hbs`<Auth::RegisterForm @organizationInvitationId=1 @organizationInvitationCode='C0D3'/>`);
      await fillByLabel(firstNameInputLabel, 'pix');
      await fillByLabel(lastNameInputLabel, 'pix');
      await fillByLabel(emailInputLabel, 'shi@fu.me');
      await fillByLabel(passwordInputLabel, 'Mypassword1');
      await clickByName(cguAriaLabel);

      // when
      await clickByName(registerButtonLabel);

      // then
      assert.dom('.alert-input--error').doesNotExist();
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(sessionServiceObserver.authenticator, 'authenticator:oauth2');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(sessionServiceObserver.email, 'shi@fu.me');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(sessionServiceObserver.password, 'Mypassword1');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(sessionServiceObserver.scope, 'pix-orga');
    });
  });

  module('errors management', function (hooks) {
    let spy, screen;

    hooks.beforeEach(async function () {
      spy = sinon.spy();
      this.owner.unregister('service:store');
      this.owner.register('service:store', StoreStub);
      StoreStub.prototype.createRecord = sinon.stub().returns({
        save: spy,
        unloadRecord: () => {
          return resolve();
        },
      });

      screen = await renderScreen(
        hbs`<Auth::RegisterForm @organizationInvitationId=1 @organizationInvitationCode='C0D3'/>`
      );
    });

    module('When first name is not valid', () => {
      test('it should prevent submission and display error message', async function (assert) {
        // given
        await fillByLabel(firstNameInputLabel, '');

        // when
        await clickByName(registerButtonLabel);

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(spy.callCount, 0);
        assert.dom(screen.getByText(this.intl.t(EMPTY_FIRSTNAME_ERROR_MESSAGE))).exists();
      });
    });

    module('When last name is not valid', () => {
      test('it should prevent submission and display error message', async function (assert) {
        // given
        await fillByLabel(lastNameInputLabel, '');

        // when
        await clickByName(registerButtonLabel);

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(spy.callCount, 0);
        assert.dom(screen.getByText(this.intl.t(EMPTY_LASTNAME_ERROR_MESSAGE))).exists();
      });
    });

    module('When email is not valid', () => {
      test('it should prevent submission and display error message', async function (assert) {
        // given
        await fillByLabel(emailInputLabel, 'email');

        // when
        await clickByName(registerButtonLabel);

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(spy.callCount, 0);
        assert.dom(screen.getByText(this.intl.t(EMPTY_EMAIL_ERROR_MESSAGE))).exists();
      });
    });

    module('When password is not valid', () => {
      test('it should prevent submission and display error message', async function (assert) {
        // given
        await fillByLabel(passwordInputLabel, '');

        // when
        await clickByName(registerButtonLabel);

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(spy.callCount, 0);
        assert.dom(screen.getByText(this.intl.t(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE))).exists();
      });
    });

    module('When cgu have not been accepted', () => {
      test('it should prevent submission', async function (assert) {
        // given
        await clickByName(cguAriaLabel);

        // when
        await clickByName(registerButtonLabel);

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(spy.callCount, 0);
      });
    });
  });
});
