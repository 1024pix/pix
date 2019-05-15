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

    it('returns the level if the scorecard level is over zero', function() {
      // given
      const controller = this.owner.lookup('controller:scorecard-details');

      // when
      controller.set('scorecard', { level: 1 });

      // then
      expect(controller.get('level')).to.be.equal(1);
    });

    it('returns a dash if the scorecard level is zero', function() {
      // given
      const controller = this.owner.lookup('controller:scorecard-details');

      // when
      controller.set('scorecard', { level: 0 });

      // then
      expect(controller.get('level')).to.be.equal('–');
    });
  });

  describe('#earnedPix', function() {
    it('returns the earnedPix if the scorecard earnedPix is over zero', function() {
      // given
      const controller = this.owner.lookup('controller:scorecard-details');

      // when
      controller.set('scorecard', { earnedPix: 1 });

      // then
      expect(controller.get('earnedPix')).to.be.equal(1);
    });

    it('returns a dash if the scorecard earnedPix is zero', function() {
      // given
      const controller = this.owner.lookup('controller:scorecard-details');

      // when
      controller.set('scorecard', { earnedPix: 0 });

      // then
      expect(controller.get('earnedPix')).to.be.equal('–');
    });
  });
});
