import sinon from 'sinon';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import setupIntl from '../../../helpers/setup-intl';

module('Unit | Component | toggable-login-form', (hooks) => {
  setupTest(hooks);
  setupIntl(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:auth/toggable-login-form');
  });

  module('#updateEmail', () => {
    test('should update email without spaces', function (assert) {
      // given
      const emailWithSpaces = '    user@example.net  ';
      const event = { target: { value: emailWithSpaces } };

      // when
      component.updateEmail(event);

      // then
      const expectedEmail = emailWithSpaces.trim();
      assert.strictEqual(component.email, expectedEmail);
    });
  });

  module('#authenticate', () => {
    const eventStub = { preventDefault: sinon.stub().returns() };

    module('When there is an invitation', () => {
      test('should not accept organization invitation when form is invalid', function (assert) {
        // given
        component.email = '';
        component.password = 'pix123';
        component.args.isWithInvitation = true;
        component.args.certificationCenterInvitation = {
          accept: sinon.stub().resolves(),
        };

        // when
        component.authenticate(eventStub);

        // then
        assert.ok(component.args.certificationCenterInvitation.accept.notCalled);
      });

      module('When form is valid', (hooks) => {
        hooks.beforeEach(() => {
          component.email = 'user@example.net';
          component.password = 'pix123';
          component.args.isWithInvitation = true;
          component.args.certificationCenterInvitationId = '1234';
          component.args.certificationCenterInvitationCode = 'ABCD';
        });

        test('should accept organization invitation', async function (assert) {
          // given
          component.args.certificationCenterInvitation = {
            accept: sinon.stub().resolves(),
          };
          const _authenticateStub = sinon.stub().resolves();
          component._authenticate = _authenticateStub;

          // when
          await component.authenticate(eventStub);

          // then
          sinon.assert.calledWith(component.args.certificationCenterInvitation.accept, {
            id: component.args.certificationCenterInvitationId,
            code: component.args.certificationCenterInvitationCode,
            email: component.email,
          });
          assert.false(component.isErrorMessagePresent);
          assert.strictEqual(component.errorMessage, null);
        });

        test('should authenticate user after accepting organization invitation', async function (assert) {
          // given
          component.args.certificationCenterInvitation = {
            accept: sinon.stub().resolves(),
          };
          const _authenticateStub = sinon.stub().resolves();
          component._authenticate = _authenticateStub;

          // when
          await component.authenticate(eventStub);

          // then
          assert.ok(_authenticateStub.calledWith(component.password, component.email));
        });

        module('When there is an error in accepting invitation', function () {
          test('it should display a message error when it is not a 412 error', async function (assert) {
            // given
            component.args.certificationCenterInvitation = {
              accept: sinon.stub().rejects({ errors: [{ status: '400' }] }),
            };

            // when
            await component.authenticate(eventStub);

            // then
            assert.strictEqual(component.errorMessage, this.intl.t('common.api-error-messages.bad-request-error'));
            assert.false(component.isLoading);
            assert.true(component.isErrorMessagePresent);
          });

          test('should authenticate if error is status 412', async function (assert) {
            // given
            component.args.certificationCenterInvitation = {
              accept: sinon.stub().rejects({ errors: [{ status: '412' }] }),
            };
            const _authenticateStub = sinon.stub().resolves();
            component._authenticate = _authenticateStub;

            // when
            await component.authenticate(eventStub);

            // then
            assert.ok(_authenticateStub.calledWith(component.password, component.email));
          });

          module('when a 412 error is caught', function () {
            module('when authentication fails', function () {
              test('should display an error message', async function (assert) {
                // given
                const authenticateStub = sinon.stub().rejects();
                class SessionStub extends Service {
                  authenticate = authenticateStub;
                }
                this.owner.register('service:session', SessionStub);

                component.args.certificationCenterInvitation = {
                  accept: sinon.stub().rejects({ errors: [{ status: '412' }] }),
                };

                // when
                await component.authenticate(eventStub);

                // then
                assert.strictEqual(
                  component.errorMessage,
                  this.intl.t('common.api-error-messages.internal-server-error')
                );
                assert.false(component.isLoading);
                assert.true(component.isErrorMessagePresent);
              });
            });
          });
        });
      });
    });
  });
});
