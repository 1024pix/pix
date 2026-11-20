import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | campaign', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#hasCustomResultPageButton', function () {
    test('returns true when there are a button url and button text', function (assert) {
      // given
      const campaignParams = {
        customResultPageButtonUrl: 'https://example.net',
        customResultPageButtonText: 'a result page button text',
      };

      // when
      const campaign = store.createRecord('campaign', campaignParams);

      // then
      assert.true(campaign.hasCustomResultPageButton);
    });
    test('returns false when there is a button url but no button text', function (assert) {
      // given
      const campaignParams = {
        customResultPageButtonUrl: 'https://example.net',
        customResultPageButtonText: null,
      };

      // when
      const campaign = store.createRecord('campaign', campaignParams);

      // then
      assert.false(campaign.hasCustomResultPageButton);
    });
    test('returns false when there is a button text but no button url', function (assert) {
      const campaignParams = {
        customResultPageButtonUrl: null,
        customResultPageButtonText: 'a result button text',
      };

      // when
      const campaign = store.createRecord('campaign', campaignParams);

      // then
      assert.false(campaign.hasCustomResultPageButton);
    });
  });

  module('getter isAssessment', function () {
    test('returns true when campaign is of type ASSESSMENT', function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        type: 'ASSESSMENT',
      });

      // when
      const isAssessment = campaign.isAssessment;

      // then
      assert.true(isAssessment);
    });

    test('returns false otherwise', function (assert) {
      // given
      const campaign1 = store.createRecord('campaign', {
        type: 'PROFILES_COLLECTION',
      });
      const campaign2 = store.createRecord('campaign', {
        type: 'EXAM',
      });

      // when
      const isAssessment1 = campaign1.isAssessment;
      const isAssessment2 = campaign2.isAssessment;

      // then
      assert.false(isAssessment1);
      assert.false(isAssessment2);
    });
  });

  module('getter isProfilesCollection', function () {
    test('returns true when campaign is of type PROFILES_COLLECTION', function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        type: 'PROFILES_COLLECTION',
      });

      // when
      const isProfilesCollection = campaign.isProfilesCollection;

      // then
      assert.true(isProfilesCollection);
    });

    test('returns false otherwise', function (assert) {
      // given
      const campaign1 = store.createRecord('campaign', {
        type: 'EXAM',
      });
      const campaign2 = store.createRecord('campaign', {
        type: 'ASSESSMENT',
      });

      // when
      const isProfilesCollection1 = campaign1.isProfilesCollection;
      const isProfilesCollection2 = campaign2.isProfilesCollection;

      // then
      assert.false(isProfilesCollection1);
      assert.false(isProfilesCollection2);
    });
  });

  module('getter isExam', function () {
    test('returns true when campaign is of type EXAM', function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        type: 'EXAM',
      });

      // when
      const isExam = campaign.isExam;

      // then
      assert.true(isExam);
    });

    test('returns false otherwise', function (assert) {
      // given
      const campaign1 = store.createRecord('campaign', {
        type: 'PROFILES_COLLECTION',
      });
      const campaign2 = store.createRecord('campaign', {
        type: 'ASSESSMENT',
      });

      // when
      const isExam1 = campaign1.isExam;
      const isExam2 = campaign2.isExam;

      // then
      assert.false(isExam1);
      assert.false(isExam2);
    });
  });

  module('getter combinedCourseCode', function () {
    [
      { label: 'relative url', url: '/parcours/COMBINIX1' },
      { label: 'relative url to tunnel', url: '/parcours/COMBINIX1/checkpoint' },
      { label: 'absolute url', url: 'https://app.pix.fr/parcours/COMBINIX1' },
      { label: 'absolute url to tunnel', url: 'https://app.pix.fr/parcours/COMBINIX1/checkpoint' },
      { label: 'url with query params', url: '/parcours/COMBINIX1?foo=bar' },
      { label: 'url with hash', url: '/parcours/COMBINIX1#top' },
    ].forEach(({ label, url }) => {
      test(`returns the combined course code from a ${label}`, function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          customResultPageButtonUrl: url,
        });

        // when
        const combinedCourseCode = campaign.combinedCourseCode;

        // then
        assert.strictEqual(combinedCourseCode, 'COMBINIX1');
      });
    });

    test('returns null when campaign is not part of a combined course', function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        // TODO use isPartOfCombinedCourse false
        customResultPageButtonUrl: 'https://example.net',
      });

      // when
      const combinedCourseCode = campaign.combinedCourseCode;

      // then
      assert.strictEqual(combinedCourseCode, null);
    });

    test('returns null when there is no custom result page button url', function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        // TODO use isPartOfCombinedCourse true
        customResultPageButtonUrl: null,
      });

      // when
      const combinedCourseCode = campaign.combinedCourseCode;

      // then
      assert.strictEqual(combinedCourseCode, null);
    });

    test('returns null when the url does not contain a combined course code', function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        // TODO use isPartOfCombinedCourse true
        customResultPageButtonUrl: '/parcours/',
      });

      // when
      const combinedCourseCode = campaign.combinedCourseCode;

      // then
      assert.strictEqual(combinedCourseCode, null);
    });
  });
});
