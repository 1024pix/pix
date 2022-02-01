import { module, test } from 'qunit';
import pick from 'lodash/pick';
import { setupTest } from 'ember-qunit';

module('Unit | Model | certification-candidate-for-supervising', function (hooks) {
  setupTest(hooks);

  test('it creates a CertificationCandidateForSupervising', function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const data = {
      firstName: 'Jean-Paul',
      lastName: 'Candidat',
      birthdate: '2000-12-25',
      extraTimePercentage: 10,
      authorizedToStart: true,
      assessmentStatus: 'started',
    };

    // when
    const model = store.createRecord('certification-candidate-for-supervising', data);

    // then
    assert.deepEqual(_pickModelData(data), _pickModelData(model));
  });

  module('#get hasStarted', () => {
    test('returns false if assessmentStatus is not started', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: null };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.false(model.hasStarted);
    });

    test('returns true if assessmentStatus is started', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: 'started' };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.true(model.hasStarted);
    });
  });

  module('#get hasCompleted', () => {
    test('returns false if assessmentStatus is started', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: 'started' };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.false(model.hasCompleted);
    });

    test('returns true if assessmentStatus is completed', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: 'completed' };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.true(model.hasCompleted);
    });

    test('returns true if assessmentStatus is endedBySupervisor', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: 'endedBySupervisor' };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.true(model.hasCompleted);
    });
  });

  function _pickModelData(certificationCandidate) {
    return pick(certificationCandidate, [
      'firstName',
      'lastName',
      'birthdate',
      'extraTimePercentage',
      'authorizedToStart',
      'assessmentStatus',
    ]);
  }
});
