import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { A } from '@ember/array';

module('Unit | Model | certification report', function (hooks) {
  setupTest(hooks);

  test('it should return the right data in the finalized session model', function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('certification-report', {
      id: 123,
      firstName: 'Clément',
      lastName: 'Tine',
      certificationCourseId: 987,
      hasSeenEndTestScreen: false,
    });

    assert.notPropEqual(model.id, 123);
    assert.deepEqual(model.firstName, 'Clément');
    assert.deepEqual(model.lastName, 'Tine');
    assert.deepEqual(model.certificationCourseId, 987);
    assert.false(model.hasSeenEndTestScreen);
    assert.deepEqual(model.firstIssueReportDescription, '');
  });

  module('#firstIssueReportDescription', function () {
    test('it should the first description of certification issue report', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const description = 'Il était en retard à la certification';
      const issueReport = store.createRecord('certification-issue-report', {
        description,
        category: 'Retard',
      });
      const certificationReport = store.createRecord('certification-report', {
        id: 123,
        certificationIssueReports: A([issueReport]),
        hasSeenEndTestScreen: false,
      });
      // when / then
      assert.deepEqual(certificationReport.firstIssueReportDescription, description);
    });
  });
});
