import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Controller | authenticated/sessions/details/certification-candidates', function(hooks) {
  setupTest(hooks);
  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  module('#computed hasOneOrMoreCandidates()', function() {
    test('It should return true when has one or more candidates', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      controller.model = { certificationCandidates: ['certifCandidate1', 'certifCanddate2'] } ;

      const shouldDisplayStudentList = controller.hasOneOrMoreCandidates;

      // then
      assert.true(shouldDisplayStudentList);
    });

    test('It should return false when has no candidate', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      controller.model = { certificationCandidates: [] } ;

      const shouldDisplayStudentList = controller.hasOneOrMoreCandidates;

      // then
      assert.false(shouldDisplayStudentList);
    });
  });

  module('#get shouldDisplayComplementaryCertifications', function() {
    test('should return false if feature toggle is false and center has complementary certifications', function(assert) {
      // given
      _stubFeatureToggle(this, 'isComplementaryCertificationSubscriptionEnabled', false);
      _stubCurrentCenterHabilitations(this, store, ['Pix+Droit']);
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      const shouldDisplayComplementaryCertifications = controller.shouldDisplayComplementaryCertifications;

      // then
      assert.false(shouldDisplayComplementaryCertifications);
    });

    test('should return false if feature toggle is true and center has no complementary certifications', function(assert) {
      // given
      _stubFeatureToggle(this, 'isComplementaryCertificationSubscriptionEnabled', true);
      _stubCurrentCenterHabilitations(this, store, []);
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      const shouldDisplayComplementaryCertifications = controller.shouldDisplayComplementaryCertifications;

      // then
      assert.false(shouldDisplayComplementaryCertifications);
    });

    test('should return true if feature toggle is true and center has complementary certifications', function(assert) {
      // given
      _stubFeatureToggle(this, 'isComplementaryCertificationSubscriptionEnabled', true);
      _stubCurrentCenterHabilitations(this, store, ['Pix+Edu']);
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      const shouldDisplayComplementaryCertifications = controller.shouldDisplayComplementaryCertifications;

      // then
      assert.true(shouldDisplayComplementaryCertifications);
    });
  });
});

function _stubFeatureToggle(controller, featureToggleName, featureToggleValue) {
  const featureToggles = {};
  featureToggles[featureToggleName] = featureToggleValue;
  class FeatureTogglesStub extends Service {
    featureToggles = featureToggles;
  }
  controller.owner.register('service:feature-toggles', FeatureTogglesStub);
}

function _stubCurrentCenterHabilitations(controller, store, habilitations) {
  const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
    habilitations,
  });
  class CurrentUserStub extends Service {
    currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
  }
  controller.owner.register('service:current-user', CurrentUserStub);
}
