import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import sinon from 'sinon';

module('Unit | Component | Training | card', function (hooks) {
  setupTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#durationFormatted', function () {
    [
      {
        duration: {
          hours: 10,
          minutes: 11,
          seconds: 12,
        },
        expectedResult: '10h 11m 12s',
      },
      {
        duration: {
          hours: 10,
        },
        expectedResult: '10h',
      },
      {
        duration: {
          minutes: 11,
        },
        expectedResult: '11m',
      },
      {
        duration: {
          seconds: 12,
        },
        expectedResult: '12s',
      },
      {
        duration: {
          minutes: 11,
          seconds: 12,
        },
        expectedResult: '11m 12s',
      },
      {
        duration: {
          hours: 10,
          seconds: 12,
        },
        expectedResult: '10h 12s',
      },
      {
        duration: {
          hours: 10,
          minutes: 11,
        },
        expectedResult: '10h 11m',
      },
    ].forEach(({ duration, expectedResult }) => {
      test(`should return ${expectedResult} for given duration ${JSON.stringify(duration)}`, function (assert) {
        // given
        const training = store.createRecord('training', { duration });
        const component = createGlimmerComponent('training/card', { training });

        // when
        const result = component.durationFormatted;

        // then
        assert.strictEqual(result, expectedResult);
      });
    });
  });

  module('#imageSrc', function () {
    test('should return appropriate image src for training type webinaire', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'webinaire' });
      const component = createGlimmerComponent('training/card', { training });
      const getRandomImageNumberSpy = sinon.spy(component, '_getRandomImageNumber');

      // when
      const result = component.imageSrc;

      // then
      assert.ok(new RegExp(/\/images\/illustrations\/trainings\/Formation-Webinaire-[1-3].svg/g).test(result));
      assert.true(getRandomImageNumberSpy.called);
    });

    test('should return appropriate image src for training type autoformation', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'autoformation' });
      const component = createGlimmerComponent('training/card', { training });
      const getRandomImageNumberSpy = sinon.spy(component, '_getRandomImageNumber');

      // when
      const result = component.imageSrc;

      // then
      assert.ok(
        new RegExp(/\/images\/illustrations\/trainings\/Formation-Parcours_autoformation-[1-3].svg/g).test(result),
      );
      assert.true(getRandomImageNumberSpy.called);
    });

    test('should return appropriate image src for training type e-learning', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'e-learning' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.imageSrc;

      // then
      assert.ok(new RegExp(/\/images\/illustrations\/trainings\/Formation-E-learning-1.svg/g).test(result));
    });

    test('should return appropriate image src for training type hybrid-training', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'hybrid-training' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.imageSrc;

      // then
      assert.ok(new RegExp(/\/images\/illustrations\/trainings\/Formation-Hybrid_training-1.svg/g).test(result));
    });

    test('should return appropriate image src for training type in-person-training', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'in-person-training' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.imageSrc;

      // then
      assert.ok(
        new RegExp(/\/images\/illustrations\/trainings\/Formation-Instructor_lead_training-1.svg/g).test(result),
      );
    });
  });

  module('#tagColor', function () {
    test('should return appropriate tag color for given type webinaire', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'webinaire' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.tagColor;

      // then
      assert.strictEqual(result, 'tertiary');
    });

    test('should return appropriate tag color for given type autoformation', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'autoformation' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.tagColor;

      // then
      assert.strictEqual(result, 'primary');
    });

    test('should return appropriate tag color for given type e-learning', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'e-learning' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.tagColor;

      // then
      assert.strictEqual(result, 'success');
    });

    test('should return appropriate tag color for given type hybrid-training', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'hybrid-training' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.tagColor;

      // then
      assert.strictEqual(result, 'error');
    });

    test('should return appropriate tag color for given type in-person-training', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'in-person-training' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.tagColor;

      // then
      assert.strictEqual(result, 'secondary');
    });
  });
});
