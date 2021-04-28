import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { certificationStatuses } from 'pix-admin/models/certification';

module('Unit | Model | jury-certification-summary', function(hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  module('#statusLabel', function() {

    certificationStatuses.forEach(function({ value, label }) {
      module(`when the status is ${value}`, function() {

        test(`statusLabel should return ${label}`, function(assert) {
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

  module('#hasSeenEndTestScreenLabel', function() {

    test('it returns an empty string when it has seen end test screen', function(assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', { hasSeenEndTestScreen: true });
      });

      // when
      const hasSeenEndTestScreenLabel = juryCertificationSummaryProcessed.hasSeenEndTestScreenLabel;

      // then
      assert.equal(hasSeenEndTestScreenLabel, '');
    });

    test('it returns \'non\' when it has not seen end test screen', function(assert) {
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

  module('#numberOfCertificationIssueReportsWithRequiredActionLabel', function() {

    test('it returns an empty string when there are no issue reports', function(assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', { numberOfCertificationIssueReportsWithRequiredAction: 0 });
      });

      // when
      const numberOfCertificationIssueReportsWithRequiredActionLabel = juryCertificationSummaryProcessed.numberOfCertificationIssueReportsWithRequiredActionLabel;

      // then
      assert.equal(numberOfCertificationIssueReportsWithRequiredActionLabel, '');
    });

    test('it returns the count of issue reports when there are some', function(assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', { numberOfCertificationIssueReportsWithRequiredAction: 4 });
      });

      // when
      const numberOfCertificationIssueReportsWithRequiredActionLabel = juryCertificationSummaryProcessed.numberOfCertificationIssueReportsWithRequiredActionLabel;

      // then
      assert.equal(numberOfCertificationIssueReportsWithRequiredActionLabel, 4);
    });
  });

  module('#complementaryCertificationsLabel', function() {

    test('it returns an empty string when there are no complementary certifications taken', function(assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', {
          cleaCertificationStatus: 'not_taken',
          pixPlusDroitMaitreCertificationStatus: 'not_taken',
          pixPlusDroitExpertCertificationStatus: 'not_taken',
        });
      });

      // when
      const complementaryCertificationsLabel = juryCertificationSummaryProcessed.complementaryCertificationsLabel;

      // then
      assert.equal(complementaryCertificationsLabel, '');
    });

    test('it returns CléA Numérique when Clea has been taken as complementary certification', function(assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', {
          cleaCertificationStatus: 'taken',
          pixPlusDroitMaitreCertificationStatus: 'not_taken',
          pixPlusDroitExpertCertificationStatus: 'not_taken',
        });
      });

      // when
      const complementaryCertificationsLabel = juryCertificationSummaryProcessed.complementaryCertificationsLabel;

      // then
      assert.equal(complementaryCertificationsLabel, 'CléA Numérique');
    });

    test('it returns Pix+ Droit Maître when pix+ droit maitre has been taken as complementary certification', function(assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', {
          cleaCertificationStatus: 'not_taken',
          pixPlusDroitMaitreCertificationStatus: 'taken',
          pixPlusDroitExpertCertificationStatus: 'not_taken',
        });
      });

      // when
      const complementaryCertificationsLabel = juryCertificationSummaryProcessed.complementaryCertificationsLabel;

      // then
      assert.equal(complementaryCertificationsLabel, 'Pix+ Droit Maître');
    });

    test('it returns Pix+ Droit Expert when pix+ droit expert has been taken as complementary certification', function(assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', {
          cleaCertificationStatus: 'not_taken',
          pixPlusDroitMaitreCertificationStatus: 'not_taken',
          pixPlusDroitExpertCertificationStatus: 'taken',
        });
      });

      // when
      const complementaryCertificationsLabel = juryCertificationSummaryProcessed.complementaryCertificationsLabel;

      // then
      assert.equal(complementaryCertificationsLabel, 'Pix+ Droit Expert');
    });

    test('it returns all complementary certifications taken separated by carriage return where there are some', function(assert) {
      // given
      const juryCertificationSummaryProcessed = run(() => {
        return store.createRecord('jury-certification-summary', {
          cleaCertificationStatus: 'taken',
          pixPlusDroitMaitreCertificationStatus: 'not_taken',
          pixPlusDroitExpertCertificationStatus: 'taken',
        });
      });

      // when
      const complementaryCertificationsLabel = juryCertificationSummaryProcessed.complementaryCertificationsLabel;

      // then
      assert.equal(complementaryCertificationsLabel, 'CléA Numérique\nPix+ Droit Expert');
    });
  });
});
