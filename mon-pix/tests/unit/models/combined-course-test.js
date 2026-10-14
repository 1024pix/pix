import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | Combined Course', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });
  module('#nextCombinedCourseItemLink', function () {
    test('when user has not completed any item', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        isCompleted: false,
        redirection: '/campagnes/CODE123',
      });
      const combinedCourse = store.createRecord('combined-course');
      combinedCourse.items = [combinedCourseItem];
      assert.strictEqual(combinedCourse.nextCombinedCourseItem, combinedCourseItem);
    });
    test('when all items are completed', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        isCompleted: true,
        redirection: '/campagnes/CODE123',
      });
      const combinedCourse = store.createRecord('combined-course');
      combinedCourse.items = [combinedCourseItem];
      assert.strictEqual(combinedCourse.nextCombinedCourseItem, undefined);
    });
    test('when one item is completed and the other is not', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        isCompleted: true,
        redirection: '/modules/demo-combinix-1',
      });
      const secondCombinedCourseItem = store.createRecord('combined-course-item', {
        isCompleted: false,
        redirection: '/campagnes/CODE123',
      });
      const combinedCourse = store.createRecord('combined-course');
      combinedCourse.items = [combinedCourseItem, secondCombinedCourseItem];
      assert.strictEqual(combinedCourse.nextCombinedCourseItem, secondCombinedCourseItem);
    });
  });

  module('#previousCombinedCourseItem', function () {
    test('should return null when there is only one item', function (assert) {
      //given
      const nextCombinedCourseItem = store.createRecord('combined-course-item', {
        isCompleted: false,
        redirection: '/campagnes/CODE123',
      });
      const combinedCourse = store.createRecord('combined-course');
      combinedCourse.items = [nextCombinedCourseItem];

      //then
      assert.strictEqual(combinedCourse.previousCombinedCourseItem, null);
    });

    test('should return null when there is no previous element', function (assert) {
      //given
      const nextCombinedCourseItem = store.createRecord('combined-course-item', {
        isCompleted: false,
        redirection: '/campagnes/CODE123',
      });
      const followingCombinedCourseItem = store.createRecord('combined-course-item', {
        isCompleted: false,
        redirection: '/campagnes/CODE123',
      });
      const combinedCourse = store.createRecord('combined-course');
      combinedCourse.items = [nextCombinedCourseItem, followingCombinedCourseItem];

      //then
      assert.strictEqual(combinedCourse.previousCombinedCourseItem, null);
    });

    test('should return last completed item when there are several items in CombinedCourse', function (assert) {
      //given
      const previousCombinedCourseItem = store.createRecord('combined-course-item', {
        isCompleted: true,
        redirection: '/campagnes/CODE123',
      });
      const nextCombinedCourseItem = store.createRecord('combined-course-item', {
        isCompleted: false,
        redirection: '/campagnes/CODE123',
      });
      const followingCombinedCourseITem = store.createRecord('combined-course-item', {
        isCompleted: false,
        redirection: '/campagnes/CODE123',
      });
      const combinedCourse = store.createRecord('combined-course');
      combinedCourse.items = [previousCombinedCourseItem, nextCombinedCourseItem, followingCombinedCourseITem];

      //then
      assert.strictEqual(combinedCourse.previousCombinedCourseItem, previousCombinedCourseItem);
    });
  });

  module('#hasItemOfTypeModule', function () {
    test('returns true when there is an item of type module', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        isCompleted: false,
        type: 'module',
        redirection: '/modules/demo-combinix-1',
      });
      const combinedCourse = store.createRecord('combined-course');
      combinedCourse.items = [combinedCourseItem];
      assert.true(combinedCourse.hasItemOfTypeModule);
    });
    test('returns false when there is not an item of type module', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        isCompleted: false,
        type: 'popopo',
        redirection: '/demo-combinix-1',
      });
      const combinedCourse = store.createRecord('combined-course');
      combinedCourse.items = [combinedCourseItem];
      assert.false(combinedCourse.hasItemOfTypeModule);
    });
  });
  module('#areItemsOfTheSameType', function () {
    test('returns false when items are of different types', function (assert) {
      const combinedCourseItem1 = store.createRecord('combined-course-item', {
        isCompleted: false,
        type: 'campaign',
      });
      const combinedCourseItem2 = store.createRecord('combined-course-item', {
        isCompleted: false,
        type: 'formation',
      });
      const combinedCourseItem3 = store.createRecord('combined-course-item', {
        isCompleted: false,
        type: 'module',
        redirection: '/modules/demo-combinix-2',
      });

      const combinedCourse = store.createRecord('combined-course');
      combinedCourse.items = [combinedCourseItem1, combinedCourseItem2, combinedCourseItem3];
      assert.false(combinedCourse.areItemsOfTheSameType);
    });
    test('returns true when items are of different types', function (assert) {
      const combinedCourseItem1 = store.createRecord('combined-course-item', {
        isCompleted: false,
        type: 'campaign',
      });
      const combinedCourseItem2 = store.createRecord('combined-course-item', {
        isCompleted: false,
        type: 'campaign',
      });
      const combinedCourse = store.createRecord('combined-course');
      combinedCourse.items = [combinedCourseItem1, combinedCourseItem2];
      assert.true(combinedCourse.areItemsOfTheSameType);
    });
  });
});
