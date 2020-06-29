import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | scorecard-details ', function() {
  setupTest();

  describe('#level', function() {
    it('returns null if the scorecard isNotStarted', function() {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: { isNotStarted: true } });

      // then
      expect(component.level).to.equal(null);
    });

    it('returns the level if the scorecard is not isNotStarted', function() {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: { level: 1 } });

      // then
      expect(component.level).to.equal(1);
    });

  });

  describe('#isProgressable', function() {
    it('returns false if isMaxLevel', function() {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: { isMaxLevel: true } });

      // then
      expect(component.isProgressable).to.equal(false);
    });

    it('returns false if isNotStarted', function() {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: { isNotStarted: true } });

      // then
      expect(component.isProgressable).to.equal(false);
    });

    it('returns false if isFinished', function() {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: { isFinished: true } });

      // then
      expect(component.isProgressable).to.equal(false);
    });

    it('returns true otherwise', function() {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: {} });

      // then
      expect(component.isProgressable).to.equal(true);
    });
  });

  describe('#canImprove', function() {
    it('returns true if maxlevel not reached', function() {
      // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: { isFinishedWithMaxLevel: false } });

      // then
      expect(component.canImprove).to.equal(true);
    });

    it('returns false if maxlevel reached', function() {
    // when
      const component = createGlimmerComponent('component:scorecard-details', { scorecard: { isFinishedWithMaxLevel: true } });

      // then
      expect(component.canImprove).to.equal(false);
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
      const component = createGlimmerComponent('component:scorecard-details', { scorecard });

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
      const result = component.tutorialsGroupedByTubeName;

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
      const scorecard = EmberObject.create({ tutorials });
      const component = createGlimmerComponent('component:scorecard-details', { scorecard });

      const expectedResult = [];

      // when
      const result = component.tutorialsGroupedByTubeName;

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(result).to.have.lengthOf(0);
    });
  });

  describe('#improveCompetenceEvaluation', function() {
    let store, userId, competenceId, router;

    beforeEach(async function() {
      // given
      competenceId = 'recCompetenceId';
      const scorecard = EmberObject.create({ competenceId });
      const component = createGlimmerComponent('component:scorecard-details', { scorecard });
      store = Service.create({ queryRecord: sinon.stub().resolves() });
      component.store = store;
      userId = 'userId';
      component.currentUser = EmberObject.create({ user: { id: userId } });
      router = EmberObject.create({ transitionTo: sinon.stub() });
      component.router = router;

      // when
      await component.improveCompetenceEvaluation();
    });

    it('creates a competence-evaluation for improving', async function() {
      // then
      sinon.assert.calledWith(store.queryRecord, 'competence-evaluation', {
        improve: true,
        userId,
        competenceId
      });
    });

    it('redirects to competences.resume route', async function() {
      // then
      sinon.assert.calledWith(router.transitionTo, 'competences.resume', competenceId);
    });

  });

  describe('#computeRemainingDaysBeforeImproving', function() {
    let component, scorecard;

    beforeEach(() => {
      const competenceId = 'recCompetenceId';
      scorecard = EmberObject.create({ competenceId });
      component = createGlimmerComponent('component:scorecard-details', { scorecard });
    });

    it('should return a singular sentence when remaining days before improving are equal to 1', () => {
      // given
      scorecard.remainingDaysBeforeImproving = 1;

      // when
      const result = component.computeRemainingDaysBeforeImproving;

      // then
      expect(result).to.be.equal('1 jour');
    });

    it('should return a plural sentence when remaining days before improving are different than 1', () => {
      // given
      scorecard.remainingDaysBeforeImproving = 3;

      // when
      const result = component.computeRemainingDaysBeforeImproving;

      // then
      expect(result).to.be.equal('3 jours');
    });
  });

  describe('#shouldWaitBeforeImproving', function() {
    let component, scorecard;

    beforeEach(() => {
      const competenceId = 'recCompetenceId';
      scorecard = EmberObject.create({ competenceId });
      component = createGlimmerComponent('component:competence-card-default', { scorecard });
    });

    it('should return true when remaining days before improving are different than 0', () => {
      // given
      scorecard.remainingDaysBeforeImproving = 3;

      // when
      const result = component.shouldWaitBeforeImproving;

      // then
      expect(result).to.be.true;
    });

    it('should return false when remaining days before improving are equal to 0', () => {
      // given
      scorecard.remainingDaysBeforeImproving = 0;

      // when
      const result = component.shouldWaitBeforeImproving;

      // then
      expect(result).to.be.false;
    });
  });

});
