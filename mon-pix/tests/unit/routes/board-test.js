import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | board', function() {

  setupTest();

  let route;
  let storeStub;
  let currentUserStub;

  context('is organization user', function() {

    beforeEach(function() {
      storeStub = Service.create({
        query: sinon.stub().resolves([{ id: 1 }, { id: 2 }]),
        findRecord: sinon.stub().withArgs('organization', 123)
          .resolves({ id: 123 })
      });

      currentUserStub = Service.create({
        user: { isBoardOrganization: true, boardOrganizationId: 123 }
      });

      route = this.owner.lookup('route:board');
      route.set('store', storeStub);
      route.set('currentUser', currentUserStub);

      route.transitionTo = sinon.spy();
    });

    it('should return user first organization and snapshots', async function() {
      // when
      const model = await route.model();

      // then
      expect(model.organization.id).to.equal(123);
      expect(model.snapshots.length).to.equal(2);
    });
  });

  context('is regular user', function() {

    beforeEach(function() {
      currentUserStub = Service.create({
        user: { isBoardOrganization: false, organizations: [] }
      });

      route = this.owner.lookup('route:board');
      route.set('currentUser', currentUserStub);

      route.transitionTo = sinon.spy();
    });

    it('should return to index', async function() {
      // when
      await route.model();

      // then
      sinon.assert.calledWith(route.transitionTo, 'index');
    });
  });

});
