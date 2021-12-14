import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | campaigns | join | sco-mediacentre', function () {
  setupTest();

  let controller;

  beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns.join.sco-mediacentre');
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

    it('should authenticate the user', async function () {
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
    });
  });
});
