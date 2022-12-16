import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | user-certifications/get', function (hooks) {
  setupTest(hooks);

  module('#get shouldDisplayDetailsSection', function () {
    test('should return true when certification has a commentForCandidate', function (assert) {
      const controller = this.owner.lookup('controller:authenticated/user-certifications/get');
      const store = this.owner.lookup('service:store');
      controller.model = store.createRecord('certification', {
        firstName: 'Laura',
        lastName: 'Summers',
        commentForCandidate: 'some comment',
        certifiedBadgeImages: [],
      });

      // when
      const shouldDisplayDetailsSection = controller.shouldDisplayDetailsSection;

      // then
      assert.true(shouldDisplayDetailsSection);
    });

    test('should return true when certification has at least one certified badge image', function (assert) {
      const controller = this.owner.lookup('controller:authenticated/user-certifications/get');
      const store = this.owner.lookup('service:store');
      controller.model = store.createRecord('certification', {
        firstName: 'Laura',
        lastName: 'Summers',
        commentForCandidate: null,
        certifiedBadgeImages: ['/some/img'],
      });

      // when
      const shouldDisplayDetailsSection = controller.shouldDisplayDetailsSection;

      // then
      assert.true(shouldDisplayDetailsSection);
    });

    test('should return false when none of the above is checked', function (assert) {
      const controller = this.owner.lookup('controller:authenticated/user-certifications/get');
      const store = this.owner.lookup('service:store');
      controller.model = store.createRecord('certification', {
        firstName: 'Laura',
        lastName: 'Summers',
        commentForCandidate: null,
        certifiedBadgeImages: [],
      });

      // when
      const shouldDisplayDetailsSection = controller.shouldDisplayDetailsSection;

      // then
      assert.false(shouldDisplayDetailsSection);
    });
  });
});
