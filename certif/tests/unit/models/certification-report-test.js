import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { A } from '@ember/array';

module('Unit | Model | certification report', (hooks) => {
  setupTest(hooks);

  test('it should return the right data in the finalized session model', function(assert) {
    // given
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('certification-report', {
      id: 123,
      firstName: 'Clément',
      lastName: 'Tine',
      certificationCourseId: 987,
      hasSeenEndTestScreen: false,
    }));

    // when / then
    assert.equal(model.id, 123);
    assert.equal(model.firstName, 'Clément');
    assert.equal(model.lastName, 'Tine');
    assert.equal(model.certificationCourseId, 987);
    assert.equal(model.hasSeenEndTestScreen, false);
    assert.equal(model.firstIssueReportDescription, '');
  });

  module('#firstIssueReportDescription', () => {
    test('it should the first description of certification issue report', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const description = 'Il était en retard à la certification';
      const issueReport = run(() => store.createRecord('certification-issue-report', {
        description,
        category: 'Retard',
      }));
      const certificationReport = run(() => store.createRecord('certification-report', {
        id: 123,
        certificationIssueReports: A([ issueReport ]),
        hasSeenEndTestScreen: false,
      }));

      // when / then
      assert.equal(certificationReport.firstIssueReportDescription, description);
    });
  });
});
