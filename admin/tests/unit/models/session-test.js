import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { STARTED, PROCESSED } from 'pix-admin/models/session';

module('Unit | Model | session', function(hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  module('#isFinalized', function() {

    module('when the status is PROCESSED', function() {

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

    module('when the status is STARTED', function() {

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

  module('#hasExaminerGlobalComment', function() {

    module('when there is no examinerGlobalComment', function() {

      test('it should return false', function(assert) {
        // given
        const session = store.createRecord('session', { examinerGlobalComment: null });

        // when
        const hasExaminerGlobalComment = session.hasExaminerGlobalComment;

        // then
        assert.equal(hasExaminerGlobalComment, false);
      });
    });

    module('when there is a examinerGlobalComment with only whitespaces', function() {

      test('it should also return false', function(assert) {
        // given
        const session = store.createRecord('session', { examinerGlobalComment: '   ' });

        // when
        const hasExaminerGlobalComment = session.hasExaminerGlobalComment;

        // then
        assert.equal(hasExaminerGlobalComment, false);
      });
    });

    module('when there is an examinerGlobalComment', function() {

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

  module('#isPublished', function() {

    module('when there is no certification', function() {
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

    module('when there are multiple certifications', function() {

      module('when all certifications are published', function() {

        let sessionWithAllCertificationsPublished;

        hooks.beforeEach(async function() {
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

      module('when not all certifications are published', function() {

        let sessionWithoutAllCertificationsPublished;

        hooks.beforeEach(async function() {
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
      module('when all certifications are not published', function() {

        let sessionWithoutAllCertificationsPublished;

        hooks.beforeEach(async function() {
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

  module('#countExaminerComment', function() {
    let sessionWithOneExaminerComment;
    let sessionWithNoExaminerComment;

    hooks.beforeEach(async function() {
      sessionWithOneExaminerComment = run(() => {
        const certif = store.createRecord('jury-certification-summary', { examinerComment: 'Salut' });
        return store.createRecord('session', { juryCertificationSummaries: [certif] });
      });

      sessionWithNoExaminerComment = run(() => {
        const certif = store.createRecord('jury-certification-summary', { examinerComment: null });
        return store.createRecord('session', { juryCertificationSummaries: [certif] });
      });
    });

    test('it should count 1 examiner comment', function(assert) {
      const countWithExaminerComment = sessionWithOneExaminerComment.countExaminerComment;
      assert.equal(countWithExaminerComment, 1);
    });

    test('it should count 0 examiner comment', function(assert) {
      const countNoExaminerComment = sessionWithNoExaminerComment.countExaminerComment;
      assert.equal(countNoExaminerComment, 0);
    });

  });

  module('#countNotCheckedEndScreen', function() {

    let sessionWithOneUncheckedEndScreen;
    let sessionWithOneCheckedEndScreen;

    hooks.beforeEach(async function() {
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

  module('#countNonValidatedCertifications', function() {

    let sessionWithOneNotValidatedCertif;
    let sessionWithValidatedCertif;

    hooks.beforeEach(async function() {
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

  module('#areResultsToBeSentToPrescriber', function() {

    module('when session is finalized but results were not sent to prescriber yet', function() {

      test('it should return areResultsToBeSentToPrescriber with true value', function(assert) {
        // given
        const session = store.createRecord('session', { status: 'finalized', resultsSentToPrescriberAt: null });

        // when
        const areResultsToBeSentToPrescriber = session.areResultsToBeSentToPrescriber;

        // then
        assert.equal(areResultsToBeSentToPrescriber, true);
      });
    });

    module('when session is finalized and results has been sent to prescriber', function() {

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

  module('#displayStatus', function() {

    module('when status is created', function() {

      test('it should display created printable equivalent', function(assert) {
        // given
        const session = store.createRecord('session', { status: 'created' });

        // when
        const displayStatus = session.displayStatus;

        // then
        assert.equal(displayStatus, 'Créée');
      });
    });

    module('when status is finalized', function() {

      test('it should display finalized printable equivalent', function(assert) {
        // given
        const session = store.createRecord('session', { status: 'finalized' });

        // when
        const displayStatus = session.displayStatus;

        // then
        assert.equal(displayStatus, 'Finalisée');
      });
    });

    module('when status is processed', function() {

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
