import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | board', function() {

  setupTest('route:board', {
    needs: ['service:session', 'service:metrics']
  });

  const queryRecord = sinon.stub();
  const query = sinon.stub();
  let route;

  beforeEach(function() {

    this.register('service:store', Service.extend({ queryRecord, query }));
    this.inject.service('store', { as: 'store' });
    this.register('service:session', Service.extend({
      data: { authenticated: { userId: 12, token: 'VALID-TOKEN' } }
    }));

    this.inject.service('session', { as: 'session' });
    route = this.subject();
    route.transitionTo = sinon.spy();
  });

  it('exists', function() {
    route = this.subject();
    expect(route).to.be.ok;
  });

  it('should correctly call the store', function() {
    // given
    queryRecord.resolves();

    // when
    route.model();

    // then
    sinon.assert.calledOnce(queryRecord);
  });

  it('should return user first organization and snapshots', function() {
    // given
    const user = EmberObject.create({ id: 1, organizations: [{ id: 1 }, { id: 2 }] });
    queryRecord.resolves(user);
    query.resolves([{ id: 1 }, { id: 2 }]);

    // when
    const result = route.model();

    // then
    return result.then((model) => {
      expect(model.organization.id).to.equal(1);
      expect(model.snapshots.length).to.equal(2);
    });
  });

  it('should return to index when the user has no organization', function() {
    // given
    const user = EmberObject.create({ id: 1, organizations: [] });
    queryRecord.resolves(user);

    // when
    const result = route.model();

    // then
    return result.then((_) => {
      sinon.assert.calledOnce(route.transitionTo);
      sinon.assert.calledWith(route.transitionTo, 'index');
    });
  });
});
