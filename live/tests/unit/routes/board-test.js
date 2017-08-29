import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import Ember from 'ember';
import sinon from 'sinon';

describe('Unit | Route | board', function() {
  setupTest('route:board', {
    // Specify the other units that are required for this test.
    needs: ['service:current-routed-modal', 'service:session']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  const findRecord = sinon.stub();

  beforeEach(function() {
    this.register('service:store', Ember.Service.extend({
      findRecord: findRecord
    }));
    this.inject.service('store', { as: 'store' });

    this.register('service:session', Ember.Service.extend({
      data: { authenticated: { userId: 12 } }
    }));
    this.inject.service('session', { as: 'session' });
  });

  it('should correctly call the store', function() {
    // given
    const route = this.subject();
    route.transitionTo = () => {};

    findRecord.resolves();

    // when
    route.model();

    // then
    sinon.assert.calledOnce(findRecord);
    sinon.assert.calledWith(findRecord, 'user', 12);
  });

  it('should return user first organization informations', function() {
    // given
    const user = Ember.Object.create({ id: 1, organizations: [{ id: 1 }, { id: 2 }] });

    const route = this.subject();
    route.transitionTo = () => {};

    findRecord.resolves(user);

    // when
    const promise = route.model();

    // then
    return promise.then((organization) => {
      expect(organization.id).to.equal(1);
    });
  });

  it('should return to home page if no user was found', function() {
    // given
    const route = this.subject();
    route.transitionTo = sinon.spy();

    findRecord.rejects();

    // when
    const promise = route.model();

    // then
    return promise.then(_ => {
      sinon.assert.calledOnce(route.transitionTo);
      sinon.assert.calledWith(route.transitionTo, 'index');
    });
  });

  it('should return to /compte when the user has no organization', function() {
    // given
    const route = this.subject();
    route.transitionTo = sinon.spy();
    const user = Ember.Object.create({ id: 1, organizations: [] });

    findRecord.resolves(user);

    // when
    const promise = route.model();

    // then
    return promise.then(_ => {
      sinon.assert.calledOnce(route.transitionTo);
      sinon.assert.calledWith(route.transitionTo, 'compte');
    });
  });

});
