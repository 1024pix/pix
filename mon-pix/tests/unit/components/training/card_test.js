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
        const component = createGlimmerComponent('component:training/card', { training });

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
      const component = createGlimmerComponent('component:training/card', { training });
      const getRandomImageNumberSpy = sinon.spy(component, '_getRandomImageNumber');

      // when
      const result = component.imageSrc;

      // then
      assert.ok(new RegExp(/\/images\/illustrations\/trainings\/Illu_Webinaire-[1-3].png/g).test(result));
      assert.true(getRandomImageNumberSpy.called);
    });

    test('should return appropriate image src for training type autoformation', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'autoformation' });
      const component = createGlimmerComponent('component:training/card', { training });
      const getRandomImageNumberSpy = sinon.spy(component, '_getRandomImageNumber');

      // when
      const result = component.imageSrc;

      // then
      assert.ok(new RegExp(/\/images\/illustrations\/trainings\/Illu_Parcours_autoformation-[1-3].png/g).test(result));
      assert.true(getRandomImageNumberSpy.called);
    });
  });

  module('#tagColor', function () {
    test('should return appropriate tag color for given type webinaire', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'webinaire' });
      const component = createGlimmerComponent('component:training/card', { training });

      // when
      const result = component.tagColor;

      // then
      assert.strictEqual(result, 'purple-light');
    });

    test('should return appropriate tag color for given type autoformation', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'autoformation' });
      const component = createGlimmerComponent('component:training/card', { training });

      // when
      const result = component.tagColor;

      // then
      assert.strictEqual(result, 'blue-light');
    });
  });
});
