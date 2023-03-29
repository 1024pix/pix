import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | tutorial panel', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:tutorial-panel');
  });

  module('#shouldDisplayHint', function () {
    test('should return true when hint is defined', function (assert) {
      // given
      component.args.hint = 'Un conseil...';

      // when
      const result = component.shouldDisplayHint;

      // then
      assert.true(result);
    });

    test('should return false when hint is not defined', function (assert) {
      // given
      component.args.hint = null;

      // when
      const result = component.shouldDisplayHint;

      // then
      assert.false(result);
    });

    test('should return false when hint is an empty array', function (assert) {
      // given
      component.args.hint = [];

      // when
      const result = component.shouldDisplayHint;

      // then
      assert.false(result);
    });
  });

  module('#shouldDisplayHintOrTuto', function () {
    test('should return true when hint is defined and tuto is not', function (assert) {
      // given
      component.args.hint = 'Un conseil...';
      component.args.tutorials = [];

      // when
      const result = component.shouldDisplayHintOrTuto;

      // then
      assert.true(result);
    });

    test('should return true when hint is not defined and tuto is defined', function (assert) {
      // given
      component.args.hint = null;
      component.args.tutorials = [{ id: 'recTuto' }];

      // when
      const result = component.shouldDisplayHintOrTuto;

      // then
      assert.true(result);
    });

    test('should return false when hint and tutorials are not defined', function (assert) {
      // given
      component.args.hint = null;
      component.args.tutorials = null;

      // when
      const result = component.shouldDisplayHintOrTuto;

      // then
      assert.false(result);
    });

    test('should return false when hint and tutorials are empty array', function (assert) {
      // given
      component.args.hint = [];
      component.args.tutorials = [];

      // when
      const result = component.shouldDisplayHintOrTuto;

      // then
      assert.false(result);
    });
  });

  module('#shouldDisplayTutorial', function () {
    test('should return true when has tutorial', function (assert) {
      // given
      const tutorialsExpected = {
        id: 'recTuto1',
        format: 'video',
      };
      component.args.tutorials = [tutorialsExpected];

      // when
      const result = component.shouldDisplayTutorial;

      // then
      assert.true(result);
    });

    test('should return false when tutorials is empty', function (assert) {
      // given
      component.args.tutorials = [];

      // when
      const result = component.shouldDisplayTutorial;

      // then
      assert.false(result);
    });

    test('should return false when tutorials is null', function (assert) {
      // given
      component.args.tutorials = null;

      // when
      const result = component.shouldDisplayTutorial;

      // then
      assert.false(result);
    });
  });

  module('#limitedTutorial', function () {
    test('should return an array with the same tutorials', function (assert) {
      // given
      const tutorialsExpected1 = {
        id: 'recTuto1',
        format: 'video',
      };
      const tutorialsExpected2 = {
        id: 'recTuto2',
        format: 'son',
      };
      const tutorials = [tutorialsExpected1, tutorialsExpected2];
      component.args.tutorials = tutorials;

      // when
      const result = component.limitedTutorials;

      // then
      assert.deepEqual(result, tutorials);
    });

    test('should return only 3 elements if the tutorials contains more', function (assert) {
      // given
      const tutorialsExpected1 = {
        id: 'recTuto1',
      };
      const tutorialsExpected2 = {
        id: 'recTuto2',
      };
      const tutorialsExpected3 = {
        id: 'recTuto3',
      };
      const tutorialsExpected4 = {
        id: 'recTuto4',
      };

      const tutorials = [tutorialsExpected1, tutorialsExpected2, tutorialsExpected3, tutorialsExpected4];
      const expectedTutorials = [tutorialsExpected1, tutorialsExpected2, tutorialsExpected3];
      component.args.tutorials = tutorials;

      // when
      const result = component.limitedTutorials;

      // then
      assert.strictEqual(result.length, 3);
      assert.deepEqual(result, expectedTutorials);
    });
  });
});
