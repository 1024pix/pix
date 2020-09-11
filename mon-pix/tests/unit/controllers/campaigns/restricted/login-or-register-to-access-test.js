import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | campaigns/restricted/login-or-register-to-access', () => {

  setupTest();

  let controller;
  let sessionStub;
  let currentUserStub;

  beforeEach(function() {
    controller = this.owner.lookup('controller:campaigns.restricted.login-or-register-to-access');

    sessionStub = {
      set: sinon.stub(),
      authenticate: sinon.stub(),
    };
    currentUserStub = {
      load: sinon.stub().resolves(),
      user: {
        save: sinon.stub().resolves(),
      },
    };

    controller.set('model', 'AZERTY999');
    controller.set('session', sessionStub);
    controller.set('currentUser', currentUserStub);

    controller.transitionToRoute = sinon.stub();
  });

  describe('#addGarAuthenticationMethodToUser', () => {

    it('should update user with idToken and redirect to campaigns.start-or-resume', async () => {
      // given
      const externalUserToken = 'ABCD';
      const expectedOptions = {
        adapterOptions: {
          authenticationMethodsSaml: true,
          externalUserToken,
        },
      };

      // when
      await controller.actions.addGarAuthenticationMethodToUser.call(controller, externalUserToken);

      // then
      sinon.assert.calledOnce(currentUserStub.load);
      sinon.assert.calledWith(currentUserStub.user.save, expectedOptions);

      sinon.assert.calledWith(sessionStub.set, 'data.externalUser', null);
      sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume');
    });
  });

});
