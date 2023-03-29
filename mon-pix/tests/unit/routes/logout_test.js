import Service from '@ember/service';
import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';

const AUTHENTICATED_SOURCE_FROM_GAR = ENV.APP.AUTHENTICATED_SOURCE_FROM_GAR;

module('Unit | Route | logout', function (hooks) {
  setupTest(hooks);

  let sessionStub;
  let campaignStorageStub;
  let redirectToHomePageStub;

  hooks.beforeEach(function () {
    campaignStorageStub = { clearAll: sinon.stub() };
    redirectToHomePageStub = sinon.stub();
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
    route._redirectToHomePage = redirectToHomePageStub;

    // when
    route.beforeModel();

    // then
    sinon.assert.calledOnce(campaignStorageStub.clearAll);
    assert.ok(true);
  });

  module('when user is authenticated', function () {
    test('should disconnect the authenticated user no matter the connexion source', function (assert) {
      // given
      const invalidateStub = sinon.stub();
      sessionStub = Service.create({
        isAuthenticated: true,
        invalidate: invalidateStub,
        data: {
          authenticated: {
            source: AUTHENTICATED_SOURCE_FROM_GAR,
          },
        },
      });
      const route = this.owner.lookup('route:logout');
      route.set('session', sessionStub);
      route.set('campaignStorage', campaignStorageStub);
      route._redirectToHomePage = redirectToHomePageStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.calledOnce(invalidateStub);
      assert.ok(true);
    });

    test('should redirect to home when source of connexion is pix', function (assert) {
      // given
      const invalidateStub = sinon.stub();

      sessionStub = Service.create({
        isAuthenticated: true,
        invalidate: invalidateStub,
        data: {
          authenticated: {
            source: 'pix',
          },
        },
      });

      const route = this.owner.lookup('route:logout');
      route.set('session', sessionStub);
      route.set('campaignStorage', campaignStorageStub);
      route._redirectToHomePage = redirectToHomePageStub;

      // when
      route.beforeModel();

      // then
      assert.strictEqual(route.session.alternativeRootURL, null);
    });

    test('should redirect to disconnected page when source of connexion is external', function (assert) {
      // given
      const invalidateStub = sinon.stub();

      sessionStub = Service.create({
        isAuthenticated: true,
        invalidate: invalidateStub,
        data: {
          authenticated: {
            source: AUTHENTICATED_SOURCE_FROM_GAR,
          },
        },
      });

      const route = this.owner.lookup('route:logout');
      route.set('session', sessionStub);
      route.set('campaignStorage', campaignStorageStub);
      route._redirectToHomePage = redirectToHomePageStub;

      // when
      route.beforeModel();

      // then
      assert.strictEqual(route.session.alternativeRootURL, '/nonconnecte');
    });
  });

  module('when user is not authenticated', function () {
    test('should redirect to home', function (assert) {
      // given
      const route = this.owner.lookup('route:logout');
      route.set(
        'session',
        Service.create({
          isAuthenticated: false,
          data: {
            authenticated: {},
          },
        })
      );
      route.set('campaignStorage', campaignStorageStub);
      route._redirectToHomePage = redirectToHomePageStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.calledOnce(route._redirectToHomePage);
      assert.ok(true);
    });
  });
});
