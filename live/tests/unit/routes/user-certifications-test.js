import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';
import EmberObject from '@ember/object';

describe('Unit | Route | user certifications', function() {
  setupTest('route:user-certifications', {
    needs: ['service:session', 'service:current-routed-modal']
  });

  let route;
  const findRecord = sinon.stub();

  beforeEach(function() {

    this.register('service:store', Service.extend({
      findRecord: findRecord
    }));
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

  it('should return connected user certifications', function() {
    // given
    const certifications = [
      EmberObject.create({ id: 1 })
    ];
    const user = EmberObject.create({ id: 1, certifications: certifications });
    findRecord.resolves(user);

    // when
    const result = route.model();

    // then
    return result.then((certifications) => {
      expect(certifications[0].id).to.equal(1);
    });
  });
});
