import { setupTest } from 'ember-mocha';
import { describe, it } from 'mocha';
import Service from '@ember/service';
import sinon from 'sinon';
import PixWindow from 'mon-pix/utils/pix-window';

describe('Unit | Routes | authentication | login-gar', function () {
  setupTest();

  describe('#beforeModel', function () {
    context('when a token is set as an hash of an url', function () {
      it('should authenticate the user', async function () {
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
      });
    });
  });
});
