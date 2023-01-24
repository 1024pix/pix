import { module, test } from 'qunit';
import { click, fillIn, find, triggerEvent } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';

import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { clickByLabel } from '../../../helpers/click-by-label';

import ENV from '../../../../config/environment';

const EMPTY_FIRSTNAME_ERROR_MESSAGE = 'Votre prénom n’est pas renseigné.';
const EMPTY_LASTNAME_ERROR_MESSAGE = 'Votre nom n’est pas renseigné.';
const INVALID_DAY_OF_BIRTH_ERROR_MESSAGE = 'Votre jour de naissance n’est pas valide.';
const INVALID_MONTH_OF_BIRTH_ERROR_MESSAGE = 'Votre mois de naissance n’est pas valide.';
const INVALID_YEAR_OF_BIRTH_ERROR_MESSAGE = 'Votre année de naissance n’est pas valide.';
const EMPTY_EMAIL_ERROR_MESSAGE = 'Votre email n’est pas valide.';
const INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE =
  'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

module('Integration | Component | routes/register-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  let authenticateStub;
  let saveUserAssociationStub;
  let saveDependentUserStub;

  hooks.beforeEach(function () {
    authenticateStub = sinon.stub();
    class sessionStub extends Service {
      authenticate = authenticateStub;
    }
    authenticateStub.resolves();

    saveUserAssociationStub = sinon.stub();
    saveDependentUserStub = sinon.stub();
    class storeStub extends Service {
      createRecord = sinon
        .stub()
        .onFirstCall()
        .returns({
          username: 'pix.pix1010',
          save: saveUserAssociationStub,
          unloadRecord: sinon.stub().resolves(),
        })
        .onSecondCall()
        .returns({
          save: saveDependentUserStub,
          unloadRecord: sinon.stub().resolves(),
        });
    }
    saveUserAssociationStub.resolves({ username: 'pix.pix1010' });
    saveDependentUserStub.resolves();

    this.owner.register('service:session', sessionStub);
    this.owner.register('service:store', storeStub);
  });

  module('successful cases', function () {
    test('should call authentication service by email with appropriate parameters, when all things are ok and form is submitted', async function (assert) {
      // given
      const screen = await render(hbs`<Routes::RegisterForm />`);

      await fillInputReconciliationForm({ screen, intl: this.intl });
      await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));
      await click('.pix-toggle-deprecated__off');

      await fillIn('#email', 'shi@fu.me');
      await fillIn('#password', 'Mypassword1');

      // when
      await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

      // then
      assert.dom('.form-textfield__input--error').doesNotExist();
      assert.dom('.join-restricted-campaign__error').doesNotExist();
      sinon.assert.calledWith(authenticateStub, 'authenticator:oauth2', {
        login: 'shi@fu.me',
        password: 'Mypassword1',
        scope: 'mon-pix',
      });
      assert.ok(true);
    });

    test('should call authentication service by username with appropriate parameters, when all things are ok and form is submitted', async function (assert) {
      // given
      const screen = await render(hbs`<Routes::RegisterForm />`);

      await fillInputReconciliationForm({ screen, intl: this.intl });
      await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

      await fillIn('#password', 'Mypassword1');

      // when
      await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

      // then
      assert.dom('.form-textfield__input--error').doesNotExist();
      assert.dom('.join-restricted-campaign__error').doesNotExist();
      sinon.assert.calledWith(authenticateStub, 'authenticator:oauth2', {
        login: 'pix.pix1010',
        password: 'Mypassword1',
        scope: 'mon-pix',
      });
      assert.ok(true);
    });

    test('should display RGPD legal notice', async function (assert) {
      // given
      const screen = await render(hbs`<Routes::RegisterForm />`);
      await fillInputReconciliationForm({ screen, intl: this.intl });

      // when
      await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

      // then
      assert.ok(screen.getByText(this.intl.t('pages.login-or-register.register-form.rgpd-legal-notice')));
      assert.ok(
        screen.getByRole('link', { name: this.intl.t('pages.login-or-register.register-form.rgpd-legal-notice-link') })
      );
    });
  });

  module('errors management', function () {
    module('input errors on reconciliation form', function () {
      [{ stringFilledIn: '' }, { stringFilledIn: ' ' }].forEach(function ({ stringFilledIn }) {
        test(`should display an error message on firstName field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          await render(hbs`<Routes::RegisterForm />`);

          // when
          await fillIn('#firstName', stringFilledIn);
          await triggerEvent('#firstName', 'focusout');

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(
            find('#register-firstName-container #validationMessage-firstName').textContent,
            EMPTY_FIRSTNAME_ERROR_MESSAGE
          );
          assert.dom('#register-firstName-container .form-textfield__input-container--error').exists();
        });
      });

      [{ stringFilledIn: '' }, { stringFilledIn: ' ' }].forEach(function ({ stringFilledIn }) {
        test(`should display an error message on lastName field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          await render(hbs`<Routes::RegisterForm />`);

          // when
          await fillIn('#lastName', stringFilledIn);
          await triggerEvent('#lastName', 'focusout');

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(
            find('#register-lastName-container #validationMessage-lastName').textContent,
            EMPTY_LASTNAME_ERROR_MESSAGE
          );
          assert.dom('#register-lastName-container .form-textfield__input-container--error').exists();
        });
      });

      [{ stringFilledIn: '' }, { stringFilledIn: 'a' }, { stringFilledIn: '32' }].forEach(function ({
        stringFilledIn,
      }) {
        test(`should display an error message on dayOfBirth field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          await render(hbs`<Routes::RegisterForm />`);

          // when
          await fillIn('#dayOfBirth', stringFilledIn);
          await triggerEvent('#dayOfBirth', 'focusout');

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(
            find('#register-birthdate-container #dayValidationMessage').textContent,
            INVALID_DAY_OF_BIRTH_ERROR_MESSAGE
          );
          assert.dom('#register-birthdate-container .form-textfield__input-container--error').exists();
        });
      });

      [{ stringFilledIn: '' }, { stringFilledIn: 'a' }, { stringFilledIn: '13' }].forEach(function ({
        stringFilledIn,
      }) {
        test(`should display an error message on monthOfBirth field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          await render(hbs`<Routes::RegisterForm />`);

          // when
          await fillIn('#monthOfBirth', stringFilledIn);
          await triggerEvent('#monthOfBirth', 'focusout');

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(
            find('#register-birthdate-container #monthValidationMessage').textContent,
            INVALID_MONTH_OF_BIRTH_ERROR_MESSAGE
          );
          assert.dom('#register-birthdate-container .form-textfield__input-container--error').exists();
        });
      });

      [{ stringFilledIn: '' }, { stringFilledIn: 'a' }, { stringFilledIn: '10000' }].forEach(function ({
        stringFilledIn,
      }) {
        test(`should display an error message on yearOfBirth field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          await render(hbs`<Routes::RegisterForm />`);

          // when
          await fillIn('#yearOfBirth', stringFilledIn);
          await triggerEvent('#yearOfBirth', 'focusout');

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(
            find('#register-birthdate-container #yearValidationMessage').textContent,
            INVALID_YEAR_OF_BIRTH_ERROR_MESSAGE
          );
          assert.dom('#register-birthdate-container .form-textfield__input-container--error').exists();
        });
      });

      [{ stringFilledIn: ' ' }, { stringFilledIn: 'a' }, { stringFilledIn: 'shi.fu' }].forEach(function ({
        stringFilledIn,
      }) {
        test(`should display an error message on email field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          const screen = await render(hbs`<Routes::RegisterForm /> `);

          await fillInputReconciliationForm({ screen, intl: this.intl });
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // when
          await click('.pix-toggle-deprecated__off');
          await fillIn('#email', stringFilledIn);
          await triggerEvent('#email', 'focusout');

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(
            find('#register-email-container #validationMessage-email').textContent,
            EMPTY_EMAIL_ERROR_MESSAGE
          );
          assert.dom('#register-email-container .form-textfield__input-container--error').exists();
        });
      });
    });
    module('input errors on create account form', function () {
      [
        { stringFilledIn: ' ' },
        { stringFilledIn: 'password' },
        { stringFilledIn: 'password1' },
        { stringFilledIn: 'Password' },
      ].forEach(function ({ stringFilledIn }) {
        test(`should display an error message on password field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          const screen = await render(hbs`<Routes::RegisterForm /> `);

          await fillInputReconciliationForm({ screen, intl: this.intl });
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // when
          await fillIn('#password', stringFilledIn);
          await triggerEvent('#password', 'focusout');

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(
            find('#register-password-container #validationMessage-password').textContent,
            INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE
          );
          assert.dom('#register-password-container .form-textfield__input-container--error').exists();
        });
      });
    });

    test('should not call api when email is invalid', async function (assert) {
      // given
      const screen = await render(hbs`<Routes::RegisterForm /> `);

      await fillInputReconciliationForm({ screen, intl: this.intl });
      await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

      // when
      await click('.pix-toggle-deprecated__off');
      await fillIn('#email', 'shi.fu');
      await triggerEvent('#email', 'focusout');
      await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(find('#register-email-container #validationMessage-email').textContent, EMPTY_EMAIL_ERROR_MESSAGE);
      assert.dom('#register-email-container .form-textfield__input-container--error').exists();
      sinon.assert.notCalled(saveDependentUserStub);
      assert.ok(true);
    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-async-module-callbacks
    module('When create and reconcile service fails', async function () {
      test('Should display registerErrorMessage when authentication service fails with username error', async function (assert) {
        // given
        const expectedRegisterErrorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY);
        saveDependentUserStub.rejects({ errors: [{ status: '400' }] });

        // when
        const screen = await render(hbs`<Routes::RegisterForm />`);

        await fillInputReconciliationForm({ screen, intl: this.intl });
        await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

        await fillIn('#password', 'Mypassword1');
        await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

        // then
        assert.dom('div[id="register-display-error-message"').exists();
        assert.ok(find('div[id="register-display-error-message"').innerHTML.includes(expectedRegisterErrorMessage));
      });
    });

    test('should not call api when password is invalid', async function (assert) {
      // given
      const screen = await render(hbs`<Routes::RegisterForm /> `);

      await fillInputReconciliationForm({ screen, intl: this.intl });
      await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

      // when
      await fillIn('#password', 'toto');
      await triggerEvent('#password', 'focusout');
      await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(
        find('#register-password-container #validationMessage-password').textContent,
        INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE
      );
      assert.dom('#register-password-container .form-textfield__input-container--error').exists();
      sinon.assert.notCalled(saveDependentUserStub);
      assert.ok(true);
    });

    const internalServerErrorMessage =
      'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.';

    [
      {
        status: '404',
        errorMessage:
          'Vous êtes un élève ? <br> Vérifiez vos informations (prénom, nom et date de naissance) ou contactez un enseignant. <br><br> Vous êtes un enseignant ? <br> L’accès à un parcours n’est pas disponible pour le moment.',
      },
      { status: '500', errorMessage: internalServerErrorMessage },
    ].forEach(({ status, errorMessage }) => {
      test(`should display an error message if user saves with an error response status ${status}`, async function (assert) {
        saveUserAssociationStub.rejects({ errors: [{ status }] });
        const screen = await render(hbs`<Routes::RegisterForm />`);
        await fillInputReconciliationForm({ screen, intl: this.intl });

        // when
        await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(find('div[id="register-error-message"').innerHTML, errorMessage);
      });
    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-async-module-callbacks
    module('When student is already reconciled in the same organization', async function () {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by email only', async function () {
        test('should display the error message related to the short code S61)', async function (assert) {
          // given
          const meta = { shortCode: 'S61', value: 'j***@example.net' };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s61', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by username only', async function () {
        test('should display the error message related to the short code S62)', async function (assert) {
          // given
          const meta = { shortCode: 'S62', value: 'j***.h***2' };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s62', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by SamlId only', async function () {
        test('should display the error message related to the short code S63)', async function (assert) {
          // given
          const meta = { shortCode: 'S63', value: undefined };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s63', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by SamlId and username', async function () {
        test('should display the error message related to the short code S63)', async function (assert) {
          // given
          const meta = { shortCode: 'S63', value: undefined };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s63', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by SamlId and email', async function () {
        test('should display the error message related to the short code S63)', async function (assert) {
          // given
          const meta = { shortCode: 'S63', value: undefined };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s63', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by SamlId, email and username', async function () {
        test('should display the error message related to the short code S63)', async function (assert) {
          // given
          const meta = { shortCode: 'S63', value: undefined };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s63', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by email and username', async function () {
        test('should display the error message related to the short code S62)', async function (assert) {
          // given
          const meta = { shortCode: 'S62', value: 'j***.h***2' };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s62', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });
    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-async-module-callbacks
    module('When student is already reconciled in others organization', async function () {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by email only', async function () {
        test('should display the error message related to the short code S51)', async function (assert) {
          // given
          const meta = { shortCode: 'S51', value: 'j***@example.net' };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s51', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by username only', async function () {
        test('should display the error message related to the short code S52)', async function (assert) {
          // given
          const meta = { shortCode: 'S52', value: 'j***.h***2' };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s52', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by SamlId only', async function () {
        test('should display the error message related to the short code S53)', async function (assert) {
          // given
          const meta = { shortCode: 'S53', value: undefined };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s53', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by SamlId and username', async function () {
        test('should display the error message related to the short code S53)', async function (assert) {
          // given
          const meta = { shortCode: 'S53', value: undefined };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s53', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by SamlId and email', async function () {
        test('should display the error message related to the short code S53)', async function (assert) {
          // given
          const meta = { shortCode: 'S53', value: undefined };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s53', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by SamlId, username and email', async function () {
        test('should display the error message related to the short code S53)', async function (assert) {
          // given
          const meta = { shortCode: 'S53', value: undefined };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s53', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('When student account is authenticated by username and email', async function () {
        test('should display the error message related to the short code S52)', async function (assert) {
          // given
          const meta = { shortCode: 'S52', value: 'j***.h***2' };
          const expectedErrorMessage = this.intl.t('api-error-messages.register-error.s52', { value: meta.value });

          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, intl: this.intl });

          // when
          await clickByLabel(this.intl.t('pages.login-or-register.register-form.button-form'));
          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(find('div[id="register-error-message"').innerHTML, expectedErrorMessage);
        });
      });
    });
  });
});

async function fillInputReconciliationForm({ screen, intl }) {
  await fillIn(screen.getByRole('textbox', { name: 'obligatoire Prénom' }), 'Legolas');
  await fillIn(screen.getByRole('textbox', { name: 'obligatoire Nom' }), 'Vertefeuille');
  await fillIn(
    screen.getByRole('spinbutton', {
      name: intl.t('pages.login-or-register.register-form.fields.birthdate.day.label'),
    }),
    '10'
  );
  await fillIn(
    screen.getByRole('spinbutton', {
      name: intl.t('pages.login-or-register.register-form.fields.birthdate.month.label'),
    }),
    '10'
  );
  await fillIn(
    screen.getByRole('spinbutton', {
      name: intl.t('pages.login-or-register.register-form.fields.birthdate.year.label'),
    }),
    '2010'
  );
}
