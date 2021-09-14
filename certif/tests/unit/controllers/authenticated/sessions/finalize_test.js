import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import Service from '@ember/service';
import sinon from 'sinon';

const FINALIZE_PATH = 'authenticated/sessions/finalize';

module('Unit | Controller | ' + FINALIZE_PATH, function(hooks) {
  setupTest(hooks);

  module('#computed uncheckedHasSeenEndTestScreenCount', function() {

    test('it should count no unchecked box if no report', function(assert) {
      // given
      class FeatureTogglesStub extends Service {
        featureToggles = {
          isManageUncompletedCertifEnabled: false,
        };
      }
      this.owner.register('service:feature-toggles', FeatureTogglesStub);
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      controller.model = run(() => store.createRecord('session', {
        certificationReports: [],
      }));

      // when
      const uncheckedHasSeenEndTestScreenCount = controller.uncheckedHasSeenEndTestScreenCount;

      // then
      assert.equal(uncheckedHasSeenEndTestScreenCount, 0);
    });

    test('it should count unchecked boxes', function(assert) {
      // given
      class FeatureTogglesStub extends Service {
        featureToggles = {
          isManageUncompletedCertifEnabled: false,
        };
      }
      this.owner.register('service:feature-toggles', FeatureTogglesStub);
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const certificationReportA = run(() => store.createRecord('certification-report', {
        hasSeenEndTestScreen: true,
      }));
      const certificationReportB = run(() => store.createRecord('certification-report', {
        hasSeenEndTestScreen: false,
      }));
      const certificationReportC = run(() => store.createRecord('certification-report', {
        hasSeenEndTestScreen: false,
      }));
      controller.model = run(() => store.createRecord('session', {
        certificationReports: [certificationReportA, certificationReportB, certificationReportC],
      }));

      // when
      const uncheckedHasSeenEndTestScreenCount = controller.uncheckedHasSeenEndTestScreenCount;

      // then
      assert.equal(uncheckedHasSeenEndTestScreenCount, 2);
    });
  });

  module('#computed hasUncheckedHasSeenEndTestScreen', function() {

    test('it should be false if no unchecked certification reports', function(assert) {
      // given
      class FeatureTogglesStub extends Service {
        featureToggles = {
          isManageUncompletedCertifEnabled: false,
        };
      }
      this.owner.register('service:feature-toggles', FeatureTogglesStub);
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const certificationReportA = run(() => store.createRecord('certification-report', {
        hasSeenEndTestScreen: true,
      }));
      const certificationReportB = run(() => store.createRecord('certification-report', {
        hasSeenEndTestScreen: true,
      }));
      controller.model = run(() => store.createRecord('session', {
        certificationReports: [certificationReportA, certificationReportB],
      }));

      // when
      const hasUncheckedHasSeenEndTestScreen = controller.hasUncheckedHasSeenEndTestScreen;

      // then
      assert.false(hasUncheckedHasSeenEndTestScreen);
    });

    test('it should be true if at least one unchecked certification reports', function(assert) {
      // given
      class FeatureTogglesStub extends Service {
        featureToggles = {
          isManageUncompletedCertifEnabled: false,
        };
      }
      this.owner.register('service:feature-toggles', FeatureTogglesStub);
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const certificationReportA = run(() => store.createRecord('certification-report', {
        hasSeenEndTestScreen: true,
      }));
      const certificationReportB = run(() => store.createRecord('certification-report', {
        hasSeenEndTestScreen: false,
      }));
      controller.model = run(() => store.createRecord('session', {
        certificationReports: [certificationReportA, certificationReportB],
      }));

      // when
      const hasUncheckedHasSeenEndTestScreen = controller.hasUncheckedHasSeenEndTestScreen;

      // then
      assert.true(hasUncheckedHasSeenEndTestScreen);
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

    [
      { hasSeenEndTestScreen1: true, hasSeenEndTestScreen2: true, expectedState: false },
      { hasSeenEndTestScreen1: true, hasSeenEndTestScreen2: false, expectedState: false },
      { hasSeenEndTestScreen1: false, hasSeenEndTestScreen2: true, expectedState: false },
      { hasSeenEndTestScreen1: false, hasSeenEndTestScreen2: false, expectedState: true },
    ].forEach(({ hasSeenEndTestScreen1, hasSeenEndTestScreen2, expectedState }) =>
      test('it should toggle the hasSeenEndTestScreen attribute of all certifs in session to false depending on if some were checked', function(assert) {
        assert.expect(2);
        // given
        const someWereChecked = hasSeenEndTestScreen1 || hasSeenEndTestScreen2;
        const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
        const session = {
          certificationReports: [
            { hasSeenEndTestScreen: hasSeenEndTestScreen1 },
            { hasSeenEndTestScreen: hasSeenEndTestScreen2 },
          ],
        };
        controller.model = session;

        // when
        controller.send('toggleAllCertificationReportsHasSeenEndTestScreen', someWereChecked);

        // then
        session.certificationReports.forEach((certif) => {
          assert.equal(certif.hasSeenEndTestScreen, expectedState);
        });
      }),
    );
  });

  module('#action openModal', function() {

    test('it should set flag showConfirmModal to true', function(assert) {
      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      const session = {
        certificationReports: [
          { isCompleted: true },
          { isCompleted: true },
        ],
      };
      controller.model = session;

      // when
      controller.send('openModal');

      // then
      assert.true(controller.showConfirmModal);
    });
  });

  module('#action close', function() {

    test('it should set flag showConfirmModal to false', function(assert) {
      // given
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);

      // when
      controller.send('closeModal');

      // then
      assert.false(controller.showConfirmModal);
    });
  });

  module('#abort', function() {
    test('should abort a certification report', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationReport = store.createRecord('certification-report');
      const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
      certificationReport.abort = sinon.stub();
      certificationReport.abort.resolves('ok');
      const event = {
        target: {
          value: ('coucou'),
        },
      };

      // when
      controller.abort(certificationReport, event);

      // then
      sinon.assert.calledWithExactly(certificationReport.abort, 'coucou');
      assert.ok(true);
    });
  });
});
