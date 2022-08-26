import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { clickByLabel } from '../../helpers/click-by-label';
import Service from '@ember/service';

import { fillIn, find, findAll, settled, triggerEvent, waitUntil } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';

import ArrayProxy from '@ember/array/proxy';
import { resolve, reject } from 'rsvp';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

import ENV from '../../../config/environment';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

const FORM_TITLE = '.sign-form-title';
const INPUT_TEXT_FIELD_CLASS_DEFAULT = 'form-textfield__input-container--default';

const userEmpty = EmberObject.create({});

const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

describe('Integration | Component | SignupForm', function () {
  setupIntlRenderingTest();

  describe('Localization', function () {
    const originalLocale = ENV.APP.LOCALE;

    afterEach(function () {
      this.intl.setLocale(originalLocale);
    });

    [
      { locale: 'fr', expectedFormTitle: 'Inscrivez-vous' },
      { locale: 'en', expectedFormTitle: 'Sign up' },
    ].forEach(function (testCase) {
      it(`${testCase.locale}`, async function () {
        const expectedTitle = testCase.expectedFormTitle;
        this.set('user', userEmpty);
        this.intl.setLocale(testCase.locale);

        // when
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // then
        expect(find(FORM_TITLE).textContent).to.equal(expectedTitle);
      });
    });
  });

  describe('Rendering', function () {
    beforeEach(async function () {
      this.set('user', userEmpty);
      this.intl.setLocale(['en', 'fr']);
      await render(hbs`<SignupForm @user={{this.user}} />`);
    });

    it('renders', function () {
      expect(find('.sign-form__container')).to.exist;
    });

    it('should return correct form title', function () {
      const formTitle = this.intl.t('pages.sign-up.first-title');
      expect(find(FORM_TITLE).textContent).to.equal(formTitle);
    });

    it('should display form elements', async function () {
      // given & when
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

      // then
      expect(screen.getByRole('link', { name: this.intl.t('navigation.homepage') })).to.exist;
      expect(screen.getByRole('heading', { name: this.intl.t('pages.sign-up.first-title') })).to.exist;
      expect(screen.getByRole('link', { name: this.intl.t('pages.sign-up.subtitle.link') })).to.exist;
      expect(screen.getByRole('textbox', { name: this.intl.t('pages.sign-up.fields.firstname.label') })).to.exist;
      expect(screen.getByRole('textbox', { name: this.intl.t('pages.sign-up.fields.lastname.label') })).to.exist;
      expect(
        screen.getByRole('textbox', {
          name: `${this.intl.t('pages.sign-up.fields.email.label')} ${this.intl.t('pages.sign-up.fields.email.help')}`,
        })
      ).to.exist;
      expect(screen.getByRole('button', { name: this.intl.t('common.form.visible-password') })).to.exist;
      expect(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') })).to.exist;
    });

    it("should have links to Pix's CGU and data protection policy ", async function () {
      // given & when
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

      // then
      expect(screen.getByRole('link', { name: this.intl.t('common.cgu.cgu') })).to.exist;
      expect(screen.getByRole('link', { name: this.intl.t('common.cgu.data-protection-policy') })).to.exist;
    });

    it('should render a submit button', async function () {
      // given & when
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

      // then
      expect(screen.getByRole('button', { name: this.intl.t('pages.sign-up.actions.submit') })).to.exist;
    });
  });

  describe('When API returns errors', function () {
    const userInputs = {
      email: 'toto@pix.fr',
      firstName: 'Marion',
      lastName: 'Yade',
      password: 'gipix2017',
      cgu: true,
    };

    it('should display an error if api cannot be reached', async function () {
      // given
      const expectedErrorMessage = ApiErrorMessages.INTERNAL_SERVER_ERROR.MESSAGE;
      const stubCatchedApiErrorInternetDisconnected = undefined;

      const user = EmberObject.create({
        ...userInputs,
        save() {
          return new reject(stubCatchedApiErrorInternetDisconnected);
        },
      });

      this.set('user', user);
      await render(hbs`<SignupForm @user={{this.user}} />`);

      // when
      await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

      // then
      expect(find('div[id="sign-up-error-message"]')).to.exist;
      expect(find('div[id="sign-up-error-message"]').textContent.trim()).to.equal(this.intl.t(expectedErrorMessage));
    });

    it('should display related error message if internal server error', async function () {
      // given
      const expectedErrorMessage = ApiErrorMessages.INTERNAL_SERVER_ERROR.MESSAGE;
      const apiReturn = {
        errors: [
          {
            status: 500,
            detail: expectedErrorMessage,
            title: 'Internal server error',
          },
        ],
      };

      const user = EmberObject.create({
        ...userInputs,
        save() {
          return new reject(apiReturn);
        },
      });

      this.set('user', user);
      await render(hbs`<SignupForm @user={{this.user}} />`);

      // when
      await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

      // then
      expect(find('div[id="sign-up-error-message"]')).to.exist;
      expect(find('div[id="sign-up-error-message"]').textContent.trim()).to.equal(this.intl.t(expectedErrorMessage));
    });

    it('should display related error message if bad gateway error', async function () {
      // given
      const expectedErrorMessage = ApiErrorMessages.BAD_GATEWAY.MESSAGE;
      const apiReturn = {
        errors: [
          {
            status: 502,
            detail: expectedErrorMessage,
            title: 'Bad gateway error',
          },
        ],
      };
      const user = EmberObject.create({
        ...userInputs,
        save() {
          return new reject(apiReturn);
        },
      });

      this.set('user', user);
      await render(hbs`<SignupForm @user={{this.user}} />`);

      // when
      await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

      // then
      expect(find('div[id="sign-up-error-message"]')).to.exist;
      expect(find('div[id="sign-up-error-message"]').textContent.trim()).to.equal(this.intl.t(expectedErrorMessage));
    });

    it('should display related error message if gateway timeout error', async function () {
      // given
      const expectedErrorMessage = ApiErrorMessages.GATEWAY_TIMEOUT.MESSAGE;
      const apiReturn = {
        errors: [
          {
            status: 504,
            detail: expectedErrorMessage,
            title: 'Gateway timeout error',
          },
        ],
      };
      const user = EmberObject.create({
        ...userInputs,
        save() {
          return new reject(apiReturn);
        },
      });

      this.set('user', user);
      await render(hbs`<SignupForm @user={{this.user}} />`);

      // when
      await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

      // then
      expect(find('div[id="sign-up-error-message"]')).to.exist;
      expect(find('div[id="sign-up-error-message"]').textContent.trim()).to.equal(this.intl.t(expectedErrorMessage));
    });

    it('should display related error message if not implemented error', async function () {
      // given
      const expectedErrorMessage = ApiErrorMessages.INTERNAL_SERVER_ERROR.MESSAGE;
      const apiReturn = {
        errors: [
          {
            status: 501,
            detail: 'Not implemented Error',
            title: 'Not implemented error',
          },
        ],
      };
      const user = EmberObject.create({
        ...userInputs,
        save() {
          return new reject(apiReturn);
        },
      });

      this.set('user', user);
      await render(hbs`<SignupForm @user={{this.user}} />`);

      // when
      await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

      // then
      expect(find('div[id="sign-up-error-message"]')).to.exist;
      expect(find('div[id="sign-up-error-message"]').textContent.trim()).to.equal(this.intl.t(expectedErrorMessage));
    });
  });

  describe('Behaviors', function () {
    let session;
    beforeEach(function () {
      class sessionService extends Service {
        authenticateUser = sinon.stub().resolves();
      }
      this.owner.register('service:session', sessionService);
      session = this.owner.lookup('service:session', sessionService);
    });
    describe('behavior when signup successful (test external calls)', function () {
      it('should return true if action <Signup> is handled', async function () {
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
          },
        });

        this.set('authenticateUser', () => {});

        this.set('user', user);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

        // then
        return settled().then(() => {
          expect(isFormSubmitted).to.be.true;
        });
      });

      it('should authenticate the user and empty the password', async function () {
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
          },
        });
        this.set('user', user);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

        // then
        return settled().then(() => {
          sinon.assert.calledOnce(session.authenticateUser);
          sinon.assert.calledWith(session.authenticateUser, 'toto@pix.fr', 'gipix2017');
          expect(user.password).to.be.null;
        });
      });
    });

    describe('Errors management', function () {
      it('should display an error message on first name field, when field is empty and focus-out', async function () {
        // given
        const emptyFirstnameErrorMessage = this.intl.t('pages.sign-up.fields.firstname.error');
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#firstName', '');
        await triggerEvent('#firstName', 'focusout');

        // then
        return settled().then(() => {
          expect(find('#validationMessage-firstName').getAttribute('class')).to.contain(
            'form-textfield__message--error'
          );
          expect(find('.form-textfield__message--error').textContent.trim()).to.equal(emptyFirstnameErrorMessage);
          expect(find('#firstName').getAttribute('class')).to.contain('form-textfield__input--error');
          expect(find('.form-textfield-icon__state--error')).to.exist;
        });
      });

      it('should display an error message on last name field, when field is empty and focus-out', async function () {
        // given
        const emptyLastnameErrorMessage = this.intl.t('pages.sign-up.fields.lastname.error');
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#lastName', '');
        await triggerEvent('#lastName', 'focusout');

        // then
        return settled().then(() => {
          expect(find('#validationMessage-lastName').getAttribute('class')).to.contain(
            'form-textfield__message--error'
          );
          expect(find('.form-textfield__message--error').textContent.trim()).to.equal(emptyLastnameErrorMessage);
          expect(find('#lastName').getAttribute('class')).to.contain('form-textfield__input--error');
          expect(find('.form-textfield-icon__state--error')).to.exist;
        });
      });

      it('should display an error message on email field, when field is empty and focus-out', async function () {
        // given
        const emptyEmailErrorMessage = this.intl.t('pages.sign-up.fields.email.error');
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#email', '');
        await triggerEvent('#email', 'focusout');

        // then
        return settled().then(() => {
          expect(find('.form-textfield__message-email').getAttribute('class')).to.contain(
            'form-textfield__message--error'
          );
          expect(find('.form-textfield__message--error').textContent.trim()).to.equal(emptyEmailErrorMessage);
          expect(find('#email').getAttribute('class')).to.contain('form-textfield__input--error');
          expect(find('.form-textfield-icon__state--error')).to.exist;
        });
      });

      it('should display an error message on password field, when field is empty and focus-out', async function () {
        // given
        const incorrectPasswordErrorMessage = this.intl.t('pages.sign-up.fields.password.error');
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#password', '');
        await triggerEvent('#password', 'focusout');

        // then
        return settled().then(() => {
          expect(find('.form-textfield__message-password').getAttribute('class')).to.contain(
            'form-textfield__message--error'
          );
          expect(find('.form-textfield__message--error').textContent.trim()).to.equal(incorrectPasswordErrorMessage);
          expect(find('#password').getAttribute('class')).to.contain('form-textfield__input--error');
          expect(find('.form-textfield-icon__state--error')).to.exist;
        });
      });

      it("should display an error message on cgu field, when cgu isn't accepted and form is submitted", async function () {
        // given
        const uncheckedCheckboxCguErrorMessage = this.intl.t('common.cgu.error');
        const userWithCguNotAccepted = EmberObject.create({
          cgu: false,
          errors: ArrayProxy.create({
            content: [
              {
                attribute: 'cgu',
                message: uncheckedCheckboxCguErrorMessage,
              },
            ],
            cgu: [
              {
                attribute: 'cgu',
                message: uncheckedCheckboxCguErrorMessage,
              },
            ],
          }),
          save() {
            return new reject();
          },
        });

        this.set('user', userWithCguNotAccepted);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

        // then
        return settled().then(() => {
          expect(find('.sign-form__validation-error')).to.exist;
          expect(find('.sign-form__validation-error').textContent.trim()).to.equal(uncheckedCheckboxCguErrorMessage);
        });
      });

      it('should display an error message on email field, when email above a maximum length of 255 and focus-out', async function () {
        // given
        const expectedMaxLengthEmailError = 'Votre adresse e-mail ne doit pas dépasser les 255 caractères.';
        const errors = [
          {
            status: '422',
            attribute: 'email',
            message: expectedMaxLengthEmailError,
          },
        ];

        const userBackToSaveWithErrors = EmberObject.create({
          email: 'elliott'.repeat(37) + '@example.net',
          firstName: 'Henry',
          lastName: 'Thomas',
          password: 'Pix12345',
          cgu: true,
          errors,
          save() {
            return new reject({ errors });
          },
        });

        this.set('user', userBackToSaveWithErrors);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

        // then
        expect(find('#validationMessage-email').textContent).to.equal(expectedMaxLengthEmailError);
      });

      it('should not display success notification message when an error occurred during the form submission', async function () {
        const userThatThrowAnErrorDuringSaving = EmberObject.create({
          errors: ArrayProxy.create({
            content: [
              {
                attribute: 'email',
                message: 'An error concerning the email thrown by the API',
              },
            ],
          }),
          save() {
            return new reject();
          },
        });

        this.set('user', userThatThrowAnErrorDuringSaving);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

        // then
        return settled().then(() => {
          expect(find('.signup-form__notification-message')).to.not.exist;
        });
      });
    });

    describe('Successfull cases', function () {
      it('should display first name field as validated without error message, when field is filled and focus-out', async function () {
        // given
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#firstName', 'pix');
        await triggerEvent('#firstName', 'focusout');

        // then
        return settled().then(() => {
          expect(find('#validationMessage-firstName').getAttribute('class')).to.contain(
            'form-textfield__message--success'
          );
          expect(find('.form-textfield__message--error')).not.to.exist;
          expect(find('#firstName').getAttribute('class')).to.contain('form-textfield__input--success');
          expect(find('.form-textfield-icon__state--success')).to.exist;
        });
      });

      it('should display last name field as validated without error message, when field is filled and focus-out', async function () {
        // given
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#lastName', 'pix');
        await triggerEvent('#lastName', 'focusout');

        // then
        return settled().then(() => {
          expect(find('#validationMessage-lastName').getAttribute('class')).to.contain(
            'form-textfield__message--success'
          );
          expect(find('.form-textfield__message--error')).not.to.exist;
          expect(find('#lastName').getAttribute('class')).to.contain('form-textfield__input--success');
          expect(find('.form-textfield-icon__state--success')).to.exist;
        });
      });

      it('should display email field as validated without error message, when field is filled and focus-out', async function () {
        // given
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#email', 'shi@fu.pix');
        await triggerEvent('#email', 'focusout');

        // then
        return settled().then(() => {
          expect(find('.form-textfield__message-email').getAttribute('class')).to.contain(
            'form-textfield__message--success'
          );
          expect(find('.form-textfield__message--error')).not.to.exist;
          expect(find('#email').getAttribute('class')).to.contain('form-textfield__input--success');
          expect(find('.form-textfield-icon__state--success')).to.exist;
        });
      });

      it('should display password field as validated without error message, when field is filled and focus-out', async function () {
        // given
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#password', 'Mypassword1');
        await triggerEvent('#password', 'focusout');

        // then
        return settled().then(() => {
          expect(find('.form-textfield__message-password').getAttribute('class')).to.contain(
            'form-textfield__message--success'
          );
          expect(find('.form-textfield__message--error')).not.to.exist;
          expect(find('#password').getAttribute('class')).to.contain('form-textfield__input--success');
          expect(find('.form-textfield-icon__state--success')).to.exist;
        });
      });

      it('should not display an error message on cgu field, when cgu is accepted and form is submitted', async function () {
        // given
        const userWithCguAccepted = EmberObject.create({
          cgu: true,
          save() {
            return new resolve();
          },
        });

        this.set('user', userWithCguAccepted);
        this.set('authenticateUser', () => {});
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

        // then
        return settled().then(() => {
          expect(find('.sign-form__validation-error')).to.not.exist;
        });
      });

      it('should reset validation property, when all things are ok and form is submitted', async function () {
        // given
        const validUser = EmberObject.create({
          email: 'toto@pix.fr',
          firstName: 'Marion',
          lastName: 'Yade',
          password: 'gipix2017',
          cgu: true,
          save() {
            return new resolve();
          },
        });

        this.set('user', validUser);
        this.set('authenticateUser', () => {});
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

        // then
        return settled().then(() => {
          expect(findAll('.form-textfield__input-field-container')[0].getAttribute('class')).contains(
            INPUT_TEXT_FIELD_CLASS_DEFAULT
          );
        });
      });
    });
  });

  describe('Loading management', () => {
    it('should not display any loading spinner by default', async function () {
      // given
      this.set('user', userEmpty);

      // when
      await render(hbs`<SignupForm @user={{this.user}} />`);

      // then
      expect(find('.sign-form-body__bottom-button .loader-in-button')).to.not.exist;
    });

    it('should display a loading spinner when user submit signup', async function () {
      // given
      class sessionService extends Service {
        authenticateUser = sinon.stub().resolves();
      }
      this.owner.register('service:session', sessionService);

      const validUser = EmberObject.create({
        email: 'toto@pix.fr',
        firstName: 'Marion',
        lastName: 'Yade',
        password: 'gipix2017',
        cgu: true,
        save() {
          return new resolve();
        },
      });
      this.set('user', validUser);
      await render(hbs`<SignupForm @user={{this.user}} />`);

      // when
      await clickByLabel("Je m'inscris");

      // then
      await waitUntil(() => find('.loader-in-button'));
    });
  });
});
