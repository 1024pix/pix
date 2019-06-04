import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import Service from '@ember/service';

describe('Unit | Route | user certifications/index', function() {
  setupTest();

  let route;
  const findAll = sinon.stub();
  const unloadAll = sinon.stub();

  beforeEach(function() {

    this.owner.register('service:store', Service.extend({
      findAll: findAll,
      unloadAll: unloadAll
    }));

    route = this.owner.lookup('route:user-certifications/index');
  });

  it('exists', function() {
    expect(route).to.be.ok;
  });

  it('should return connected user certifications', function() {
    // given
    const certifications = [
      EmberObject.create({ id: 1 })
    ];
    findAll.resolves(certifications);

    // when
    const result = route.model();

    // then
    return result.then((certifications) => {
      expect(certifications[0].id).to.equal(1);
    });
  });
});
