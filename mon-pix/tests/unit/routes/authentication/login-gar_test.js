import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import sinon from 'sinon';
import PixWindow from 'mon-pix/utils/pix-window';

module('Unit | Routes | authentication | login-gar', function (hooks) {
  setupTest(hooks);

  module('#beforeModel', function () {
    module('when a token is set as an hash of an url', function () {
      test('should authenticate the user', async function (assert) {
        // given
        const route = this.owner.lookup('route:authentication/login-gar');
        const sessionStub = Service.create({
          authenticate: sinon.stub().resolves(),
        });
        route.set('session', sessionStub);

        sinon.stub(PixWindow, 'getLocationHash').returns('#access_token');

        // when
        await route.beforeModel();

        // then
        sinon.assert.calledWith(sessionStub.authenticate, 'authenticator:gar', 'access_token');
        assert.ok(true);
      });
    });
  });
});
