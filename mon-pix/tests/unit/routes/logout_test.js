import Service from '@ember/service';
import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';

const AUTHENTICATED_SOURCE_FROM_MEDIACENTRE = ENV.APP.AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

module('Unit | Route | logout', function (hooks) {
  setupTest(hooks);

  let sessionStub;
  let campaignStorageStub;

  hooks.beforeEach(function () {
    campaignStorageStub = { clearAll: sinon.stub() };
  });

  test('should disconnect the authenticated user no matter the connexion source', function (assert) {
    // given
    const invalidateStub = sinon.stub();
    sessionStub = Service.create({
      isAuthenticated: true,
      invalidate: invalidateStub,
      data: {
        authenticated: {
          source: AUTHENTICATED_SOURCE_FROM_MEDIACENTRE,
        },
      },
    });

    const route = this.owner.lookup('route:logout');
    route.set('session', sessionStub);
    route.set('campaignStorage', campaignStorageStub);

    // when
    route.beforeModel();

    // then
    assert.expect(0);
    sinon.assert.calledOnce(invalidateStub);
  });

  test('should erase campaign storage', function (assert) {
    // given
    const invalidateStub = sinon.stub();
    sessionStub = Service.create({
      invalidate: invalidateStub,
      data: {
        authenticated: {},
      },
    });

    const route = this.owner.lookup('route:logout');
    route.set('campaignStorage', campaignStorageStub);
    route.set('session', sessionStub);

    // when
    route.beforeModel();

    // then
    assert.expect(0);
    sinon.assert.calledOnce(campaignStorageStub.clearAll);
  });

  test('should redirect to home when source of connexion is pix', function (assert) {
    // given
    const invalidateStub = sinon.stub();

    sessionStub = Service.create({ isAuthenticated: true, invalidate: invalidateStub });

    const route = this.owner.lookup('route:logout');
    route.set('session', sessionStub);
    route.set('campaignStorage', campaignStorageStub);
    route._redirectToHome = sinon.stub();
    route.source = 'pix';

    // when
    route.afterModel();

    // then
    assert.expect(0);
    sinon.assert.calledOnce(route._redirectToHome);
  });

  test('should redirect to disconnected page when source of connexion is external', function (assert) {
    // given
    const invalidateStub = sinon.stub();

    sessionStub = Service.create({ isAuthenticated: true, invalidate: invalidateStub });

    const route = this.owner.lookup('route:logout');
    route.set('session', sessionStub);
    route.set('campaignStorage', campaignStorageStub);
    route._redirectToDisconnectedPage = sinon.stub();
    route.source = AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

    // when
    route.afterModel();

    // then
    assert.expect(0);
    sinon.assert.calledOnce(route._redirectToDisconnectedPage);
  });
});
