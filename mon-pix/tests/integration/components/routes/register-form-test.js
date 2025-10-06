import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import ENV from '../../../../config/environment';
import { stubSessionService } from '../../../helpers/service-stubs.js';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const EMAIL_INPUT_LABEL = 'Adresse e-mail';
const PASSWORD_INPUT_LABEL = 'Mot de passe';

const EMPTY_FIRSTNAME_ERROR_MESSAGE = 'Votre prénom n’est pas renseigné.';
const EMPTY_LASTNAME_ERROR_MESSAGE = 'Votre nom n’est pas renseigné.';
const INVALID_DAY_OF_BIRTH_ERROR_MESSAGE = 'Votre jour de naissance n’est pas valide.';
const INVALID_MONTH_OF_BIRTH_ERROR_MESSAGE = 'Votre mois de naissance n’est pas valide.';
const INVALID_YEAR_OF_BIRTH_ERROR_MESSAGE = 'Votre année de naissance n’est pas valide.';
const EMPTY_EMAIL_ERROR_MESSAGE = 'Votre email n’est pas valide.';
const INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE =
  'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

const S53_ERROR_MESSAGE = 'Vous possédez déjà un compte Pix via l’ENT.Utilisez-le pour rejoindre le parcours.';
const R51_ERROR_MESSAGE = '(Pour l’enseignant : voir le ’Kit de dépannage’ dans Pix Orga > Documentation - Code R51)';
const R52_ERROR_MESSAGE = '(Pour l’enseignant : voir le ’Kit de dépannage’ dans Pix Orga > Documentation - Code R52)';
const R61_ERROR_MESSAGE = '(Pour l’enseignant : voir le ’Kit de dépannage’ dans Pix Orga > Documentation - Code R61)';
const R62_ERROR_MESSAGE = '(Pour l’enseignant : voir le ’Kit de dépannage’ dans Pix Orga > Documentation - Code R62)';
const R63_ERROR_MESSAGE = '(Pour l’enseignant : voir le ’Kit de dépannage’ dans Pix Orga > Documentation - Code R63)';
const EMAIL_ERROR_MESSAGE = 'Vous possédez déjà un compte Pix avec l’adresse e-mailj***@example.net';
const ENT_ERROR_MESSAGE = 'Vous possédez déjà un compte Pix via l’ENT dans un autre établissement scolaire.';
const USERNAME_ERROR_MESSAGE =
  'Vous possédez déjà un compte Pix utilisé avec l’identifiant sous la forme prénom.nom suivi de 4 chiffres:j***.h***2';

