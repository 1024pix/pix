import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { STARTED, PROCESSED } from 'pix-admin/models/session';

module('Unit | Model | session', (hooks) => {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  module('#isFinalized', () => {

    module('when the status is PROCESSED', () => {

      test('isFinalized should be true', function(assert) {
        // given
        const sessionProcessed = run(() => {
          return store.createRecord('session', { status: PROCESSED });
        });

        // when
        const isFinalized = sessionProcessed.get('isFinalized');

        // then
        assert.equal(isFinalized, true);
      });
    });

    module('when the status is STARTED', () => {

      test('isFinalized should be false', function(assert) {
        // given
        const sessionStarted = run(() => {
          return store.createRecord('session', { status: STARTED });
        });

        // when
        const isFinalized = sessionStarted.get('isFinalized');

        // then
        assert.equal(isFinalized, false);
      });

    });

  });

  module('#hasExaminerGlobalComment', () => {

    module('when there is no examinerGlobalComment', () => {

      test('it should return false', function(assert) {
        // given
        const session = store.createRecord('session', { examinerGlobalComment: null });

        // when
        const hasExaminerGlobalComment = session.hasExaminerGlobalComment;

        // then
        assert.equal(hasExaminerGlobalComment, false);
      });
    });

    module('when there is a examinerGlobalComment with only whitespaces', () => {

      test('it should also return false', function(assert) {
        // given
        const session = store.createRecord('session', { examinerGlobalComment: '   ' });

        // when
        const hasExaminerGlobalComment = session.hasExaminerGlobalComment;

        // then
        assert.equal(hasExaminerGlobalComment, false);
      });
    });

    module('when there is an examinerGlobalComment', () => {

      test('it should return true', function(assert) {
        // given
        const session = store.createRecord('session', { examinerGlobalComment: 'salut' });

        // when
        const hasExaminerGlobalComment = session.hasExaminerGlobalComment;

        // then
        assert.equal(hasExaminerGlobalComment, true);
      });
    });
  });

  module('#isPublished', () => {

    module('when there is no certification', () => {
      let sessionWithoutCertifications;

      test('isPublished should be false', function(assert) {
        // given
        sessionWithoutCertifications = run(() => {
          return store.createRecord('session', { juryCertificationSummaries: [] });
        });

        // when
        const isPublished = sessionWithoutCertifications.get('isPublished');

        // then
        assert.equal(isPublished, false);
      });
    });

    module('when there are multiple certifications', () => {

      module('when all certifications are published', () => {

        let sessionWithAllCertificationsPublished;

        hooks.beforeEach(async () => {
          sessionWithAllCertificationsPublished = run(() => {
            const certif1 = store.createRecord('jury-certification-summary', { isPublished: true });
            const certif2 = store.createRecord('jury-certification-summary', { isPublished: true });
            return store.createRecord('session', { juryCertificationSummaries: [ certif1, certif2 ] });
          });
        });

        test('isPublished should be true', function(assert) {
          const isPublished = sessionWithAllCertificationsPublished.get('isPublished');
          assert.equal(isPublished, true);
        });
      });

      module('when not all certifications are published', () => {

        let sessionWithoutAllCertificationsPublished;

        hooks.beforeEach(async () => {
          sessionWithoutAllCertificationsPublished = run(() => {
            const certif1 = store.createRecord('jury-certification-summary', { isPublished: true });
            const certif2 = store.createRecord('jury-certification-summary', { isPublished: false });
            return store.createRecord('session', { juryCertificationSummaries: [ certif1, certif2 ] });
          });
        });

        test('isPublished from session should be true', function(assert) {
          const isPublished = sessionWithoutAllCertificationsPublished.get('isPublished');
          assert.equal(isPublished, true);
        });
      });
      module('when all certifications are not published', () => {

        let sessionWithoutAllCertificationsPublished;

        hooks.beforeEach(async () => {
          sessionWithoutAllCertificationsPublished = run(() => {
            const certif1 = store.createRecord('jury-certification-summary', { isPublished: false });
            const certif2 = store.createRecord('jury-certification-summary', { isPublished: false });
            return store.createRecord('session', { juryCertificationSummaries: [ certif1, certif2 ] });
          });
        });

        test('isPublished from session should be false', function(assert) {
          const isPublished = sessionWithoutAllCertificationsPublished.get('isPublished');
          assert.equal(isPublished, false);
        });
      });

    });

  });

  module('#countCertificationIssueReports', () => {
    let sessionWithCertificationIssueReports;
    let sessionWithoutCertificationIssueReport;

    hooks.beforeEach(async () => {
      sessionWithCertificationIssueReports = run(() => {
        const certif = store.createRecord('jury-certification-summary', { numberOfCertificationIssueReports: 5 });
        const certif2 = store.createRecord('jury-certification-summary', { numberOfCertificationIssueReports: 1 });
        return store.createRecord('session', { juryCertificationSummaries: [certif, certif2] });
      });

      sessionWithoutCertificationIssueReport = run(() => {
        const certif = store.createRecord('jury-certification-summary', { numberOfCertificationIssueReports: undefined });
        return store.createRecord('session', { juryCertificationSummaries: [certif] });
      });
    });

    test('it should count 6 certification issue reports', function(assert) {
      assert.equal(sessionWithCertificationIssueReports.countCertificationIssueReports, 6);
    });

    test('it should count 0 certification issue report', function(assert) {
      assert.equal(sessionWithoutCertificationIssueReport.countCertificationIssueReports, 0);
    });

  });

  module('#countCertificationIssueReportsWithActionRequired', () => {
    let sessionWithCertificationIssueReports;
    let sessionWithoutCertificationIssueReport;

    hooks.beforeEach(async () => {
      sessionWithCertificationIssueReports = run(() => {
        const certif = store.createRecord('jury-certification-summary', { numberOfCertificationIssueReportsWithRequiredAction: 5 });
        const certif2 = store.createRecord('jury-certification-summary', { numberOfCertificationIssueReportsWithRequiredAction: 1 });
        return store.createRecord('session', { juryCertificationSummaries: [certif, certif2] });
      });

      sessionWithoutCertificationIssueReport = run(() => {
        const certif = store.createRecord('jury-certification-summary', { numberOfCertificationIssueReports: undefined });
        return store.createRecord('session', { juryCertificationSummaries: [certif] });
      });
    });

    test('it should count 6 certification issue reports ', function(assert) {
      assert.equal(sessionWithCertificationIssueReports.countCertificationIssueReportsWithActionRequired, 6);
    });

    test('it should count 0 certification issue report ', function(assert) {
      assert.equal(sessionWithoutCertificationIssueReport.countCertificationIssueReportsWithActionRequired, 0);
    });

  });

  module('#countNotCheckedEndScreen', () => {

    let sessionWithOneUncheckedEndScreen;
    let sessionWithOneCheckedEndScreen;

    hooks.beforeEach(async () => {
      sessionWithOneUncheckedEndScreen = run(() => {
        const certif = store.createRecord('jury-certification-summary', { hasSeenEndTestScreen: false });
        return store.createRecord('session', { juryCertificationSummaries: [certif] });
      });

      sessionWithOneCheckedEndScreen = run(() => {
        const certif = store.createRecord('jury-certification-summary', { hasSeenEndTestScreen: true });
        return store.createRecord('session', { juryCertificationSummaries: [certif] });
      });
    });

    test('it should count 1 unchecked box if only one box (unchecked)', function(assert) {
      const countNotCheckedEndScreen = sessionWithOneUncheckedEndScreen.countNotCheckedEndScreen;
      assert.equal(countNotCheckedEndScreen, 1);
    });

    test('it should count 0 unchecked box if only one box (checked)', function(assert) {
      const countNotCheckedEndScreen = sessionWithOneCheckedEndScreen.countNotCheckedEndScreen;
      assert.equal(countNotCheckedEndScreen, 0);
    });

  });

  module('#countNonValidatedCertifications', () => {

    let sessionWithOneNotValidatedCertif;
    let sessionWithValidatedCertif;

    hooks.beforeEach(async () => {
      sessionWithOneNotValidatedCertif = run(() => {
        const certif = store.createRecord('jury-certification-summary', { status: 'nonValidated' });
        return store.createRecord('session', { juryCertificationSummaries: [certif] });
      });

      sessionWithValidatedCertif = run(() => {
        const certif = store.createRecord('jury-certification-summary', { status: 'validated' });
        return store.createRecord('session', { juryCertificationSummaries: [certif] });
      });
    });

    test('it should count 1 non validated', function(assert) {
      const countNonValidated = sessionWithOneNotValidatedCertif.countNonValidatedCertifications;
      assert.equal(countNonValidated, 1);
    });

    test('it should count 0 non validated', function(assert) {
      const countNonValidated = sessionWithValidatedCertif.countNonValidatedCertifications;
      assert.equal(countNonValidated, 0);
    });

  });

  module('#areResultsToBeSentToPrescriber', () => {

    module('when session is finalized but results were not sent to prescriber yet', () => {

      test('it should return areResultsToBeSentToPrescriber with true value', function(assert) {
        // given
        const session = store.createRecord('session', { status: 'finalized', resultsSentToPrescriberAt: null });

        // when
        const areResultsToBeSentToPrescriber = session.areResultsToBeSentToPrescriber;

        // then
        assert.equal(areResultsToBeSentToPrescriber, true);
      });
    });

    module('when session is finalized and results has been sent to prescriber', () => {

      test('it should return areResultsToBeSentToPrescriber with false value', function(assert) {
        // given
        const session = store.createRecord('session', { status: 'finalized', resultsSentToPrescriberAt: new Date() });

        // when
        const areResultsToBeSentToPrescriber = session.areResultsToBeSentToPrescriber;

        // then
        assert.equal(areResultsToBeSentToPrescriber, false);
      });
    });
  });

  module('#displayStatus', () => {

    module('when status is created', () => {

      test('it should display created printable equivalent', function(assert) {
        // given
        const session = store.createRecord('session', { status: 'created' });

        // when
        const displayStatus = session.displayStatus;

        // then
        assert.equal(displayStatus, 'Créée');
      });
    });

    module('when status is finalized', () => {

      test('it should display finalized printable equivalent', function(assert) {
        // given
        const session = store.createRecord('session', { status: 'finalized' });

        // when
        const displayStatus = session.displayStatus;

        // then
        assert.equal(displayStatus, 'Finalisée');
      });
    });

    module('when status is processed', () => {

      test('it should display processed printable equivalent', function(assert) {
        // given
        const session = store.createRecord('session', { status: 'processed' });

        // when
        const displayStatus = session.displayStatus;

        // then
        assert.equal(displayStatus, 'Résultats transmis par Pix');
      });
    });
  });
});
