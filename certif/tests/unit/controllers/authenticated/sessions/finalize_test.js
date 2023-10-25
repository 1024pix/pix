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

    test('it should count unchecked boxes', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = await _createSessionWithCertificationReports({
        store,
        certificationReportsData: [
          {
            hasSeenEndTestScreen: true,
            isCompleted: true,
          },
          {
            hasSeenEndTestScreen: false,
            isCompleted: true,
          },
          {
            hasSeenEndTestScreen: false,
            isCompleted: true,
          },
        ],
      });
      controller.model = session;

      // when
      const uncheckedHasSeenEndTestScreenCount = controller.uncheckedHasSeenEndTestScreenCount;

      // then
      assert.strictEqual(uncheckedHasSeenEndTestScreenCount, 2);
    });
  });

  module('#computed hasUncheckedHasSeenEndTestScreen', function () {
    test('it should be false if no unchecked certification reports', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      controller.model = await _createSessionWithCertificationReports({
        store,
        certificationReportsData: [
          {
            hasSeenEndTestScreen: true,
            isCompleted: true,
          },
          {
            hasSeenEndTestScreen: true,
            isCompleted: true,
          },
        ],
      });

      // when
      const hasUncheckedHasSeenEndTestScreen = controller.hasUncheckedHasSeenEndTestScreen;

      // then
      assert.false(hasUncheckedHasSeenEndTestScreen);
    });

    test('it should be true if at least one unchecked certification reports', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);

      controller.model = await _createSessionWithCertificationReports({
        store,
        certificationReportsData: [
          {
            hasSeenEndTestScreen: true,
            isCompleted: true,
          },
          {
            hasSeenEndTestScreen: false,
            isCompleted: true,
          },
        ],
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
      const store = this.owner.lookup('service:store');
      const initialValue = null;
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = store.createRecord('session', { examinerGlobalComment: initialValue });
      controller.model = session;
      controller.examinerGlobalCommentMaxLength = 5;

      // when
      controller.send('updateExaminerGlobalComment', { target: { value: 'MoreThan5Characters' } });

      // then
      assert.strictEqual(session.examinerGlobalComment, initialValue);
    });

    test('it should update session examiner global comment if input value is not exceeding max size', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const initialValue = null;
      const newValue = 'hello';
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = store.createRecord('session', { examinerGlobalComment: initialValue });
      controller.model = session;

      // when
      controller.send('updateExaminerGlobalComment', { target: { value: newValue } });

      // then
      assert.strictEqual(session.examinerGlobalComment, newValue);
    });

    test('it should update session examiner global comment to null if trimmed input value is still empty', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const initialValue = 'initialValue';
      const newValue = '  ';
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = store.createRecord('session', { examinerGlobalComment: initialValue });
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
      test('it should toggle the hasSeenEndTestScreen attribute of all certifs in session to false depending on if some were checked', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const someWereChecked = hasSeenEndTestScreen1 || hasSeenEndTestScreen2;
        const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
        const eventStub = { srcElement: { checked: sinon.stub() } };
        const session = await _createSessionWithCertificationReports({
          store,
          certificationReportsData: [
            {
              hasSeenEndTestScreen: hasSeenEndTestScreen1,
              isCompleted: true,
            },
            {
              hasSeenEndTestScreen: hasSeenEndTestScreen2,
              isCompleted: true,
            },
          ],
        });

        controller.model = session;

        // when
        controller.send('toggleAllCertificationReportsHasSeenEndTestScreen', someWereChecked, eventStub);

        // then
        const [firstReport, secondReport] = session.hasMany('certificationReports').value().slice();
        assert.strictEqual(firstReport.hasSeenEndTestScreen, expectedState);
        assert.strictEqual(secondReport.hasSeenEndTestScreen, expectedState);
      }),
    );

    test('it should toggle the hasSeenEndTestScreen attribute only for completed certifs in session', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const eventStub = { srcElement: { checked: sinon.stub() } };
      const session = await _createSessionWithCertificationReports({
        store,
        certificationReportsData: [
          {
            hasSeenEndTestScreen: false,
            isCompleted: true,
          },
          {
            hasSeenEndTestScreen: false,
            isCompleted: false,
          },
        ],
      });

      controller.model = session;

      // when
      controller.send('toggleAllCertificationReportsHasSeenEndTestScreen', false, eventStub);

      // then
      const [firstReport, secondReport] = session.hasMany('certificationReports').value().slice();

      assert.true(firstReport.hasSeenEndTestScreen);
      assert.false(secondReport.hasSeenEndTestScreen);
    });
  });

  module('#action openModal', function () {
    test('it should set flag showConfirmModal to true', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = await _createSessionWithCertificationReports({
        store,
        certificationReportsData: [{ isCompleted: true }, { isCompleted: true }],
      });
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
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = store.createRecord('session', {
        hasIncident: false,
      });
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
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = store.createRecord('session', {
        hasJoiningIssue: false,
      });
      controller.model = session;
      const displayJoiningIssue = true;

      // when
      controller.send('toggleSessionJoiningIssue', displayJoiningIssue);

      // then
      assert.true(session.hasJoiningIssue);
    });
  });
});

async function _createSessionWithCertificationReports({ store, sessionData = {}, certificationReportsData = [] }) {
  const session = store.createRecord('session', sessionData);

  if (certificationReportsData.length) {
    const certificationReports = await session.get('certificationReports');
    certificationReportsData.forEach(certificationReports.createRecord);
  }

  return session;
}
