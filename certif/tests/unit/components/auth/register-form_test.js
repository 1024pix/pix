import { setupTest } from 'ember-qunit';
import { FRENCH_INTERNATIONAL_LOCALE } from 'pix-certif/services/locale';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import setupIntl from '../../../helpers/setup-intl';

module('Unit | Component | register-form', (hooks) => {
  setupTest(hooks);
  setupIntl(hooks);
  const eventStub = { preventDefault: sinon.stub().returns() };

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:auth/register-form');
    component.store = {
      createRecord: sinon.stub().returns({ save: sinon.stub(), deleteRecord: sinon.stub() }),
    };
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#register', () => {
    module('When form is invalid', () => {
      test('does not call the store', async function (assert) {
        // given
        const incorrectEmail = 'alainternational';
        component.firstName = 'Alain';
        component.lastName = 'Ternational';
        component.email = incorrectEmail;
        component.password = 'Password123';
        component.isTermsOfServiceValidated = true;

        // when
        await component.register(eventStub);

        // then
        assert.ok(component.store.createRecord.notCalled);
      });
    });

    module('When form is valid', () => {
      test('creates pix account, membership and validate invitation', async function (assert) {
        // given
        const certificationCenterInvitationCode = 'AZERTY123';
        const certificationCenterInvitationId = 1234;
        const cgu = true;
        const email = 'alainternational@example.net';
        const firstName = 'Alain';
        const lastName = 'Ternational';
        const password = 'Password123';
        const selectedLanguage = FRENCH_INTERNATIONAL_LOCALE;

        component.args = {
          ...component.args,
          certificationCenterInvitationCode,
          certificationCenterInvitationId,
        };

        component.isTermsOfServiceValidated = cgu;
        component.email = email;
        component.firstName = firstName;
        component.lastName = lastName;
        component.selectedLanguage = selectedLanguage;
        component.password = password;

        // when
        await component.register(eventStub);

        // then
        sinon.assert.calledWith(component.store.createRecord, 'user', {
          cgu,
          email,
          firstName,
          lastName,
          lang: selectedLanguage,
          password,
        });
        sinon.assert.calledWith(component.store.createRecord, 'certification-center-invitation-response', {
          id: certificationCenterInvitationId,
          code: certificationCenterInvitationCode,
          email,
        });
        assert.ok(true);
      });
    });

    module('error cases', () => {
      test('Throws default error', async function (assert) {
        // given
        const deleteRecord = sinon.stub();
        component.store = {
          createRecord: sinon
            .stub()
            .returns({ save: sinon.stub().rejects({ errors: [{ status: '400' }] }), deleteRecord }),
        };

        component.firstName = 'Alain';
        component.lastName = 'Ternational';
        component.email = 'alainternational@example.net';
        component.password = 'Password123';
        component.isTermsOfServiceValidated = true;

        // when
        await component.register(eventStub);

        // then
        assert.strictEqual(component.errorMessage, this.intl.t('common.form-errors.default'));
        sinon.assert.calledOnce(deleteRecord);
      });

      module('When email already exists', () => {
        test('Throws an error', async function (assert) {
          // given
          const deleteRecord = sinon.stub();
          component.store = {
            createRecord: sinon
              .stub()
              .returns({ save: sinon.stub().rejects({ errors: [{ status: '422' }] }), deleteRecord }),
          };

          component.firstName = 'Alain';
          component.lastName = 'Ternational';
          component.email = 'alainternational@example.net';
          component.password = 'Password123';
          component.isTermsOfServiceValidated = true;

          // when
          await component.register(eventStub);

          // then
          assert.strictEqual(component.errorMessage, this.intl.t('common.form-errors.email.already-exists'));
          sinon.assert.calledOnce(deleteRecord);
        });
      });
    });
  });
});
