import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | campaigns/restricted/join-from-mediacentre', function () {
  setupTest();

  let controller;

  beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns.restricted.join-from-mediacentre');
    controller.router = { transitionTo: sinon.stub() };
    controller.set('model', { code: 'AZERTY999' });
  });

  describe('#createAndReconcile', function () {
    let externalUser;
    let sessionStub;
    let currentUserStub;

    beforeEach(function () {
      externalUser = { save: sinon.stub() };
      sessionStub = {
        set: sinon.stub(),
        authenticate: sinon.stub(),
      };
      currentUserStub = { load: sinon.stub() };
      controller.set('session', sessionStub);
      controller.set('currentUser', currentUserStub);
    });

    it('should authenticate the user and redirect to campaigns.start-or-resume after save', async function () {
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
      sinon.assert.calledWith(controller.router.transitionTo, 'campaigns.start-or-resume', 'AZERTY999');
    });
  });
});
