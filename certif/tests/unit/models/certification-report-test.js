import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | finalized session', function(hooks) {
  setupTest(hooks);

  test('it should return the right data in the finalized session model', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('certification-report', {
      id: 123,
      firstName: 'Clément',
      lastName: 'Tine',
      certificationCourseId: 987,
      examinerComment: 'Il a eu un soucis à la question 4',
      hasSeenEndTestScreen: false,
    }));

    // then
    assert.equal(model.id, 123);
    assert.equal(model.firstName, 'Clément');
    assert.equal(model.lastName, 'Tine');
    assert.equal(model.certificationCourseId, 987);
    assert.equal(model.examinerComment, 'Il a eu un soucis à la question 4');
    assert.equal(model.hasSeenEndTestScreen, false);
  });
});
