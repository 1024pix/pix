import sinon from 'sinon';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | competence-card-default ', function() {
  setupTest();

  describe('#improveCompetenceEvaluation', function() {
    let store, userId, competenceId, router;

    beforeEach(async function() {
      // given
      competenceId = 'recCompetenceId';
      const scorecard = EmberObject.create({ competenceId });
      const component = createGlimmerComponent('component:competence-card-default', { scorecard, interactive: true });
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
      component = createGlimmerComponent('component:competence-card-default', { scorecard, interactive: true });
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
      component = createGlimmerComponent('component:competence-card-default', { scorecard, interactive: true });
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
