import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/administration', function (hooks) {
  setupTest(hooks);

  test('it should check if current user is super admin', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/administration');

    const restrictAccessToStub = sinon.stub().returns();
    class AccessControlStub extends Service {
      restrictAccessTo = restrictAccessToStub;
    }
    this.owner.register('service:access-control', AccessControlStub);

    // when
    route.beforeModel();

    // then
    assert.ok(restrictAccessToStub.calledWith(['isSuperAdmin'], 'authenticated'));
  });
});
