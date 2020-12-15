import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import config from 'pix-certif/config/environment';

module('Unit | Controller | authenticated/sessions/details', function(hooks) {
  setupTest(hooks);

  module('#certificationCandidatesCount', function() {
    test('should return a string that matches the candidate count if more than 0 candidate', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = { certificationCandidates: ['candidate1', 'candidate2'] };

      // when
      const certificationCandidatesCountResult = controller.certificationCandidatesCount;

      // then
      assert.equal(certificationCandidatesCountResult, '(2)');
    });

    test('should return an empty string when there are no certification candidates in the session', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = { certificationCandidates: [] };

      // when
      const certificationCandidatesCountResult = controller.certificationCandidatesCount;

      // then
      assert.equal(certificationCandidatesCountResult, '');
    });
  });

  module('#hasOneOrMoreCandidates', function() {
    test('should return true if session has at least 1 candidate', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = { certificationCandidates: ['candidate1', 'candidate2'] };

      // when
      const hasOneOrMoreCandidates = controller.hasOneOrMoreCandidates;

      // then
      assert.ok(hasOneOrMoreCandidates);
    });

    test('should return false if session has 0 candidate', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = { certificationCandidates: [] };

      // when
      const hasOneOrMoreCandidates = controller.hasOneOrMoreCandidates;

      // then
      assert.notOk(hasOneOrMoreCandidates);
    });
  });

  module('#shouldDisplayDownloadButton', function() {

    module('when there is at least one enrolled candidate', function() {

      module('when the toggle CertifPrescriptionSco is enabled', function() {

        module('when the user is of type SCO', function() {

          test('should return true', function(assert) {
            // given
            const controller = this.owner.lookup('controller:authenticated/sessions/details');
            controller.model = {
              certificationCandidates: ['candidate1', 'candidate2'],
              isUserFromSco: true,
              isCertifPrescriptionScoEnabled: true,
            };

            // when
            const shouldDisplayDownloadButton = controller.shouldDisplayDownloadButton;

            // then
            assert.ok(shouldDisplayDownloadButton);
          });
        });

        module('when user is not from sco', function() {

          test('should return false', function(assert) {
            // given
            const controller = this.owner.lookup('controller:authenticated/sessions/details');
            controller.model = {
              certificationCandidates: ['candidate1', 'candidate2'],
              isUserFromSco: false,
              isCertifPrescriptionScoEnabled: true,
            };

            // when
            const shouldDisplayDownloadButton = controller.shouldDisplayDownloadButton;

            // then
            assert.notOk(shouldDisplayDownloadButton);
          });
        });

      });

      module('when the toggle CertifPrescriptionSco is not enabled', function() {

        module('when user is from sco', function() {

          test('should return false ', function(assert) {
            // given
            const controller = this.owner.lookup('controller:authenticated/sessions/details');
            controller.model = {
              certificationCandidates: ['candidate1', 'candidate2'],
              isUserFromSco: true,
              isCertifPrescriptionScoEnabled: false,
            };

            // when
            const shouldDisplayDownloadButton = controller.shouldDisplayDownloadButton;

            // then
            assert.notOk(shouldDisplayDownloadButton);
          });
        });
      });

      module('when the toggle FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS is enabled', function() {
        test('Should return true', function(assert) {
          // given
          config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS = true;
          const controller = this.owner.lookup('controller:authenticated/sessions/details');
          controller.model = {
            certificationCandidates: ['candidate1', 'candidate2'],
            isUserFromSco: false,
            isCertifPrescriptionScoEnabled: false,
          };

          // when
          const shouldDisplayDownloadButton = controller.shouldDisplayDownloadButton;

          // then
          assert.ok(shouldDisplayDownloadButton);
        });
      });
    });
  });

  module('when there is no enrolled candidate', function() {
    test('Should return false.', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = {
        certificationCandidates: [],
        isUserFromSco: true,
        isCertifPrescriptionScoEnabled: true,
      };

      // when
      const shouldDisplayDownloadButton = controller.shouldDisplayDownloadButton;

      // then
      assert.notOk(shouldDisplayDownloadButton);
    });
  });
});
