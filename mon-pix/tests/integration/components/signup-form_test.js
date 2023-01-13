import { module, test } from 'qunit';
import sinon from 'sinon';
import { clickByLabel } from '../../helpers/click-by-label';
import Service from '@ember/service';

import { fillIn, find, findAll, settled, triggerEvent } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';

import ArrayProxy from '@ember/array/proxy';
import { resolve, reject } from 'rsvp';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

import ENV from '../../../config/environment';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

const FORM_TITLE = '.sign-form-title';
const INPUT_TEXT_FIELD_CLASS_DEFAULT = 'form-textfield__input-container--default';

const userEmpty = EmberObject.create({});

module('Integration | Component | SignupForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Localization', function (hooks) {
    const originalLocale = ENV.APP.LOCALE;

    hooks.afterEach(function () {
      this.intl.setLocale(originalLocale);
    });

    [
      { locale: 'fr', expectedFormTitle: 'Inscrivez-vous' },
      { locale: 'en', expectedFormTitle: 'Sign up' },
    ].forEach(function (testCase) {
      test(`${testCase.locale}`, async function (assert) {
        const expectedTitle = testCase.expectedFormTitle;
        this.set('user', userEmpty);
        this.intl.setLocale(testCase.locale);

        // when
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // then
        assert.strictEqual(find(FORM_TITLE).textContent, expectedTitle);
      });
    });
  });

  module('Rendering', function (hooks) {
    hooks.beforeEach(async function () {
      this.set('user', userEmpty);
      this.intl.setLocale(['en', 'fr']);
      await render(hbs`<SignupForm @user={{this.user}} />`);
    });

    test('renders', function (assert) {
      assert.dom('.sign-form__container').exists();
    });

    test('should return correct form title', function (assert) {
      const formTitle = this.intl.t('pages.sign-up.first-title');
      assert.strictEqual(find(FORM_TITLE).textContent, formTitle);
    });

    test('should display form elements', async function (assert) {
      // given & when
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

      // then
      assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.homepage') }));
      assert.ok(screen.getByRole('heading', { name: this.intl.t('pages.sign-up.first-title') }));
      assert.ok(screen.getByRole('link', { name: this.intl.t('pages.sign-up.subtitle.link') }));
      assert.ok(screen.getByRole('textbox', { name: this.intl.t('pages.sign-up.fields.firstname.label') }));
      assert.ok(screen.getByRole('textbox', { name: this.intl.t('pages.sign-up.fields.lastname.label') }));
      assert.ok(
        screen.getByRole('textbox', {
          name: `${this.intl.t('pages.sign-up.fields.email.label')} ${this.intl.t('pages.sign-up.fields.email.help')}`,
        })
      );
      assert.ok(screen.getByRole('button', { name: this.intl.t('common.form.visible-password') }));
      assert.ok(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));
    });

    test("should have links to Pix's CGU and data protection policy ", async function (assert) {
      // given & when
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

      // then
      assert.ok(screen.getByRole('link', { name: this.intl.t('common.cgu.cgu') }));
      assert.ok(screen.getByRole('link', { name: this.intl.t('common.cgu.data-protection-policy') }));
    });

    test('should render a submit button', async function (assert) {
      // given & when
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

      // then
      assert.ok(screen.getByRole('button', { name: this.intl.t('pages.sign-up.actions.submit') }));
    });
  });

  module('When API returns errors', function () {
    const userInputs = {
      email: 'toto@pix.fr',
      firstName: 'Marion',
      lastName: 'Yade',
      password: 'gipix2017',
      cgu: true,
    };

    test('should display an error if api cannot be reached', async function (assert) {
      // given
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
      assert.dom('div[id="sign-up-error-message"]').exists();
      const expectedErrorMessage = this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY);
      assert.strictEqual(find('div[id="sign-up-error-message"]').textContent.trim(), expectedErrorMessage);
    });

    test('should display related error message if internal server error', async function (assert) {
      // given
      const apiReturn = {
        errors: [
          {
            status: 500,
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
      assert.dom('div[id="sign-up-error-message"]').exists();
      const expectedErrorMessage = this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY);
      assert.strictEqual(find('div[id="sign-up-error-message"]').textContent.trim(), expectedErrorMessage);
    });

    test('should display related error message if bad gateway error', async function (assert) {
      // given
      const apiReturn = {
        errors: [
          {
            status: 502,
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
      assert.dom('div[id="sign-up-error-message"]').exists();
      const expectedErrorMessage = this.intl.t(ApiErrorMessages.BAD_GATEWAY.I18N_KEY);
      assert.strictEqual(find('div[id="sign-up-error-message"]').textContent.trim(), expectedErrorMessage);
    });

    test('should display related error message if gateway timeout error', async function (assert) {
      // given
      const apiReturn = {
        errors: [
          {
            status: 504,
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
      assert.dom('div[id="sign-up-error-message"]').exists();
      const expectedErrorMessage = this.intl.t(ApiErrorMessages.GATEWAY_TIMEOUT.I18N_KEY);
      assert.strictEqual(find('div[id="sign-up-error-message"]').textContent.trim(), expectedErrorMessage);
    });

    test('should display related error message if not implemented error', async function (assert) {
      // given
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
      assert.dom('div[id="sign-up-error-message"]').exists();
      const expectedErrorMessage = this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY);
      assert.strictEqual(find('div[id="sign-up-error-message"]').textContent.trim(), expectedErrorMessage);
    });
  });

  module('Behaviors', function (hooks) {
    let session;
    hooks.beforeEach(function () {
      class sessionService extends Service {
        authenticateUser = sinon.stub().resolves();
      }

      this.owner.register('service:session', sessionService);
      session = this.owner.lookup('service:session', sessionService);
    });
    module('behavior when signup successful (test external calls)', function () {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('should return true if action <Signup> is handled', async function (assert) {
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
          assert.true(isFormSubmitted);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('should authenticate the user and empty the password', async function (assert) {
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
          assert.notOk(user.password);
          assert.ok(true);
        });
      });
    });

    module('Errors management', function () {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('should display an error message on first name field, when field is empty and focus-out', async function (assert) {
        // given
        const emptyFirstnameErrorMessage = this.intl.t('pages.sign-up.fields.firstname.error');
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#firstName', '');
        await triggerEvent('#firstName', 'focusout');

        // then
        return settled().then(() => {
          assert.ok(
            find('#validationMessage-firstName').getAttribute('class').includes('form-textfield__message--error')
          );
          assert.strictEqual(find('.form-textfield__message--error').textContent.trim(), emptyFirstnameErrorMessage);
          assert.ok(find('#firstName').getAttribute('class').includes('form-textfield__input--error'));
          assert.dom('.form-textfield-icon__state--error').exists();
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('should display an error message on last name field, when field is empty and focus-out', async function (assert) {
        // given
        const emptyLastnameErrorMessage = this.intl.t('pages.sign-up.fields.lastname.error');
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#lastName', '');
        await triggerEvent('#lastName', 'focusout');

        // then
        return settled().then(() => {
          assert.ok(
            find('#validationMessage-lastName').getAttribute('class').includes('form-textfield__message--error')
          );
          assert.strictEqual(find('.form-textfield__message--error').textContent.trim(), emptyLastnameErrorMessage);
          assert.ok(find('#lastName').getAttribute('class').includes('form-textfield__input--error'));
          assert.dom('.form-textfield-icon__state--error').exists();
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('should display an error message on email field, when field is empty and focus-out', async function (assert) {
        // given
        const emptyEmailErrorMessage = this.intl.t('pages.sign-up.fields.email.error');
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#email', '');
        await triggerEvent('#email', 'focusout');

        // then
        return settled().then(() => {
          assert.ok(
            find('.form-textfield__message-email').getAttribute('class').includes('form-textfield__message--error')
          );
          assert.strictEqual(find('.form-textfield__message--error').textContent.trim(), emptyEmailErrorMessage);
          assert.ok(find('#email').getAttribute('class').includes('form-textfield__input--error'));
          assert.dom('.form-textfield-icon__state--error').exists();
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('should display an error message on password field, when field is empty and focus-out', async function (assert) {
        // given
        const incorrectPasswordErrorMessage = this.intl.t('pages.sign-up.fields.password.error');
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#password', '');
        await triggerEvent('#password', 'focusout');

        // then
        return settled().then(() => {
          assert.ok(
            find('.form-textfield__message-password').getAttribute('class').includes('form-textfield__message--error')
          );
          assert.strictEqual(find('.form-textfield__message--error').textContent.trim(), incorrectPasswordErrorMessage);
          assert.ok(find('#password').getAttribute('class').includes('form-textfield__input--error'));
          assert.dom('.form-textfield-icon__state--error').exists();
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test("should display an error message on cgu field, when cgu isn't accepted and form is submitted", async function (assert) {
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
          assert.dom('.sign-form__validation-error').exists();
          assert.strictEqual(find('.sign-form__validation-error').textContent.trim(), uncheckedCheckboxCguErrorMessage);
        });
      });

      test('should display an error message on email field, when email above a maximum length of 255 and focus-out', async function (assert) {
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
        assert.strictEqual(find('#validationMessage-email').textContent, expectedMaxLengthEmailError);
      });

      test('should not display success notification message when an error occurred during the form submission', async function (assert) {
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
          assert.dom('.signup-form__notification-message').doesNotExist();
        });
      });
    });

    module('Successfull cases', function () {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('should display first name field as validated without error message, when field is filled and focus-out', async function (assert) {
        // given
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#firstName', 'pix');
        await triggerEvent('#firstName', 'focusout');

        // then
        return settled().then(() => {
          assert.ok(
            find('#validationMessage-firstName').getAttribute('class').includes('form-textfield__message--success')
          );
          assert.dom('.form-textfield__message--error').doesNotExist();
          assert.ok(find('#firstName').getAttribute('class').includes('form-textfield__input--success'));
          assert.dom('.form-textfield-icon__state--success').exists();
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('should display last name field as validated without error message, when field is filled and focus-out', async function (assert) {
        // given
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#lastName', 'pix');
        await triggerEvent('#lastName', 'focusout');

        // then
        return settled().then(() => {
          assert.ok(
            find('#validationMessage-lastName').getAttribute('class').includes('form-textfield__message--success')
          );
          assert.dom('.form-textfield__message--error').doesNotExist();
          assert.ok(find('#lastName').getAttribute('class').includes('form-textfield__input--success'));
          assert.dom('.form-textfield-icon__state--success').exists();
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('should display email field as validated without error message, when field is filled and focus-out', async function (assert) {
        // given
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#email', 'shi@fu.pix');
        await triggerEvent('#email', 'focusout');

        // then
        return settled().then(() => {
          assert.ok(
            find('.form-textfield__message-email').getAttribute('class').includes('form-textfield__message--success')
          );
          assert.dom('.form-textfield__message--error').doesNotExist();
          assert.ok(find('#email').getAttribute('class').includes('form-textfield__input--success'));
          assert.dom('.form-textfield-icon__state--success').exists();
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('should display password field as validated without error message, when field is filled and focus-out', async function (assert) {
        // given
        this.set('user', userEmpty);
        await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await fillIn('#password', 'Mypassword1');
        await triggerEvent('#password', 'focusout');

        // then
        return settled().then(() => {
          assert.ok(
            find('.form-textfield__message-password').getAttribute('class').includes('form-textfield__message--success')
          );
          assert.dom('.form-textfield__message--error').doesNotExist();
          assert.ok(find('#password').getAttribute('class').includes('form-textfield__input--success'));
          assert.dom('.form-textfield-icon__state--success').exists();
        });
      });

      test('should not display an error message on cgu field, when cgu is accepted and form is submitted', async function (assert) {
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
          assert.dom('.sign-form__validation-error').doesNotExist();
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('should reset validation property, when all things are ok and form is submitted', async function (assert) {
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
          assert.ok(
            findAll('.form-textfield__input-field-container')[0]
              .getAttribute('class')
              .includes(INPUT_TEXT_FIELD_CLASS_DEFAULT)
          );
        });
      });
    });
  });

  module('Loading management', function () {
    test('should not display any loading spinner by default', async function (assert) {
      // given
      this.set('user', userEmpty);

      // when
      await render(hbs`<SignupForm @user={{this.user}} />`);

      // then
      assert.dom('.sign-form-body__bottom-button .loader-in-button').doesNotExist();
    });

    test('should display a loading spinner when user submit signup', async function (assert) {
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
      assert.ok(find('.loader-in-button'));
    });
  });
});
