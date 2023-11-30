import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Route | authenticated/autonomous-courses/autonomous-course', function (hooks) {
  setupTest(hooks);

  module('#beforeModel', function () {
    test('it should check if current user is "SUPER_ADMIN", "METIER" or "SUPPORT"', function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/autonomous-courses/autonomous-course');

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
