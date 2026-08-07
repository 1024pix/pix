import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | account-recovery | update-sco-record', function (hooks) {
  setupTest(hooks);

  module('#updateRecord', function () {
    module('when user is already authenticated', function () {
      test('should update account-recovery-demand, invalidate the session and authenticate user', async function (assert) {
        // given
        const email = 'user@example.net';
        const password = 'Password123';
        const temporaryKey = 'temporaryKey';

        const accountRecoveryDemandService = this.owner.lookup('service:account-recovery-demand');
        accountRecoveryDemandService.update = sinon.stub().resolves();

        const sessionStub = Service.create({
          authenticate: sinon.stub(),
          invalidate: sinon.stub().resolves(),
          isAuthenticated: true,
        });

        const controller = this.owner.lookup('controller:account-recovery/update-sco-record');
        controller.model = { email, temporaryKey };
        controller.session = sessionStub;

        // when
        await controller.updateRecord(password);

        // then
        sinon.assert.calledWith(accountRecoveryDemandService.update, { temporaryKey, password });
        sinon.assert.called(controller.session.invalidate);
        sinon.assert.calledWith(controller.session.authenticate, 'authenticator:oauth2', {
          login: email,
          password,
        });
        assert.ok(true);
      });
    });

    module('when user is not already authenticated', function () {
      test('should update account-recovery-demand and authenticate user', async function (assert) {
        // given
        const email = 'user@example.net';
        const password = 'Password123';
        const temporaryKey = 'temporaryKey';

        const accountRecoveryDemandService = this.owner.lookup('service:account-recovery-demand');
        accountRecoveryDemandService.update = sinon.stub().resolves();

        const sessionStub = Service.create({
          authenticate: sinon.stub(),
          invalidate: sinon.stub(),
          isAuthenticated: false,
        });

        const controller = this.owner.lookup('controller:account-recovery/update-sco-record');
        controller.model = { email, temporaryKey };
        controller.session = sessionStub;

        // when
        await controller.updateRecord(password);

        // then
        sinon.assert.calledWith(accountRecoveryDemandService.update, { temporaryKey, password });
        sinon.assert.notCalled(controller.session.invalidate);
        sinon.assert.calledWith(controller.session.authenticate, 'authenticator:oauth2', {
          login: email,
          password,
        });
        assert.ok(true);
      });
    });
  });
});
