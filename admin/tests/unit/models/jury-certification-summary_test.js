import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { certificationStatuses } from 'pix-admin/models/certification';

module('Unit | Model | jury-certification-summary', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('#statusLabel', function () {
    certificationStatuses.forEach(function ({ value, label }) {
      module(`when the status is ${value}`, function () {
        test(`statusLabel should return ${label}`, function (assert) {
          // given
          const juryCertificationSummaryProcessed = run(() => {
            return store.createRecord('jury-certification-summary', { status: value });
          });

          // when
          const statusLabel = juryCertificationSummaryProcessed.get('statusLabel');

          // then
          assert.equal(statusLabel, label);
        });
      });
    });
  });

  module('#hasSeenEndTestScreenLabel', function () {
    test('it returns an empty string when it has seen end test screen', function (assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', { hasSeenEndTestScreen: true });
      });

      // when
      const hasSeenEndTestScreenLabel = juryCertificationSummaryProcessed.hasSeenEndTestScreenLabel;

      // then
      assert.equal(hasSeenEndTestScreenLabel, '');
    });

    test("it returns 'non' when it has not seen end test screen", function (assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', { hasSeenEndTestScreen: false });
      });

      // when
      const hasSeenEndTestScreenLabel = juryCertificationSummaryProcessed.hasSeenEndTestScreenLabel;

      // then
      assert.equal(hasSeenEndTestScreenLabel, 'non');
    });
  });

  module('#numberOfCertificationIssueReportsWithRequiredActionLabel', function () {
    test('it returns an empty string when there are no issue reports', function (assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', {
          numberOfCertificationIssueReportsWithRequiredAction: 0,
        });
      });

      // when
      const numberOfCertificationIssueReportsWithRequiredActionLabel =
        juryCertificationSummaryProcessed.numberOfCertificationIssueReportsWithRequiredActionLabel;

      // then
      assert.equal(numberOfCertificationIssueReportsWithRequiredActionLabel, '');
    });

    test('it returns the count of issue reports when there are some', function (assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', {
          numberOfCertificationIssueReportsWithRequiredAction: 4,
        });
      });

      // when
      const numberOfCertificationIssueReportsWithRequiredActionLabel =
        juryCertificationSummaryProcessed.numberOfCertificationIssueReportsWithRequiredActionLabel;

      // then
      assert.equal(numberOfCertificationIssueReportsWithRequiredActionLabel, 4);
    });
  });

  module('#complementaryCertificationsLabel', function () {
    test('it returns an empty string when there are no complementary certifications taken', function (assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', {
          cleaCertificationStatus: 'not_taken',
          pixPlusDroitMaitreCertificationStatus: 'not_taken',
          pixPlusDroitExpertCertificationStatus: 'not_taken',
          pixPlusEduAutonomeCertificationStatus: 'not_taken',
          pixPlusEduAvanceCertificationStatus: 'not_taken',
          pixPlusEduExpertCertificationStatus: 'not_taken',
          pixPlusEduFormateurCertificationStatus: 'not_taken',
        });
      });

      // when
      const complementaryCertificationsLabel = juryCertificationSummaryProcessed.complementaryCertificationsLabel;

      // then
      assert.equal(complementaryCertificationsLabel, '');
    });

    [
      { attribute: 'cleaCertificationStatus', expectedMessage: 'CléA Numérique' },
      { attribute: 'pixPlusDroitMaitreCertificationStatus', expectedMessage: 'Pix+ Droit Maître' },
      { attribute: 'pixPlusDroitExpertCertificationStatus', expectedMessage: 'Pix+ Droit Expert' },
      { attribute: 'pixPlusEduAutonomeCertificationStatus', expectedMessage: 'Pix+ Édu Autonome' },
      { attribute: 'pixPlusEduAvanceCertificationStatus', expectedMessage: 'Pix+ Édu Avancé' },
      { attribute: 'pixPlusEduExpertCertificationStatus', expectedMessage: 'Pix+ Édu Expert' },
      { attribute: 'pixPlusEduFormateurCertificationStatus', expectedMessage: 'Pix+ Édu Formateur' },
    ].forEach(({ attribute, expectedMessage }) => {
      test(`it returns ${expectedMessage} when ${attribute} is not equal to 'not_taken`, function (assert) {
        // given
        const juryCertificationSummaryProcessed = run(() => {
          return store.createRecord('jury-certification-summary', {
            cleaCertificationStatus: 'not_taken',
            pixPlusDroitMaitreCertificationStatus: 'not_taken',
            pixPlusDroitExpertCertificationStatus: 'not_taken',
            pixPlusEduAutonomeCertificationStatus: 'not_taken',
            pixPlusEduAvanceCertificationStatus: 'not_taken',
            pixPlusEduExpertCertificationStatus: 'not_taken',
            pixPlusEduFormateurCertificationStatus: 'not_taken',
          });
        });
        juryCertificationSummaryProcessed[attribute] = 'not_equal_to_not_taken';

        // when
        const complementaryCertificationsLabel = juryCertificationSummaryProcessed.complementaryCertificationsLabel;

        // then
        assert.equal(complementaryCertificationsLabel, expectedMessage);
      });
    });

    test('it returns all complementary certifications taken separated by carriage return where there are some', function (assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', {
          cleaCertificationStatus: 'taken',
          pixPlusDroitMaitreCertificationStatus: 'not_taken',
          pixPlusDroitExpertCertificationStatus: 'taken',
          pixPlusEduAutonomeCertificationStatus: 'not_taken',
          pixPlusEduAvanceCertificationStatus: 'not_taken',
          pixPlusEduExpertCertificationStatus: 'not_taken',
          pixPlusEduFormateurCertificationStatus: 'not_taken',
        });
      });

      // when
      const complementaryCertificationsLabel = juryCertificationSummaryProcessed.complementaryCertificationsLabel;

      // then
      assert.equal(complementaryCertificationsLabel, 'CléA Numérique\nPix+ Droit Expert');
    });
  });

  module('#get isCertificationStarted', function () {
    test('it should return true when the status is "started"', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'started' });
      });

      // when
      const isCertificationStarted = juryCertificationSummary.isCertificationStarted;

      // then
      assert.true(isCertificationStarted);
    });

    test('it should return false when the status is "validated" (not started)', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'validated' });
      });

      // when
      const isCertificationStarted = juryCertificationSummary.isCertificationStarted;

      // then
      assert.false(isCertificationStarted);
    });

    test('it should return false when the status is "rejected" (not started)', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'rejected' });
      });

      // when
      const isCertificationStarted = juryCertificationSummary.isCertificationStarted;

      // then
      assert.false(isCertificationStarted);
    });

    test('it should return false when the status is "error" (not started)', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'error' });
      });

      // when
      const isCertificationStarted = juryCertificationSummary.isCertificationStarted;

      // then
      assert.false(isCertificationStarted);
    });

    test('it should return false when the status is "cancelled" (not started)', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'cancelled' });
      });

      // when
      const isCertificationStarted = juryCertificationSummary.isCertificationStarted;

      // then
      assert.false(isCertificationStarted);
    });
  });

  module('#isCertificationInError', function () {
    test('it should return true when the status is "error"', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'error' });
      });

      // when
      const isCertificationInError = juryCertificationSummary.isCertificationInError;

      // then
      assert.true(isCertificationInError);
    });

    test('it should return false when the status is "started" (not in error)', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'started' });
      });

      // when
      const isCertificationInError = juryCertificationSummary.isCertificationInError;

      // then
      assert.false(isCertificationInError);
    });

    test('it should return false when the status is "validated" (not in error)', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'validated' });
      });

      // when
      const isCertificationInError = juryCertificationSummary.isCertificationInError;

      // then
      assert.false(isCertificationInError);
    });

    test('it should return false when the status is "rejected" (not in error)', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'rejected' });
      });

      // when
      const isCertificationInError = juryCertificationSummary.isCertificationInError;

      // then
      assert.false(isCertificationInError);
    });

    test('it should return false when the status is "cancelled" (not in error)', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { status: 'cancelled' });
      });

      // when
      const isCertificationInError = juryCertificationSummary.isCertificationInError;

      // then
      assert.false(isCertificationInError);
    });
  });

  module('#get completionDate', function () {
    test('it should return null if completedAt is null', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { completedAt: null });
      });

      // then
      assert.equal(juryCertificationSummary.completionDate, null);
    });

    test('it should a formatted date when completedAt is defined', function (assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('jury-certification-summary', { completedAt: '2021-06-30 15:10:45' });
      });

      // then
      assert.equal(juryCertificationSummary.completionDate, '30/06/2021, 15:10:45');
    });
  });
});
