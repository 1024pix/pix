import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';

describe('Unit | Component | tutorial panel', function() {
  setupComponentTest('tutorial-panel', {
    unit: true
  });

  let component;

  beforeEach(function() {
    component = this.subject();
  });

  describe('#shouldDisplayHintAndTuto', function() {

    [ 'ko', 'aband', 'partially', 'timedout', 'default' ].forEach((status) => {
      it(`should return true when resultItemStatus is "${status}"`, function() {
        // given
        component.set('resultItemStatus', status);

        // when
        const result = component.get('shouldDisplayHintAndTuto');

        // then
        expect(result).to.be.true;
      });
    });

    it('should return false when resultItemStatus is "ok"', function() {
      // given
      component.set('resultItemStatus', 'ok');

      // when
      const result = component.get('shouldDisplayHintAndTuto');

      // then
      expect(result).to.be.false;
    });
  });

  describe('#shouldDisplayHint', function() {

    it('should return true when hint is defined', function() {
      // given
      component.set('hint', 'Un conseil...');

      // when
      const result = component.get('shouldDisplayHint');

      // then
      expect(result).to.be.true;
    });

    it('should return false when hint is not defined', function() {
      // given
      component.set('hint', null);

      // when
      const result = component.get('shouldDisplayHint');

      // then
      expect(result).to.be.false;
    });
  });

  describe('#shouldDisplayTutorial', function() {

    it('should return true when has tutorial', function() {
      // given
      const tutorialsExpected = {
        id: 'recTuto1',
        format: 'video',
      };
      component.set('tutorials', [tutorialsExpected]);

      // when
      const result = component.get('shouldDisplayTutorial');

      // then
      expect(result).to.be.true;
    });

    it('should return false when tutorials is empty', function() {
      // given
      component.set('tutorials', []);

      // when
      const result = component.get('shouldDisplayTutorial');

      // then
      expect(result).to.be.false;
    });

    it('should return false when tutorials is null', function() {
      // given
      component.set('tutorials', null);

      // when
      const result = component.get('shouldDisplayTutorial');

      // then
      expect(result).to.be.false;
    });
  });
});
