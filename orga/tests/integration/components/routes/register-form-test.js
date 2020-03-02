import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { resolve } from 'rsvp';
import { click, fillIn, render, triggerEvent } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';

const EMPTY_FIRSTNAME_ERROR_MESSAGE = 'Votre prénom n’est pas renseigné.';
const EMPTY_LASTNAME_ERROR_MESSAGE = 'Votre nom n’est pas renseigné.';
const EMPTY_EMAIL_ERROR_MESSAGE = 'Votre email n’est pas valide.';
const INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE = 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

module('Integration | Component | routes/register-form', function(hooks) {
  setupRenderingTest(hooks);

  let sessionStub;
  let storeStub;

  hooks.beforeEach(function() {
    this.set('user', EmberObject.create({}));
    sessionStub = Service.extend({});
    storeStub = Service.extend({});
    this.owner.register('service:session', sessionStub);
  });

  test('it renders', async function(assert) {
    // when
    await render(hbs`{{routes/register-form}}`);

    //then
    assert.dom('.register-form').exists();
  });

  module('successful cases', function() {

    hooks.beforeEach(function() {
      this.owner.unregister('service:store');
      this.owner.register('service:store', storeStub);
      storeStub.prototype.createRecord = () => {
        return EmberObject.create({
          save() {
            return resolve();
          }
        });
      };
      sessionStub.prototype.authenticate = function(authenticator, email, password, scope) {
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
      await render(hbs`{{routes/register-form  organizationInvitationId=1 organizationInvitationCode='C0D3'}}`);
      await fillIn('#register-firstName', 'pix');
      await fillIn('#register-lastName', 'pix');
      await fillIn('#register-email', 'shi@fu.me');
      await fillIn('#register-password', 'Mypassword1');
      await click('#register-cgu');

      // when
      await click('.button');

      // then
      assert.dom('.alert-input--error').doesNotExist();
      assert.equal(sessionServiceObserver.authenticator, 'authenticator:oauth2');
      assert.equal(sessionServiceObserver.email, 'shi@fu.me');
      assert.equal(sessionServiceObserver.password, 'Mypassword1');
      assert.equal(sessionServiceObserver.scope, 'pix-orga');
    });
  });

  module('errors management', function() {

    [{ stringFilledIn: '' },
      { stringFilledIn: ' ' },
    ].forEach(function({ stringFilledIn }) {
      test(`it should display an error message on firstName field, when '${stringFilledIn}' is typed and focused out`, async function(assert) {
        // given
        await render(hbs`{{routes/register-form}}`);

        // when
        await fillIn('#register-firstName', stringFilledIn);
        await triggerEvent('#register-firstName', 'focusout');

        // then
        assert.dom('#register-firstName-container .alert-input--error').hasText(EMPTY_FIRSTNAME_ERROR_MESSAGE);
        assert.dom('#register-firstName-container .input--error').exists();
      });
    });

    [{ stringFilledIn: '' },
      { stringFilledIn: ' ' },
    ].forEach(function({ stringFilledIn }) {
      test(`it should display an error message on lastName field, when '${stringFilledIn}' is typed and focused out`, async function(assert) {
        // given
        await render(hbs`{{routes/register-form}}`);

        // when
        await fillIn('#register-lastName', stringFilledIn);
        await triggerEvent('#register-lastName', 'focusout');

        // then
        assert.dom('#register-lastName-container .alert-input--error').hasText(EMPTY_LASTNAME_ERROR_MESSAGE);
        assert.dom('#register-lastName-container .input--error').exists();
      });
    });

    [{ stringFilledIn: ' ' },
      { stringFilledIn: 'a' },
      { stringFilledIn: 'shi.fu' },
    ].forEach(function({ stringFilledIn }) {

      test(`it should display an error message on email field, when '${stringFilledIn}' is typed and focused out`, async function(assert) {
        // given
        await render(hbs`{{routes/register-form}}`);

        // when
        await fillIn('#register-email', stringFilledIn);
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
    ].forEach(function({ stringFilledIn }) {

      test(`it should display an error message on password field, when '${stringFilledIn}' is typed and focused out`, async function(assert) {
        // given
        await render(hbs`{{routes/register-form}}`);

        // when
        await fillIn('#register-password', stringFilledIn);
        await triggerEvent('#register-password', 'focusout');

        // then
        assert.dom('#register-password-container .alert-input--error').hasText(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE);
        assert.dom('#register-password-container .input-password--error').exists();
      });
    });
  });
});
