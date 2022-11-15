import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

import Service from '@ember/service';

module('Unit | Controller | account-recovery | update-sco-record', function (hooks) {
  setupTest(hooks);

  module('#updateRecord', function () {
    module('when user is already authenticated', function () {
      test('should update account-recovery-demand, invalidate the session and authenticate user', async function (assert) {
        // given
        const email = 'user@example.net';
        const password = 'Password123';
        const scope = 'mon-pix';
        const temporaryKey = 'temporaryKey';

        const updateDemand = {
          update: sinon.stub().resolves(),
        };

        const storeStub = {
          createRecord: sinon.stub(),
        };
        storeStub.createRecord.withArgs('account-recovery-demand', { temporaryKey, password }).returns(updateDemand);

        const sessionStub = Service.create({
          authenticate: sinon.stub(),
          invalidate: sinon.stub().resolves(),
          isAuthenticated: true,
        });

        const controller = this.owner.lookup('controller:account-recovery/update-sco-record');
        controller.model = { email, temporaryKey };
        controller.session = sessionStub;
        controller.store = storeStub;

        // when
        await controller.updateRecord(password);

        // then
        sinon.assert.called(updateDemand.update);
        sinon.assert.called(controller.session.invalidate);
        sinon.assert.calledWith(controller.session.authenticate, 'authenticator:oauth2', {
          login: email,
          password,
          scope,
        });
        assert.ok(true);
      });
    });

    module('when user is not already authenticated', function () {
      test('should update account-recovery-demand and authenticate user', async function (assert) {
        // given
        const email = 'user@example.net';
        const password = 'Password123';
        const scope = 'mon-pix';
        const temporaryKey = 'temporaryKey';

        const updateDemand = {
          update: sinon.stub().resolves(),
        };

        const storeStub = {
          createRecord: sinon.stub(),
        };
        storeStub.createRecord.withArgs('account-recovery-demand', { temporaryKey, password }).returns(updateDemand);

        const sessionStub = Service.create({
          authenticate: sinon.stub(),
          invalidate: sinon.stub(),
          isAuthenticated: false,
        });

        const controller = this.owner.lookup('controller:account-recovery/update-sco-record');
        controller.model = { email, temporaryKey };
        controller.session = sessionStub;
        controller.store = storeStub;

        // when
        await controller.updateRecord(password);

        // then
        sinon.assert.called(updateDemand.update);
        sinon.assert.notCalled(controller.session.invalidate);
        sinon.assert.calledWith(controller.session.authenticate, 'authenticator:oauth2', {
          login: email,
          password,
          scope,
        });
        assert.ok(true);
      });
    });
  });
});
