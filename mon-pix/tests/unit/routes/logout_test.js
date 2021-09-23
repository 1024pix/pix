import Service from '@ember/service';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { expect } from 'chai';
import ENV from 'mon-pix/config/environment';

const AUTHENTICATED_SOURCE_FROM_MEDIACENTRE = ENV.APP.AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

describe('Unit | Route | logout', function() {
  setupTest();

  let sessionStub;
  let campaignStorageStub;

  beforeEach(function() {
    campaignStorageStub = { clearAll: sinon.stub() };
  });

  it('should disconnect the user', function() {
    // Given
    const invalidateStub = sinon.stub();
    sessionStub = Service.create({ isAuthenticated: true, invalidate: invalidateStub, data: {
      authenticated: {
        source: AUTHENTICATED_SOURCE_FROM_MEDIACENTRE,
      },
    },
    });

    const route = this.owner.lookup('route:logout');
    route.set('session', sessionStub);
    route.set('campaignStorage', campaignStorageStub);

    // When
    route.beforeModel();

    // Then
    sinon.assert.calledOnce(invalidateStub);
  });

  it('should set an alternative disconnection route when source of connexion is external', function() {
    // Given
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

    // When
    route.beforeModel();

    // Then
    expect(sessionStub.alternativeRootURL).to.equal('/nonconnecte');
  });

  it('should erase campaign storage', function() {
    // Given
    const invalidateStub = sinon.stub();
    sessionStub = Service.create({ invalidate: invalidateStub, data: {
      authenticated: {},
    },
    });

    const route = this.owner.lookup('route:logout');
    route.set('campaignStorage', campaignStorageStub);
    route.set('session', sessionStub);
    route.set('campaignStorage', campaignStorageStub);

    // When
    route.beforeModel();

    // Then
    sinon.assert.calledOnce(campaignStorageStub.clearAll);
  });
});
