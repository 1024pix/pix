import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | session', function(hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  module('#countNotCheckedEndScreen', function() {

    module('when there is only one certification', function() {
      let sessionWithOneUncheckedEndScreen;
      let sessionWithOneCheckedEndScreen;

      hooks.beforeEach(async function() {
        sessionWithOneUncheckedEndScreen = run(() => {
          const certif = store.createRecord('certification', { hasSeenEndTestScreen: false });
          return store.createRecord('session', { certifications: [certif] });
        });

        sessionWithOneCheckedEndScreen = run(() => {
          const certif = store.createRecord('certification', { hasSeenEndTestScreen: true });
          return store.createRecord('session', { certifications: [certif] });
        });
      });

      test('it should have one certification', function(assert) {
        const certifsChecked = sessionWithOneUncheckedEndScreen.get('certifications');
        const certifsUnchecked = sessionWithOneCheckedEndScreen.get('certifications');
        assert.equal(certifsChecked.length, 1);
        assert.equal(certifsUnchecked.length, 1);
      });

      test('it should count 1 unchecked box if only one box (unchecked)', function(assert) {
        const countNotCheckedEndScreen = sessionWithOneUncheckedEndScreen.get('countNotCheckedEndScreen');
        assert.equal(countNotCheckedEndScreen, 1);
      });

      test('it should count 0 unchecked box if only one box (checked)', function(assert) {
        const countNotCheckedEndScreen = sessionWithOneCheckedEndScreen.get('countNotCheckedEndScreen');
        assert.equal(countNotCheckedEndScreen, 0);
      });
    });

    module('when there are multiple certifications', function() {
      let sessionWithCertifications;

      hooks.beforeEach(async function() {
        store = this.owner.lookup('service:store');

        sessionWithCertifications = run(() => {
          const certif1 = store.createRecord('certification', { hasSeenEndTestScreen: false });
          const certif2 = store.createRecord('certification', { hasSeenEndTestScreen: false });
          const certif3 = store.createRecord('certification', { hasSeenEndTestScreen: true });
          return store.createRecord('session', { certifications: [ certif1, certif2, certif3 ] });
        });
      });

      test('it should have 3 certifications', function(assert) {
        const certifications = sessionWithCertifications.get('certifications');
        assert.equal(certifications.length, 3);
      });

      test('it should count 2 unchecked box if two box (unchecked)', function(assert) {
        const countNotCheckedEndScreen = sessionWithCertifications.get('countNotCheckedEndScreen');
        assert.equal(countNotCheckedEndScreen, 2);
      });
    });

  });

  module('#isPublished', function() {

    module('when there is no certification', function() {
      let sessionWithoutCertifications;
      
      test('isPublished should be false', function(assert) {
        // given
        sessionWithoutCertifications = run(() => {
          return store.createRecord('session', { certifications: [] });
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
            const certif1 = store.createRecord('certification', { isPublished: true });
            const certif2 = store.createRecord('certification', { isPublished: true });
            return store.createRecord('session', { certifications: [ certif1, certif2 ] });
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
            const certif1 = store.createRecord('certification', { isPublished: true });
            const certif2 = store.createRecord('certification', { isPublished: false });
            return store.createRecord('session', { certifications: [ certif1, certif2 ] });
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
            const certif1 = store.createRecord('certification', { isPublished: false });
            const certif2 = store.createRecord('certification', { isPublished: false });
            return store.createRecord('session', { certifications: [ certif1, certif2 ] });
          });
        });

        test('isPublished from session should be false', function(assert) {
          const isPublished = sessionWithoutAllCertificationsPublished.get('isPublished');
          assert.equal(isPublished, false);
        });
      });

    });

  });
});
