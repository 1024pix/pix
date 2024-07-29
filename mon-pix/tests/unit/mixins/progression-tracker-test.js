import EmberObject from '@ember/object';
import ProgressionTrackerMixin from 'mon-pix/mixins/progression-tracker';
import { module, test } from 'qunit';

module('Unit | Mixin | progression-tracker', function () {
  const steps = ['one', 'two', 'three'];
  const initialProgression = [
    EmberObject.create({ name: 'one', status: 'completed' }),
    EmberObject.create({ name: 'two', status: null }),
    EmberObject.create({ name: 'three', status: null }),
  ];
  const testProgression = [
    EmberObject.create({ name: 'one', status: 'completed' }),
    EmberObject.create({ name: 'two', status: 'completed' }),
    EmberObject.create({ name: 'three', status: null }),
  ];

  test('it should move automatically to the first step when initialized', function (assert) {
    const ProgressionTrackerObject = EmberObject.extend(ProgressionTrackerMixin);
    const s = ProgressionTrackerObject.create({ steps });
    assert.deepEqual(s.progression, initialProgression);
  });

  test('it should move forward to other step and update the state', function (assert) {
    const ProgressionTrackerObject = EmberObject.extend(ProgressionTrackerMixin);
    const s = ProgressionTrackerObject.create({ steps });
    s.next();
    assert.deepEqual(s.progression, testProgression);
    assert.strictEqual(s.activeStep, 'two');
  });

  test('it should move backward to other step and update the state', function (assert) {
    const ProgressionTrackerObject = EmberObject.extend(ProgressionTrackerMixin);
    const s = ProgressionTrackerObject.create({ steps });
    s.next();
    s.next();
    s.prev();
    assert.deepEqual(s.progression, testProgression);
    assert.strictEqual(s.activeStep, 'two');
  });

  test('it should not mutate the steps passed in', function (assert) {
    const ProgressionTrackerObject = EmberObject.extend(ProgressionTrackerMixin);
    const s = ProgressionTrackerObject.create({ steps });
    s.next();
    s.next();
    assert.deepEqual(s.steps, ['one', 'two', 'three']);
  });
});
