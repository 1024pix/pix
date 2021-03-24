import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { resolve } from 'rsvp';
import { render, triggerEvent } from '@ember/test-helpers';
import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

const EMPTY_FIRSTNAME_ERROR_MESSAGE = 'Votre prénom n’est pas renseigné.';
const EMPTY_LASTNAME_ERROR_MESSAGE = 'Votre nom n’est pas renseigné.';
const EMPTY_EMAIL_ERROR_MESSAGE = 'Votre email n’est pas valide.';
const INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE = 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

module('Integration | Component | routes/register-form', (hooks) => {
  setupRenderingTest(hooks);

  class SessionStub extends Service {}
  class StoreStub extends Service {}

  hooks.beforeEach(function() {
    this.set('user', EmberObject.create({}));

    this.owner.register('service:session', SessionStub);
  });

  test('it renders', async function(assert) {
    // when
    await render(hbs`<Routes::RegisterForm/>`);

    //then
    assert.dom('.register-form').exists();
  });

  module('successful cases', () => {

    hooks.beforeEach(function() {
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
      SessionStub.prototype.authenticate = function(authenticator, email, password, scope) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    test('it should call authentication service with appropriate parameters, when all things are ok and form is submitted', async function(assert) {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await render(hbs`<Routes::RegisterForm @organizationInvitationId=1 @organizationInvitationCode='C0D3'/>`);
      await fillInByLabel('Prénom', 'pix');
      await fillInByLabel('Nom', 'pix');
      await fillInByLabel('Adresse e-mail', 'shi@fu.me');
      await fillInByLabel('Mot de passe', 'Mypassword1');
      await clickByLabel('Accepter les conditions d\'utilisation de Pix');

      // when
      await clickByLabel('Je m\'inscris');

      // then
      assert.dom('.alert-input--error').doesNotExist();
      assert.equal(sessionServiceObserver.authenticator, 'authenticator:oauth2');
      assert.equal(sessionServiceObserver.email, 'shi@fu.me');
      assert.equal(sessionServiceObserver.password, 'Mypassword1');
      assert.equal(sessionServiceObserver.scope, 'pix-orga');
    });
  });

  module('errors management', () => {

    module('error display', () => {

      [{ stringFilledIn: '' },
        { stringFilledIn: ' ' },
      ].forEach(({ stringFilledIn }) => {
        test(`it should display an error message on firstName field, when '${stringFilledIn}' is typed and focused out`, async function(assert) {
          // given
          await render(hbs`<Routes::RegisterForm/>`);

          // when
          await fillInByLabel('Prénom', stringFilledIn);
          await triggerEvent('#register-firstName', 'focusout');

          // then
          assert.dom('#register-firstName-container .alert-input--error').hasText(EMPTY_FIRSTNAME_ERROR_MESSAGE);
          assert.dom('#register-firstName-container .input--error').exists();
        });
      });

      [{ stringFilledIn: '' },
        { stringFilledIn: ' ' },
      ].forEach(({ stringFilledIn }) => {
        test(`it should display an error message on lastName field, when '${stringFilledIn}' is typed and focused out`, async function(assert) {
          // given
          await render(hbs`<Routes::RegisterForm/>`);

          // when
          await fillInByLabel('Nom', stringFilledIn);
          await triggerEvent('#register-lastName', 'focusout');

          // then
          assert.dom('#register-lastName-container .alert-input--error').hasText(EMPTY_LASTNAME_ERROR_MESSAGE);
          assert.dom('#register-lastName-container .input--error').exists();
        });
      });

      [{ stringFilledIn: ' ' },
        { stringFilledIn: 'a' },
        { stringFilledIn: 'shi.fu' },
      ].forEach(({ stringFilledIn }) => {

        test(`it should display an error message on email field, when '${stringFilledIn}' is typed and focused out`, async function(assert) {
          // given
          await render(hbs`<Routes::RegisterForm/>`);

          // when
          await fillInByLabel('Adresse e-mail', stringFilledIn);
          await triggerEvent('#register-email', 'focusout');

          // then
          assert.dom('#register-email-container .alert-input--error').hasText(EMPTY_EMAIL_ERROR_MESSAGE);
          assert.dom('#register-email-container .input--error').exists();
        });
      });

      [{ stringFilledIn: ' ' },
        { stringFilledIn: 'password' },
        { stringFilledIn: 'password1' },
        { stringFilledIn: 'Password' },
      ].forEach(({ stringFilledIn }) => {

        test(`it should display an error message on password field, when '${stringFilledIn}' is typed and focused out`, async function(assert) {
          // given
          await render(hbs`<Routes::RegisterForm/>`);

          // when
          await fillInByLabel('Mot de passe', stringFilledIn);
          await triggerEvent('#register-password', 'focusout');

          // then
          assert.dom('#register-password-container .alert-input--error').hasText(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE);
          assert.dom('#register-password-container .input-password--error').exists();
        });
      });
    });

    module('form submission', (hooks) => {

      let spy;
      let validUser;

      const fillForm = async function(user) {
        await fillInByLabel('Prénom', user.firstName);
        await fillInByLabel('Nom', user.lastName);
        await fillInByLabel('Adresse e-mail', user.email);
        await fillInByLabel('Mot de passe', user.password);
        if (user.cgu) {
          await clickByLabel('Accepter les conditions d\'utilisation de Pix');
        }
      };

      hooks.beforeEach(async function() {
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

        await render(hbs`<Routes::RegisterForm @organizationInvitationId=1 @organizationInvitationCode='C0D3'/>`);
      });

      test('it should prevent submission when firstName is not valid', async function(assert) {
        // given
        await fillForm({ ...validUser, ...{ firstName: '' } });

        // when
        await clickByLabel('Je m\'inscris');

        // then
        assert.equal(spy.callCount, 0);
      });

      test('it should prevent submission when lastName is not valid', async function(assert) {
        // given
        await fillForm({ ...validUser, ...{ lastName: '' } });

        // when
        await clickByLabel('Je m\'inscris');

        // then
        assert.equal(spy.callCount, 0);
      });

      test('it should prevent submission when email is not valid', async function(assert) {
        // given
        await fillForm({ ...validUser, ...{ email: '' } });

        // when
        await clickByLabel('Je m\'inscris');

        // then
        assert.equal(spy.callCount, 0);
      });

      test('it should prevent submission when password is not valid', async function(assert) {
        // given
        await fillForm({ ...validUser, ...{ password: '' } });

        // when
        await clickByLabel('Je m\'inscris');

        // then
        assert.equal(spy.callCount, 0);
      });

      test('it should prevent submission when cgu have not been accepted', async function(assert) {
        // given
        await fillForm({ ...validUser, ...{ cgu: false } });

        // when
        await clickByLabel('Je m\'inscris');

        // then
        assert.equal(spy.callCount, 0);
      });
    });
  });
});
