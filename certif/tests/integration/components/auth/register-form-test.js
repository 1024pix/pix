import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const EMPTY_FIRSTNAME_ERROR_MESSAGE = 'common.form-errors.firstname.mandatory';
const EMPTY_LASTNAME_ERROR_MESSAGE = 'common.form-errors.lastname.mandatory';
const EMPTY_EMAIL_ERROR_MESSAGE = 'common.form-errors.email.format';
const INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE = 'common.form-errors.password.format';
const CGU_ERROR_MESSAGE = 'pages.login-or-register.register-form.fields.cgu.error';

module('Integration | Component | Auth::RegisterForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  let firstNameInputLabel;
  let lastNameInputLabel;
  let emailInputLabel;
  let passwordInputLabel;
  let cguAriaLabel;

  hooks.beforeEach(function () {
    firstNameInputLabel = t('common.labels.candidate.firstname');
    lastNameInputLabel = t('common.labels.candidate.lastname');
    emailInputLabel = t('common.forms.login.email');
    passwordInputLabel = t('common.forms.login.password');
    cguAriaLabel = "J'accepte les conditions d'utilisation de Pix et la politique de confidentialité";
  });

  test('[a11y] it should display a message that all inputs are required', async function (assert) {
    // when
    const screen = await render(hbs`<Auth::RegisterForm />`);

    // then
    assert.dom(screen.getByText('Tous les champs sont obligatoires.')).exists();
    assert.dom(screen.getByRole('textbox', { name: firstNameInputLabel })).hasAttribute('required');
    assert.dom(screen.getByRole('textbox', { name: lastNameInputLabel })).hasAttribute('required');
    assert.dom(screen.getByRole('textbox', { name: emailInputLabel })).hasAttribute('required');
    assert.dom(screen.getByRole('checkbox', { name: cguAriaLabel })).hasAttribute('required');
    assert.dom(screen.getByLabelText(passwordInputLabel)).hasAttribute('required');
  });

  test('it should display legal mentions with related links', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('fr') };

    // when
    const screen = await render(hbs`<Auth::RegisterForm />`);

    // then
    assert
      .dom(screen.getByText(t('pages.login-or-register.register-form.fields.cgu.accept'), { exact: false }))
      .exists();
    assert.dom(screen.getByText(`${t('pages.login-or-register.register-form.fields.cgu.terms-of-use')}`)).exists();
    assert.dom(screen.getByText(t('pages.login-or-register.register-form.fields.cgu.and'), { exact: false })).exists();
    assert
      .dom(screen.getByText(`${t('pages.login-or-register.register-form.fields.cgu.data-protection-policy')}`))
      .exists();
    assert
      .dom(screen.getByRole('link', { name: "conditions d'utilisation de Pix" }))
      .hasAttribute('href', 'https://pix.org/fr/conditions-generales-d-utilisation');
    assert
      .dom(screen.getByRole('link', { name: 'politique de confidentialité' }))
      .hasAttribute('href', 'https://pix.org/fr/politique-protection-donnees-personnelles-app');
  });

  module('errors management', function () {
    module('when first name is not valid', () => {
      test('it should display error message', async function (assert) {
        // given
        const screen = await render(hbs`<Auth::RegisterForm />`);

        // when
        await fillByLabel(firstNameInputLabel, '');
        const firstNameInput = screen.getByRole('textbox', { name: firstNameInputLabel });
        await triggerEvent(firstNameInput, 'focusout');

        // then
        assert.dom(screen.getByText(t(EMPTY_FIRSTNAME_ERROR_MESSAGE))).exists();
      });
    });

    module('when last name is not valid', () => {
      test('it should display error message', async function (assert) {
        // given
        const screen = await render(hbs`<Auth::RegisterForm />`);

        // when
        await fillByLabel(lastNameInputLabel, '');
        const lastNameInput = screen.getByRole('textbox', { name: lastNameInputLabel });
        await triggerEvent(lastNameInput, 'focusout');

        // then
        assert.dom(screen.getByText(t(EMPTY_LASTNAME_ERROR_MESSAGE))).exists();
      });
    });

    module('when email is not valid', () => {
      test('it should display error message', async function (assert) {
        // given
        const screen = await render(hbs`<Auth::RegisterForm />`);

        // when
        await fillByLabel(emailInputLabel, 'incorrectEmailFormat');
        const emailInput = screen.getByRole('textbox', { name: emailInputLabel });
        await triggerEvent(emailInput, 'focusout');

        // then
        assert.dom(screen.getByText(t(EMPTY_EMAIL_ERROR_MESSAGE))).exists();
      });
    });

    module('when password is not valid', () => {
      test('it should display error message', async function (assert) {
        // given
        const screen = await render(hbs`<Auth::RegisterForm />`);

        // when
        await fillByLabel(passwordInputLabel, '');
        const passwordInput = screen.getByLabelText(passwordInputLabel);
        await triggerEvent(passwordInput, 'focusout');

        // then
        assert.dom(screen.getByText(t(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE))).exists();
      });
    });

    module('when cgu have not been accepted', () => {
      test('it should display error message', async function (assert) {
        // given
        const screen = await render(hbs`<Auth::RegisterForm />`);

        // when
        await clickByName(cguAriaLabel);
        await clickByName(cguAriaLabel);
        const cguCheckbox = screen.getByRole('checkbox', { name: cguAriaLabel });
        await triggerEvent(cguCheckbox, 'focusout');

        // then
        assert.dom(screen.getByText(t(CGU_ERROR_MESSAGE))).exists();
      });
    });
  });

  module('#register submit flow', function (hooks) {
    let store;
    let submitButtonLabel;

    hooks.beforeEach(function () {
      submitButtonLabel = t('pages.login-or-register.register-form.actions.login-button');
      class SessionStub extends Service {
        authenticate = sinon.stub().resolves();
      }
      this.owner.register('service:session', SessionStub);
      store = this.owner.lookup('service:store');
    });

    async function _fillValidForm() {
      await fillByLabel(firstNameInputLabel, 'Alain');
      await fillByLabel(lastNameInputLabel, 'Ternational');
      await fillByLabel(emailInputLabel, 'alainternational@example.net');
      await fillByLabel(passwordInputLabel, 'Password123');
      await clickByName(cguAriaLabel);
    }

    test('when the form is invalid, it does not create any record', async function (assert) {
      // given
      const createRecord = sinon.stub(store, 'createRecord');
      await render(hbs`<Auth::RegisterForm />`);

      // when
      await fillByLabel(firstNameInputLabel, 'Alain');
      await fillByLabel(lastNameInputLabel, 'Ternational');
      await fillByLabel(emailInputLabel, 'invalid-email');
      await fillByLabel(passwordInputLabel, 'Password123');
      await clickByName(cguAriaLabel);
      await clickByName(submitButtonLabel);

      // then
      sinon.assert.notCalled(createRecord);
      assert.ok(true);
    });

    test('when the form is valid, it creates a user and an invitation response', async function (assert) {
      // given
      const invitationCode = 'AZERTY123';
      const invitationId = '1234';

      const userSave = sinon.stub().resolves();
      const invitationResponseSave = sinon.stub().resolves();
      const invitationToDelete = { unloadRecord: sinon.stub() };
      const createRecord = sinon.stub(store, 'createRecord');
      createRecord.withArgs('user').returns({ save: userSave, deleteRecord: sinon.stub() });
      createRecord
        .withArgs('certification-center-invitation-response')
        .returns({ save: invitationResponseSave, deleteRecord: sinon.stub() });
      sinon
        .stub(store, 'peekRecord')
        .withArgs('certification-center-invitation', invitationId)
        .returns(invitationToDelete);

      this.set('invitationCode', invitationCode);
      this.set('invitationId', invitationId);
      const screen = await render(
        hbs`<Auth::RegisterForm
  @certificationCenterInvitationCode={{this.invitationCode}}
  @certificationCenterInvitationId={{this.invitationId}}
/>`,
      );

      // when
      await _fillValidForm(screen);
      await clickByName(submitButtonLabel);

      // then
      sinon.assert.calledWithMatch(createRecord, 'user', {
        email: 'alainternational@example.net',
        firstName: 'Alain',
        lastName: 'Ternational',
        password: 'Password123',
        cgu: true,
      });
      sinon.assert.calledWithMatch(createRecord, 'certification-center-invitation-response', {
        id: invitationId,
        code: invitationCode,
        email: 'alainternational@example.net',
      });
      sinon.assert.calledOnce(userSave);
      sinon.assert.calledOnce(invitationResponseSave);
      sinon.assert.calledOnce(invitationToDelete.unloadRecord);
      assert.ok(true);
    });

    test('when the server returns a 422 error, it displays a specific error message', async function (assert) {
      // given
      const deleteUser = sinon.stub();
      const userSave = sinon.stub().rejects({ errors: [{ status: '422' }] });
      sinon.stub(store, 'createRecord').returns({ save: userSave, deleteRecord: deleteUser });

      const screen = await render(hbs`<Auth::RegisterForm />`);

      // when
      await _fillValidForm(screen);
      await clickByName(submitButtonLabel);

      // then
      assert.dom(screen.getByText(t('common.form-errors.email.invalid-or-already-used-email'))).exists();
      sinon.assert.calledOnce(deleteUser);
    });

    test('when the server returns any other error, it displays a default error message', async function (assert) {
      // given
      const deleteUser = sinon.stub();
      const userSave = sinon.stub().rejects({ errors: [{ status: '400' }] });
      sinon.stub(store, 'createRecord').returns({ save: userSave, deleteRecord: deleteUser });

      const screen = await render(hbs`<Auth::RegisterForm />`);

      // when
      await _fillValidForm(screen);
      await clickByName(submitButtonLabel);

      // then
      assert.dom(screen.getByText(t('common.form-errors.default'))).exists();
      sinon.assert.calledOnce(deleteUser);
    });
  });
});
