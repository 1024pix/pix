import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | board', function() {

  setupTest('route:board', {
    needs: ['service:metrics', 'service:session']
  });

  let route;

  context('is organization user', function() {

    beforeEach(function() {
      this.register('service:store', Service.extend({
        query: sinon.stub().resolves([{ id: 1 }, { id: 2 }])
      }));
      this.inject.service('store', { as: 'store' });

      this.register('service:currentUser', Service.extend({
        user: { organizations: [{ id: 1 }, { id: 2 }] }
      }));
      this.inject.service('currentUser', { as: 'currentUser' });

      route = this.subject();
      route.transitionTo = sinon.spy();
    });

    it('should return user first organization and snapshots', function() {
      // when
      const result = route.model();

      // then
      return result.then((model) => {
        expect(model.organization.id).to.equal(1);
        expect(model.snapshots.length).to.equal(2);
      });
    });
  });

  context('is regular user', function() {

    beforeEach(function() {
      this.register('service:currentUser', Service.extend({
        user: { organizations: [] }
      }));
      this.inject.service('currentUser', { as: 'currentUser' });

      route = this.subject();
      route.transitionTo = sinon.spy();
    });

    it('should return to index', function() {
      // when
      const result = route.model();

      // then
      return result.then((_) => {
        sinon.assert.calledWith(route.transitionTo, 'index');
      });
    });
  });

});
