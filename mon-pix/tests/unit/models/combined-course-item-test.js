import { setupTest } from 'ember-qunit';
import { CombinedCourseAssets, CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item';
import { module, test } from 'qunit';

module('Unit | Model | Combined Course Item', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('Type is CAMPAIGN', function () {
    test('return route campaign', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        type: CombinedCourseItemTypes.CAMPAIGN,
      });
      assert.strictEqual(combinedCourseItem.route, 'campaigns');
    });

    test('return iconUrl related for campaign', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        type: CombinedCourseItemTypes.CAMPAIGN,
      });
      assert.strictEqual(combinedCourseItem.iconUrl, CombinedCourseAssets.CAMPAIGN_ICON);
    });
    test('retrieves 1 from totalStagesCount and validatedStagesCount', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        type: CombinedCourseItemTypes.CAMPAIGN,
        totalStagesCount: 5,
        validatedStagesCount: 2,
      });
      assert.strictEqual(combinedCourseItem.totalStages, 4);
      assert.strictEqual(combinedCourseItem.validatedStages, 1);
    });
  });

  module('Type is MODULE', function () {
    test('return route campaign', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        type: CombinedCourseItemTypes.MODULE,
      });
      assert.strictEqual(combinedCourseItem.route, 'module');
    });

    test('return iconUrl related for campaign', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        type: CombinedCourseItemTypes.MODULE,
        image: 'my-module-url',
      });
      assert.strictEqual(combinedCourseItem.iconUrl, 'my-module-url');
    });
  });

  module('Type is FORMATION', function () {
    test('return iconUrl related for campaign', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        type: CombinedCourseItemTypes.FORMATION,
        image: 'my-module-url',
      });
      assert.strictEqual(combinedCourseItem.iconUrl, CombinedCourseAssets.FORMATION_ICON);
    });
    test('should return module when typeForStepDisplay getter is called', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        type: CombinedCourseItemTypes.FORMATION,
        image: 'my-module-url',
      });
      assert.strictEqual(combinedCourseItem.typeForStepDisplay, CombinedCourseItemTypes.MODULE);
    });
  });
});
