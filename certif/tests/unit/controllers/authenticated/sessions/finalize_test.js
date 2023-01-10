import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

const FINALIZE_PATH = 'authenticated/sessions/finalize';

module('Unit | Controller | ' + FINALIZE_PATH, function (hooks) {
  setupTest(hooks);

  module('#computed uncheckedHasSeenEndTestScreenCount', function () {
    test('it should count no unchecked box if no report', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      controller.model = store.createRecord('session', {
        certificationReports: [],
      });

      // when
      const uncheckedHasSeenEndTestScreenCount = controller.uncheckedHasSeenEndTestScreenCount;

      // then
      assert.strictEqual(uncheckedHasSeenEndTestScreenCount, 0);
    });

    test('it should count unchecked boxes', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationReportA = store.createRecord('certification-report', {
        hasSeenEndTestScreen: true,
        isCompleted: true,
      });
      const certificationReportB = store.createRecord('certification-report', {
        hasSeenEndTestScreen: false,
        isCompleted: true,
      });
      const certificationReportC = store.createRecord('certification-report', {
        hasSeenEndTestScreen: false,
        isCompleted: true,
      });
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      controller.model = store.createRecord('session', {
        certificationReports: [certificationReportA, certificationReportB, certificationReportC],
      });

      // when
      const uncheckedHasSeenEndTestScreenCount = controller.uncheckedHasSeenEndTestScreenCount;

      // then
      assert.strictEqual(uncheckedHasSeenEndTestScreenCount, 2);
    });
  });

  module('#computed hasUncheckedHasSeenEndTestScreen', function () {
    test('it should be false if no unchecked certification reports', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationReportA = store.createRecord('certification-report', {
        hasSeenEndTestScreen: true,
        isCompleted: true,
      });
      const certificationReportB = store.createRecord('certification-report', {
        hasSeenEndTestScreen: true,
        isCompleted: true,
      });
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      controller.model = store.createRecord('session', {
        certificationReports: [certificationReportA, certificationReportB],
      });

      // when
      const hasUncheckedHasSeenEndTestScreen = controller.hasUncheckedHasSeenEndTestScreen;

      // then
      assert.false(hasUncheckedHasSeenEndTestScreen);
    });

    test('it should be true if at least one unchecked certification reports', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const certificationReportA = store.createRecord('certification-report', {
        hasSeenEndTestScreen: true,
        isCompleted: true,
      });
      const certificationReportB = store.createRecord('certification-report', {
        hasSeenEndTestScreen: false,
        isCompleted: true,
      });
      controller.model = store.createRecord('session', {
        certificationReports: [certificationReportA, certificationReportB],
      });

      // when
      const hasUncheckedHasSeenEndTestScreen = controller.hasUncheckedHasSeenEndTestScreen;

      // then
      assert.true(hasUncheckedHasSeenEndTestScreen);
    });
  });

  module('#computed shouldDisplayHasSeenEndTestScreenCheckbox', function () {
    test('it should return false if the session has supervisor access', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      controller.model = store.createRecord('session', {
        certificationReports: [],
        hasSupervisorAccess: true,
      });

      // when
      const result = controller.shouldDisplayHasSeenEndTestScreenCheckbox;

      // then
      assert.false(result);
    });

    test('it should return true if the session does not have supervisor access', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      controller.model = store.createRecord('session', {
        certificationReports: [],
        hasSupervisorAccess: false,
      });

      // when
      const result = controller.shouldDisplayHasSeenEndTestScreenCheckbox;

      // then
      assert.true(result);
    });
  });

  module('#action updateExaminerGlobalComment', function () {
    test('it should left session examiner global comment untouched if input value exceeds max size', function (assert) {
      // given
      const initialValue = null;
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = { examinerGlobalComment: initialValue };
      controller.model = session;
      controller.examinerGlobalCommentMaxLength = 5;

      // when
      controller.send('updateExaminerGlobalComment', { target: { value: 'MoreThan5Characters' } });

      // then
      assert.strictEqual(session.examinerGlobalComment, initialValue);
    });

    test('it should update session examiner global comment if input value is not exceeding max size', function (assert) {
      // given
      const initialValue = null;
      const newValue = 'hello';
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = { examinerGlobalComment: initialValue };
      controller.model = session;

      // when
      controller.send('updateExaminerGlobalComment', { target: { value: newValue } });

      // then
      assert.strictEqual(session.examinerGlobalComment, newValue);
    });

    test('it should update session examiner global comment to null if trimmed input value is still empty', function (assert) {
      // given
      const initialValue = 'initialValue';
      const newValue = '  ';
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = { examinerGlobalComment: initialValue };
      controller.model = session;

      // when
      controller.send('updateExaminerGlobalComment', { target: { value: newValue } });

      // then
      assert.strictEqual(session.examinerGlobalComment, null);
    });
  });

  module('#toggleCertificationReportHasSeenEndTestScreen', function () {
    test('it should toggle the hasSeenEndTestScreen attribute of the certif parameter', function (assert) {
      // given
      const initialValue = true;
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const certifReport = { hasSeenEndTestScreen: initialValue };

      // when
      controller.send('toggleCertificationReportHasSeenEndTestScreen', certifReport);

      // then
      assert.strictEqual(certifReport.hasSeenEndTestScreen, !initialValue);
    });
  });

  module('#toggleAllCertificationReportsHasSeenEndTestScreen', function () {
    [
      { hasSeenEndTestScreen1: true, hasSeenEndTestScreen2: true, expectedState: false },
      { hasSeenEndTestScreen1: true, hasSeenEndTestScreen2: false, expectedState: false },
      { hasSeenEndTestScreen1: false, hasSeenEndTestScreen2: true, expectedState: false },
      { hasSeenEndTestScreen1: false, hasSeenEndTestScreen2: false, expectedState: true },
    ].forEach(({ hasSeenEndTestScreen1, hasSeenEndTestScreen2, expectedState }) =>
      test('it should toggle the hasSeenEndTestScreen attribute of all certifs in session to false depending on if some were checked', function (assert) {
        // given
        const someWereChecked = hasSeenEndTestScreen1 || hasSeenEndTestScreen2;
        const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
        const session = {
          certificationReports: [
            { hasSeenEndTestScreen: hasSeenEndTestScreen1, isCompleted: true },
            { hasSeenEndTestScreen: hasSeenEndTestScreen2, isCompleted: true },
          ],
        };
        controller.model = session;

        // when
        controller.send('toggleAllCertificationReportsHasSeenEndTestScreen', someWereChecked);

        // then
        assert.strictEqual(session.certificationReports[0].hasSeenEndTestScreen, expectedState);
        assert.strictEqual(session.certificationReports[1].hasSeenEndTestScreen, expectedState);
      })
    );

    test('it should toggle the hasSeenEndTestScreen attribute only for completed certifs in session', function (assert) {
      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = {
        certificationReports: [
          { hasSeenEndTestScreen: false, isCompleted: true },
          { hasSeenEndTestScreen: false, isCompleted: false },
        ],
      };
      controller.model = session;

      // when
      controller.send('toggleAllCertificationReportsHasSeenEndTestScreen', false);

      // then
      assert.true(session.certificationReports[0].hasSeenEndTestScreen);
      assert.false(session.certificationReports[1].hasSeenEndTestScreen);
    });
  });

  module('#action openModal', function () {
    test('it should set flag showConfirmModal to true', function (assert) {
      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = {
        certificationReports: [{ isCompleted: true }, { isCompleted: true }],
      };
      controller.model = session;

      // when
      controller.send('openModal');

      // then
      assert.true(controller.showConfirmModal);
    });
  });

  module('#action close', function () {
    test('it should set flag showConfirmModal to false', function (assert) {
      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);

      // when
      controller.send('closeModal');

      // then
      assert.false(controller.showConfirmModal);
    });
  });

  module('#abort', function () {
    test('should abort a certification report', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationReport = store.createRecord('certification-report');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      certificationReport.abort = sinon.stub();
      certificationReport.abort.resolves('ok');
      const optionSelected = 'coucou';

      // when
      controller.abort(certificationReport, optionSelected);

      // then
      sinon.assert.calledWithExactly(certificationReport.abort, 'coucou');
      assert.ok(true);
    });
  });

  module('#action toggleIncidentDuringCertificationSession', function () {
    test('it should set hasIncident to true', function (assert) {
      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = {
        hasIncident: false,
      };
      const displayIncidentDuringCertificationSession = true;
      controller.model = session;

      // when
      controller.send('toggleIncidentDuringCertificationSession', displayIncidentDuringCertificationSession);

      // then
      assert.true(session.hasIncident);
    });
  });

  module('#action toggleIssueWithJoiningSession', function () {
    test('it should set hasJoiningIssue to true', function (assert) {
      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = {
        hasJoiningIssue: false,
      };
      const displayJoiningIssue = true;
      controller.model = session;

      // when
      controller.send('toggleSessionJoiningIssue', displayJoiningIssue);

      // then
      assert.true(session.hasJoiningIssue);
    });
  });
});
