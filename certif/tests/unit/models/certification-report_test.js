import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { A } from '@ember/array';

module('Unit | Model | certification report', function (hooks) {
  setupTest(hooks);

  test('it should return the right data in the finalized session model', function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const model = run(() =>
      store.createRecord('certification-report', {
        id: 123,
        firstName: 'Clément',
        lastName: 'Tine',
        certificationCourseId: 987,
        hasSeenEndTestScreen: false,
      })
    );

    // when / then
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(model.id, 123);
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(model.firstName, 'Clément');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(model.lastName, 'Tine');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(model.certificationCourseId, 987);
    assert.false(model.hasSeenEndTestScreen);
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(model.firstIssueReportDescription, '');
  });

  module('#firstIssueReportDescription', function () {
    test('it should the first description of certification issue report', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const description = 'Il était en retard à la certification';
      const issueReport = run(() =>
        store.createRecord('certification-issue-report', {
          description,
          category: 'Retard',
        })
      );
      const certificationReport = run(() =>
        store.createRecord('certification-report', {
          id: 123,
          certificationIssueReports: A([issueReport]),
          hasSeenEndTestScreen: false,
        })
      );

      // when / then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(certificationReport.firstIssueReportDescription, description);
    });
  });
});
