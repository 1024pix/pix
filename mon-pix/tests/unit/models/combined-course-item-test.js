import { setupTest } from 'ember-qunit';
import {
  CampaignParticipationStatus,
  CombinedCourseAssets,
  CombinedCourseItemTypes,
} from 'mon-pix/models/combined-course-item';
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

  module('#isCampaignType', function () {
    test('returns true for items with type campaign', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        type: CombinedCourseItemTypes.CAMPAIGN,
        image: 'my-module-url',
      });
      assert.true(combinedCourseItem.isCampaignType);
    });
  });

  module('#isModuleType', function () {
    test('returns true for items with type module', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        type: CombinedCourseItemTypes.MODULE,
        image: 'my-module-url',
      });
      assert.true(combinedCourseItem.isModuleType);
    });
  });

  module('#isFormationBloc', function () {
    test('returns true for items with type formation', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        type: CombinedCourseItemTypes.FORMATION,
      });
      assert.true(combinedCourseItem.isFormationBloc);
    });
  });

  module('#ctaLabel', function () {
    test('return correct wording for modules', function (assert) {
      const combinedCourseItem = store.createRecord('combined-course-item', {
        type: CombinedCourseItemTypes.MODULE,
      });
      assert.deepEqual(combinedCourseItem.ctaLabel, 'pages.combined-courses.items.start-module');
    });

    module('diagnostic', function () {
      test('return correct wording for not started diagnostic', function (assert) {
        const combinedCourseItem = store.createRecord('combined-course-item', {
          type: CombinedCourseItemTypes.CAMPAIGN,
          isDiagnostic: true,
        });
        assert.deepEqual(combinedCourseItem.ctaLabel, 'pages.combined-courses.items.start-diagnostic');
      });

      test('return correct wording for started diagnostic', function (assert) {
        const combinedCourseItem = store.createRecord('combined-course-item', {
          type: CombinedCourseItemTypes.CAMPAIGN,
          isDiagnostic: true,
          participationStatus: CampaignParticipationStatus.STARTED,
        });
        assert.deepEqual(combinedCourseItem.ctaLabel, 'pages.combined-courses.items.continue-diagnostic');
      });
    });

    module('campaign', function () {
      test('return correct wording for not started campaigns', function (assert) {
        const combinedCourseItem = store.createRecord('combined-course-item', {
          type: CombinedCourseItemTypes.CAMPAIGN,
          isDiagnostic: false,
        });
        assert.deepEqual(combinedCourseItem.ctaLabel, 'pages.combined-courses.items.start-campaign');
      });

      test('return correct wording for started campaigns', function (assert) {
        const combinedCourseItem = store.createRecord('combined-course-item', {
          type: CombinedCourseItemTypes.CAMPAIGN,
          isDiagnostic: false,
          participationStatus: CampaignParticipationStatus.STARTED,
        });
        assert.deepEqual(combinedCourseItem.ctaLabel, 'pages.combined-courses.items.continue-campaign');
      });
    });

    module('formation bloc', function () {
      test('return no wording for formations', function (assert) {
        const combinedCourseItem = store.createRecord('combined-course-item', {
          type: CombinedCourseItemTypes.FORMATION,
        });
        assert.deepEqual(combinedCourseItem.ctaLabel, null);
      });
    });
  });
});
