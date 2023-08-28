import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module(
  'Unit | Route | authenticated/complementary-certifications/complementary-certification/details',
  function (hooks) {
    setupTest(hooks);

    module('#beforeModel', function () {
      test('it should check if current user is "SUPER_ADMIN", "SUPPORT", or "METIER"', function (assert) {
        // given
        const route = this.owner.lookup(
          'route:authenticated/complementary-certifications/complementary-certification/details',
        );

        const restrictAccessToStub = sinon.stub().returns();

        class AccessControlStub extends Service {
          restrictAccessTo = restrictAccessToStub;
        }

        this.owner.register('service:access-control', AccessControlStub);

        // when
        route.beforeModel();

        // then
        assert.ok(restrictAccessToStub.calledWith(['isSuperAdmin', 'isMetier', 'isSupport'], 'authenticated'));
      });
    });

    module('#resetController', function (hooks) {
      let controller;
      let route;

      hooks.beforeEach(function () {
        route = this.owner.lookup(
          'route:authenticated/complementary-certifications/complementary-certification/details',
        );
        controller = {
          reset: sinon.stub(),
        };
      });

      module('when route is exiting', function () {
        test('it should reset the toggle state', function (assert) {
          // when
          route.resetController(controller, true);

          // then
          assert.ok(controller.reset.calledOnce);
        });
      });

      module('when route is not exiting', function () {
        test('it should not reset controller', function (assert) {
          // when
          route.resetController(controller, false);

          // then
          assert.ok(controller.reset.notCalled);
        });
      });
    });
  },
);
