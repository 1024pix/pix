import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Component | Training | card', function (hooks) {
  setupTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#durationFormatted', function () {
    [
      { duration: { days: 2 }, expectedResult: '2j' },
      { duration: { hours: 2 }, expectedResult: '2h' },
      { duration: { minutes: 2 }, expectedResult: '2min' },
      { duration: { hours: 10, minutes: 2 }, expectedResult: '10h 2min' },
      { duration: { days: 1, hours: 4 }, expectedResult: '1j 4h' },
      { duration: { days: 1, minutes: 30 }, expectedResult: '1j 30min' },
      { duration: { days: 1, hours: 4, minutes: 30 }, expectedResult: '1j 4h 30min' },
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
      assert.ok(new RegExp(/https:\/\/images.pix.fr\/contenu-formatif\/type\/Webinaire-[1-3].svg/g).test(result));
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
      assert.ok(new RegExp(/https:\/\/images.pix.fr\/contenu-formatif\/type\/Autoformation-[1-3].svg/g).test(result));
      assert.true(getRandomImageNumberSpy.called);
    });

    test('should return appropriate image src for training type e-learning', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'e-learning' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.imageSrc;

      // then
      assert.ok(new RegExp(/https:\/\/images.pix.fr\/contenu-formatif\/type\/E-learning-1.svg/g).test(result));
    });

    test('should return appropriate image src for training type hybrid-training', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'hybrid-training' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.imageSrc;

      // then
      assert.ok(new RegExp(/https:\/\/images.pix.fr\/contenu-formatif\/type\/Hybrid-1.svg/g).test(result));
    });

    test('should return appropriate image src for training type in-person-training', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'in-person-training' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.imageSrc;

      // then
      assert.ok(new RegExp(/https:\/\/images.pix.fr\/contenu-formatif\/type\/In-person-1.svg/g).test(result));
    });

    test('should return appropriate image src for training type modulix', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'modulix' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.imageSrc;

      // then
      assert.ok(new RegExp(/https:\/\/images.pix.fr\/contenu-formatif\/type\/Modulix-[1-3].svg/g).test(result));
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

    test('should return appropriate tag color for given type modulix', function (assert) {
      // given
      const training = store.createRecord('training', { type: 'modulix' });
      const component = createGlimmerComponent('training/card', { training });

      // when
      const result = component.tagColor;

      // then
      assert.strictEqual(result, 'primary');
    });
  });

  module('#trackAccess', function () {
    test('should push event on click', function (assert) {
      // given
      const metrics = this.owner.lookup('service:metrics');
      metrics.add = sinon.stub();
      const trainingTitle = 'Mon super CF';
      const component = createGlimmerComponent('training/card', {
        training: { title: trainingTitle, link: 'https://exemple.net/' },
      });
      const currentRouteName = 'current.route.name';
      component.router = { currentRouteName };

      // when
      component.trackAccess();

      // then
      sinon.assert.calledWithExactly(metrics.add, {
        event: 'custom-event',
        'pix-event-category': 'Accès Contenu Formatif',
        'pix-event-action': `Click depuis : ${currentRouteName}`,
        'pix-event-name': `Ouvre le cf : ${trainingTitle}`,
      });
      assert.ok(true);
    });
  });
});
