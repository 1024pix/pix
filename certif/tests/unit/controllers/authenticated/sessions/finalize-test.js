import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ArrayProxy from '@ember/array/proxy';

const FINALIZE_PATH = 'authenticated/sessions/finalize';

module('Unit | Controller | ' + FINALIZE_PATH, function(hooks) {
  setupTest(hooks);

  module('#computed uncheckedHasSeenEndTestScreenCount', function() {

    test('it should count no unchecked box if no report', function(assert) {
      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const sessions = ArrayProxy.create({
        certificationReports: []
      });
      controller.model = sessions;

      // when
      const uncheckedHasSeenEndTestScreenCount = controller.uncheckedHasSeenEndTestScreenCount;

      // then
      assert.equal(uncheckedHasSeenEndTestScreenCount, 0);
    });

    test('it should count unchecked boxes', function(assert) {

      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const sessions = ArrayProxy.create({
        certificationReports: [
          { hasSeenEndTestScreen: true },
          { hasSeenEndTestScreen: false },
          { hasSeenEndTestScreen: false },
          { hasSeenEndTestScreen: false },
          { hasSeenEndTestScreen: true },
        ]
      });
      controller.model = sessions;

      // when
      const uncheckedHasSeenEndTestScreenCount = controller.uncheckedHasSeenEndTestScreenCount;

      // then
      assert.equal(uncheckedHasSeenEndTestScreenCount, 3);
    });

    test('it should count 1 unchecked box if only one box (unchecked)', function(assert) {

      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const sessions = ArrayProxy.create({
        certificationReports: [
          { hasSeenEndTestScreen: false },
        ]
      });
      controller.model = sessions;

      // when
      const uncheckedHasSeenEndTestScreenCount = controller.uncheckedHasSeenEndTestScreenCount;

      // then
      assert.strictEqual(uncheckedHasSeenEndTestScreenCount, 1);
    });
  });

  module('#computed hasUncheckedHasSeenEndTestScreen', function() {

    test('it should be false if no unchecked certification reports', function(assert) {

      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const sessions = ArrayProxy.create({
        certificationReports: [
          { hasSeenEndTestScreen: true },
          { hasSeenEndTestScreen: true },
        ]
      });
      controller.model = sessions;

      // when
      const hasUncheckedHasSeenEndTestScreen = controller.hasUncheckedHasSeenEndTestScreen;

      // then
      assert.equal(hasUncheckedHasSeenEndTestScreen, false);
    });

    test('it should be true if at least one unchecked certification reports', function(assert) {

      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const sessions = ArrayProxy.create({
        certificationReports: [
          { hasSeenEndTestScreen: false },
          { hasSeenEndTestScreen: true },
        ]
      });
      controller.model = sessions;

      // when
      const hasUncheckedHasSeenEndTestScreen = controller.hasUncheckedHasSeenEndTestScreen;

      // then
      assert.equal(hasUncheckedHasSeenEndTestScreen, true);
    });
  });

  module('#action updateExaminerGlobalComment', function() {

    test('it should left session examiner global comment untouched if input value exceeds max size', function(assert) {
      // given
      const initialValue = null;
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = { examinerGlobalComment: initialValue };
      controller.model = session;
      controller.examinerGlobalCommentMaxLength = 5;

      // when
      controller.send('updateExaminerGlobalComment', { target: { value: 'MoreThan5Characters' } });

      // then
      assert.equal(session.examinerGlobalComment, initialValue);
    });

    test('it should update session examiner global comment if input value is not exceeding max size', function(assert) {
      // given
      const initialValue = null;
      const newValue = 'hello';
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = { examinerGlobalComment: initialValue };
      controller.model = session;

      // when
      controller.send('updateExaminerGlobalComment', { target: { value: newValue } });

      // then
      assert.equal(session.examinerGlobalComment, newValue);
    });

    test('it should update session examiner global comment to null if trimmed input value is still empty', function(assert) {
      // given
      const initialValue = 'initialValue';
      const newValue = '  ';
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = { examinerGlobalComment: initialValue };
      controller.model = session;

      // when
      controller.send('updateExaminerGlobalComment', { target: { value: newValue } });

      // then
      assert.equal(session.examinerGlobalComment, null);
    });
  });

  module('#action updateCertificationReportExaminerComment', function() {

    test('it should left certif examiner comment untouched if input value exceeds max size', function(assert) {
      // given
      const initialValue = null;
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const certifReport = { examinerComment: initialValue };
      controller.examinerCommentMaxLength = 5;

      // when
      controller.send('updateCertificationReportExaminerComment', certifReport, { target: { value: 'MoreThan5Characters' } });

      // then
      assert.equal(certifReport.examinerComment, initialValue);
    });

    test('it should update certif examiner comment if input value is not exceeding max size', function(assert) {
      // given
      const initialValue = null;
      const newValue = 'hello';
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const certifReport = { examinerComment: initialValue };

      // when
      controller.send('updateCertificationReportExaminerComment', certifReport, { target: { value: newValue } });

      // then
      assert.equal(certifReport.examinerComment, newValue);
    });

    test('it should update certif examiner comment to null if trimmed input value is still empty', function(assert) {
      // given
      const initialValue = 'initialValue';
      const newValue = '  ';
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const certifReport = { examinerComment: initialValue };

      // when
      controller.send('updateCertificationReportExaminerComment', certifReport, { target: { value: newValue } });

      // then
      assert.equal(certifReport.examinerComment, null);
    });
  });

  module('#action toggleCertificationReportHasSeenEndTestScreen', function() {

    test('it should toggle the hasSeenEndTestScreen attribute of the certif parameter', function(assert) {
      // given
      const initialValue = true;
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const certifReport = { hasSeenEndTestScreen: initialValue };

      // when
      controller.send('toggleCertificationReportHasSeenEndTestScreen', certifReport);

      // then
      assert.equal(certifReport.hasSeenEndTestScreen, !initialValue);
    });
  });

  module('#action toggleAllCertificationReportsHasSeenEndTestScreen', function() {

    test('it should toggle the hasSeenEndTestScreen attribute of all the certifs in session to false depending on if some were checked', function(assert) {
      // given
      const someWereChecked = true;
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const sessions = {
        certificationReports: [
          { hasSeenEndTestScreen: false },
          { hasSeenEndTestScreen: true },
        ]
      };
      controller.model = sessions;

      // when
      controller.send('toggleAllCertificationReportsHasSeenEndTestScreen', someWereChecked);

      // then
      sessions.certificationReports.forEach((certif) => {
        assert.equal(certif.hasSeenEndTestScreen, !someWereChecked);
      });
    });
  });

  module('#action openModal', function() {

    test('it should set flag showConfirmModal to true', function(assert) {
      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);

      // when
      controller.send('openModal');

      // then
      assert.equal(controller.showConfirmModal, true);
    });
  });

  module('#action close', function() {

    test('it should set flag showConfirmModal to false', function(assert) {
      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);

      // when
      controller.send('closeModal');

      // then
      assert.equal(controller.showConfirmModal, false);
    });
  });
});
