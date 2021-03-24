import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/sessions/details', (hooks) => {
  setupTest(hooks);

  module('#certificationCandidatesCount', () => {
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

  module('#hasOneOrMoreCandidates', () => {
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

  module('#shouldDisplayDownloadButton', () => {

    module('when there is at least one enrolled candidate', () => {

      module('when it should display the CertifPrescriptionScoFeature', () => {

        test('should return true ', function(assert) {
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

      test('Should return true', function(assert) {
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

  module('#shouldDisplayResultRecipientInfoMessage', () => {

    module('when the current user certification center does manage students', () => {
      test('should also return false', function(assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/sessions/details');
        controller.model = {
          shouldDisplayPrescriptionScoStudentRegistrationFeature: true,
        };

        // when
        const shouldDisplayResultRecipientInfoMessage = controller.shouldDisplayResultRecipientInfoMessage;

        // then
        assert.notOk(shouldDisplayResultRecipientInfoMessage);
      });
    });

    module('when current user is if of type Sco and does not managing students', () => {
      test('should return true', function(assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/sessions/details');
        controller.currentUser = {
          currentCertificationCenter: { isScoManagingStudents: false },
        };

        // when
        const shouldDisplayResultRecipientInfoMessage = controller.shouldDisplayResultRecipientInfoMessage;

        // then
        assert.ok(shouldDisplayResultRecipientInfoMessage);
      });
    });
  });

  module('when there is no enrolled candidate', () => {
    test('Should return false.', function(assert) {
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
});
