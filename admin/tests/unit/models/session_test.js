import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { STARTED, PROCESSED } from 'pix-admin/models/session';

module('Unit | Model | session', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('#isFinalized', function () {
    module('when the status is PROCESSED', function () {
      test('isFinalized should be true', function (assert) {
        // given
        const sessionProcessed = run(() => {
          return store.createRecord('session', { status: PROCESSED });
        });

        // when
        const isFinalized = sessionProcessed.get('isFinalized');

        // then
        assert.true(isFinalized);
      });
    });

    module('when the status is STARTED', function () {
      test('isFinalized should be false', function (assert) {
        // given
        const sessionStarted = run(() => {
          return store.createRecord('session', { status: STARTED });
        });

        // when
        const isFinalized = sessionStarted.get('isFinalized');

        // then
        assert.false(isFinalized);
      });
    });
  });

  module('#hasExaminerGlobalComment', function () {
    module('when there is no examinerGlobalComment', function () {
      test('it should return false', function (assert) {
        // given
        const session = store.createRecord('session', { examinerGlobalComment: null });

        // when
        const hasExaminerGlobalComment = session.hasExaminerGlobalComment;

        // then
        assert.false(hasExaminerGlobalComment);
      });
    });

    module('when there is a examinerGlobalComment with only whitespaces', function () {
      test('it should also return false', function (assert) {
        // given
        const session = store.createRecord('session', { examinerGlobalComment: '   ' });

        // when
        const hasExaminerGlobalComment = session.hasExaminerGlobalComment;

        // then
        assert.false(hasExaminerGlobalComment);
      });
    });

    module('when there is an examinerGlobalComment', function () {
      test('it should return true', function (assert) {
        // given
        const session = store.createRecord('session', { examinerGlobalComment: 'salut' });

        // when
        const hasExaminerGlobalComment = session.hasExaminerGlobalComment;

        // then
        assert.true(hasExaminerGlobalComment);
      });
    });
  });

  module('#isPublished', function () {
    module('when there is no certification', function () {
      let sessionWithoutCertifications;

      test('isPublished should be false', function (assert) {
        // given
        sessionWithoutCertifications = run(() => {
          return store.createRecord('session', { juryCertificationSummaries: [] });
        });

        // when
        const isPublished = sessionWithoutCertifications.get('isPublished');

        // then
        assert.false(isPublished);
      });
    });

    module('when there are multiple certifications', function () {
      module('when all certifications are published', function (hooks) {
        let sessionWithAllCertificationsPublished;

        hooks.beforeEach(async function () {
          sessionWithAllCertificationsPublished = run(() => {
            const certif1 = store.createRecord('jury-certification-summary', { isPublished: true });
            const certif2 = store.createRecord('jury-certification-summary', { isPublished: true });
            return store.createRecord('session', { juryCertificationSummaries: [certif1, certif2] });
          });
        });

        test('isPublished should be true', function (assert) {
          const isPublished = sessionWithAllCertificationsPublished.get('isPublished');
          assert.true(isPublished);
        });
      });

      module('when not all certifications are published', function (hooks) {
        let sessionWithoutAllCertificationsPublished;

        hooks.beforeEach(async function () {
          sessionWithoutAllCertificationsPublished = run(() => {
            const certif1 = store.createRecord('jury-certification-summary', { isPublished: true });
            const certif2 = store.createRecord('jury-certification-summary', { isPublished: false });
            return store.createRecord('session', { juryCertificationSummaries: [certif1, certif2] });
          });
        });

        test('isPublished from session should be true', function (assert) {
          const isPublished = sessionWithoutAllCertificationsPublished.get('isPublished');
          assert.true(isPublished);
        });
      });
      module('when all certifications are not published', function (hooks) {
        let sessionWithoutAllCertificationsPublished;

        hooks.beforeEach(async function () {
          sessionWithoutAllCertificationsPublished = run(() => {
            const certif1 = store.createRecord('jury-certification-summary', { isPublished: false });
            const certif2 = store.createRecord('jury-certification-summary', { isPublished: false });
            return store.createRecord('session', { juryCertificationSummaries: [certif1, certif2] });
          });
        });

        test('isPublished from session should be false', function (assert) {
          const isPublished = sessionWithoutAllCertificationsPublished.get('isPublished');
          assert.false(isPublished);
        });
      });
    });
  });

  module('#countCertificationIssueReports', function (hooks) {
    let sessionWithCertificationIssueReports;
    let sessionWithoutCertificationIssueReport;

    hooks.beforeEach(async function () {
      sessionWithCertificationIssueReports = run(() => {
        const certif = store.createRecord('jury-certification-summary', { numberOfCertificationIssueReports: 5 });
        const certif2 = store.createRecord('jury-certification-summary', { numberOfCertificationIssueReports: 1 });
        return store.createRecord('session', { juryCertificationSummaries: [certif, certif2] });
      });

      sessionWithoutCertificationIssueReport = run(() => {
        const certif = store.createRecord('jury-certification-summary', {
          numberOfCertificationIssueReports: undefined,
        });
        return store.createRecord('session', { juryCertificationSummaries: [certif] });
      });
    });

    test('it should count 6 certification issue reports', function (assert) {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(sessionWithCertificationIssueReports.countCertificationIssueReports, 6);
    });

    test('it should count 0 certification issue report', function (assert) {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(sessionWithoutCertificationIssueReport.countCertificationIssueReports, 0);
    });
  });

  module('#countCertificationIssueReportsWithActionRequired', function (hooks) {
    let sessionWithCertificationIssueReports;
    let sessionWithoutCertificationIssueReport;

    hooks.beforeEach(async function () {
      sessionWithCertificationIssueReports = run(() => {
        const certif = store.createRecord('jury-certification-summary', {
          numberOfCertificationIssueReportsWithRequiredAction: 5,
        });
        const certif2 = store.createRecord('jury-certification-summary', {
          numberOfCertificationIssueReportsWithRequiredAction: 1,
        });
        return store.createRecord('session', { juryCertificationSummaries: [certif, certif2] });
      });

      sessionWithoutCertificationIssueReport = run(() => {
        const certif = store.createRecord('jury-certification-summary', {
          numberOfCertificationIssueReports: undefined,
        });
        return store.createRecord('session', { juryCertificationSummaries: [certif] });
      });
    });

    test('it should count 6 certification issue reports ', function (assert) {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(sessionWithCertificationIssueReports.countCertificationIssueReportsWithActionRequired, 6);
    });

    test('it should count 0 certification issue report ', function (assert) {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(sessionWithoutCertificationIssueReport.countCertificationIssueReportsWithActionRequired, 0);
    });
  });

  module('#countNotCheckedEndScreen', function (hooks) {
    let sessionWithOneUncheckedEndScreen;
    let sessionWithOneCheckedEndScreen;

    hooks.beforeEach(async function () {
      sessionWithOneUncheckedEndScreen = run(() => {
        const certif = store.createRecord('jury-certification-summary', { hasSeenEndTestScreen: false });
        return store.createRecord('session', { juryCertificationSummaries: [certif] });
      });

      sessionWithOneCheckedEndScreen = run(() => {
        const certif = store.createRecord('jury-certification-summary', { hasSeenEndTestScreen: true });
        return store.createRecord('session', { juryCertificationSummaries: [certif] });
      });
    });

    test('it should count 1 unchecked box if only one box (unchecked)', function (assert) {
      const countNotCheckedEndScreen = sessionWithOneUncheckedEndScreen.countNotCheckedEndScreen;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(countNotCheckedEndScreen, 1);
    });

    test('it should count 0 unchecked box if only one box (checked)', function (assert) {
      const countNotCheckedEndScreen = sessionWithOneCheckedEndScreen.countNotCheckedEndScreen;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(countNotCheckedEndScreen, 0);
    });
  });

  module('#countStartedAndInErrorCertifications', function () {
    test('it should take into account started certifications', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'started' });
      });
      const session = run(() => {
        return store.createRecord('session', { juryCertificationSummaries: [juryCertificationSummary] });
      });

      // when
      const countStartedAndInErrorCertifications = session.countStartedAndInErrorCertifications;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(countStartedAndInErrorCertifications, 1);
    });

    test('it should take into account in error certifications', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'error' });
      });
      const session = run(() => {
        return store.createRecord('session', { juryCertificationSummaries: [juryCertificationSummary] });
      });

      // when
      const countStartedAndInErrorCertifications = session.countStartedAndInErrorCertifications;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(countStartedAndInErrorCertifications, 1);
    });

    test('it should ignore validated certifications', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'validated' });
      });
      const session = run(() => {
        return store.createRecord('session', { juryCertificationSummaries: [juryCertificationSummary] });
      });

      // when
      const countStartedAndInErrorCertifications = session.countStartedAndInErrorCertifications;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(countStartedAndInErrorCertifications, 0);
    });

    test('it should ignore rejected certifications', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'validated' });
      });
      const session = run(() => {
        return store.createRecord('session', { juryCertificationSummaries: [juryCertificationSummary] });
      });

      // when
      const countStartedAndInErrorCertifications = session.countStartedAndInErrorCertifications;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(countStartedAndInErrorCertifications, 0);
    });

    test('it should ignore cancelled certifications', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'validated' });
      });
      const session = run(() => {
        return store.createRecord('session', { juryCertificationSummaries: [juryCertificationSummary] });
      });

      // when
      const countStartedAndInErrorCertifications = session.countStartedAndInErrorCertifications;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(countStartedAndInErrorCertifications, 0);
    });

    test('it should return a sum of started and in error certifications', function (assert) {
      // given
      const juryCertificationSummary1 = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'started' });
      });
      const juryCertificationSummary2 = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'error' });
      });
      const juryCertificationSummary3 = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'started' });
      });
      const session = run(() => {
        return store.createRecord('session', {
          juryCertificationSummaries: [juryCertificationSummary1, juryCertificationSummary2, juryCertificationSummary3],
        });
      });

      // when
      const countStartedAndInErrorCertifications = session.countStartedAndInErrorCertifications;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(countStartedAndInErrorCertifications, 3);
    });
  });

  module('#countCertificationsFlaggedAsAborted', function () {
    test('it should take into account certifications flagged as aborted', function (assert) {
      // given
      const juryCertificationSummary = store.createRecord('jury-certification-summary', {
        isFlaggedAborted: true,
      });
      const session = store.createRecord('session', { juryCertificationSummaries: [juryCertificationSummary] });

      // when
      const countCertificationsFlaggedAsAborted = session.countCertificationsFlaggedAsAborted;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(countCertificationsFlaggedAsAborted, 1);
    });
  });

  module('#areResultsToBeSentToPrescriber', function () {
    module('when session is finalized but results were not sent to prescriber yet', function () {
      test('it should return areResultsToBeSentToPrescriber with true value', function (assert) {
        // given
        const session = store.createRecord('session', { status: 'finalized', resultsSentToPrescriberAt: null });

        // when
        const areResultsToBeSentToPrescriber = session.areResultsToBeSentToPrescriber;

        // then
        assert.true(areResultsToBeSentToPrescriber);
      });
    });

    module('when session is finalized and results has been sent to prescriber', function () {
      test('it should return areResultsToBeSentToPrescriber with false value', function (assert) {
        // given
        const session = store.createRecord('session', { status: 'finalized', resultsSentToPrescriberAt: new Date() });

        // when
        const areResultsToBeSentToPrescriber = session.areResultsToBeSentToPrescriber;

        // then
        assert.false(areResultsToBeSentToPrescriber);
      });
    });
  });

  module('#displayStatus', function () {
    module('when status is created', function () {
      test('it should display created printable equivalent', function (assert) {
        // given
        const session = store.createRecord('session', { status: 'created' });

        // when
        const displayStatus = session.displayStatus;

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(displayStatus, 'Créée');
      });
    });

    module('when status is finalized', function () {
      test('it should display finalized printable equivalent', function (assert) {
        // given
        const session = store.createRecord('session', { status: 'finalized' });

        // when
        const displayStatus = session.displayStatus;

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(displayStatus, 'Finalisée');
      });
    });

    module('when status is processed', function () {
      test('it should display processed printable equivalent', function (assert) {
        // given
        const session = store.createRecord('session', { status: 'processed' });

        // when
        const displayStatus = session.displayStatus;

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(displayStatus, 'Résultats transmis par Pix');
      });
    });
  });
});
