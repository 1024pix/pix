import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | compte', function() {
  setupTest();

  describe('model', function() {

    let sessionStub;

    beforeEach(function() {
      sessionStub = Service.create({
        isAuthenticated: true,
      });
    });

    context('when user is an organization', function() {

      let currentUserStub;

      beforeEach(function() {
        currentUserStub = Service.create({
          user: { organizations: [{ id: 1 }] }
        });
      });

      it('should redirect to /board', async function() {
        // Given
        const route = this.owner.lookup('route:compte');
        route.set('session', sessionStub);
        route.set('currentUser', currentUserStub);

        route.transitionTo = sinon.spy();

        // When
        await route.model();

        // Then
        sinon.assert.calledWith(route.transitionTo, 'board');
      });
    });

    context('when user is regular user', function() {

      let storeStub;
      let queryRecordStub;
      let currentUserStub;

      beforeEach(function() {
        currentUserStub = Service.create({
          user: { organizations: [] }
        });

        queryRecordStub = sinon.stub();
        storeStub = Service.create({
          queryRecord: queryRecordStub
        });
      });

      it('should load user profile', async function() {
        // Given
        const foundUser = EmberObject.create({ id: 'hello' });

        queryRecordStub.withArgs('user', { profile: true }).resolves(foundUser);
        const route = this.owner.lookup('route:compte');
        route.set('store', storeStub);
        route.set('currentUser', currentUserStub);

        // When
        const model = await route.model();

        // Then
        expect(model).to.deep.equal(foundUser);
      });
    });
  });

  describe('#searchForOrganization', function() {

    let storeQueryStub;
    let storeStub;
    let organizations;
    let organizationCollectionStub;

    beforeEach(() => {
      organizationCollectionStub = sinon.stub();
      organizations = { get: organizationCollectionStub, content: [{}] };

      storeQueryStub = sinon.stub().resolves(organizations);
      storeStub = Service.create({
        query: storeQueryStub
      });
    });

    it('should search for an organization', function() {
      // Given
      const route = this.owner.lookup('route:compte');
      route.set('store', storeStub);

      // When
      route.actions.searchForOrganization.call(route, 'RVSG44');

      // Then
      sinon.assert.calledOnce(storeQueryStub);
      sinon.assert.calledWith(storeQueryStub, 'organization', {
        code: 'RVSG44'
      });
    });

    describe('when there is only one result', () => {
      it('should return the organization', function() {
        // Given
        organizationCollectionStub.returns('THE FIRST OBJECT');

        const route = this.owner.lookup('route:compte');
        route.set('store', storeStub);

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

        const route = this.owner.lookup('route:compte');
        route.set('store', storeStub);

        // When
        const routeActionResult = route.actions.searchForOrganization.call(route, 'RVSG44');

        return routeActionResult.then(function(organization) {
          expect(organization).to.equal(null);
        });
      });
    });
  });

  describe('#shareProfileSnapshot', function() {

    let storeStub;
    let storeCreateRecordStub;
    let storeSaveStub;
    let organization;

    beforeEach(() => {
      storeSaveStub = sinon.stub().resolves();
      organization = EmberObject.create({ id: 1234, name: 'ACME', code: 'RVSG44', save: storeSaveStub });
      storeCreateRecordStub = sinon.stub().returns(organization);
      storeStub = Service.create({
        createRecord: storeCreateRecordStub,
      });
    });

    it('should create and save a new Snapshot', function() {
      // given
      const route = this.owner.lookup('route:compte');
      route.set('store', storeStub);

      // when
      const promise = route.actions.shareProfileSnapshot.call(route, organization);

      // then
      return promise.then(function() {
        sinon.assert.called(storeCreateRecordStub);
        sinon.assert.called(storeSaveStub);
      });
    });
  });

});
