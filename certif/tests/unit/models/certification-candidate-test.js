import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | certification-candidate', function(hooks) {
  setupTest(hooks);

  test('should return a human readable version of the candidate certificationCourseId', function(assert) {
    const certificationCandidate = run(() =>
      this.owner.lookup('service:store').createRecord('certification-candidate', { certificationCourseId: 12345 }));

    const actualReadableCertificationCourseId = certificationCandidate.readableCertificationCourseId;

    assert.equal(actualReadableCertificationCourseId, certificationCandidate.certificationCourseId.toLocaleString());
  });
});
