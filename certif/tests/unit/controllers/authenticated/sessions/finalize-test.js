import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../../../helpers/setup-intl';

const FINALIZE_PATH = 'authenticated/sessions/finalize';

module('Unit | Controller | ' + FINALIZE_PATH, function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  module('#action updateExaminerGlobalComment', function () {
    test('it should left session examiner global comment untouched if input value exceeds max size', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const initialValue = null;
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = store.createRecord('session-management', { examinerGlobalComment: initialValue });
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
      const session = store.createRecord('session-management', { examinerGlobalComment: initialValue });
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
      const session = store.createRecord('session-management', { examinerGlobalComment: initialValue });
      controller.model = session;

      // when
      controller.send('updateExaminerGlobalComment', { target: { value: newValue } });

      // then
      assert.strictEqual(session.examinerGlobalComment, null);
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

  module('#action toggleIncidentDuringCertificationSession', function () {
    test('it should set hasIncident to true', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = store.createRecord('session-management', {
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
      const session = store.createRecord('session-management', {
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

  module('#finalizeSession', function () {
    module('when there are no certification reports', function () {
      test('it finalizes the session', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const session = store.createRecord('session-management', {
          certificationReports: [],
        });
        const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
        controller.session = session;
        controller.router = {
          transitionTo: sinon.stub(),
        };
        controller.pixToast = {
          sendSuccessNotification: sinon.stub(),
        };
        session.save = sinon.stub();
        session.save.resolves();

        // when
        await controller.finalizeSession();

        // then
        sinon.assert.calledWithExactly(session.save, { adapterOptions: { finalization: true } });
        assert.ok(controller.pixToast.sendSuccessNotification.called);
        sinon.assert.calledWithExactly(controller.router.transitionTo, 'authenticated.sessions.details', session.id);
      });
    });

    module('when there are certification reports', function () {
      test('it finalizes the session', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationReport = store.createRecord('certification-report', {
          certificationCourseId: 123,
          abortReason: 'technical',
        });
        const adapter = this.owner.lookup('adapter:certification-report');
        adapter.abort = sinon.stub();
        const session = store.createRecord('session-management', {
          certificationReports: [certificationReport],
        });
        const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
        controller.session = session;
        controller.router = {
          transitionTo: sinon.stub(),
        };
        controller.pixToast = {
          sendSuccessNotification: sinon.stub(),
        };
        session.save = sinon.stub();
        session.save.resolves();

        // when
        await controller.finalizeSession();

        // then
        sinon.assert.calledOnceWithExactly(adapter.abort, {
          certificationCourseId: 123,
          reason: certificationReport.abortReason,
        });
        assert.ok(true);
      });
    });
  });
});

async function _createSessionWithCertificationReports({ store, sessionData = {}, certificationReportsData = [] }) {
  const session = store.createRecord('session-management', sessionData);

  if (certificationReportsData.length) {
    const certificationReports = await session.get('certificationReports');
    certificationReportsData.forEach(certificationReports.createRecord);
  }

  return session;
}
