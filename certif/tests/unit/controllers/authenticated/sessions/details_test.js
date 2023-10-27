import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/sessions/details', function (hooks) {
  setupTest(hooks);

  module('#certificationCandidatesCount', function () {
    test('should return a string that matches the candidate count if more than 0 candidate', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = { certificationCandidates: ['candidate1', 'candidate2'] };

      // when
      const certificationCandidatesCountResult = controller.certificationCandidatesCount;

      // then
      assert.strictEqual(certificationCandidatesCountResult, '(2)');
    });

    test('should return an empty string when there are no certification candidates in the session', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = { certificationCandidates: [] };

      // when
      const certificationCandidatesCountResult = controller.certificationCandidatesCount;

      // then
      assert.strictEqual(certificationCandidatesCountResult, '');
    });
  });

  module('#hasOneOrMoreCandidates', function () {
    test('should return true if session has at least 1 candidate', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = { certificationCandidates: ['candidate1', 'candidate2'] };

      // when
      const hasOneOrMoreCandidates = controller.hasOneOrMoreCandidates;

      // then
      assert.ok(hasOneOrMoreCandidates);
    });

    test('should return false if session has 0 candidate', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = { certificationCandidates: [] };

      // when
      const hasOneOrMoreCandidates = controller.hasOneOrMoreCandidates;

      // then
      assert.notOk(hasOneOrMoreCandidates);
    });
  });

  module('#shouldDisplayDownloadButton', function () {
    module('when there is at least one enrolled candidate', function () {
      module('when it should display the CertifPrescriptionScoFeature', function () {
        test('should return true ', function (assert) {
          // given
          const controller = this.owner.lookup('controller:authenticated/sessions/details');
          controller.model = {
            certificationCandidates: ['candidate1', 'candidate2'],
            shouldDisplayPrescriptionScoStudentRegistrationFeature: true,
          };

          // when
          const shouldDisplayDownloadButton = controller.shouldDisplayDownloadButton;

          // then
          assert.ok(shouldDisplayDownloadButton);
        });
      });

      test('Should return true', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/sessions/details');
        controller.model = {
          certificationCandidates: ['candidate1', 'candidate2'],
          shouldDisplayPrescriptionScoStudentRegistrationFeature: false,
        };

        // when
        const shouldDisplayDownloadButton = controller.shouldDisplayDownloadButton;

        // then
        assert.ok(shouldDisplayDownloadButton);
      });
    });
  });

  module('when there is no enrolled candidate', function () {
    test('Should return false.', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = {
        certificationCandidates: [],
        isUserFromSco: true,
      };

      // when
      const shouldDisplayDownloadButton = controller.shouldDisplayDownloadButton;

      // then
      assert.notOk(shouldDisplayDownloadButton);
    });
  });

  module('#urlToDownloadSessionIssueReportSheet', function () {
    test('should return a url to download the V3 issue report PDF if session is V3', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = { session: { version: 3 } };

      // when
      const url = controller.urlToDownloadSessionIssueReportSheet;

      // then
      assert.strictEqual(url, 'https://cloud.pix.fr/s/wJc6N3sZNZRC4MZ/download');
    });
  });
});
