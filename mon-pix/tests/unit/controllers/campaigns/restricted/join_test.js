import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | campaigns/restricted/join', function() {
  setupTest();

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:campaigns.restricted.join');
    controller.transitionToRoute = sinon.stub();
    controller.set('model', 'AZERTY999');
  });

  describe('#reconcile', function() {

    let schoolingRegistration;

    beforeEach(function() {
      schoolingRegistration = { save: sinon.stub() };
    });

    context('When withReconciliation is false', function() {

      it('should run reconciliation checks and not redirect', async function() {
        // given
        schoolingRegistration.save.resolves();
        const adapterOptions = { withReconciliation: false };

        // when
        await controller.actions.reconcile.call(controller, schoolingRegistration, adapterOptions);

        // then
        sinon.assert.calledOnce(schoolingRegistration.save);
        sinon.assert.notCalled(controller.transitionToRoute);
      });
    });

    context('When withReconciliation is true', function() {

      it('should associate user with student and redirect to campaigns.start-or-resume', async function() {
        // given
        schoolingRegistration.save.resolves();
        const adapterOptions = { withReconciliation: true };

        // when
        await controller.actions.reconcile.call(controller, schoolingRegistration, adapterOptions);

        // then
        sinon.assert.calledOnce(schoolingRegistration.save);
        sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume');
      });
    });
  });

  describe('#createAndReconcile', function() {

    let externalUser;
    let sessionStub;
    let currentUserStub;

    beforeEach(function() {
      externalUser = { save: sinon.stub() };
      sessionStub = {
        set: sinon.stub(),
        authenticate: sinon.stub(),
      };
      currentUserStub = { load: sinon.stub() };
      controller.set('session', sessionStub);
      controller.set('currentUser', currentUserStub);
    });

    it('should authenticate the user and redirect to campaigns.start-or-resume after save', async function() {
      // given
      const accessToken = 'access-token';
      externalUser.save.resolves({ accessToken });
      sessionStub.set.resolves();
      sessionStub.authenticate.resolves();
      currentUserStub.load.resolves();

      // when
      await controller.actions.createAndReconcile.call(controller, externalUser);

      // then
      sinon.assert.calledOnce(externalUser.save);
      sinon.assert.calledWith(sessionStub.set, 'data.externalUser', null);
      sinon.assert.calledWith(sessionStub.authenticate, 'authenticator:oauth2', { token: accessToken });
      sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume');
    });
  });
});
