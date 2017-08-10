import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Ember from 'ember';
import sinon from 'sinon';

describe('Unit | Route | board', function() {
  setupTest('route:board', {
    // Specify the other units that are required for this test.
    needs: ['service:current-routed-modal']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  const queryRecordStub = sinon.stub();

  beforeEach(function() {
    this.register('service:store', Ember.Service.extend({
      queryRecord: queryRecordStub
    }));
    this.inject.service('store', { as: 'store' });
  });

  it('should correctly call the store', function() {
    // given
    const route = this.subject();
    route.transitionTo = () => {};

    queryRecordStub.resolves();

    // when
    route.model();

    // then
    sinon.assert.calledOnce(queryRecordStub);
    sinon.assert.calledWith(queryRecordStub, 'user', {});
  });

  it('should return user first organization informations', function() {
    // given
    const user = Ember.Object.create({ id: 1, organizations: [{ id: 1 }, { id: 2 }] });

    const route = this.subject();
    route.transitionTo = () => {};

    queryRecordStub.resolves(user);

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

    queryRecordStub.rejects();

    // when
    const promise = route.model();

    // then
    return promise.then(_ => {
      sinon.assert.calledOnce(route.transitionTo);
      sinon.assert.calledWith(route.transitionTo, 'index');
    });
  });

});
