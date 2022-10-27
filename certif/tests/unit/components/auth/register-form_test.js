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
      createRecord: sinon.stub().returns({ save: sinon.stub() }),
    };
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
      test('should call the store', async function (assert) {
        // given
        component.firstName = 'Alain';
        component.lastName = 'Ternational';
        component.email = 'alainternational@example.net';
        component.password = 'Password123';
        component.cgu = true;

        // when
        await component.register(eventStub);

        // then
        assert.ok(component.store.createRecord.calledOnce);
      });
    });

    module('error cases', () => {
      test('should throw default error', async function (assert) {
        // given
        component.store = {
          createRecord: sinon.stub().returns({ save: sinon.stub().rejects({ errors: [{ status: '400' }] }) }),
        };

        component.firstName = 'Alain';
        component.lastName = 'Ternational';
        component.email = 'alainternational@example.net';
        component.password = 'Password123';
        component.cgu = true;

        // when
        await component.register(eventStub);

        // then
        assert.strictEqual(component.errorMessage, this.intl.t('pages.login-or-register.register-form.errors.default'));
      });

      module('when email already exists', () => {
        test('should throw an error', async function (assert) {
          // given
          component.store = {
            createRecord: sinon.stub().returns({ save: sinon.stub().rejects({ errors: [{ status: '422' }] }) }),
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
            this.intl.t('pages.login-or-register.register-form.errors.email-already-exists')
          );
        });
      });
    });
  });
});
