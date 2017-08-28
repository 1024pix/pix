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
    expect(route.authenticationRoute).to.equal('/connexion');
  });

  describe('searchForOrganization', function() {

    let storeQueryStub;
    let storyStub;
    let organizations;
    let organizationCollectionStub;

    beforeEach(() => {
      organizationCollectionStub = sinon.stub();
      organizations = { get: organizationCollectionStub, content: [{}] };

      storeQueryStub = sinon.stub().resolves(organizations);
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

    describe('when there is only one result', () => {
      it('should return the organization', function() {
        // Given
        organizationCollectionStub.returns('THE FIRST OBJECT');

        this.register('service:store', storyStub);
        this.inject.service('store', { as: 'store' });
        const route = this.subject();

        // When
        const routeActionResult = route.actions.searchForOrganization.call(route, 'RVSG44');

        return routeActionResult.then(function(organization) {
          expect(organization).to.equal('THE FIRST OBJECT');
        });
      });
    });

    describe('when there is no organization found', () => {
      it('should null', function() {
        // Given
        organizations.content = [];
        organizationCollectionStub.returns('THE FIRST OBJECT');

        this.register('service:store', storyStub);
        this.inject.service('store', { as: 'store' });
        const route = this.subject();

        // When
        const routeActionResult = route.actions.searchForOrganization.call(route, 'RVSG44');

        return routeActionResult.then(function(organization) {
          expect(organization).to.equal(null);
        });
      });
    });
  });
});
