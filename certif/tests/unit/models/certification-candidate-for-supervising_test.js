import { setupTest } from 'ember-qunit';
import pick from 'lodash/pick';
import { module, test } from 'qunit';

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
      startDateTime: new Date('2022-10-01T13:37:07Z'),
      theoricalEndDateTime: new Date('2022-10-01T15:07:07Z'),
      complementaryCertification: 'Super Certification Complémentaire',
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

  module('#get isAuthorizedToResume', function () {
    test('it returns true if candidate is authorized to start and has already started', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: 'started', authorizedToStart: true };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.true(model.isAuthorizedToResume);
    });

    test('it returns false if candidate is not authorized to start and has already started', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: 'started', authorizedToStart: false };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.false(model.isAuthorizedToResume);
    });

    test('it returns false if candidate is authorized to start and has not already started', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: null, authorizedToStart: true };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.false(model.isAuthorizedToResume);
    });

    test('it returns false if candidate is not authorized to start and has not already started', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: null, authorizedToStart: false };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.false(model.isAuthorizedToResume);
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
      'startDateTime',
      'theoricalEndDateTime',
      'complementaryCertification',
    ]);
  }
});
