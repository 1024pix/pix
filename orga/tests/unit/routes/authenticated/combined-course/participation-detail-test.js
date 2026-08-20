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

    test('should group consecutive CAMPAIGN items together in the same step', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const itemsToSort = [
        { reference: 'CAMPAIGN-1', type: 'CAMPAIGN' },
        { reference: 'CAMPAIGN-2', type: 'CAMPAIGN' },
        { reference: 'CAMPAIGN-3', type: 'CAMPAIGN' },
      ];

      // when
      const result = route.sortItemsByStep(itemsToSort);

      // then
      assert.strictEqual(result.length, 1);
      assert.deepEqual(result, [
        [
          { reference: 'CAMPAIGN-1', type: 'CAMPAIGN' },
          { reference: 'CAMPAIGN-2', type: 'CAMPAIGN' },
          { reference: 'CAMPAIGN-3', type: 'CAMPAIGN' },
        ],
      ]);
    });

    test('should group consecutive MODULE items together in the same step', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const itemsToSort = [
        { reference: 'MODULE-1', type: 'MODULE' },
        { reference: 'MODULE-2', type: 'MODULE' },
        { reference: 'MODULE-3', type: 'MODULE' },
      ];

      // when
      const result = route.sortItemsByStep(itemsToSort);

      // then
      assert.strictEqual(result.length, 1);
      assert.deepEqual(result, [
        [
          { reference: 'MODULE-1', type: 'MODULE' },
          { reference: 'MODULE-2', type: 'MODULE' },
          { reference: 'MODULE-3', type: 'MODULE' },
        ],
      ]);
    });

    test('should group FORMATION and MODULE items together in the same step', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const itemsToSort = [
        { reference: 'FORMATION-1', type: 'FORMATION' },
        { reference: 'MODULE-1', type: 'MODULE' },
        { reference: 'MODULE-2', type: 'MODULE' },
      ];

      // when
      const result = route.sortItemsByStep(itemsToSort);

      // then
      assert.strictEqual(result.length, 1);
      assert.deepEqual(result, [
        [
          { reference: 'FORMATION-1', type: 'FORMATION' },
          { reference: 'MODULE-1', type: 'MODULE' },
          { reference: 'MODULE-2', type: 'MODULE' },
        ],
      ]);
    });

    test('should create a new step when a CAMPAIGN item appears after MODULE items', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const itemsToSort = [
        { reference: 'MODULE-1', type: 'MODULE' },
        { reference: 'MODULE-2', type: 'MODULE' },
        { reference: 'CAMPAIGN-1', type: 'CAMPAIGN' },
        { reference: 'MODULE-3', type: 'MODULE' },
      ];

      // when
      const result = route.sortItemsByStep(itemsToSort);

      // then
      assert.strictEqual(result.length, 3);
      assert.deepEqual(result, [
        [
          { reference: 'MODULE-1', type: 'MODULE' },
          { reference: 'MODULE-2', type: 'MODULE' },
        ],
        [{ reference: 'CAMPAIGN-1', type: 'CAMPAIGN' }],
        [{ reference: 'MODULE-3', type: 'MODULE' }],
      ]);
    });

    test('should create a new step when FORMATION items are not consecutive with MODULE items', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participation-detail');
      const itemsToSort = [
        { reference: 'FORMATION-1', type: 'FORMATION' },
        { reference: 'FORMATION-2', type: 'FORMATION' },
      ];

      // when
      const result = route.sortItemsByStep(itemsToSort);

      // then
      assert.strictEqual(result.length, 2);
      assert.deepEqual(result, [
        [{ reference: 'FORMATION-1', type: 'FORMATION' }],
        [{ reference: 'FORMATION-2', type: 'FORMATION' }],
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
