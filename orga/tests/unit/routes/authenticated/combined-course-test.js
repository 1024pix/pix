import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/combined-course', function (hooks) {
  setupTest(hooks);
  module('beforeModel', function () {
    test('user is redirected to index when he has no access', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course');
      const router = this.owner.lookup('service:router');
      const store = this.owner.lookup('service:store');
      const currentUser = this.owner.lookup('service:current-user');

      const replaceWithStub = sinon.stub(router, 'replaceWith');
      sinon.stub(currentUser, 'canAccessCampaignsPage').value(false);
      sinon.stub(store, 'findRecord').resolves();
      // when
      await route.beforeModel();

      // then
      assert.ok(replaceWithStub.calledWithExactly('authenticated.index'));
    });
  });
  module('model', function () {
    test('fetch a combined-course ', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course');
      const store = this.owner.lookup('service:store');
      const combinedCourse = Symbol('combinedCourse');
      const combinedCourseId = Symbol('combinedCourseId');

      sinon.stub(store, 'findRecord').withArgs('combined-course', combinedCourseId).resolves(combinedCourse);

      // when
      const result = await route.model({ combined_course_id: combinedCourseId });

      // then
      assert.strictEqual(result, combinedCourse);
    });
    test('replace route with not-found route when findRecord throws', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course');
      const router = this.owner.lookup('service:router');
      const store = this.owner.lookup('service:store');
      const combinedCourseId = Symbol('combinedCourseId');

      const replaceWithStub = sinon.stub(router, 'replaceWith');
      sinon.stub(store, 'findRecord').rejects(new Error('olala'));
      sinon.stub(console, 'error');

      // when
      await route.model({ combined_course_id: combinedCourseId });

      // then
      assert.ok(replaceWithStub.calledWithExactly('not-found'));
    });
  });
});
