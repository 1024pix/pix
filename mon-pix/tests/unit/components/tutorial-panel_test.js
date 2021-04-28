import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | tutorial panel', function() {
  setupTest();

  let component;

  beforeEach(function() {
    component = createGlimmerComponent('component:tutorial-panel');
  });

  describe('#shouldDisplayHint', function() {

    it('should return true when hint is defined', function() {
      // given
      component.args.hint = 'Un conseil...';

      // when
      const result = component.shouldDisplayHint;

      // then
      expect(result).to.be.true;
    });

    it('should return false when hint is not defined', function() {
      // given
      component.args.hint = null;

      // when
      const result = component.shouldDisplayHint;

      // then
      expect(result).to.be.false;
    });

    it('should return false when hint is an empty array', function() {
      // given
      component.args.hint = [];

      // when
      const result = component.shouldDisplayHint;

      // then
      expect(result).to.be.false;
    });

  });

  describe('#shouldDisplayHintOrTuto', function() {

    it('should return true when hint is defined and tuto is not', function() {
      // given
      component.args.hint = 'Un conseil...';
      component.args.tutorials = [];

      // when
      const result = component.shouldDisplayHintOrTuto;

      // then
      expect(result).to.be.true;
    });

    it('should return true when hint is not defined and tuto is defined', function() {
      // given
      component.args.hint = null;
      component.args.tutorials = [{ id: 'recTuto' }];

      // when
      const result = component.shouldDisplayHintOrTuto;

      // then
      expect(result).to.be.true;
    });

    it('should return false when hint and tutorials are not defined', function() {
      // given
      component.args.hint = null;
      component.args.tutorials = null;

      // when
      const result = component.shouldDisplayHintOrTuto;

      // then
      expect(result).to.be.false;
    });

    it('should return false when hint and tutorials are empty array', function() {
      // given
      component.args.hint = [];
      component.args.tutorials = [];

      // when
      const result = component.shouldDisplayHintOrTuto;

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
      component.args.tutorials = [tutorialsExpected];

      // when
      const result = component.shouldDisplayTutorial;

      // then
      expect(result).to.be.true;
    });

    it('should return false when tutorials is empty', function() {
      // given
      component.args.tutorials = [];

      // when
      const result = component.shouldDisplayTutorial;

      // then
      expect(result).to.be.false;
    });

    it('should return false when tutorials is null', function() {
      // given
      component.args.tutorials = null;

      // when
      const result = component.shouldDisplayTutorial;

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
      component.args.tutorials = tutorials;

      // when
      const result = component.limitedTutorials;

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
      component.args.tutorials = tutorials;

      // when
      const result = component.limitedTutorials;

      // then
      expect(result.length).to.equal(3);
      expect(result).to.deep.equal(expectedTutorials);
    });
  });

});
