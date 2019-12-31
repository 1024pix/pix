import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { resolve } from 'rsvp';
import { click, fillIn, find, render, triggerEvent } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';

const EMPTY_FIRSTNAME_ERROR_MESSAGE = 'Votre prénom n’est pas renseigné.';
const EMPTY_LASTNAME_ERROR_MESSAGE = 'Votre nom n’est pas renseigné.';
const EMPTY_EMAIL_ERROR_MESSAGE = 'Votre email n’est pas valide.';
const INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE = 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

describe('Integration | Component | routes/register-form', function() {
  setupRenderingTest();

  let sessionStub;
  let storeStub;

  beforeEach(function() {
    this.set('user', EmberObject.create({}));
    sessionStub = Service.extend({});
    storeStub = Service.extend({});
    this.owner.register('service:session', sessionStub);
  });

  it('renders', async function() {
    // when
    await render(hbs`{{routes/register-form}}`);

    //then
    expect(find('.register-form')).to.exist;
  });

  context('successful cases', function() {

    beforeEach(function() {
      this.owner.unregister('service:store');
      this.owner.register('service:store', storeStub);
      storeStub.prototype.createRecord = () => {
        return EmberObject.create({
          save() {
            return resolve();
          }
        });
      };
      sessionStub.prototype.authenticate = function(authenticator, { email, password, scope }) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    it('should call authentication service with appropriate parameters, when all things are ok and form is submitted', async function() {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await render(hbs`{{routes/register-form}}`);
      await fillIn('#firstName', 'pix');
      await fillIn('#lastName', 'pix');
      await fillIn('#email', 'shi@fu.me');
      await fillIn('#password', 'Mypassword1');

      // when
      await click('#submit-registration');

      // then
      expect(find('.form-textfield__input--error')).to.not.exist;
      expect(sessionServiceObserver.authenticator).to.equal('authenticator:oauth2');
      expect(sessionServiceObserver.email).to.equal('shi@fu.me');
      expect(sessionServiceObserver.password).to.equal('Mypassword1');
      expect(sessionServiceObserver.scope).to.equal('mon-pix');
    });
  });

  context('errors management', function() {

    [{ stringFilledIn: '' },
      { stringFilledIn: ' ' },
    ].forEach(function({ stringFilledIn }) {

      it(`should display an error message on firstName field, when '${stringFilledIn}' is typed and focused out`, async function() {
        // given
        await render(hbs`{{routes/register-form}}`);

        // when
        await fillIn('#firstName', stringFilledIn);
        await triggerEvent('#firstName', 'blur');

        // then
        expect(find('#register-firstName-container #validationMessage').textContent).to.equal(EMPTY_FIRSTNAME_ERROR_MESSAGE);
        expect(find('#register-firstName-container .form-textfield__input-container--error')).to.exist;
      });
    });

    [{ stringFilledIn: '' },
      { stringFilledIn: ' ' },
    ].forEach(function({ stringFilledIn }) {

      it(`should display an error message on lastName field, when '${stringFilledIn}' is typed and focused out`, async function() {
        // given
        await render(hbs`{{routes/register-form}}`);

        // when
        await fillIn('#lastName', stringFilledIn);
        await triggerEvent('#lastName', 'blur');

        // then
        expect(find('#register-lastName-container #validationMessage').textContent).to.equal(EMPTY_LASTNAME_ERROR_MESSAGE);
        expect(find('#register-lastName-container .form-textfield__input-container--error')).to.exist;
      });
    });

    [{ stringFilledIn: ' ' },
      { stringFilledIn: 'a' },
      { stringFilledIn: 'shi.fu' },
    ].forEach(function({ stringFilledIn }) {

      it(`should display an error message on email field, when '${stringFilledIn}' is typed and focused out`, async function() {
        // given
        await render(hbs`{{routes/register-form}}`);

        // when
        await fillIn('#email', stringFilledIn);
        await triggerEvent('#email', 'blur');

        // then
        expect(find('#register-email-container #validationMessage').textContent).to.equal(EMPTY_EMAIL_ERROR_MESSAGE);
        expect(find('#register-email-container .form-textfield__input-container--error')).to.exist;
      });
    });

    [{ stringFilledIn: ' ' },
      { stringFilledIn: 'password' },
      { stringFilledIn: 'password1' },
      { stringFilledIn: 'Password' },
    ].forEach(function({ stringFilledIn }) {

      it(`should display an error message on password field, when '${stringFilledIn}' is typed and focused out`, async function() {
        // given
        await render(hbs`{{routes/register-form}}`);

        // when
        await fillIn('#password', stringFilledIn);
        await triggerEvent('#password', 'blur');

        // then
        expect(find('#register-password-container #validationMessage').textContent).to.equal(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE);
        expect(find('#register-password-container .form-textfield__input-container--error')).to.exist;
      });
    });
  });
});
