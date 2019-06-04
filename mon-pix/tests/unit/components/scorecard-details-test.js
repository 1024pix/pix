import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | scorecard-details ', function() {
  setupTest();

  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:scorecard-details');
  });

  describe('#level', function() {
    it('returns null if the scorecard isNotStarted', function() {
      // when
      component.set('scorecard', { isNotStarted: true });

      // then
      expect(component.get('level')).to.be.equal(null);
    });

    it('returns the level if the scorecard is not isNotStarted', function() {
      // when
      component.set('scorecard', { level: 1 });

      // then
      expect(component.get('level')).to.be.equal(1);
    });

  });

  describe('#isProgressable', function() {
    it('returns false if isMaxLevel', function() {
      // when
      component.set('scorecard', { isMaxLevel: true });

      // then
      expect(component.get('isProgressable')).to.be.equal(false);
    });

    it('returns false if isNotStarted', function() {
      // when
      component.set('scorecard', { isNotStarted: true });

      // then
      expect(component.get('isProgressable')).to.be.equal(false);
    });

    it('returns false if isFinished', function() {
      // when
      component.set('scorecard', { isFinished: true });

      // then
      expect(component.get('isProgressable')).to.be.equal(false);
    });

    it('returns true otherwise', function() {
      // when
      component.set('scorecard', {});

      // then
      expect(component.get('isProgressable')).to.be.equal(true);
    });
  });
});
