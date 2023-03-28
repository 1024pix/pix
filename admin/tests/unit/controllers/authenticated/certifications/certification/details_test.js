import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import EmberObject from '@ember/object';

module('Unit | Controller | authenticated/certifications/certification/details', function (hooks) {
  setupTest(hooks);

  const answer = (result) => {
    return {
      skill: '@skill1',
      challengeId: 'rec12345',
      order: '1',
      result: 'ok',
      jury: result,
    };
  };

  const competence = (juryScore, ...results) => {
    return {
      name: 'Une compétence',
      index: '1.1',
      positionedLevel: 3,
      positionedScore: 26,
      obtainedLevel: 3,
      obtainedScore: 26,
      answers: results.slice(0, 3).map(answer),
      juryScore: juryScore ? 12 : false,
    };
  };

  test('it computes jury rate correctly', function (assert) {
    // given
    const controller = this.owner.lookup('controller:authenticated/certifications/certification/details');
    controller.set(
      'model',
      EmberObject.create({
        competences: [
          competence(false, 'ok', 'ok', 'skip'),
          competence(false, 'ok', 'ko', 'ok'),
          competence(false, 'ok', 'aband', 'ok'),
          competence(false, 'ok', 'timedout', 'ok'),
          competence(false, 'ok', 'ok', 'ok'),
        ],
      })
    );

    // when
    run(function () {
      controller.send('onUpdateRate');
    });

    // then
    assert.strictEqual(controller.get('juryRate'), 78.57);
  });

  test('it computes jury score correctly', function (assert) {
    // given
    const controller = this.owner.lookup('controller:authenticated/certifications/certification/details');
    controller.set(
      'model',
      EmberObject.create({
        competences: [
          competence(true, 'ok', 'ok', 'skip'),
          competence(false, 'ok', 'ko', 'ok'),
          competence(true, 'ok', 'aband', 'ok'),
          competence(false, 'ok', 'timedout', 'ok'),
          competence(true, 'ok', 'ok', 'ok'),
        ],
      })
    );

    // when
    run(function () {
      controller.send('onUpdateRate');
    });

    // then
    // 3 jury scores + 2 obtained scores
    assert.strictEqual(controller.get('juryScore'), 12 * 3 + 26 * 2);
  });

  module('#shouldDisplayJuryScore', function () {
    test('it returns true if the jury score is 0', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/details');
      controller.set('juryScore', 0);

      // when
      const shouldDisplayJuryScore = controller.shouldDisplayJuryScore;

      // then
      assert.true(shouldDisplayJuryScore);
    });

    test('it returns true if the jury score is a number', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/details');
      controller.set('juryScore', 3);

      // when
      const shouldDisplayJuryScore = controller.shouldDisplayJuryScore;

      // then
      assert.true(shouldDisplayJuryScore);
    });

    test('it returns false if the jury score is not a number', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/details');
      controller.set('juryScore', null);

      // when
      const shouldDisplayJuryScore = controller.shouldDisplayJuryScore;

      // then
      assert.false(shouldDisplayJuryScore);
    });
  });
});
