import { module, test } from 'qunit';
import sinon from 'sinon';
import Service from '@ember/service';

import { fillIn, triggerEvent } from '@ember/test-helpers';
import { render, clickByName } from '@1024pix/ember-testing-library';

import ArrayProxy from '@ember/array/proxy';
import { resolve, reject } from 'rsvp';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

import ENV from '../../../config/environment';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

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
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        // then
        assert.dom(screen.getByRole('heading', { name: expectedTitle })).exists();
      });
    });
  });

  module('Rendering', function () {
    test('should display form elements', async function (assert) {
      // given
      this.set('user', userEmpty);

      // when
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

      // then
      assert
        .dom(screen.getByRole('link', { name: this.intl.t('navigation.showcase-homepage', { tld: 'localhost' }) }))
        .exists();
      assert.dom(screen.getByRole('heading', { name: this.intl.t('pages.sign-up.first-title') })).exists();
      assert.dom(screen.getByRole('link', { name: this.intl.t('pages.sign-up.subtitle.link') })).exists();
      assert.dom(screen.getByRole('textbox', { name: this.intl.t('pages.sign-up.fields.firstname.label') })).exists();
      assert.dom(screen.getByRole('textbox', { name: this.intl.t('pages.sign-up.fields.lastname.label') })).exists();
      assert
        .dom(
          screen.getByLabelText(
            `${this.intl.t('pages.sign-up.fields.password.label')} ${this.intl.t('pages.sign-up.fields.password.help')}`
          )
        )
        .exists();
      assert
        .dom(
          screen.getByRole('textbox', {
            name: `${this.intl.t('pages.sign-up.fields.email.label')} ${this.intl.t(
              'pages.sign-up.fields.email.help'
            )}`,
          })
        )
        .exists();
      assert.dom(screen.getByRole('button', { name: this.intl.t('common.form.visible-password') })).exists();
      assert.dom(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') })).exists();
    });

    test("should have links to Pix's CGU and data protection policy ", async function (assert) {
      // given
      this.set('user', userEmpty);

      // when
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

      // then
      assert.ok(screen.getByRole('link', { name: this.intl.t('common.cgu.cgu') }));
      assert.ok(screen.getByRole('link', { name: this.intl.t('common.cgu.data-protection-policy') }));
    });

    test('should render a submit button', async function (assert) {
      // given
      this.set('user', userEmpty);

      // when
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

      // then
      assert.ok(screen.getByRole('button', { name: this.intl.t('pages.sign-up.actions.submit') }));
    });

    test('[a11y] it should display a message that all inputs are required', async function (assert) {
      // given & when
      const screen = await render(hbs`<SignupForm />`);

      // then
      assert.dom(screen.getByText(this.intl.t('common.form.mandatory-all-fields'))).exists();
      assert
        .dom(screen.getByRole('textbox', { name: this.intl.t('pages.sign-up.fields.firstname.label') }))
        .hasAttribute('required');
      assert
        .dom(screen.getByRole('textbox', { name: this.intl.t('pages.sign-up.fields.lastname.label') }))
        .hasAttribute('required');
      assert
        .dom(
          screen.getByRole('textbox', {
            name: `${this.intl.t('pages.sign-up.fields.email.label')} ${this.intl.t(
              'pages.sign-up.fields.email.help'
            )}`,
          })
        )
        .hasAttribute('required');
      assert
        .dom(
          screen.getByLabelText(
            `${this.intl.t('pages.sign-up.fields.password.label')} ${this.intl.t('pages.sign-up.fields.password.help')}`
          )
        )
        .hasAttribute('required');
    });
  });

  module('When API returns errors', function () {
    test('should display an error if api cannot be reached', async function (assert) {
      // given
      const stubCatchedApiErrorInternetDisconnected = undefined;

      const user = EmberObject.create({
        cgu: true,
        save() {
          return new reject(stubCatchedApiErrorInternetDisconnected);
        },
      });

      this.set('user', user);
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);
      await _fillFormWithCorrectData(screen);

      // when
      await clickByName(this.intl.t('pages.sign-up.actions.submit'));

      // then
      assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY))).exists();
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
        cgu: true,
        save() {
          return new reject(apiReturn);
        },
      });

      this.set('user', user);
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);
      await _fillFormWithCorrectData(screen);

      // when
      await clickByName(this.intl.t('pages.sign-up.actions.submit'));

      // then
      assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY))).exists();
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
        cgu: true,
        save() {
          return new reject(apiReturn);
        },
      });

      this.set('user', user);
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);
      await _fillFormWithCorrectData(screen);

      // when
      await clickByName(this.intl.t('pages.sign-up.actions.submit'));

      // then
      assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.BAD_GATEWAY.I18N_KEY))).exists();
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
        cgu: true,
        save() {
          return new reject(apiReturn);
        },
      });

      this.set('user', user);
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);
      await _fillFormWithCorrectData(screen);

      // when
      await clickByName(this.intl.t('pages.sign-up.actions.submit'));

      // then
      assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.GATEWAY_TIMEOUT.I18N_KEY))).exists();
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
        cgu: true,
        save() {
          return new reject(apiReturn);
        },
      });

      this.set('user', user);
      const screen = await render(hbs`<SignupForm @user={{this.user}} />`);
      await _fillFormWithCorrectData(screen);

      // when
      await clickByName(this.intl.t('pages.sign-up.actions.submit'));

      // then
      assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY))).exists();
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
      test('should return true if action <Signup> is handled', async function (assert) {
        // given
        let isFormSubmitted = false;
        const user = EmberObject.create({
          cgu: true,
          save() {
            isFormSubmitted = true;
            return resolve();
          },
        });

        this.set('authenticateUser', () => {});

        this.set('user', user);
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);
        await _fillFormWithCorrectData(screen);

        // when
        await clickByName(this.intl.t('pages.sign-up.actions.submit'));

        // then
        assert.true(isFormSubmitted);
      });

      test('should authenticate the user and empty the password', async function (assert) {
        // given
        const authenticateUserStub = sinon.stub();

        this.set('authenticateUser', authenticateUserStub);

        const user = EmberObject.create({
          cgu: true,
          save() {
            return resolve();
          },
        });
        this.set('user', user);
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);
        await _fillFormWithCorrectData(screen);

        // when
        await clickByName(this.intl.t('pages.sign-up.actions.submit'));

        // then
        sinon.assert.calledOnce(session.authenticateUser);
        sinon.assert.calledWith(session.authenticateUser, 'jean@example.net', 'Password123');
        assert.notOk(user.password);
        assert.ok(true);
      });
    });

    module('Errors management', function () {
      test('should display an error message on first name field, when field is empty and focus-out', async function (assert) {
        // given
        this.set('user', userEmpty);
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        const firstNameInput = screen.getByRole('textbox', {
          name: this.intl.t('pages.sign-up.fields.firstname.label'),
        });

        // when
        await fillIn(firstNameInput, '');
        await triggerEvent(firstNameInput, 'focusout');

        // then
        assert.dom(screen.getByText(this.intl.t('pages.sign-up.fields.firstname.error'))).exists();
      });

      test('should display an error message on last name field, when field is empty and focus-out', async function (assert) {
        // given
        this.set('user', userEmpty);
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        const lastNameInput = screen.getByRole('textbox', {
          name: this.intl.t('pages.sign-up.fields.lastname.label'),
        });

        // when
        await fillIn(lastNameInput, '');
        await triggerEvent(lastNameInput, 'focusout');

        // then
        assert.dom(screen.getByText(this.intl.t('pages.sign-up.fields.lastname.error'))).exists();
      });

      test('should display an error message on email field, when field is empty and focus-out', async function (assert) {
        // given
        this.set('user', userEmpty);
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        const emailInput = screen.getByRole('textbox', {
          name: `${this.intl.t('pages.sign-up.fields.email.label')} ${this.intl.t('pages.sign-up.fields.email.help')}`,
        });

        // when
        await fillIn(emailInput, '');
        await triggerEvent(emailInput, 'focusout');

        // then
        assert.dom(screen.getByText(this.intl.t('pages.sign-up.fields.email.error'))).exists();
      });

      test('should display an error message on password field, when field is empty and focus-out', async function (assert) {
        // given
        this.set('user', userEmpty);
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        const passwordInput = screen.getByLabelText(
          `${this.intl.t('pages.sign-up.fields.password.label')} ${this.intl.t('pages.sign-up.fields.password.help')}`
        );

        // when
        await fillIn(passwordInput, '');
        await triggerEvent(passwordInput, 'focusout');

        // then
        assert.dom(screen.getByText(this.intl.t('pages.sign-up.fields.password.error'))).exists();
      });

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
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await clickByName(this.intl.t('pages.sign-up.actions.submit'));

        // then
        assert.dom(screen.getByText(uncheckedCheckboxCguErrorMessage)).exists();
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
          cgu: true,
          errors,
          save() {
            return new reject({ errors });
          },
        });

        this.set('user', userBackToSaveWithErrors);
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        const tooLargeEmail = 'jean'.repeat(37);
        await fillIn(screen.getByRole('textbox', { name: 'Prénom' }), 'Jean');
        await fillIn(screen.getByRole('textbox', { name: 'Nom' }), 'Cérien');
        await fillIn(
          screen.getByRole('textbox', { name: 'Adresse e-mail (ex: nom@exemple.fr)' }),
          `${tooLargeEmail}@example.net`
        );
        await fillIn(
          screen.getByLabelText('Mot de passe (8 caractères minimum, dont une majuscule, une minuscule et un chiffre)'),
          'Password123'
        );

        // when
        await clickByName(this.intl.t('pages.sign-up.actions.submit'));

        // then
        assert.dom(screen.getByText(expectedMaxLengthEmailError)).exists();
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
        await clickByName(this.intl.t('pages.sign-up.actions.submit'));

        // then
        assert.dom('.signup-form__notification-message').doesNotExist();
      });
    });

    module('Successfull cases', function () {
      test('should display first name field as validated without error message, when field is filled and focus-out', async function (assert) {
        // given
        this.set('user', userEmpty);
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        const firstNameInput = screen.getByRole('textbox', {
          name: this.intl.t('pages.sign-up.fields.firstname.label'),
        });

        // when
        await fillIn(firstNameInput, 'pix');
        await triggerEvent(firstNameInput, 'focusout');

        // then
        assert.dom(screen.queryByText(this.intl.t('pages.sign-up.fields.firstname.error'))).doesNotExist();
      });

      test('should display last name field as validated without error message, when field is filled and focus-out', async function (assert) {
        // given
        this.set('user', userEmpty);
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        const lastNameInput = screen.getByRole('textbox', {
          name: this.intl.t('pages.sign-up.fields.lastname.label'),
        });

        // when
        await fillIn(lastNameInput, 'pix');
        await triggerEvent(lastNameInput, 'focusout');

        // then
        assert.dom(screen.queryByText(this.intl.t('pages.sign-up.fields.lastname.error'))).doesNotExist();
      });

      test('should display email field as validated without error message, when field is filled and focus-out', async function (assert) {
        // given
        this.set('user', userEmpty);
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        const emailInput = screen.getByRole('textbox', {
          name: `${this.intl.t('pages.sign-up.fields.email.label')} ${this.intl.t('pages.sign-up.fields.email.help')}`,
        });

        // when
        await fillIn(emailInput, 'shi@fu.pix');
        await triggerEvent(emailInput, 'focusout');

        // then
        assert.dom(screen.queryByText(this.intl.t('pages.sign-up.fields.email.error'))).doesNotExist();
      });

      test('should display password field as validated without error message, when field is filled and focus-out', async function (assert) {
        // given
        this.set('user', userEmpty);
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        const passwordInput = screen.getByLabelText(
          `${this.intl.t('pages.sign-up.fields.password.label')} ${this.intl.t('pages.sign-up.fields.password.help')}`
        );

        // when
        await fillIn(passwordInput, 'Mypassword1');
        await triggerEvent(passwordInput, 'focusout');

        // then
        assert.dom(screen.queryByText(this.intl.t('pages.sign-up.fields.password.error'))).doesNotExist();
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
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await clickByName(this.intl.t('pages.sign-up.actions.submit'));

        // then
        assert.dom(screen.queryByText(this.intl.t('common.cgu.error'))).doesNotExist();
      });

      test('should reset validation property, when all informations are validated and form is submitted', async function (assert) {
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
        const screen = await render(hbs`<SignupForm @user={{this.user}} />`);

        // when
        await clickByName(this.intl.t('pages.sign-up.actions.submit'));

        // then
        assert.dom(screen.queryByText(this.intl.t('pages.sign-up.fields.firstname.error'))).doesNotExist();
        assert.dom(screen.queryByText(this.intl.t('pages.sign-up.fields.lastname.error'))).doesNotExist();
        assert.dom(screen.queryByText(this.intl.t('pages.sign-up.fields.email.error'))).doesNotExist();
        assert.dom(screen.queryByText(this.intl.t('pages.sign-up.fields.password.error'))).doesNotExist();
        assert.dom(screen.queryByText(this.intl.t('common.cgu.error'))).doesNotExist();
      });
    });
  });

  async function _fillFormWithCorrectData(screen) {
    await fillIn(screen.getByRole('textbox', { name: 'Prénom' }), 'Jean');
    await fillIn(screen.getByRole('textbox', { name: 'Nom' }), 'Cérien');
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail (ex: nom@exemple.fr)' }), 'jean@example.net');
    await fillIn(
      screen.getByLabelText('Mot de passe (8 caractères minimum, dont une majuscule, une minuscule et un chiffre)'),
      'Password123'
    );
  }
});
