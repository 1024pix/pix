import { A } from '@ember/array';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | certification report', function (hooks) {
  setupTest(hooks);

  test('it should return the right data in the finalized session model', function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('certification-report', {
      id: '123',
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
        id: '123',
        certificationIssueReports: A([issueReport]),
        hasSeenEndTestScreen: false,
      });
      // when / then
      assert.deepEqual(certificationReport.firstIssueReportDescription, description);
    });

    module('#isInvalid', function () {
      module('when the certification is incomplete', function () {
        module('when the certification has no abort reason', function () {
          test('it should return true', function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            const certificationReport = store.createRecord('certification-report', {
              isCompleted: false,
              abortReason: null,
            });
            // when / then
            assert.true(certificationReport.isInvalid);
          });
        });
        module('when the certification has abort reasons', function () {
          test('it should return false', function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            const certificationReport = store.createRecord('certification-report', {
              isCompleted: false,
              abortReason: 'technical',
            });
            // when / then
            assert.false(certificationReport.isInvalid);
          });
        });
      });

      module('when the certification is complete ', function () {
        module('when the certification has no abort reasons', function () {
          test('it should return false', function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            const certificationReport = store.createRecord('certification-report', {
              isCompleted: true,
              abortReason: null,
            });
            // when / then
            assert.false(certificationReport.isInvalid);
          });
        });
        module('when the certification has abort reasons', function () {
          test('it should return false', function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            const certificationReport = store.createRecord('certification-report', {
              isCompleted: true,
              abortReason: 'technical',
            });
            // when / then
            assert.false(certificationReport.isInvalid);
          });
        });
      });
    });
  });

  module('#toJSON', function () {
    test('it should create JSON from the object props', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationReport = store.createRecord('certification-report', {
        id: '123',
        certificationIssueReports: A([]),
        hasSeenEndTestScreen: true,
        certificationCourseId: 1,
        firstName: 'A',
        lastName: 'B',
        isCompleted: true,
        abortReason: true,
      });
      // when / then
      assert.deepEqual(certificationReport.toJSON(), {
        id: '123',
        hasSeenEndTestScreen: true,
        certificationCourseId: 1,
        firstName: 'A',
        lastName: 'B',
        isCompleted: true,
        abortReason: true,
      });
    });
  });
});
