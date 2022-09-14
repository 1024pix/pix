import { expect } from 'chai';
import { context, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Controller | shared-certification', function () {
  setupTest();

  context('#get shouldDisplayDetailsSection', function () {
    it('should return true when certification has a commentForCandidate', function () {
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
      expect(shouldDisplayDetailsSection).to.be.true;
    });

    it('should return true when certification has at least one certified badge image', function () {
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
      expect(shouldDisplayDetailsSection).to.be.true;
    });

    it('should return false when none of the above is checked', function () {
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
      expect(shouldDisplayDetailsSection).to.be.false;
    });
  });
});
