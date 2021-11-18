import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Controller | authenticated/sessions/details/certification-candidates', function(hooks) {
  setupTest(hooks);

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

  module('#get displayComplementaryCertification', function() {
    test('should return false if feature toggle is false', function(assert) {
      // given
      _stubFeatureToggle(this, 'isComplementaryCertificationSubscriptionEnabled', false);
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      const displayComplementaryCertification = controller.displayComplementaryCertification;

      // then
      assert.false(displayComplementaryCertification);
    });

    test('should return true if feature toggle is true', function(assert) {
      // given
      _stubFeatureToggle(this, 'isComplementaryCertificationSubscriptionEnabled', true);
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      const displayComplementaryCertification = controller.displayComplementaryCertification;

      // then
      assert.true(displayComplementaryCertification);
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