module('Integration | Component | routes/register-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  let sessionService;
  let saveUserAssociationStub;
  let saveDependentUserStub;

  hooks.beforeEach(function () {
    sessionService = stubSessionService(this.owner, { isAuthenticated: false });
    sessionService.authenticate.resolves();

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

    this.owner.register('service:store', storeStub);
  });

  module('successful cases', function () {
    test('should call authentication service by email with appropriate parameters, when all things are ok and form is submitted', async function (assert) {
      // given
      const screen = await render(hbs`<Routes::RegisterForm />`);

      await fillInputReconciliationForm({ screen, t });
      await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

      await click(screen.getByText('Mon adresse e-mail'));

      await fillIn(screen.getByLabelText(EMAIL_INPUT_LABEL, { exact: false }), 'shi@fu.me');
      await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'Mypassword1');

      // when
      await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

      // then
      sinon.assert.calledWith(sessionService.authenticate, 'authenticator:oauth2', {
        login: 'shi@fu.me',
        password: 'Mypassword1',
      });
      assert.ok(true);
    });

    test('should call authentication service by username with appropriate parameters, when all things are ok and form is submitted', async function (assert) {
      // given
      const screen = await render(hbs`<Routes::RegisterForm />`);

      await fillInputReconciliationForm({ screen, t });
      await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));
      await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'Mypassword1');

      // when
      await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

      // then
      sinon.assert.calledWith(sessionService.authenticate, 'authenticator:oauth2', {
        login: 'pix.pix1010',
        password: 'Mypassword1',
      });
      assert.ok(true);
    });

    test('should display RGPD legal notice', async function (assert) {
      // given
      const screen = await render(hbs`<Routes::RegisterForm />`);
      await fillInputReconciliationForm({ screen, t });

      // when
      await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

      // then
      assert.ok(screen.getByText(t('pages.sco-signup-or-login.register-form.rgpd-legal-notice')));
      assert.ok(
        screen.getByRole('link', { name: t('pages.sco-signup-or-login.register-form.rgpd-legal-notice-link') }),
      );
    });
  });

  module('errors management', function () {
    module('input errors on reconciliation form', function () {
      [{ stringFilledIn: '' }, { stringFilledIn: ' ' }].forEach(function ({ stringFilledIn }) {
        test(`should display an error message on firstName field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          const screen = await render(hbs`<Routes::RegisterForm />`);

          // when
          await fillIn(screen.getByLabelText(/Prénom/, { exact: false }), stringFilledIn);
          await triggerEvent(screen.getByLabelText(/Prénom/, { exact: false }), 'focusout');

          // then
          assert.dom(screen.getByText(EMPTY_FIRSTNAME_ERROR_MESSAGE)).exists();
        });
      });

      [{ stringFilledIn: '' }, { stringFilledIn: ' ' }].forEach(function ({ stringFilledIn }) {
        test(`should display an error message on lastName field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          const screen = await render(hbs`<Routes::RegisterForm />`);

          // when
          await fillIn(screen.getByLabelText(/Nom/, { exact: false }), stringFilledIn);
          await triggerEvent(screen.getByLabelText(/Nom/, { exact: false }), 'focusout');

          // then
          assert.dom(screen.getByText(EMPTY_LASTNAME_ERROR_MESSAGE)).exists();
        });
      });

      [{ stringFilledIn: '' }, { stringFilledIn: 'a' }, { stringFilledIn: '32' }].forEach(function ({
        stringFilledIn,
      }) {
        test(`should display an error message on dayOfBirth field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          const screen = await render(hbs`<Routes::RegisterForm />`);

          // when
          await fillIn(screen.getByRole('spinbutton', { name: 'Jour de naissance' }), stringFilledIn);
          await triggerEvent(screen.getByRole('spinbutton', { name: 'Jour de naissance' }), 'focusout');

          // then
          assert.dom(screen.getByText(INVALID_DAY_OF_BIRTH_ERROR_MESSAGE)).exists();
        });
      });

      [{ stringFilledIn: '' }, { stringFilledIn: 'a' }, { stringFilledIn: '13' }].forEach(function ({
        stringFilledIn,
      }) {
        test(`should display an error message on monthOfBirth field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          const screen = await render(hbs`<Routes::RegisterForm />`);

          // when
          await fillIn(screen.getByRole('spinbutton', { name: 'Mois de naissance' }), stringFilledIn);
          await triggerEvent(screen.getByRole('spinbutton', { name: 'Mois de naissance' }), 'focusout');

          // then
          assert.dom(screen.getByText(INVALID_MONTH_OF_BIRTH_ERROR_MESSAGE)).exists();
        });
      });

      [{ stringFilledIn: '' }, { stringFilledIn: 'a' }, { stringFilledIn: '10000' }].forEach(function ({
        stringFilledIn,
      }) {
        test(`should display an error message on yearOfBirth field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          const screen = await render(hbs`<Routes::RegisterForm />`);

          // when
          await fillIn(screen.getByRole('spinbutton', { name: 'Année de naissance' }), stringFilledIn);
          await triggerEvent(screen.getByRole('spinbutton', { name: 'Année de naissance' }), 'focusout');

          // then
          assert.dom(screen.getByText(INVALID_YEAR_OF_BIRTH_ERROR_MESSAGE)).exists();
        });
      });

      [{ stringFilledIn: ' ' }, { stringFilledIn: 'a' }, { stringFilledIn: 'shi.fu' }].forEach(function ({
        stringFilledIn,
      }) {
        test(`should display an error message on email field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
          // given
          const screen = await render(hbs`<Routes::RegisterForm />`);

          await fillInputReconciliationForm({ screen, t });
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // when
          await click(screen.getByText('Mon adresse e-mail'));
          await fillIn(screen.getByLabelText(EMAIL_INPUT_LABEL, { exact: false }), stringFilledIn);
          await triggerEvent(screen.getByLabelText(EMAIL_INPUT_LABEL, { exact: false }), 'focusout');

          // then
          assert.dom(screen.getByText(EMPTY_EMAIL_ERROR_MESSAGE)).exists();
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
          const screen = await render(hbs`<Routes::RegisterForm />`);

          await fillInputReconciliationForm({ screen, t });
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // when
          await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), stringFilledIn);
          await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'focusout');

          // then
          assert.dom(screen.getByText(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE)).exists();
        });
      });

      module('when the password is correctly filled', function () {
        test('should not display an error message on password field', async function (assert) {
          // given
          const screen = await render(hbs`<Routes::RegisterForm />`);
          const correctPassword = '12345678Ab!';

          await fillInputReconciliationForm({ screen, t });
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // when
          await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), correctPassword);
          await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'focusout');

          // then
          assert.dom(screen.queryByText(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE)).doesNotExist();
        });
      });
    });

    test('should not call api when email is invalid', async function (assert) {
      // given
      const screen = await render(hbs`<Routes::RegisterForm />`);

      await fillInputReconciliationForm({ screen, t });
      await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

      // when
      await click(screen.getByText('Mon adresse e-mail'));
      await fillIn(screen.getByLabelText(EMAIL_INPUT_LABEL, { exact: false }), 'shi.fu');
      await triggerEvent(screen.getByLabelText(EMAIL_INPUT_LABEL, { exact: false }), 'focusout');
      await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

      // then
      assert.dom(screen.getByText(EMPTY_EMAIL_ERROR_MESSAGE)).exists();
      sinon.assert.notCalled(saveDependentUserStub);
      assert.ok(true);
    });

    module('When create and reconcile service fails', function () {
      test('Should display registerErrorMessage when authentication service fails with error', async function (assert) {
        // given
        saveDependentUserStub.rejects({ errors: [{ status: '400' }] });

        // when
        const screen = await render(hbs`<Routes::RegisterForm />`);

        await fillInputReconciliationForm({ screen, t });
        await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

        await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'Mypassword1');
        await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

        // then
        assert.dom(screen.getByText(t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY))).exists();
      });

      test('Should display username specific errors when authentication service fails with username error', async function (assert) {
        // given
        saveDependentUserStub.rejects({
          errors: [
            {
              status: '409',
              code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_IN_DB',
              title: 'Conflict',
              detail: 'Un compte avec cet identifiant existe déjà.',
              meta: {
                shortCode: 'S50',
              },
            },
          ],
        });

        // when
        const screen = await render(hbs`<Routes::RegisterForm />`);

        await fillInputReconciliationForm({ screen, t });
        await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

        await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'Mypassword1');
        await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

        // then
        assert.dom(screen.getByText(t('api-error-messages.register-error.s50'))).exists();
      });
    });

    test('should not call api when password is invalid', async function (assert) {
      // given
      const screen = await render(hbs`<Routes::RegisterForm />`);

      await fillInputReconciliationForm({ screen, t });
      await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

      // when
      await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'toto');
      await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'focusout');
      await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

      // then
      assert.dom(screen.getByText(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE)).exists();
      sinon.assert.notCalled(saveDependentUserStub);
      assert.ok(true);
    });

    const internalServerErrorMessage =
      'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.';

    [
      {
        status: '404',
        errorMessage:
          'Vous êtes un élève ? Vérifiez vos informations (prénom, nom et date de naissance) ou contactez un enseignant. Vous êtes un enseignant ? L’accès à un parcours n’est pas disponible pour le moment.',
      },
      { status: '500', errorMessage: internalServerErrorMessage },
    ].forEach(({ status, errorMessage }) => {
      test(`should display an error message if user saves with an error response status ${status}`, async function (assert) {
        saveUserAssociationStub.rejects({ errors: [{ status }] });
        const screen = await render(hbs`<Routes::RegisterForm />`);
        await fillInputReconciliationForm({ screen, t });

        // when
        await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

        // then
        assert.dom(screen.getByText(errorMessage)).exists();
      });
    });

    module('When student is already reconciled in the same organization', function () {
      module('When student account is authenticated by email only', function () {
        test('should display the error message related to the short code S61)', async function (assert) {
          // given
          const meta = { shortCode: 'S61', value: 'j***@example.net' };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          const errorMessage = screen.getByText(
            (errorMessage) => errorMessage.startsWith(EMAIL_ERROR_MESSAGE) && errorMessage.endsWith(R61_ERROR_MESSAGE),
          );
          assert.dom(errorMessage).exists();
        });
      });

      module('When student account is authenticated by username only', function () {
        test('should display the error message related to the short code S62)', async function (assert) {
          // given
          const meta = { shortCode: 'S62', value: 'j***.h***2' };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          const errorMessage = screen.getByText(
            (errorMessage) =>
              errorMessage.startsWith(USERNAME_ERROR_MESSAGE) && errorMessage.endsWith(R62_ERROR_MESSAGE),
          );
          assert.dom(errorMessage).exists();
        });
      });

      module('When student account is authenticated by SamlId only', function () {
        test('should display the error message related to the short code S63)', async function (assert) {
          // given
          const meta = { shortCode: 'S63', value: undefined };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          const errorMessage = screen.getByText(
            (errorMessage) => errorMessage.startsWith(ENT_ERROR_MESSAGE) && errorMessage.endsWith(R63_ERROR_MESSAGE),
          );
          assert.dom(errorMessage).exists();
        });
      });

      module('When student account is authenticated by SamlId and username', function () {
        test('should display the error message related to the short code S63)', async function (assert) {
          // given
          const meta = { shortCode: 'S63', value: undefined };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          const errorMessage = screen.getByText(
            (errorMessage) => errorMessage.startsWith(ENT_ERROR_MESSAGE) && errorMessage.endsWith(R63_ERROR_MESSAGE),
          );
          assert.dom(errorMessage).exists();
        });
      });

      module('When student account is authenticated by SamlId and email', function () {
        test('should display the error message related to the short code S63)', async function (assert) {
          // given
          const meta = { shortCode: 'S63', value: undefined };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          const errorMessage = screen.getByText(
            (errorMessage) => errorMessage.startsWith(ENT_ERROR_MESSAGE) && errorMessage.endsWith(R63_ERROR_MESSAGE),
          );
          assert.dom(errorMessage).exists();
        });
      });

      module('When student account is authenticated by SamlId, email and username', function () {
        test('should display the error message related to the short code S63)', async function (assert) {
          // given
          const meta = { shortCode: 'S63', value: undefined };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          const errorMessage = screen.getByText(
            (errorMessage) => errorMessage.startsWith(ENT_ERROR_MESSAGE) && errorMessage.endsWith(R63_ERROR_MESSAGE),
          );
          assert.dom(errorMessage).exists();
        });
      });

      module('When student account is authenticated by email and username', function () {
        test('should display the error message related to the short code S62)', async function (assert) {
          // given
          const meta = { shortCode: 'S62', value: 'j***.h***2' };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          const errorMessage = screen.getByText(
            (errorMessage) =>
              errorMessage.startsWith(USERNAME_ERROR_MESSAGE) && errorMessage.endsWith(R62_ERROR_MESSAGE),
          );
          assert.dom(errorMessage).exists();
        });
      });
    });

    module('When student is already reconciled in others organization', function () {
      module('When student account is authenticated by email only', function () {
        test('should display the error message related to the short code S51)', async function (assert) {
          // given
          const meta = { shortCode: 'S51', value: 'j***@example.net' };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          const errorMessage = screen.getByText(
            (errorMessage) => errorMessage.startsWith(EMAIL_ERROR_MESSAGE) && errorMessage.endsWith(R51_ERROR_MESSAGE),
          );
          assert.dom(errorMessage).exists();
        });
      });

      module('When student account is authenticated by username only', function () {
        test('should display the error message related to the short code S52)', async function (assert) {
          // given
          const meta = { shortCode: 'S52', value: 'j***.h***2' };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          const errorMessage = screen.getByText(
            (errorMessage) =>
              errorMessage.startsWith(USERNAME_ERROR_MESSAGE) && errorMessage.endsWith(R52_ERROR_MESSAGE),
          );
          assert.dom(errorMessage).exists();
        });
      });

      module('When student account is authenticated by SamlId only', function () {
        test('should display the error message related to the short code S53)', async function (assert) {
          // given
          const meta = { shortCode: 'S53', value: undefined };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          assert.dom(screen.getByText(S53_ERROR_MESSAGE)).exists();
        });
      });

      module('When student account is authenticated by SamlId and username', function () {
        test('should display the error message related to the short code S53)', async function (assert) {
          // given
          const meta = { shortCode: 'S53', value: undefined };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          assert.dom(screen.getByText(S53_ERROR_MESSAGE)).exists();
        });
      });

      module('When student account is authenticated by SamlId and email', function () {
        test('should display the error message related to the short code S53)', async function (assert) {
          // given
          const meta = { shortCode: 'S53', value: undefined };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          assert.dom(screen.getByText(S53_ERROR_MESSAGE)).exists();
        });
      });

      module('When student account is authenticated by SamlId, username and email', function () {
        test('should display the error message related to the short code S53)', async function (assert) {
          // given
          const meta = { shortCode: 'S53', value: undefined };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          assert.dom(screen.getByText(S53_ERROR_MESSAGE)).exists();
        });
      });

      module('When student account is authenticated by username and email', function () {
        test('should display the error message related to the short code S52)', async function (assert) {
          // given
          const meta = { shortCode: 'S52', value: 'j***.h***2' };
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta,
          };

          saveUserAssociationStub.rejects({ errors: [error] });

          const screen = await render(hbs`<Routes::RegisterForm />`);
          await fillInputReconciliationForm({ screen, t });

          // when
          await click(screen.getByRole('button', { name: t('pages.sco-signup-or-login.register-form.button-form') }));

          // then
          const errorMessage = screen.getByText(
            (errorMessage) =>
              errorMessage.startsWith(USERNAME_ERROR_MESSAGE) && errorMessage.endsWith(R52_ERROR_MESSAGE),
          );
          assert.dom(errorMessage).exists();
        });
      });
    });
  });
});

async function fillInputReconciliationForm({ screen, t }) {
  await fillIn(screen.getByLabelText(/Prénom/, { exact: false }), 'Legolas');
  await fillIn(screen.getByLabelText(/Nom/, { exact: false }), 'Vertefeuille');
  await fillIn(
    screen.getByRole('spinbutton', {
      name: t('pages.sco-signup-or-login.register-form.fields.birthdate.day.label'),
    }),
    '10',
  );
  await fillIn(
    screen.getByRole('spinbutton', {
      name: t('pages.sco-signup-or-login.register-form.fields.birthdate.month.label'),
    }),
    '10',
  );
  await fillIn(
    screen.getByRole('spinbutton', {
      name: t('pages.sco-signup-or-login.register-form.fields.birthdate.year.label'),
    }),
    '2010',
  );
}
