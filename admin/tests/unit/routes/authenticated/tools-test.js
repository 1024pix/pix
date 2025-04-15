import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/tools', function (hooks) {
  setupTest(hooks);

  module('index', function () {
    test('it should check if current user has an accepted role', function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/tools');

      const restrictAccessToStub = sinon.stub().returns();

      class AccessControlStub extends Service {
        restrictAccessTo = restrictAccessToStub;
      }

      this.owner.register('service:access-control', AccessControlStub);

      // when
      route.beforeModel();

      // then
      assert.ok(restrictAccessToStub.calledWith(['isMetier', 'isCertif', 'isSuperAdmin'], 'authenticated'));
    });
  });

  module('tabs', function () {
    module('campaigns', function () {
      test('it should check if current user has a metier or superadmin role', function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/tools/campaigns');

        const restrictAccessToStub = sinon.stub().returns();

        class AccessControlStub extends Service {
          restrictAccessTo = restrictAccessToStub;
        }

        this.owner.register('service:access-control', AccessControlStub);

        // when
        route.beforeModel();

        // then
        assert.ok(restrictAccessToStub.calledWith(['isMetier', 'isSuperAdmin'], 'authenticated'));
      });
    });

    module('junior', function () {
      test('it should check if current user has a metier or superadmin role', function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/tools/junior');

        const restrictAccessToStub = sinon.stub().returns();

        class AccessControlStub extends Service {
          restrictAccessTo = restrictAccessToStub;
        }

        this.owner.register('service:access-control', AccessControlStub);

        // when
        route.beforeModel();

        // then
        assert.ok(restrictAccessToStub.calledWith(['isMetier', 'isSuperAdmin'], 'authenticated'));
      });
    });

    module('certification', function () {
      test('it should check if current user has a certif or superadmin role', function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/tools/certification');

        const restrictAccessToStub = sinon.stub().returns();

        class AccessControlStub extends Service {
          restrictAccessTo = restrictAccessToStub;
        }

        this.owner.register('service:access-control', AccessControlStub);

        // when
        route.beforeModel();

        // then
        assert.ok(restrictAccessToStub.calledWith(['isCertif', 'isSuperAdmin'], 'authenticated'));
      });
    });
  });
});
