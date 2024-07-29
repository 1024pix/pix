import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | campaigns | join | sco-mediacentre', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns.join.sco-mediacentre');
    controller.set('model', { code: 'AZERTY999' });
  });

  module('#createAndReconcile', function (hooks) {
    let externalUser;
    let sessionStub;
    let currentUserStub;

    hooks.beforeEach(function () {
      externalUser = { save: sinon.stub() };
      sessionStub = {
        set: sinon.stub(),
        authenticate: sinon.stub(),
      };
      currentUserStub = { load: sinon.stub() };
      controller.set('session', sessionStub);
      controller.set('currentUser', currentUserStub);
    });

    test('should authenticate the user', async function (assert) {
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
      assert.ok(true);
    });
  });
});
