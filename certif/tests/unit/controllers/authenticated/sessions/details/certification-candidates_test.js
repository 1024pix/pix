import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Controller | authenticated/sessions/details/certification-candidates', function (hooks) {
  setupTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#computed hasOneOrMoreCandidates()', function () {
    test('It should return true when has one or more candidates', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      controller.model = { certificationCandidates: ['certifCandidate1', 'certifCanddate2'] };

      const shouldDisplayStudentList = controller.hasOneOrMoreCandidates;

      // then
      assert.true(shouldDisplayStudentList);
    });

    test('It should return false when has no candidate', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      controller.model = { certificationCandidates: [] };

      const shouldDisplayStudentList = controller.hasOneOrMoreCandidates;

      // then
      assert.false(shouldDisplayStudentList);
    });
  });

  module('#get shouldDisplayComplementaryCertifications', function () {
    test('should return false if center has no complementary certifications', function (assert) {
      // given
      _stubCurrentCenter(this, store, { habilitations: [] });
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      const shouldDisplayComplementaryCertifications = controller.shouldDisplayComplementaryCertifications;

      // then
      assert.false(shouldDisplayComplementaryCertifications);
    });

    test('should return true and center has complementary certifications', function (assert) {
      // given
      _stubCurrentCenter(this, store, { habilitations: ['Pix+Edu'] });
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      const shouldDisplayComplementaryCertifications = controller.shouldDisplayComplementaryCertifications;

      // then
      assert.true(shouldDisplayComplementaryCertifications);
    });
  });

  module('#get shouldDisplayPaymentOptions', function () {
    test('should return false if center is sco', function (assert) {
      // given
      _stubCurrentCenter(this, store, { type: 'SCO' });
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      const shouldDisplayPaymentOptions = controller.shouldDisplayPaymentOptions;

      // then
      assert.false(shouldDisplayPaymentOptions);
    });

    test('should return true if center is not SCO', function (assert) {
      // given
      _stubCurrentCenter(this, store, { type: 'PRO' });
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      const shouldDisplayPaymentOptions = controller.shouldDisplayPaymentOptions;

      // then
      assert.true(shouldDisplayPaymentOptions);
    });
  });
});

function _stubCurrentCenter(controller, store, properties) {
  const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
    ...properties,
  });

  class CurrentUserStub extends Service {
    currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
  }
  controller.owner.register('service:current-user', CurrentUserStub);
}
