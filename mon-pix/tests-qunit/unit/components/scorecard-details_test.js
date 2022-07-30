import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | scorecard-details ', function (hooks) {
  setupTest(hooks);

  module('#level', function () {
    test('returns null if the scorecard isNotStarted', function (assert) {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: { isNotStarted: true } });

      // then
      assert.equal(component.level, null);
    });

    test('returns the level if the scorecard is not isNotStarted', function (assert) {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: { level: 1 } });

      // then
      assert.equal(component.level, 1);
    });
  });

  module('#isProgressable', function () {
    test('returns false if isMaxLevel', function (assert) {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: { isMaxLevel: true } });

      // then
      assert.false(component.isProgressable);
    });

    test('returns false if isNotStarted', function (assert) {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: { isNotStarted: true } });

      // then
      assert.false(component.isProgressable);
    });

    test('returns false if isFinished', function (assert) {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: { isFinished: true } });

      // then
      assert.false(component.isProgressable);
    });

    test('returns true otherwise', function (assert) {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: {} });

      // then
      assert.true(component.isProgressable);
    });
  });

  module('#canImprove', function () {
    test('returns true if maxlevel not reached', function (assert) {
      // when
      const component = createGlimmerComponent('component:scorecard-details', {
        scorecard: { isFinishedWithMaxLevel: false },
      });

      // then
      assert.true(component.canImprove);
    });

    test('returns false if maxlevel reached', function (assert) {
      // when
      const component = createGlimmerComponent('component:scorecard-details', {
        scorecard: { isFinishedWithMaxLevel: true },
      });

      // then
      assert.false(component.canImprove);
    });
  });

  module('#tutorialsGroupedByTubeName', function () {
    test('returns an array of tubes with related tutorials', function (assert) {
      // given
      const tutorial_1 = EmberObject.create({
        modelName: 'tutorial',
        id: 'recR17mopxC9VAmGp',
        title: 'Définition : Lorem Ipsum',
        tubeName: '@web',
        tubePracticalTitle: 'Lorem Ipsum dolor sit',
      });

      const tutorial_2 = EmberObject.create({
        modelName: 'tutorial',
        id: 'recR17mopxC9VAopm',
        title: 'Lorem Ipsum',
        tubeName: '@web',
        tubePracticalTitle: 'Lorem Ipsum dolor sit',
      });

      const tutorial_3 = EmberObject.create({
        modelName: 'tutorial',
        id: 'recR17mopxC9VAoap',
        title: 'Définition : Lorem Ipsum',
        tubeName: '@url',
        tubePracticalTitle: 'Lorem Ipsum dolor sit',
      });

      const tutorials = [tutorial_1, tutorial_2, tutorial_3];
      const scorecard = EmberObject.create({ tutorials });
      const component = createGlimmerComponent('component:scorecard-details', { scorecard });

      const expectedResult = [
        {
          name: tutorial_1.tubeName,
          practicalTitle: tutorial_1.tubePracticalTitle,
          tutorials: [tutorial_1, tutorial_2],
        },
        {
          name: tutorial_3.tubeName,
          practicalTitle: tutorial_3.tubePracticalTitle,
          tutorials: [tutorial_3],
        },
      ];

      // when
      const result = component.tutorialsGroupedByTubeName;

      // then
      assert.deepEqual(result[0].name, expectedResult[0].name);
      assert.deepEqual(result[0].practicalTitle, expectedResult[0].practicalTitle);
      assert.equal(result[0].tutorials.length, 2);
      assert.deepEqual(result[0].tutorials[0].id, expectedResult[0].tutorials[0].id);
      assert.deepEqual(result[0].tutorials[1].id, expectedResult[0].tutorials[1].id);

      assert.deepEqual(result[1].name, expectedResult[1].name);
      assert.deepEqual(result[1].practicalTitle, expectedResult[1].practicalTitle);
      assert.equal(result[1].tutorials.length, 1);
      assert.deepEqual(result[1].tutorials[0].id, expectedResult[1].tutorials[0].id);
    });

    test('returns an empty array when there is no tutorials', function (assert) {
      // given
      const tutorials = [];
      const scorecard = EmberObject.create({ tutorials });
      const component = createGlimmerComponent('component:scorecard-details', { scorecard });

      const expectedResult = [];

      // when
      const result = component.tutorialsGroupedByTubeName;

      // then
      assert.deepEqual(result, expectedResult);
      assert.equal(result.length, 0);
    });
  });

  module('#improveCompetenceEvaluation', function () {
    const competenceId = 'recCompetenceId';
    const userId = 'userId';
    const scorecardId = 'scorecardId';
    const scorecard = EmberObject.create({ competenceId, id: scorecardId });
    let competenceEvaluation, component;

    test('calls competenceEvaluation service for improving', async function (assert) {
      // given
      component = createGlimmerComponent('component:scorecard-details', { scorecard });
      competenceEvaluation = Service.create({ improve: sinon.stub() });
      component.currentUser = EmberObject.create({ user: { id: userId } });
      component.competenceEvaluation = competenceEvaluation;

      // when
      await component.improveCompetenceEvaluation();

      // then
      assert.expect(0);
      sinon.assert.calledWith(competenceEvaluation.improve, { userId, competenceId, scorecardId });
    });
  });

  module('#shouldWaitBeforeImproving', function () {
    let component, scorecard;

    hooks.beforeEach(() => {
      const competenceId = 'recCompetenceId';
      scorecard = EmberObject.create({ competenceId });
      component = createGlimmerComponent('component:competence-card-default', { scorecard });
    });

    test('should return true when remaining days before improving are different than 0', function (assert) {
      // given
      scorecard.remainingDaysBeforeImproving = 3;

      // when
      const result = component.shouldWaitBeforeImproving;

      // then
      assert.true(result);
    });

    test('should return false when remaining days before improving are equal to 0', function (assert) {
      // given
      scorecard.remainingDaysBeforeImproving = 0;

      // when
      const result = component.shouldWaitBeforeImproving;

      // then
      assert.false(result);
    });
  });
});
