import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/combined-courses', function (hooks) {
  setupTest(hooks);

  let route;
  let store;
  let currentUser;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/campaigns/combined-courses');
    store = this.owner.lookup('service:store');
    currentUser = this.owner.lookup('service:current-user');
  });

  module('model', function () {
    test('should query combined-courses with organizationId and pagination params', async function (assert) {
      // given
      const organizationId = Symbol('organization-id');
      const pageNumber = 2;
      const pageSize = 10;
      const combinedCoursesSymbol = Symbol('combined-courses');

      currentUser.organization = { id: organizationId };

      sinon
        .stub(store, 'query')
        .withArgs(
          'combined-course',
          {
            organizationId,
            page: {
              number: pageNumber,
              size: pageSize,
            },
          },
          { reload: true },
        )
        .resolves(combinedCoursesSymbol);

      // when
      const result = await route.model({ pageNumber, pageSize });

      // then
      assert.deepEqual(result, { combinedCourses: combinedCoursesSymbol });
    });
  });

  module('resetController', function () {
    test('should reset pageNumber and pageSize when exiting the route', function (assert) {
      // given
      const controller = {
        pageNumber: 5,
        pageSize: 50,
      };

      // when
      route.resetController(controller, true);

      // then
      assert.deepEqual(controller, {
        pageNumber: 1,
        pageSize: 25,
      });
    });
  });
});
