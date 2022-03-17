import Service from '@ember/service';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import ENV from 'mon-pix/config/environment';

const AUTHENTICATED_SOURCE_FROM_MEDIACENTRE = ENV.APP.AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

describe('Unit | Route | logout', () => {
  setupTest();

  let sessionStub;
  let campaignStorageStub;

  beforeEach(function () {
    campaignStorageStub = { clearAll: sinon.stub() };
  });

  it('should disconnect the authenticated user no matter the connexion source', function () {
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
    sinon.assert.calledOnce(invalidateStub);
  });

  it('should erase campaign storage', function () {
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
    sinon.assert.calledOnce(campaignStorageStub.clearAll);
  });

  it('should redirect to home when source of connexion is pix', function () {
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
    sinon.assert.calledOnce(route._redirectToHome);
  });

  it('should redirect to disconnected page when source of connexion is external', function () {
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
    sinon.assert.calledOnce(route._redirectToDisconnectedPage);
  });
});
