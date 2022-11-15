import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | shared-certification', function (hooks) {
  setupTest(hooks);

  module('#get shouldDisplayDetailsSection', function () {
    test('should return true when certification has a commentForCandidate', function (assert) {
      const controller = this.owner.lookup('controller:shared-certification');
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
      assert.equal(shouldDisplayDetailsSection, true);
    });

    test('should return true when certification has at least one certified badge image', function (assert) {
      const controller = this.owner.lookup('controller:shared-certification');
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
      assert.equal(shouldDisplayDetailsSection, true);
    });

    test('should return false when none of the above is checked', function (assert) {
      const controller = this.owner.lookup('controller:shared-certification');
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
      assert.equal(shouldDisplayDetailsSection, false);
    });
  });
});
