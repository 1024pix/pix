import Service from '@ember/service';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import ENV from 'mon-pix/config/environment';
import { expect } from 'chai';

const AUTHENTICATED_SOURCE_FROM_GAR = ENV.APP.AUTHENTICATED_SOURCE_FROM_GAR;

describe('Unit | Route | logout', function () {
  setupTest();

  let sessionStub;
  let campaignStorageStub;
  let redirectToHomePageStub;

  beforeEach(function () {
    campaignStorageStub = { clearAll: sinon.stub() };
    redirectToHomePageStub = sinon.stub();
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
    route._redirectToHomePage = redirectToHomePageStub;

    // when
    route.beforeModel();

    // then
    sinon.assert.calledOnce(campaignStorageStub.clearAll);
  });

  describe('when user is authenticated', function () {
    it('should disconnect the authenticated user no matter the connexion source', function () {
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
    });

    it('should redirect to home when source of connexion is pix', function () {
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
      expect(route.session.alternativeRootURL).to.equal(null);
    });

    it('should redirect to disconnected page when source of connexion is external', function () {
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
      expect(route.session.alternativeRootURL).to.equal('/nonconnecte');
    });
  });

  describe('when user is not authenticated', function () {
    it('should redirect to home', function () {
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
    });
  });
});
