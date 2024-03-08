import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/certifications', function (hooks) {
  setupTest(hooks);

  module('#beforeModel', function () {
    test('it should check if current user is super admin, certif, or support', function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/certifications');

      const restrictAccessToStub = sinon.stub().returns();
      class AccessControlStub extends Service {
        restrictAccessTo = restrictAccessToStub;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      route.beforeModel();

      // then
      assert.ok(restrictAccessToStub.calledWith(['isSuperAdmin', 'isCertif', 'isSupport'], 'authenticated'));
    });
  });
});
