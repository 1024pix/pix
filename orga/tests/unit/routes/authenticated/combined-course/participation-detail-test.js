import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/combined-course', function (hooks) {
  setupTest(hooks);

  module('beforeModel', function () {
    test('user is redirected to index when he has no access', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const router = this.owner.lookup('service:router');
      const currentUser = this.owner.lookup('service:current-user');

      const replaceWithStub = sinon.stub(router, 'replaceWith');
      sinon.stub(currentUser, 'canAccessCampaignsPage').value(false);

      // when
      await route.beforeModel();

      // then
      assert.ok(replaceWithStub.calledWithExactly('authenticated.index'));
    });
  });

  module('sortItemsByStep', function () {
    test('should return an empty array when given an empty array', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const itemsToSort = [];

      // when
      const result = route.sortItemsByStep(itemsToSort);

      // then
      assert.deepEqual(result, []);
    });

    test('should group consecutive campaign items together in the same step', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const itemsToSort = [
        { reference: 'campaign-1', type: 'campaign' },
        { reference: 'campaign-2', type: 'campaign' },
        { reference: 'campaign-3', type: 'campaign' },
      ];

      // when
      const result = route.sortItemsByStep(itemsToSort);

      // then
      assert.strictEqual(result.length, 1);
      assert.deepEqual(result, [
        [
          { reference: 'campaign-1', type: 'campaign' },
          { reference: 'campaign-2', type: 'campaign' },
          { reference: 'campaign-3', type: 'campaign' },
        ],
      ]);
    });

    test('should group consecutive module items together in the same step', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const itemsToSort = [
        { reference: 'module-1', type: 'module' },
        { reference: 'module-2', type: 'module' },
        { reference: 'module-3', type: 'module' },
      ];

      // when
      const result = route.sortItemsByStep(itemsToSort);

      // then
      assert.strictEqual(result.length, 1);
      assert.deepEqual(result, [
        [
          { reference: 'module-1', type: 'module' },
          { reference: 'module-2', type: 'module' },
          { reference: 'module-3', type: 'module' },
        ],
      ]);
    });

    test('should group formation and module items together in the same step', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const itemsToSort = [
        { reference: 'formation-1', type: 'formation' },
        { reference: 'module-1', type: 'module' },
        { reference: 'module-2', type: 'module' },
      ];

      // when
      const result = route.sortItemsByStep(itemsToSort);

      // then
      assert.strictEqual(result.length, 1);
      assert.deepEqual(result, [
        [
          { reference: 'formation-1', type: 'formation' },
          { reference: 'module-1', type: 'module' },
          { reference: 'module-2', type: 'module' },
        ],
      ]);
    });

    test('should create a new step when a campaign item appears after module items', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const itemsToSort = [
        { reference: 'module-1', type: 'module' },
        { reference: 'module-2', type: 'module' },
        { reference: 'campaign-1', type: 'campaign' },
        { reference: 'module-3', type: 'module' },
      ];

      // when
      const result = route.sortItemsByStep(itemsToSort);

      // then
      assert.strictEqual(result.length, 3);
      assert.deepEqual(result, [
        [
          { reference: 'module-1', type: 'module' },
          { reference: 'module-2', type: 'module' },
        ],
        [{ reference: 'campaign-1', type: 'campaign' }],
        [{ reference: 'module-3', type: 'module' }],
      ]);
    });

    test('should create a new step when formation items are not consecutive with module items', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const itemsToSort = [
        { reference: 'formation-1', type: 'formation' },
        { reference: 'formation-2', type: 'formation' },
      ];

      // when
      const result = route.sortItemsByStep(itemsToSort);

      // then
      assert.strictEqual(result.length, 2);
      assert.deepEqual(result, [
        [{ reference: 'formation-1', type: 'formation' }],
        [{ reference: 'formation-2', type: 'formation' }],
      ]);
    });
  });

  module('model', function () {
    test('fetch a combined course participation det      g;ail', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const store = this.owner.lookup('service:store');

      const combinedCourseId = Symbol('combinedCourseId');
      const combinedCourse = { id: combinedCourseId };
      sinon.stub(route, 'modelFor').returns(combinedCourse);

      const participationId = Symbol('participationId');
      const participationDetail = { participation: Symbol('participation'), items: [Symbol('items')] };
      sinon
        .stub(store, 'queryRecord')
        .withArgs('combined-course-participation-detail', { combinedCourseId, participationId })
        .resolves(participationDetail);

      // when
      const result = await route.model({ participation_id: participationId });

      // then
      assert.deepEqual(result, {
        combinedCourse,
        participation: participationDetail.participation,
        itemsBySteps: [participationDetail.items],
      });
    });

    test('replace route with not-found route when queryRecord throws', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const router = this.owner.lookup('service:router');
      const store = this.owner.lookup('service:store');

      const combinedCourseId = Symbol('combinedCourseId');
      const combinedCourse = { id: combinedCourseId };
      sinon.stub(route, 'modelFor').returns(combinedCourse);

      const replaceWithStub = sinon.stub(router, 'replaceWith');
      sinon.stub(store, 'queryRecord').rejects(new Error('olala'));
      sinon.stub(console, 'error');

      // when
      await route.model({});

      // then
      assert.ok(replaceWithStub.calledWithExactly('not-found'));
    });
  });
});
