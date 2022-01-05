import { module, test } from 'qunit';
import { resolve } from 'rsvp';
import { render, triggerEvent } from '@ember/test-helpers';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
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
    await render(hbs`<Auth::RegisterForm/>`);

    //then
    assert.dom('.register-form').exists();
  });

  test('[a11y] it should display a message that all inputs are required', async function (assert) {
    // when
    await render(hbs`<Auth::RegisterForm/>`);

    // then
    assert.contains('Tous les champs sont obligatoires.');
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
      await render(hbs`<Auth::RegisterForm @organizationInvitationId=1 @organizationInvitationCode='C0D3'/>`);
      await fillByLabel(firstNameInputLabel, 'pix');
      await fillByLabel(lastNameInputLabel, 'pix');
      await fillByLabel(emailInputLabel, 'shi@fu.me');
      await fillByLabel(passwordInputLabel, 'Mypassword1');
      await clickByName(cguAriaLabel);

      // when
      await clickByName(registerButtonLabel);

      // then
      assert.dom('.alert-input--error').doesNotExist();
      assert.equal(sessionServiceObserver.authenticator, 'authenticator:oauth2');
      assert.equal(sessionServiceObserver.email, 'shi@fu.me');
      assert.equal(sessionServiceObserver.password, 'Mypassword1');
      assert.equal(sessionServiceObserver.scope, 'pix-orga');
    });
  });

  module('errors management', function () {
    module('error display', () => {
      [{ stringFilledIn: '' }, { stringFilledIn: ' ' }].forEach(function ({ stringFilledIn }) {
        test(`it should display an error message on firstName field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          await render(hbs`<Auth::RegisterForm/>`);

          // when
          await fillByLabel(firstNameInputLabel, stringFilledIn);
          await triggerEvent('#register-firstName', 'focusout');

          // then
          assert
            .dom('#register-firstName-container .alert-input--error')
            .hasText(this.intl.t(EMPTY_FIRSTNAME_ERROR_MESSAGE));
          assert.dom('#register-firstName-container .input--error').exists();
        });
      });

      [{ stringFilledIn: '' }, { stringFilledIn: ' ' }].forEach(function ({ stringFilledIn }) {
        test(`it should display an error message on lastName field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          await render(hbs`<Auth::RegisterForm/>`);

          // when
          await fillByLabel(lastNameInputLabel, stringFilledIn);
          await triggerEvent('#register-lastName', 'focusout');

          // then
          assert
            .dom('#register-lastName-container .alert-input--error')
            .hasText(this.intl.t(EMPTY_LASTNAME_ERROR_MESSAGE));
          assert.dom('#register-lastName-container .input--error').exists();
        });
      });

      [{ stringFilledIn: ' ' }, { stringFilledIn: 'a' }, { stringFilledIn: 'shi.fu' }].forEach(function ({
        stringFilledIn,
      }) {
        test(`it should display an error message on email field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          await render(hbs`<Auth::RegisterForm/>`);

          // when
          await fillByLabel(emailInputLabel, stringFilledIn);
          await triggerEvent('#register-email', 'focusout');

          // then
          assert.dom('#register-email-container .alert-input--error').hasText(this.intl.t(EMPTY_EMAIL_ERROR_MESSAGE));
          assert.dom('#register-email-container .input--error').exists();
        });
      });

      [
        { stringFilledIn: ' ' },
        { stringFilledIn: 'password' },
        { stringFilledIn: 'password1' },
        { stringFilledIn: 'Password' },
      ].forEach(function ({ stringFilledIn }) {
        test(`it should display an error message on password field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          await render(hbs`<Auth::RegisterForm/>`);

          // when
          await fillByLabel(passwordInputLabel, stringFilledIn);
          await triggerEvent('#register-password', 'focusout');

          // then
          assert
            .dom('#register-password-container .alert-input--error')
            .hasText(this.intl.t(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE));
          assert.dom('#register-password-container .input-password--error').exists();
        });
      });
    });

    module('form submission', (hooks) => {
      let spy;
      let validUser;

      const fillForm = async function (user) {
        await fillByLabel(firstNameInputLabel, user.firstName);
        await fillByLabel(lastNameInputLabel, user.lastName);
        await fillByLabel(emailInputLabel, user.email);
        await fillByLabel(passwordInputLabel, user.password);
        if (user.cgu) {
          await clickByName(cguAriaLabel);
        }
      };

      hooks.beforeEach(async function () {
        validUser = {
          firstName: 'pix',
          lastName: 'pix',
          email: 'shi@fu.me',
          password: 'Mypassword1',
          cgu: true,
        };

        spy = sinon.spy();
        this.owner.unregister('service:store');
        this.owner.register('service:store', StoreStub);
        StoreStub.prototype.createRecord = sinon.stub().returns({
          save: spy,
          unloadRecord: () => {
            return resolve();
          },
        });

        await render(hbs`<Auth::RegisterForm @organizationInvitationId=1 @organizationInvitationCode='C0D3'/>`);
      });

      test('it should prevent submission when firstName is not valid', async function (assert) {
        // given
        await fillForm({ ...validUser, ...{ firstName: '' } });

        // when
        await clickByName(registerButtonLabel);

        // then
        assert.equal(spy.callCount, 0);
      });

      test('it should prevent submission when lastName is not valid', async function (assert) {
        // given
        await fillForm({ ...validUser, ...{ lastName: '' } });

        // when
        await clickByName(registerButtonLabel);

        // then
        assert.equal(spy.callCount, 0);
      });

      test('it should prevent submission when email is not valid', async function (assert) {
        // given
        await fillForm({ ...validUser, ...{ email: '' } });

        // when
        await clickByName(registerButtonLabel);

        // then
        assert.equal(spy.callCount, 0);
      });

      test('it should prevent submission when password is not valid', async function (assert) {
        // given
        await fillForm({ ...validUser, ...{ password: '' } });

        // when
        await clickByName(registerButtonLabel);

        // then
        assert.equal(spy.callCount, 0);
      });

      test('it should prevent submission when cgu have not been accepted', async function (assert) {
        // given
        await fillForm({ ...validUser, ...{ cgu: false } });

        // when
        await clickByName(registerButtonLabel);

        // then
        assert.equal(spy.callCount, 0);
      });
    });
  });
});
