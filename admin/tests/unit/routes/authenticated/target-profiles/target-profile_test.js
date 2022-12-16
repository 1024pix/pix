import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Route | authenticated/target-profiles/target-profile', function (hooks) {
  setupTest(hooks);

  module('#beforeModel', function () {
    test('it should check if current user is "SUPER_ADMIN", "SUPPORT", or "METIER"', function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/target-profiles/target-profile');

      const restrictAccessToStub = sinon.stub().returns();
      class AccessControlStub extends Service {
        restrictAccessTo = restrictAccessToStub;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      route.beforeModel();

      // then
      assert.ok(restrictAccessToStub.calledWith(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated'));
    });
  });
});
