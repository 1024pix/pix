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
    const competenceId = 'recCompetenceId';
    const userId = 'userId';
    const scorecardId = 'scorecardId';
    const scorecard = EmberObject.create({ competenceId, id: scorecardId });
    let competenceEvaluation, component;

    it('calls competenceEvaluation service for improving', async function() {
      // given
      component = createGlimmerComponent('component:competence-card-default', { scorecard });
      competenceEvaluation = Service.create({ improve: sinon.stub() });
      component.currentUser = EmberObject.create({ user: { id: userId } });
      component.competenceEvaluation = competenceEvaluation;

      // when
      await component.improveCompetenceEvaluation();

      // then
      sinon.assert.calledWith(competenceEvaluation.improve, { userId, competenceId, scorecardId });
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
