import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
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
    module('when form is invalid', () => {
      test('should not call the store', async function (assert) {
        // given
        const incorrectEmail = 'alainternational';
        component.firstName = 'Alain';
        component.lastName = 'Ternational';
        component.email = incorrectEmail;
        component.password = 'Password123';
        component.cgu = true;

        // when
        await component.register(eventStub);

        // then
        assert.ok(component.store.createRecord.notCalled);
      });
    });

    module('when form is valid', () => {
      test('should create pix account, membership and validate invitation', async function (assert) {
        // given
        const firstName = 'Alain';
        const lastName = 'Ternational';
        const email = 'alainternational@example.net';
        const password = 'Password123';
        const cgu = true;
        const certificationCenterInvitationId = 1234;
        const certificationCenterInvitationCode = 'AZERTY123';
        component.firstName = firstName;
        component.lastName = lastName;
        component.email = email;
        component.password = password;
        component.cgu = cgu;
        component.args.certificationCenterInvitationId = certificationCenterInvitationId;
        component.args.certificationCenterInvitationCode = certificationCenterInvitationCode;

        // when
        await component.register(eventStub);

        // then
        sinon.assert.calledWith(component.store.createRecord, 'user', { firstName, lastName, password, email, cgu });
        sinon.assert.calledWith(component.store.createRecord, 'certification-center-invitation-response', {
          id: certificationCenterInvitationId,
          code: certificationCenterInvitationCode,
          email,
        });
        assert.ok(true);
      });
    });

    module('error cases', () => {
      test('should throw default error', async function (assert) {
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
        component.cgu = true;

        // when
        await component.register(eventStub);

        // then
        assert.strictEqual(component.errorMessage, this.intl.t('common.forms.error-default'));
        sinon.assert.calledOnce(deleteRecord);
      });

      module('when email already exists', () => {
        test('should throw an error', async function (assert) {
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
          component.cgu = true;

          // when
          await component.register(eventStub);

          // then
          assert.strictEqual(
            component.errorMessage,
            this.intl.t('common.forms.login-labels.email.error-already-exists')
          );
          sinon.assert.calledOnce(deleteRecord);
        });
      });
    });
  });
});
