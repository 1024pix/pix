import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | scoring-panel', function() {

  setupTest('component:scoring-panel', {});

  describe('#hasATrophy', function() {

    it('should be true when level is more than 0', function() {
      // given
      const assessmentWithTrophy = { estimatedLevel: 1 };
      const component = this.subject();

      // when
      component.set('assessment', assessmentWithTrophy);
      const hasATrophy = component.get('hasATrophy');

      // then
      expect(hasATrophy).to.be.equal(true);
    });

    it('should be false when level is equal to 0', function() {
      // given
      const assessmentWithNoTrophy = { estimatedLevel: 0 };
      const component = this.subject();

      // when
      component.set('assessment', assessmentWithNoTrophy);
      const hasATrophy = component.get('hasATrophy');

      // then
      expect(hasATrophy).to.be.equal(false);
    });
  });

});
