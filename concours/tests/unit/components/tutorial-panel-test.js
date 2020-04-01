import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | tutorial panel', function() {
  setupTest();

  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:tutorial-panel');
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

    it('should return false when hint is an empty array', function() {
      // given
      component.set('hint', []);

      // when
      const result = component.get('shouldDisplayHint');

      // then
      expect(result).to.be.false;
    });

  });

  describe('#shouldDisplayHintOrTuto', function() {

    it('should return true when hint is defined and tuto is not', function() {
      // given
      component.set('hint', 'Un conseil...');
      component.set('tutorials', []);

      // when
      const result = component.get('shouldDisplayHintOrTuto');

      // then
      expect(result).to.be.true;
    });

    it('should return true when hint is not defined and tuto is defined', function() {
      // given
      component.set('hint', null);
      component.set('tutorials', [{ id: 'recTuto' }]);

      // when
      const result = component.get('shouldDisplayHintOrTuto');

      // then
      expect(result).to.be.true;
    });

    it('should return false when hint and tutorials are not defined', function() {
      // given
      component.set('hint', null);
      component.set('tutorials', null);

      // when
      const result = component.get('shouldDisplayHintOrTuto');

      // then
      expect(result).to.be.false;
    });

    it('should return false when hint and tutorials are empty array', function() {
      // given
      component.set('hint', []);
      component.set('tutorials', []);

      // when
      const result = component.get('shouldDisplayHintOrTuto');

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

  describe('#limitedTutorial', function() {

    it('should return an array with the same tutorials', function() {
      // given
      const tutorialsExpected1 = {
        id: 'recTuto1',
        format: 'video',
      };
      const tutorialsExpected2 = {
        id: 'recTuto2',
        format: 'son',
      };
      const tutorials = [tutorialsExpected1, tutorialsExpected2];
      component.set('tutorials', tutorials);

      // when
      const result = component.get('limitedTutorials');

      // then
      expect(result).to.deep.equal(tutorials);
    });

    it('should return only 3 elements if the tutorials contains more', function() {
      // given
      const tutorialsExpected1 = {
        id: 'recTuto1',
      };
      const tutorialsExpected2 = {
        id: 'recTuto2',
      };
      const tutorialsExpected3 = {
        id: 'recTuto3',
      };
      const tutorialsExpected4 = {
        id: 'recTuto4',
      };

      const tutorials = [tutorialsExpected1, tutorialsExpected2, tutorialsExpected3, tutorialsExpected4];
      const expectedTutorials = [tutorialsExpected1, tutorialsExpected2, tutorialsExpected3];
      component.set('tutorials', tutorials);

      // when
      const result = component.get('limitedTutorials');

      // then
      expect(result.length).to.equal(3);
      expect(result).to.deep.equal(expectedTutorials);
    });
  });

});
