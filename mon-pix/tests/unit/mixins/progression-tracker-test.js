import EmberObject from '@ember/object';
import ProgressionTrackerMixin from 'mon-pix/mixins/progression-tracker';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Unit | Mixin | progression-tracker', function() {

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

  it('it should move automatically to the first step when initialized', function() {
    const ProgressionTrackerObject = EmberObject.extend(ProgressionTrackerMixin);
    const s = ProgressionTrackerObject.create({ steps });
    expect(s.progression).to.deep.equal(initialProgression);
  });

  it('it should move forward to other step and update the state', function() {
    const ProgressionTrackerObject = EmberObject.extend(ProgressionTrackerMixin);
    const s = ProgressionTrackerObject.create({ steps });
    s.next();
    expect(s.progression).to.deep.equal(testProgression);
    expect(s.activeStep).to.equal('two');
  });

  it('it should move backward to other step and update the state', function() {
    const ProgressionTrackerObject = EmberObject.extend(ProgressionTrackerMixin);
    const s = ProgressionTrackerObject.create({ steps });
    s.next();
    s.next();
    s.prev();
    expect(s.progression).to.deep.equal(testProgression);
    expect(s.activeStep).to.equal('two');
  });

  it('it should not mutate the steps passed in', function() {
    const ProgressionTrackerObject = EmberObject.extend(ProgressionTrackerMixin);
    const s = ProgressionTrackerObject.create({ steps });
    s.next();
    s.next();
    expect(s.steps).to.deep.equal(['one', 'two', 'three']);
  });

});
