import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | Dashboard | Content', function (hooks) {
  let component;

  setupTest(hooks);

  hooks.beforeEach(function () {
    // given
    component = createGlimmerComponent('component:dashboard/content');
  });

  module('#recommendedScorecards', function () {
    test('should return non-started scorecards', function (assert) {
      // given
      const scorecards = [
        { id: 1, isNotStarted: true },
        { id: 2, isNotStarted: true },
        { id: 4, isNotStarted: true },
        { id: 5, isNotStarted: false },
        { id: 3, isNotStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, isNotStarted: true },
        { id: 2, isNotStarted: true },
        { id: 4, isNotStarted: true },
        { id: 3, isNotStarted: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.recommendedScorecards;

      // then
      assert.deepEqual(result, expectedScorecards);
    });

    test('should return scorecards ordered by index', function (assert) {
      // given
      const scorecards = [
        { id: 3, index: '3.1', isNotStarted: true },
        { id: 1, index: '1.1', isNotStarted: true },
        { id: 4, index: '2.4', isNotStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, index: '1.1', isNotStarted: true },
        { id: 4, index: '2.4', isNotStarted: true },
        { id: 3, index: '3.1', isNotStarted: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.recommendedScorecards;

      // then
      assert.deepEqual(result, expectedScorecards);
    });

    test('should return a maximum of four cards', function (assert) {
      // given
      const scorecards = [
        { id: 1, isNotStarted: true },
        { id: 2, isNotStarted: true },
        { id: 4, isNotStarted: true },
        { id: 5, isNotStarted: true },
        { id: 3, isNotStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, isNotStarted: true },
        { id: 2, isNotStarted: true },
        { id: 4, isNotStarted: true },
        { id: 5, isNotStarted: true },
      ];

      component.args.model = EmberObject.create({ scorecards });

      // when
      const result = component.recommendedScorecards;

      // then
      assert.deepEqual(result, expectedScorecards);
    });
  });

  module('#startedCompetences', function () {
    test('should return started competences', function (assert) {
      // given
      const scorecards = [
        { id: 1, isStarted: true },
        { id: 2, isStarted: true },
        { id: 4, isStarted: true },
        { id: 5, isStarted: false },
        { id: 3, isStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, isStarted: true },
        { id: 2, isStarted: true },
        { id: 4, isStarted: true },
        { id: 3, isStarted: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.startedCompetences;

      // then
      assert.deepEqual(result, expectedScorecards);
    });

    test('should return scorecards ordered by index', function (assert) {
      // given
      const scorecards = [
        { id: 3, index: '3.1', isStarted: true },
        { id: 1, index: '1.1', isStarted: true },
        { id: 4, index: '2.4', isStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, index: '1.1', isStarted: true },
        { id: 4, index: '2.4', isStarted: true },
        { id: 3, index: '3.1', isStarted: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.startedCompetences;

      // then
      assert.deepEqual(result, expectedScorecards);
    });

    test('should return a maximum of four cards', function (assert) {
      // given
      const scorecards = [
        { id: 1, isStarted: true },
        { id: 2, isStarted: true },
        { id: 4, isStarted: true },
        { id: 5, isStarted: true },
        { id: 3, isStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, isStarted: true },
        { id: 2, isStarted: true },
        { id: 4, isStarted: true },
        { id: 5, isStarted: true },
      ];

      component.args.model = EmberObject.create({ scorecards });

      // when
      const result = component.startedCompetences;

      // then
      assert.deepEqual(result, expectedScorecards);
    });
  });

  module('#improvableScorecards', function () {
    test('should return improvable scorecards', function (assert) {
      // given
      const scorecards = [
        { id: 1, isImprovable: false },
        { id: 2, isImprovable: false },
        { id: 5, isImprovable: true },
        { id: 3, isImprovable: false },
      ];

      const expectedScorecards = [{ id: 5, isImprovable: true }];

      component.args.model = { scorecards };

      // when
      const result = component.improvableScorecards;

      // then
      assert.deepEqual(result, expectedScorecards);
    });

    test('should return scorecards ordered by index', function (assert) {
      // given
      const scorecards = [
        { id: 3, index: '3.1', isImprovable: true },
        { id: 1, index: '1.1', isImprovable: true },
        { id: 4, index: '2.4', isImprovable: true },
      ];

      const expectedScorecards = [
        { id: 1, index: '1.1', isImprovable: true },
        { id: 4, index: '2.4', isImprovable: true },
        { id: 3, index: '3.1', isImprovable: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.improvableScorecards;

      // then
      assert.deepEqual(result, expectedScorecards);
    });

    test('should return a maximum of four cards', function (assert) {
      // given
      const scorecards = [
        { id: 1, isImprovable: true },
        { id: 2, isImprovable: true },
        { id: 4, isImprovable: true },
        { id: 5, isImprovable: true },
        { id: 3, isImprovable: true },
      ];

      const expectedScorecards = [
        { id: 1, isImprovable: true },
        { id: 2, isImprovable: true },
        { id: 4, isImprovable: true },
        { id: 5, isImprovable: true },
      ];

      component.args.model = EmberObject.create({ scorecards });

      // when
      const result = component.improvableScorecards;

      // then
      assert.deepEqual(result, expectedScorecards);
    });
  });

  module('#userFirstname', function () {
    test('should return userFirstname', function (assert) {
      // given
      const userFirstName = 'user firstname';
      component.currentUser = EmberObject.create({ user: { firstName: userFirstName } });

      // when
      const result = component.userFirstname;

      // then
      assert.strictEqual(result, userFirstName);
    });
  });

  module('#hasNothingToShow', function () {
    test('should return true when there is nothing to show', function (assert) {
      // given
      const scorecards = [
        { id: 1, isNotStarted: false, isStarted: false },
        { id: 2, isNotStarted: false, isStarted: false },
        { id: 4, isNotStarted: false, isStarted: false },
        { id: 5, isNotStarted: false, isStarted: false },
        { id: 3, isNotStarted: false, isStarted: false },
      ];

      component.args.model = { scorecards, campaignParticipationOverviews: [] };

      // when
      const result = component.hasNothingToShow;

      // then
      assert.true(result);
    });

    test('should return false when there is one competence started', function (assert) {
      // given
      const scorecards = [
        { id: 1, isNotStarted: false, isStarted: true },
        { id: 2, isNotStarted: false, isStarted: false },
        { id: 4, isNotStarted: false, isStarted: false },
        { id: 5, isNotStarted: false, isStarted: false },
        { id: 3, isNotStarted: false, isStarted: false },
      ];

      component.args.model = { scorecards, campaignParticipationOverviews: [] };

      // when
      const result = component.hasNothingToShow;

      // then
      assert.false(result);
    });

    test('should return false when there is one competence not started', function (assert) {
      // given
      const scorecards = [
        { id: 1, isNotStarted: false, isStarted: false },
        { id: 2, isNotStarted: true, isStarted: false },
        { id: 4, isNotStarted: false, isStarted: false },
        { id: 5, isNotStarted: false, isStarted: false },
        { id: 3, isNotStarted: false, isStarted: false },
      ];

      component.args.model = { scorecards, campaignParticipationOverviews: [] };

      // when
      const result = component.hasNothingToShow;

      // then
      assert.false(result);
    });

    test('should return false when there is one campaign participation', function (assert) {
      // given
      const scorecards = [
        { id: 1, isNotStarted: false, isStarted: false },
        { id: 2, isNotStarted: false, isStarted: false },
        { id: 4, isNotStarted: false, isStarted: false },
        { id: 5, isNotStarted: false, isStarted: false },
        { id: 3, isNotStarted: false, isStarted: false },
      ];
      const campaignParticipationOverviews = [{ id: 1 }];

      component.args.model = { scorecards, campaignParticipationOverviews };

      // when
      const result = component.hasNothingToShow;

      // then
      assert.false(result);
    });
  });

  module('#userScore', function () {
    test('should return user score', function (assert) {
      // given
      const pixScore = '68';
      component.currentUser = EmberObject.create({ user: { profile: EmberObject.create({ pixScore }) } });

      // when
      const result = component.userScore;

      // then
      assert.strictEqual(result, pixScore);
    });
  });
});
