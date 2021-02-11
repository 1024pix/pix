import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';

describe('Unit | Route | campaigns/:code/restricted/index', function() {
  setupTest();

  it('should redirect to campaigns.restricted.join when user is authenticated', async function() {
    // given
    class SessionStub extends Service {
      isAuthenticated = true;
    }
    this.owner.register('service:session', SessionStub);
    const route = this.owner.lookup('route:campaigns/restricted/index');
    route.replaceWith = sinon.stub().resolves();
    const params = { code: 'ABC123' };

    // when
    await route.beforeModel(params);

    // then
    sinon.assert.calledWith(route.replaceWith, 'campaigns.restricted.join', 'ABC123');
  });

  it('should redirect to campaigns.restricted.login-or-register-to-access when user is not authenticated', async function() {
    // given
    class SessionStub extends Service {
      isAuthenticated = false;
    }
    this.owner.register('service:session', SessionStub);
    const route = this.owner.lookup('route:campaigns/restricted/index');
    route.replaceWith = sinon.stub().resolves();
    const params = { code: 'DEF456' };

    // when
    await route.beforeModel(params);

    // then
    sinon.assert.calledWith(route.replaceWith, 'campaigns.restricted.login-or-register-to-access', 'DEF456');
  });
});
