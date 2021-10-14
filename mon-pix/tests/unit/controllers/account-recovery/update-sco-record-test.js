import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

import Service from '@ember/service';

describe('Unit | Controller | account-recovery | update-sco-record', function () {
  setupTest();

  describe('#updateRecord', () => {
    context('when user is already authenticated', function () {
      it('should update account-recovery-demand, invalidate the session and authenticate user', async function () {
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
      });
    });

    context('when user is not already authenticated', function () {
      it('should update account-recovery-demand and authenticate user', async function () {
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
      });
    });
  });
});
