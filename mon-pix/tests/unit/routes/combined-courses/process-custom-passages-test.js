import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Combined Course | Process custom passages', function (hooks) {
  setupTest(hooks);

  let route, replaceWithStub;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:combined-courses.process-custom-passages');
    replaceWithStub = sinon.stub(route.router, 'replaceWith');
  });

  module('#beforeModel', function () {
    test('should redirect to combined course home page when user is not redirect from result campaign page', function (assert) {
      // given
      const transition = {
        from: { name: 'some.other.route' },
        to: { params: { code: 'test-code' } },
      };

      // when
      route.beforeModel(transition);

      // then
      assert.ok(replaceWithStub.calledWithExactly('combined-courses.programme', 'test-code'));
    });

    test('should not call transition if user came from campaign result', function (assert) {
      // given
      const transition = {
        from: { name: 'campaigns.assessment.results' },
        to: { params: { code: 'test-code' } },
      };

      // when
      route.beforeModel(transition);

      // then
      assert.ok(replaceWithStub.notCalled);
    });
  });
});
