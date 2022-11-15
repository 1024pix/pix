import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import Service from '@ember/service';

module('Unit | Route | user certifications/index', function (hooks) {
  setupTest(hooks);

  let route;
  let storeStub;
  const findAll = sinon.stub();
  const unloadAll = sinon.stub();

  hooks.beforeEach(function () {
    storeStub = Service.create({
      findAll: findAll,
      unloadAll: unloadAll,
    });

    route = this.owner.lookup('route:authenticated/user-certifications/index');
    route.set('store', storeStub);
  });

  test('exists', function (assert) {
    assert.ok(route);
  });

  test('should return connected user certifications', function (assert) {
    // given
    const certifications = [EmberObject.create({ id: 1 })];
    findAll.resolves(certifications);

    // when
    const result = route.model();

    // then
    return result.then((certifications) => {
      assert.equal(certifications[0].id, 1);
    });
  });
});
