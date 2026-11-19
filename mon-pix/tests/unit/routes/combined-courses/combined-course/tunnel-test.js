import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Combined Course | Tunnel', function (hooks) {
  setupTest(hooks);

  let route, replaceWithStub;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:combined-courses.combined-course.tunnel');
    replaceWithStub = sinon.stub(route.router, 'replaceWith');
    sinon.stub(route.accessStorage, 'clear');
  });

  module('#afterModel', function () {
    test('should redirect to combined course presentation page when combined course is completed', function (assert) {
      // given
      const combinedCourse = { code: 'COMBINIX9', organizationId: 1, nextCombinedCourseItem: undefined };

      // when
      route.afterModel(combinedCourse);

      // then
      assert.ok(replaceWithStub.calledWithExactly('combined-courses.combined-course.presentation', 'COMBINIX9'));
    });

    test('should not redirect when combined course has an item left to complete', function (assert) {
      // given
      const combinedCourse = { code: 'COMBINIX9', organizationId: 1, nextCombinedCourseItem: { id: 2 } };

      // when
      route.afterModel(combinedCourse);

      // then
      assert.ok(replaceWithStub.notCalled);
    });
  });
});
