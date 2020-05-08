import ArrayProxy from '@ember/array/proxy';
import { resolve, reject } from 'rsvp';
import Component from '@ember/component';
import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  click,
  fillIn,
  find,
  findAll,
  render,
  settled,
  triggerEvent
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import setupIntl from '../../helpers/setup-intl';
import ENV from '../../../config/environment';

const FORM_CONTAINER = '.sign-form__container';
const FORM_HEADER_CONTAINER = '.sign-form__header';
const FORM_TITLE = '.sign-form-title';

const INPUT_TEXT_FIELD = '.sign-form-body__input';
const INPUT_TEXT_FIELD_CLASS_DEFAULT = 'form-textfield__input-container--default';

const CHECKBOX_CGU_CONTAINER = '.signup-form__cgu-container';
const CHECKBOX_CGU_INPUT = '#pix-cgu';
const CHECKBOX_CGU_LABEL = '.signup-form__cgu-label';

const CGU_LINK = '.signup-form__cgu .link';

const SUBMIT_BUTTON_CONTAINER = '.sign-form-body__bottom-button';
const SUBMIT_BUTTON = '.button';

const userEmpty = EmberObject.create({});
const CAPTCHA_CONTAINER = '.signup-form__captcha-container';

describe('Integration | Component | signup form', function() {

  setupRenderingTest();
  setupIntl();

  describe('Localization', function() {
    const originalLocale = ENV.APP.LOCALE;

    afterEach(function() {
      this.intl.setLocale(originalLocale);
    });

    [
      { locale: 'fr-fr', expectedFormTitle: 'Inscrivez-vous' },
      { locale: 'en-us', expectedFormTitle: 'Sign up' },
    ].forEach(function(testCase) {
      it(`${testCase.locale}`, async function() {
        const expectedTitle = testCase.expectedFormTitle;
        this.set('user', userEmpty);
        this.intl.setLocale(testCase.locale);

        // when
        await render(hbs`{{signup-form user=user}}`);

        // then
        expect(find(FORM_TITLE).textContent).to.equal(expectedTitle);
      });
    });
  });

  describe('Rendering', function() {

    beforeEach(async function() {
      this.set('user', userEmpty);
      await render(hbs`{{signup-form user=user}}`);
    });

    it('renders', function() {
      expect(find('.sign-form__container')).to.exist;
    });

    it('should return correct form title', function() {
      const formTitle = this.intl.t('signup-form.title');
      expect(find(FORM_TITLE).textContent).to.equal(formTitle);
    });

    [
      { expectedRendering: 'form container', input: FORM_CONTAINER, expected: 1 },
      { expectedRendering: 'div to wrap heading of form', input: FORM_HEADER_CONTAINER, expected: 1 },
      { expectedRendering: 'form title (h1)', input: FORM_TITLE, expected: 1 },
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

    it('should have link to Pix\'s CGU', function() {
      const cguText = this.intl.t('signup-form.fields.cgu.label');

      expect(find('.signup-form__cgu').innerHTML).to.contains(cguText);
      expect(findAll(CGU_LINK)).to.have.length(1);
    });

    it('should render a submit button', function() {
      expect(findAll(SUBMIT_BUTTON)).to.have.length(1);
      expect(find(SUBMIT_BUTTON).textContent.trim()).to.equal(this.intl.t('signup-form.actions.submit'));
      expect(find(SUBMIT_BUTTON).nodeName).to.equal('button'.toUpperCase());
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
        return settled().then(() => {
          expect(isFormSubmitted).to.be.true;
        });
      });

      it('should authenticate the user and empty the password', async function() {
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
        return settled().then(() => {
          sinon.assert.calledOnce(authenticateUserStub);
          sinon.assert.calledWith(authenticateUserStub, { login: 'toto@pix.fr', password: 'gipix2017' });
          expect(user.password).to.be.null;
        });
      });
    });

    describe('Errors management', function() {

      it('should display an error message on first name field, when field is empty and focus-out', async function() {
        // given
        const emptyFirstnameErrorMessage = this.intl.t('signup-form.fields.firstname.error');
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#firstName', '');
        await triggerEvent('#firstName', 'blur');

        // then
        return settled().then(() => {
          expect(find('.form-textfield__message-text').getAttribute('class')).to.contain('form-textfield__message--error');
          expect(find('.form-textfield__message--error').textContent.trim()).to.equal(emptyFirstnameErrorMessage);
          expect(find('#firstName').getAttribute('class')).to.contain('form-textfield__input--error');
          expect(find('.form-textfield-icon__state--error')).to.exist;
        });
      });

      it('should display an error message on last name field, when field is empty and focus-out', async function() {
        // given
        const emptyLastnameErrorMessage = this.intl.t('signup-form.fields.lastname.error');
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#lastName', '');
        await triggerEvent('#lastName', 'blur');

        // then
        return settled().then(() => {
          expect(find('.form-textfield__message-text').getAttribute('class')).to.contain('form-textfield__message--error');
          expect(find('.form-textfield__message--error').textContent.trim()).to.equal(emptyLastnameErrorMessage);
          expect(find('#lastName').getAttribute('class')).to.contain('form-textfield__input--error');
          expect(find('.form-textfield-icon__state--error')).to.exist;
        });
      });

      it('should display an error message on email field, when field is empty and focus-out', async function() {
        // given
        const emptyEmailErrorMessage = this.intl.t('signup-form.fields.email.error');
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#email', '');
        await triggerEvent('#email', 'blur');

        // then
        return settled().then(() => {
          expect(find('.form-textfield__message-email').getAttribute('class')).to.contain('form-textfield__message--error');
          expect(find('.form-textfield__message--error').textContent.trim()).to.equal(emptyEmailErrorMessage);
          expect(find('#email').getAttribute('class')).to.contain('form-textfield__input--error');
          expect(find('.form-textfield-icon__state--error')).to.exist;
        });
      });

      it('should display an error message on password field, when field is empty and focus-out', async function() {
        // given
        const incorrectPasswordErrorMessage = this.intl.t('signup-form.fields.password.error');
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#password', '');
        await triggerEvent('#password', 'blur');

        // then
        return settled().then(() => {
          expect(find('.form-textfield__message-password').getAttribute('class')).to.contain('form-textfield__message--error');
          expect(find('.form-textfield__message--error').textContent.trim()).to.equal(incorrectPasswordErrorMessage);
          expect(find('#password').getAttribute('class')).to.contain('form-textfield__input--error');
          expect(find('.form-textfield-icon__state--error')).to.exist;
        });
      });

      it('should display an error message on cgu field, when cgu isn\'t accepted and form is submitted', async function() {
        // given
        const uncheckedCheckboxCguErrorMessage = this.intl.t('signup-form.fields.cgu.error');
        const userWithCguNotAccepted = EmberObject.create({
          cgu: false,
          errors: ArrayProxy.create({
            content: [{
              attribute: 'cgu',
              message: uncheckedCheckboxCguErrorMessage,
            }],
            cgu: [{
              attribute: 'cgu',
              message: uncheckedCheckboxCguErrorMessage
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
        return settled().then(() => {
          expect(find('.sign-form__validation-error')).to.exist;
          expect(find('.sign-form__validation-error').textContent.trim()).to.equal(uncheckedCheckboxCguErrorMessage);
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
        return settled().then(() => {
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
        return settled().then(() => {
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
        return settled().then(() => {
          expect(find('.form-textfield__message-text').getAttribute('class')).to.contain('form-textfield__message--success');
          expect(find('.form-textfield__message--error')).not.to.exist;
          expect(find('#firstName').getAttribute('class')).to.contain('form-textfield__input--success');
          expect(find('.form-textfield-icon__state--success')).to.exist;
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
        return settled().then(() => {
          expect(find('.form-textfield__message-text').getAttribute('class')).to.contain('form-textfield__message--success');
          expect(find('.form-textfield__message--error')).not.to.exist;
          expect(find('#lastName').getAttribute('class')).to.contain('form-textfield__input--success');
          expect(find('.form-textfield-icon__state--success')).to.exist;
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
        return settled().then(() => {
          expect(find('.form-textfield__message-email').getAttribute('class')).to.contain('form-textfield__message--success');
          expect(find('.form-textfield__message--error')).not.to.exist;
          expect(find('#email').getAttribute('class')).to.contain('form-textfield__input--success');
          expect(find('.form-textfield-icon__state--success')).to.exist;
        });
      });

      it('should display password field as validated without error message, when field is filled and focus-out', async function() {
        // given
        this.set('user', userEmpty);
        await render(hbs`{{signup-form user=user}}`);

        // when
        await fillIn('#password', 'Mypassword1');
        await triggerEvent('#password', 'blur');

        // then
        return settled().then(() => {
          expect(find('.form-textfield__message-password').getAttribute('class')).to.contain('form-textfield__message--success');
          expect(find('.form-textfield__message--error')).not.to.exist;
          expect(find('#password').getAttribute('class')).to.contain('form-textfield__input--success');
          expect(find('.form-textfield-icon__state--success')).to.exist;
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
        return settled().then(() => {
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
        return settled().then(() => {
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

  describe('Loading management', () => {

    it('should not display any loading spinner by default', async function() {
      // given
      this.set('user', userEmpty);

      // when
      await render(hbs`{{signup-form user=user}}`);

      // then
      expect(find('.sign-form-body__bottom-button .loader-in-button')).to.not.exist;
    });

    it('should display a loading spinner when loading certification', async function() {
      // given
      this.set('user', userEmpty);
      this.set('isLoading', true);

      // when
      await render(hbs`{{signup-form user=user isLoading=isLoading}}`);

      // then
      expect(find('.sign-form-body__bottom-button .loader-in-button')).to.exist;
    });
  });

});
