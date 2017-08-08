import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon  from 'sinon';

describe('Unit | Route | compte', function() {
  setupTest('route:compte', {
    needs: ['service:current-routed-modal', 'service:session']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  it('should redirect to / (Home)', function() {
    // Given
    const route = this.subject();

    // Then
    expect(route.authenticationRoute).to.equal('/');
  });

  describe('searchForOrganization', function() {

    let storeQueryStub;
    let storyStub;
    let apiResult;

    beforeEach(() => {
      apiResult = {};

      storeQueryStub = sinon.stub().resolves(apiResult);
      storyStub = Ember.Service.extend({
        query: storeQueryStub
      });
    });

    it('should search for an organization', function() {
      // Given
      this.register('service:store', storyStub);
      this.inject.service('store', { as: 'store' });

      const route = this.subject();

      // When
      route.actions.searchForOrganization.call(route, 'RVSG44');

      // Then
      sinon.assert.calledOnce(storeQueryStub);
      sinon.assert.calledWith(storeQueryStub, 'organization', {
        filter: {
          code: 'RVSG44'
        }
      });
    });

    it('should return the results as promise', function() {
      // Given
      this.register('service:store', storyStub);
      this.inject.service('store', { as: 'store' });
      const route = this.subject();

      // When
      const routeActionResult = route.actions.searchForOrganization.call(route, 'RVSG44');

      return routeActionResult.then(function(organizations) {
        expect(organizations).to.deep.equal(apiResult);
      });
    });
  });
});
