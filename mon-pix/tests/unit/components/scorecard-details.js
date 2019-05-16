import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | scorecard-details ', function() {
  setupTest();

  describe('#level', function() {
    it('returns null if the scorecard isNotStarted', function() {
      // given
      const controller = this.owner.lookup('controller:scorecard-details');

      // when
      controller.set('scorecard', { isNotStarted: true });

      // then
      expect(controller.get('level')).to.be.equal(null);
    });

    it('returns the level if the scorecard is not isNotStarted', function() {
      // given
      const controller = this.owner.lookup('controller:scorecard-details');

      // when
      controller.set('scorecard', { level: 1 });

      // then
      expect(controller.get('level')).to.be.equal(1);
    });

  });

  describe('#isProgressable', function() {
    it('returns false if isMaxLevel', function() {
      // given
      const controller = this.owner.lookup('controller:scorecard-details');

      // when
      controller.set('scorecard', { isMaxLevel: true });

      // then
      expect(controller.get('isProgressable')).to.be.equal(false);
    });

    it('returns false if isNotStarted', function() {
      // given
      const controller = this.owner.lookup('controller:scorecard-details');

      // when
      controller.set('scorecard', { isNotStarted: true });

      // then
      expect(controller.get('isProgressable')).to.be.equal(false);
    });

    it('returns true otherwise', function() {
      // given
      const controller = this.owner.lookup('controller:scorecard-details');

      // when
      controller.set('scorecard', {});

      // then
      expect(controller.get('isProgressable')).to.be.equal(true);
    });
  });
});
