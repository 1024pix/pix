/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { resolve, reject } from 'rsvp';
import {
  click, fillIn, find, render, triggerEvent,
} from '@ember/test-helpers';

import EmberObject from '@ember/object';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const EMPTY_FIRSTNAME_ERROR_MESSAGE = 'Votre prénom n’est pas renseigné.';
const EMPTY_LASTNAME_ERROR_MESSAGE = 'Votre nom n’est pas renseigné.';
const INVALID_DAY_OF_BIRTH_ERROR_MESSAGE = 'Votre jour de naissance n’est pas valide.';
const INVALID_MONTH_OF_BIRTH_ERROR_MESSAGE = 'Votre mois de naissance n’est pas valide.';
const INVALID_YEAR_OF_BIRTH_ERROR_MESSAGE = 'Votre année de naissance n’est pas valide.';
const EMPTY_EMAIL_ERROR_MESSAGE = 'Votre email n’est pas valide.';
const INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE = 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

describe('Integration | Component | routes/register-form', function() {

  setupIntlRenderingTest();

  let sessionStub;
  let storeStub;

  beforeEach(function() {
    sessionStub = Service.extend({});
    storeStub = Service.extend({});
    this.owner.register('service:session', sessionStub);
  });

  it('renders', async function() {
    // when
    await render(hbs`<Routes::RegisterForm/>`);

    //then
    expect(find('.register-form')).to.exist;
  });

  context('successful cases', function() {

    beforeEach(function() {
      this.owner.unregister('service:store');
      this.owner.register('service:store', storeStub);
      storeStub.prototype.createRecord = () => {
        return EmberObject.create({
          username: 'pix.pix1010',

          save(options) {
            if (options && options.adapterOptions && options.adapterOptions.searchForMatchingStudent) {
              return resolve({ username: 'pix.pix1010' });
            }
            return resolve();
          },
          unloadRecord() {
            return resolve();
          },
        });
      };
      sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
        this.authenticator = authenticator;
        this.login = login;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    it('should call authentication service by email with appropriate parameters, when all things are ok and form is submitted', async function() {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      this.set('loginWithUsername', false);

      await render(hbs`<Routes::RegisterForm @loginWithUsername={{this.loginWithUsername}} />`);

      await fillIn('#firstName', 'pix');
      await fillIn('#lastName', 'pix');
      await fillIn('#dayOfBirth', '10');
      await fillIn('#monthOfBirth', '10');
      await fillIn('#yearOfBirth', '2010');

      await click('#submit-search');

      await fillIn('#email', 'shi@fu.me');
      await fillIn('#password', 'Mypassword1');

      // when
      await click('#submit-registration');

      // then
      expect(find('.form-textfield__input--error')).to.not.exist;
      expect(find('.join-restricted-campaign__error')).to.not.exist;
      expect(sessionServiceObserver.authenticator).to.equal('authenticator:oauth2');
      expect(sessionServiceObserver.login).to.equal('shi@fu.me');
      expect(sessionServiceObserver.password).to.equal('Mypassword1');
      expect(sessionServiceObserver.scope).to.equal('mon-pix');
    });

    it('should call authentication service by username with appropriate parameters, when all things are ok and form is submitted', async function() {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      this.set('loginWithUsername', true);

      await render(hbs`<Routes::RegisterForm @loginWithUsername={{this.loginWithUsername}} />`);

      await fillIn('#firstName', 'pix');
      await fillIn('#lastName', 'pix');
      await fillIn('#dayOfBirth', '10');
      await fillIn('#monthOfBirth', '10');
      await fillIn('#yearOfBirth', '2010');

      await click('#submit-search');

      await fillIn('#password', 'Mypassword1');

      // when
      await click('#submit-registration');

      // then
      expect(find('.form-textfield__input--error')).to.not.exist;
      expect(find('.join-restricted-campaign__error')).to.not.exist;
      expect(sessionServiceObserver.authenticator).to.equal('authenticator:oauth2');
      expect(sessionServiceObserver.login).to.equal('pix.pix1010');
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
        await render(hbs`<Routes::RegisterForm />`);

        // when
        await fillIn('#firstName', stringFilledIn);
        await triggerEvent('#firstName', 'blur');

        // then
        expect(find('#register-firstName-container #validationMessage-firstName').textContent).to.equal(EMPTY_FIRSTNAME_ERROR_MESSAGE);
        expect(find('#register-firstName-container .form-textfield__input-container--error')).to.exist;
      });
    });

    [{ stringFilledIn: '' },
      { stringFilledIn: ' ' },
    ].forEach(function({ stringFilledIn }) {

      it(`should display an error message on lastName field, when '${stringFilledIn}' is typed and focused out`, async function() {
        // given
        await render(hbs`<Routes::RegisterForm />`);

        // when
        await fillIn('#lastName', stringFilledIn);
        await triggerEvent('#lastName', 'blur');

        // then
        expect(find('#register-lastName-container #validationMessage-lastName').textContent).to.equal(EMPTY_LASTNAME_ERROR_MESSAGE);
        expect(find('#register-lastName-container .form-textfield__input-container--error')).to.exist;
      });
    });

    [{ stringFilledIn: '' },
      { stringFilledIn: 'a' },
      { stringFilledIn: '32' },
    ].forEach(function({ stringFilledIn }) {

      it(`should display an error message on dayOfBirth field, when '${stringFilledIn}' is typed and focused out`, async function() {
        // given
        await render(hbs`<Routes::RegisterForm />`);

        // when
        await fillIn('#dayOfBirth', stringFilledIn);
        await triggerEvent('#dayOfBirth', 'blur');

        // then
        expect(find('#register-birthdate-container #dayValidationMessage').textContent).to.equal(INVALID_DAY_OF_BIRTH_ERROR_MESSAGE);
        expect(find('#register-birthdate-container .form-textfield__input-container--error')).to.exist;
      });
    });

    [{ stringFilledIn: '' },
      { stringFilledIn: 'a' },
      { stringFilledIn: '13' },
    ].forEach(function({ stringFilledIn }) {

      it(`should display an error message on monthOfBirth field, when '${stringFilledIn}' is typed and focused out`, async function() {
        // given
        await render(hbs`<Routes::RegisterForm />`);

        // when
        await fillIn('#monthOfBirth', stringFilledIn);
        await triggerEvent('#monthOfBirth', 'blur');

        // then
        expect(find('#register-birthdate-container #monthValidationMessage').textContent).to.equal(INVALID_MONTH_OF_BIRTH_ERROR_MESSAGE);
        expect(find('#register-birthdate-container .form-textfield__input-container--error')).to.exist;
      });
    });

    [{ stringFilledIn: '' },
      { stringFilledIn: 'a' },
      { stringFilledIn: '10000' },
    ].forEach(function({ stringFilledIn }) {

      it(`should display an error message on yearOfBirth field, when '${stringFilledIn}' is typed and focused out`, async function() {
        // given
        await render(hbs`<Routes::RegisterForm />`);

        // when
        await fillIn('#yearOfBirth', stringFilledIn);
        await triggerEvent('#yearOfBirth', 'blur');

        // then
        expect(find('#register-birthdate-container #yearValidationMessage').textContent).to.equal(INVALID_YEAR_OF_BIRTH_ERROR_MESSAGE);
        expect(find('#register-birthdate-container .form-textfield__input-container--error')).to.exist;
      });
    });

    [{ stringFilledIn: ' ' },
      { stringFilledIn: 'a' },
      { stringFilledIn: 'shi.fu' },
    ].forEach(function({ stringFilledIn }) {

      it(`should display an error message on email field, when '${stringFilledIn}' is typed and focused out`, async function() {
        // given
        this.set('matchingStudentFound', true);
        this.set('schoolingRegistrationDependentUser', EmberObject.create({ email : stringFilledIn , unloadRecord() {return resolve();}  }));
        await render(hbs`<Routes::RegisterForm @matchingStudentFound=true @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} /> `);

        // when
        await click('.pix-toggle__off');
        await fillIn('#email', stringFilledIn);
        await triggerEvent('#email', 'blur');

        // then
        expect(find('#register-email-container #validationMessage-email').textContent).to.equal(EMPTY_EMAIL_ERROR_MESSAGE);
        expect(find('#register-email-container .form-textfield__input-container--error')).to.exist;
      });
    });

    it('should not call api when email is invalid', async function() {
      // given
      const save = sinon.stub();
      this.set('matchingStudentFound', true);
      this.set('schoolingRegistrationDependentUser', EmberObject.create({ email : 'shi.fu' , unloadRecord() {return resolve();}, save  }));
      await render(hbs`<Routes::RegisterForm @matchingStudentFound=true @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} /> `);

      // when
      await click('.pix-toggle__off');
      await fillIn('#email', 'shi.fu');
      await triggerEvent('#email', 'blur');
      await click('#submit-registration');

      // then
      expect(find('#register-email-container #validationMessage-email').textContent).to.equal(EMPTY_EMAIL_ERROR_MESSAGE);
      expect(find('#register-email-container .form-textfield__input-container--error')).to.exist;
      sinon.assert.notCalled(save);
    });

    [{ stringFilledIn: ' ' },
      { stringFilledIn: 'password' },
      { stringFilledIn: 'password1' },
      { stringFilledIn: 'Password' },
    ].forEach(function({ stringFilledIn }) {

      it(`should display an error message on password field, when '${stringFilledIn}' is typed and focused out`, async function() {
        // given
        this.set('matchingStudentFound', true);
        this.set('schoolingRegistrationDependentUser', EmberObject.create({ password : stringFilledIn , unloadRecord() {return resolve();}  }));
        await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);

        // when
        await fillIn('#password', stringFilledIn);
        await triggerEvent('#password', 'blur');

        // then
        expect(find('#register-password-container #validationMessage-password').textContent).to.equal(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE);
        expect(find('#register-password-container .form-textfield__input-container--error')).to.exist;
      });
    });

    it('should not call api when password is invalid', async function() {
      // given
      const save = sinon.stub();
      this.set('matchingStudentFound', true);
      this.set('schoolingRegistrationDependentUser', EmberObject.create({ password : 'toto' , unloadRecord() {return resolve();}, save }));
      await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);

      // when
      await fillIn('#password', 'toto');
      await triggerEvent('#password', 'blur');
      await click('#submit-registration');

      // then
      expect(find('#register-password-container #validationMessage-password').textContent).to.equal(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE);
      expect(find('#register-password-container .form-textfield__input-container--error')).to.exist;
      sinon.assert.notCalled(save);
    });

    const internalServerErrorMessage = 'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.';

    [
      { status: '404', errorMessage: 'Vous êtes un élève ? <br> Vérifiez vos informations (prénom, nom et date de naissance) ou contactez un enseignant. <br><br> Vous êtes un enseignant ? <br> L’accès à un parcours n’est pas disponible pour le moment.' },
      { status: '500', errorMessage: internalServerErrorMessage },
    ].forEach(({ status, errorMessage }) => {
      it(`should display an error message if user saves with an error response status ${status}`, async function() {
        this.owner.unregister('service:store');
        this.owner.register('service:store', storeStub);
        storeStub.prototype.createRecord = () => {
          return EmberObject.create({
            username: 'pix.pix1010',

            save() {
              return reject({ errors: [{ status }] });
            },
            unloadRecord() {
              return resolve();
            },
          });
        };
        sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
          this.authenticator = authenticator;
          this.login = login;
          this.password = password;
          this.scope = scope;
          return resolve();
        };

        await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);

        await fillIn('#firstName', 'pix');
        await fillIn('#lastName', 'pix');
        await fillIn('#dayOfBirth', '10');
        await fillIn('#monthOfBirth', '10');
        await fillIn('#yearOfBirth', '2010');

        // when
        await click('#submit-search');

        // then
        expect(find('.register-form__error').innerHTML).to.equal(errorMessage);
      });
    });

    describe('When student is already reconciled in the same organization', async function() {

      describe('When student account is authenticated by email only', async function() {

        it('should display the error message related to the short code S61)', async function() {
          // given
          const meta = { shortCode: 'S61', value: 'j***@example.net' };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s61', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

      describe('When student account is authenticated by username only', async function() {

        it('should display the error message related to the short code S62)', async function() {
          // given
          const meta = { shortCode: 'S62', value: 'j***.h***2' };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s62', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

      describe('When student account is authenticated by SamlId only', async function() {

        it('should display the error message related to the short code S63)', async function() {
          // given
          const meta = { shortCode: 'S63', value: undefined };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s63', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

      describe('When student account is authenticated by SamlId and username', async function() {

        it('should display the error message related to the short code S63)', async function() {
          // given
          const meta = { shortCode: 'S63', value: undefined };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s63', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

      describe('When student account is authenticated by SamlId and email', async function() {

        it('should display the error message related to the short code S63)', async function() {
          // given
          const meta = { shortCode: 'S63', value: undefined };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s63', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

      describe('When student account is authenticated by SamlId, email and username', async function() {

        it('should display the error message related to the short code S63)', async function() {
          // given
          const  meta = { shortCode: 'S63', value: undefined };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s63', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

      describe('When student account is authenticated by email and username', async function() {

        it('should display the error message related to the short code S62)', async function() {
          // given
          const meta = { shortCode: 'S62', value: 'j***.h***2' };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s62', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

    });

    describe('When student is already reconciled in others organization', async function() {

      describe('When student account is authenticated by email only', async function() {

        it('should display the error message related to the short code S51)', async function() {
          // given
          const meta = { shortCode: 'S51', value: 'j***@example.net' };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s51', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

      describe('When student account is authenticated by username only', async function() {

        it('should display the error message related to the short code S52)', async function() {
          // given
          const meta = { shortCode: 'S52', value: 'j***.h***2' };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s52', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

      describe('When student account is authenticated by SamlId only', async function() {

        it('should display the error message related to the short code S53)', async function() {
          // given
          const meta = { shortCode: 'S53', value: undefined };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s53', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

      describe('When student account is authenticated by SamlId and username', async function() {

        it('should display the error message related to the short code S53)', async function() {
          // given
          const meta = { shortCode: 'S53', value: undefined };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s53', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

      describe('When student account is authenticated by SamlId and email', async function() {

        it('should display the error message related to the short code S53)', async function() {
          // given
          const meta = { shortCode: 'S53', value: undefined };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s53', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);

          await fillInputReconciliationForm();
          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

      describe('When student account is authenticated by SamlId, username and email', async function() {

        it('should display the error message related to the short code S53)', async function() {
          // given
          const meta = { shortCode: 'S53', value: undefined };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s53', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');

          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

      describe('When student account is authenticated by username and email', async function() {

        it('should display the error message related to the short code S52)', async function() {
          // given
          const meta = { shortCode: 'S52', value: 'j***.h***2' };
          const expectedErrorMessage =  this.intl.t('api-error-messages.register-error.s52', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          this.owner.unregister('service:store');
          this.owner.register('service:store', storeStub);
          storeStub.prototype.createRecord = () => {
            return EmberObject.create({
              username: 'pix.pix1010',

              save() {
                return reject({ errors: [error] });
              },
              unloadRecord() {
                return resolve();
              },
            });
          };
          sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
            this.authenticator = authenticator;
            this.login = login;
            this.password = password;
            this.scope = scope;
            return resolve();
          };

          await render(hbs`<Routes::RegisterForm @matchingStudentFound={{this.matchingStudentFound}} @schoolingRegistrationDependentUser={{this.schoolingRegistrationDependentUser}} />`);
          await fillInputReconciliationForm();

          // when
          await click('#submit-search');
          // then
          expect(find('.register-form__error').innerHTML).to.equal(expectedErrorMessage);
        });

      });

    });
  });
});

async function fillInputReconciliationForm() {
  await fillIn('#firstName', 'pix');
  await fillIn('#lastName', 'pix');
  await fillIn('#dayOfBirth', '10');
  await fillIn('#monthOfBirth', '10');
  await fillIn('#yearOfBirth', '2010');
}
