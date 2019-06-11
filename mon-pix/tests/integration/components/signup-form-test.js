import ArrayProxy from '@ember/array/proxy';
import { resolve, reject } from 'rsvp';
import Component from '@ember/component';
import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { click, find, findAll, fillIn, render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';

const FORM_CONTAINER = '.sign-form__container';
const FORM_HEADER_CONTAINER = '.sign-form__header';
const FORM_HEADER = '.sign-form-title';
const EXPECTED_FORM_HEADER_CONTENT = 'Inscrivez-vous';

const INPUT_TEXT_FIELD = '.sign-form-body__input';
const INPUT_TEXT_FIELD_CLASS_DEFAULT = 'form-textfield__input-container--default';

const CHECKBOX_CGU_CONTAINER = '.signup-form__cgu-container';
const CHECKBOX_CGU_INPUT = '#pix-cgu';
const CHECKBOX_CGU_LABEL = '.signup-form__cgu-label';
const UNCHECKED_CHECKBOX_CGU_ERROR = 'Veuillez accepter les conditions générales d\'utilisation (CGU) avant de créer un compte.';

const CGU_LINK = '.signup-form__cgu .link';
const CGU_LINK_CONTENT = 'conditions d\'​utilisation de Pix';

const SUBMIT_BUTTON_CONTAINER = '.sign-form-body__bottom-button';
const SUBMIT_BUTTON = '.button';
const SUBMIT_BUTTON_CONTENT = 'Je m\'inscris';

const EMPTY_FIRSTNAME_ERROR_MESSAGE = 'Votre prénom n’est pas renseigné.';

const EMPTY_LASTNAME_ERROR_MESSAGE = 'Votre nom n’est pas renseigné.';
const EMPTY_EMAIL_ERROR_MESSAGE = 'Votre email n’est pas valide.';
const INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE = 'Votre mot de passe doit comporter au moins une lettre, un chiffre et' +
  ' 8 caractères.';

const userEmpty = EmberObject.create({});
const CAPTCHA_CONTAINER = '.signup-form__captcha-container';

describe('Integration | Component | signup form', function() {

  setupRenderingTest();

  describe('Rendering', function() {

    beforeEach(async function() {
      this.set('user', userEmpty);
      await render(hbs`{{signup-form user=user}}`);
    });

    it('renders', function() {
      expect(find('.sign-form__container')).to.exist;
    });

    it(`Should return true if heading content gets <${EXPECTED_FORM_HEADER_CONTENT}>`, function() {
      expect(find(FORM_HEADER).textContent).to.equal(EXPECTED_FORM_HEADER_CONTENT);
    });

    [
      { expectedRendering: 'form container', input: FORM_CONTAINER, expected: 1 },
      { expectedRendering: 'div to wrap heading of form', input: FORM_HEADER_CONTAINER, expected: 1 },
      { expectedRendering: 'form title (h1)', input: FORM_HEADER, expected: 1 },
      { expectedRendering: '4 input fields in form', input: INPUT_TEXT_FIELD, expected: 4 },
      { expectedRendering: 'cgu container', input: CHECKBOX_CGU_CONTAINER, expected: 1 },
      { expectedRendering: 'cgu checkbox', input: CHECKBOX_CGU_INPUT, expected: 1 },
      { expectedRendering: 'cgu label', input: CHECKBOX_CGU_LABEL, expected: 1 },
      { expectedRendering: 'submit button', input: SUBMIT_BUTTON_CONTAINER, expected: 1 },
    ].forEach(function({ expectedRendering, input, expected }) {

      it(`should render ${expectedRendering}`, function() {
        expect(findAll(input)).to.have.length(expected);
      });

    });

    [
      {
        expectedRendering: 'cgu content link',
        input: CGU_LINK,
        expectedLength: 1,
        expectedValue: CGU_LINK_CONTENT,
        expectedType: 'a'
      },
      {
        expectedRendering: 'submit content button',
        input: SUBMIT_BUTTON,
        expectedLength: 1,
        expectedValue: SUBMIT_BUTTON_CONTENT,
        expectedType: 'button'
      },

    ].forEach(function({ expectedRendering, input, expectedLength, expectedValue, expectedType }) {

      it(`should render a ${expectedRendering}`, function() {
        expect(findAll(input)).to.have.length(expectedLength);
        expect(find(input).textContent.trim()).to.equal(expectedValue);
        expect(find(input).nodeName).to.equal(expectedType.toUpperCase());
      });

    });
  });

  describe('Behaviors', function() {

    beforeEach(function() {
      this.owner.register('component:g-recaptcha', Component.extend());
    });

    describe('behavior when signup successful (test external calls)', function() {
      it('should return true if action <Signup> is handled', async function() {
        // given
        let isFormSubmitted = false;
        const user = EmberObject.create({
          email: 'toto@pix.fr',
          firstName: 'Marion',
          lastName: 'Yade',
          password: 'gipix2017',
          cgu: true,

          save() {
            isFormSubmitted = true;
            return resolve();
          }
        });
        this.set('authenticateUser', () => {});

        this.set('user', user);
        await render(hbs`{{signup-form user=user signup="signup" authenticateUser=(action authenticateUser)}}`);

        // when
        await click(SUBMIT_BUTTON);

        // then
        return wait().then(() => {
          expect(isFormSubmitted).to.be.true;
        });
      });

      it('should redirect automatically to user compte', async function() {
        // given
        const authenticateUserStub = sinon.stub();

        this.set('authenticateUser', authenticateUserStub);

        const user = EmberObject.create({
          email: 'toto@pix.fr',
          firstName: 'Marion',
          lastName: 'Yade',
          password: 'gipix2017',
          cgu: true,

          save() {
            return resolve();
          }
        });
        this.set('user', user);
        await render(hbs`{{signup-form user=user signup="signup" authenticateUser=(action authenticateUser)}}`);

        // when
        await click(SUBMIT_BUTTON);

        // then
        return wait().then(() => {
          sinon.assert.calledOnce(authenticateUserStub);
          sinon.assert.calledWith(authenticateUserStub, { email: 'toto@pix.fr', password: 'gipix2017' });
        });
      });
    });

    describe('Errors management', function() {

      it('should display an error message on first name field, when field is empty and focus-out', async function() {
        // given
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#firstName', '');
        await triggerEvent('#firstName', 'blur');

        // then
        return wait().then(() => {
          expect(find('.form-textfield__message-text').getAttribute('class')).to.contain('form-textfield__message--error');
          expect(find('.form-textfield__message--error').textContent.trim()).to.equal(EMPTY_FIRSTNAME_ERROR_MESSAGE);
          expect(find('#firstName').getAttribute('class')).to.contain('form-textfield__input--error');
          expect(find('.form-textfield__icon--error')).to.exist;
        });
      });

      it('should display an error message on last name field, when field is empty and focus-out', async function() {
        // given
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#lastName', '');
        await triggerEvent('#lastName', 'blur');

        // then
        return wait().then(() => {
          expect(find('.form-textfield__message-text').getAttribute('class')).to.contain('form-textfield__message--error');
          expect(find('.form-textfield__message--error').textContent.trim()).to.equal(EMPTY_LASTNAME_ERROR_MESSAGE);
          expect(find('#lastName').getAttribute('class')).to.contain('form-textfield__input--error');
          expect(find('.form-textfield__icon--error')).to.exist;
        });
      });

      it('should display an error message on email field, when field is empty and focus-out', async function() {
        // given
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#email', '');
        await triggerEvent('#email', 'blur');

        // then
        return wait().then(() => {
          expect(find('.form-textfield__message-email').getAttribute('class')).to.contain('form-textfield__message--error');
          expect(find('.form-textfield__message--error').textContent.trim()).to.equal(EMPTY_EMAIL_ERROR_MESSAGE);
          expect(find('#email').getAttribute('class')).to.contain('form-textfield__input--error');
          expect(find('.form-textfield__icon--error')).to.exist;
        });
      });

      it('should display an error message on password field, when field is empty and focus-out', async function() {
        // given
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#password', '');
        await triggerEvent('#password', 'blur');

        // then
        return wait().then(() => {
          expect(find('.form-textfield__message-password').getAttribute('class')).to.contain('form-textfield__message--error');
          expect(find('.form-textfield__message--error').textContent.trim()).to.equal(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE);
          expect(find('#password').getAttribute('class')).to.contain('form-textfield__input--error');
          expect(find('.form-textfield__icon--error')).to.exist;
        });
      });

      it('should display an error message on cgu field, when cgu isn\'t accepted and form is submitted', async function() {
        // given
        const userWithCguNotAccepted = EmberObject.create({
          cgu: false,
          errors: ArrayProxy.create({
            content: [{
              attribute: 'cgu',
              message: UNCHECKED_CHECKBOX_CGU_ERROR,
            }],
            cgu: [{
              attribute: 'cgu',
              message: UNCHECKED_CHECKBOX_CGU_ERROR
            }]
          }),
          save() {
            return new reject();
          }
        });

        this.set('user', userWithCguNotAccepted);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await click('.button');

        // then
        return wait().then(() => {
          expect(find('.sign-form__validation-error')).to.exist;
          expect(find('.sign-form__validation-error').textContent.trim()).to.equal(UNCHECKED_CHECKBOX_CGU_ERROR);
        });
      });

      it('should not display success notification message when an error occurred during the form submission', async function() {
        const userThatThrowAnErrorDuringSaving = EmberObject.create({
          errors: ArrayProxy.create({
            content: [{
              attribute: 'email',
              message: 'An error concerning the email thrown by the API',
            }]
          }),
          save() {
            return new reject();
          }
        });

        this.set('user', userThatThrowAnErrorDuringSaving);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await click('.button');
        // then
        return wait().then(() => {
          expect(find('.signup-form__notification-message')).to.not.exist;
        });
      });

      it('should display an error message on form title, when user has not checked re-captcha', async function() {
        // given
        const UNCHECKED_CHECKBOX_RECAPTCHA_ERROR = 'Veuillez cocher le recaptcha.';
        const userWithCaptchaNotValid = EmberObject.create({
          cgu: true,
          recaptchaToken: null,
          errors: ArrayProxy.create({
            content: [{
              attribute: 'recaptchaToken',
              message: UNCHECKED_CHECKBOX_RECAPTCHA_ERROR,
            }],
            recaptchaToken: [{
              message: UNCHECKED_CHECKBOX_RECAPTCHA_ERROR
            }]
          }),
          save() {
            return new reject();
          }
        });

        this.set('user', userWithCaptchaNotValid);
        this.set('isRecaptchaEnabled', true);
        await render(hbs`{{signup-form user=user isRecaptchaEnabled=isRecaptchaEnabled}}`);

        // when
        await click('.button');
        // then
        return wait().then(() => {
          expect(find('.sign-form__validation-error')).to.exist;
          expect(find('.sign-form__validation-error').textContent.trim()).to.equal(UNCHECKED_CHECKBOX_RECAPTCHA_ERROR);
        });
      });
    });

    describe('Successfull cases', function() {

      it('should display first name field as validated without error message, when field is filled and focus-out', async function() {
        // given
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#firstName', 'pix');
        await triggerEvent('#firstName', 'blur');

        // then
        return wait().then(() => {
          expect(find('.form-textfield__message-text').getAttribute('class')).to.contain('form-textfield__message--success');
          expect(find('.form-textfield__message--error')).not.to.exist;
          expect(find('#firstName').getAttribute('class')).to.contain('form-textfield__input--success');
          expect(find('.form-textfield__icon--success')).to.exist;
        });
      });

      it('should display last name field as validated without error message, when field is filled and focus-out', async function() {
        // given
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#lastName', 'pix');
        await triggerEvent('#lastName', 'blur');

        // then
        return wait().then(() => {
          expect(find('.form-textfield__message-text').getAttribute('class')).to.contain('form-textfield__message--success');
          expect(find('.form-textfield__message--error')).not.to.exist;
          expect(find('#lastName').getAttribute('class')).to.contain('form-textfield__input--success');
          expect(find('.form-textfield__icon--success')).to.exist;
        });
      });

      it('should display email field as validated without error message, when field is filled and focus-out', async function() {
        // given
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#email', 'shi@fu.pix');
        await triggerEvent('#email', 'blur');

        // then
        return wait().then(() => {
          expect(find('.form-textfield__message-email').getAttribute('class')).to.contain('form-textfield__message--success');
          expect(find('.form-textfield__message--error')).not.to.exist;
          expect(find('#email').getAttribute('class')).to.contain('form-textfield__input--success');
          expect(find('.form-textfield__icon--success')).to.exist;
        });
      });

      it('should display password field as validated without error message, when field is filled and focus-out', async function() {
        // given
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#password', 'mypassword1');
        await triggerEvent('#password', 'blur');

        // then
        return wait().then(() => {
          expect(find('.form-textfield__message-password').getAttribute('class')).to.contain('form-textfield__message--success');
          expect(find('.form-textfield__message--error')).not.to.exist;
          expect(find('#password').getAttribute('class')).to.contain('form-textfield__input--success');
          expect(find('.form-textfield__icon--success')).to.exist;
        });
      });

      it('should not display an error message on cgu field, when cgu is accepted and form is submitted', async function() {
        // given
        const userWithCguAccepted = EmberObject.create({
          cgu: true,

          save() {
            return new resolve();
          }
        });
        this.set('user', userWithCguAccepted);
        this.set('authenticateUser', () => {});
        await render(hbs`{{signup-form user=user authenticateUser=(action authenticateUser)}}`);

        // when
        await click('.button');

        // then
        return wait().then(() => {
          expect(find('.sign-form__validation-error')).to.not.exist;
        });
      });

      it('should reset validation property, when all things are ok and form is submitted', async function() {
        // given
        const validUser = EmberObject.create({
          email: 'toto@pix.fr',
          firstName: 'Marion',
          lastName: 'Yade',
          password: 'gipix2017',
          cgu: true,

          save() {
            return new resolve();
          }
        });

        this.set('user', validUser);
        this.set('authenticateUser', () => {});
        await render(hbs`{{signup-form user=user authenticateUser=(action authenticateUser)}}`);

        // when
        await click('.button');

        // then
        return wait().then(() => {
          expect(findAll('.form-textfield__input-field-container')[0].getAttribute('class')).contains(INPUT_TEXT_FIELD_CLASS_DEFAULT);
        });
      });
    });

    describe('isRecaptchaEnabled ', function() {
      it('disabled: it should not display the captcha', async function() {
        // given
        this.set('isRecaptchaEnabled', false);
        this.set('user', userEmpty);

        // when
        await render(hbs`{{signup-form user=user isRecaptchaEnabled=isRecaptchaEnabled}}`);

        // then
        expect(find(CAPTCHA_CONTAINER)).to.not.exist;
      });

      it('enabled: it should display the captcha', async function() {
        // given
        this.set('isRecaptchaEnabled', true);
        this.set('user', userEmpty);

        // when
        await render(hbs`{{signup-form user=user isRecaptchaEnabled=isRecaptchaEnabled}}`);

        // then
        expect(find(CAPTCHA_CONTAINER)).to.exist;
      });
    });

  });
});
