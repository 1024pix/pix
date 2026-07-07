import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/combined-course-blueprints', function (hooks) {
  setupTest(hooks);

  module('list', function () {
    test('it should check if current user has super admin or metier role', function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course-blueprints/list');
      const restrictAccessToStub = sinon.stub().returns();

      class AccessControlStub extends Service {
        restrictAccessTo = restrictAccessToStub;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      route.beforeModel();

      // then
      assert.ok(restrictAccessToStub.calledWith(['isSuperAdmin', 'isMetier'], 'authenticated'));
    });
  });

  module('new', function () {
    test('it should check if current user has super admin role', function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course-blueprints/new');
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

  module('edit', function () {
    test('it should check if current user has super admin role', function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course-blueprints/edit');
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
  module('details', function () {
    test('it should allow metier and superadmin roles to access details page', function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course-blueprints/combined-course-blueprint');

      const restrictAccessToStub = sinon.stub().returns();

      class AccessControlStub extends Service {
        restrictAccessTo = restrictAccessToStub;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      route.beforeModel();

      // then
      assert.ok(restrictAccessToStub.calledWith(['isSuperAdmin', 'isMetier'], 'authenticated'));
    });
  });
});
