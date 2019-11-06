import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';

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

  describe('#tutorialsGroupedByTubeName', function() {
    it('returns an array of tubes with related tutorials', function() {
      // given
      const tutorial_1 =  EmberObject.create({
        modelName: 'tutorial',
        id: 'recR17mopxC9VAmGp',
        title: 'Définition : Lorem Ipsum',
        tubeName: '@web',
        tubePracticalTitle: 'Lorem Ipsum dolor sit',
      });

      const tutorial_2 = EmberObject.create({
        modelName: 'tutorial',
        id: 'recR17mopxC9VAopm',
        title: 'Lorem Ipsum',
        tubeName: '@web',
        tubePracticalTitle: 'Lorem Ipsum dolor sit',
      });

      const tutorial_3 = EmberObject.create({
        modelName: 'tutorial',
        id: 'recR17mopxC9VAoap',
        title: 'Définition : Lorem Ipsum',
        tubeName: '@url',
        tubePracticalTitle: 'Lorem Ipsum dolor sit',
      });

      const tutorials = [tutorial_1, tutorial_2, tutorial_3];
      const scorecard =  EmberObject.create({ tutorials });

      const expectedResult = [
        {
          name: tutorial_1.tubeName,
          practicalTitle: tutorial_1.tubePracticalTitle,
          tutorials: [tutorial_1, tutorial_2]
        },
        {
          name: tutorial_3.tubeName,
          practicalTitle: tutorial_3.tubePracticalTitle,
          tutorials: [tutorial_3]
        },
      ];

      // when
      component.set('scorecard', scorecard);
      const result = component.get('tutorialsGroupedByTubeName');

      // then
      expect(result[0].name).to.deep.equal(expectedResult[0].name);
      expect(result[0].practicalTitle).to.deep.equal(expectedResult[0].practicalTitle);
      expect(result[0].tutorials).to.have.lengthOf(2);
      expect(result[0].tutorials[0].id).to.deep.equal(expectedResult[0].tutorials[0].id);
      expect(result[0].tutorials[1].id).to.deep.equal(expectedResult[0].tutorials[1].id);

      expect(result[1].name).to.deep.equal(expectedResult[1].name);
      expect(result[1].practicalTitle).to.deep.equal(expectedResult[1].practicalTitle);
      expect(result[1].tutorials).to.have.lengthOf(1);
      expect(result[1].tutorials[0].id).to.deep.equal(expectedResult[1].tutorials[0].id);
    });

    it('returns an empty array when there is no tutorials', function() {
      // given
      const tutorials = [];
      const scorecard =  EmberObject.create({ tutorials });

      const expectedResult = [];

      // when
      component.set('scorecard', scorecard);
      const result = component.get('tutorialsGroupedByTubeName');

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(result).to.have.lengthOf(0);
    });
  });
});
