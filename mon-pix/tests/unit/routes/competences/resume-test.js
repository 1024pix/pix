import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Competence | Resume', function() {
  setupTest('route:competences.resume', {
    needs: ['service:session','service:metrics']
  });

  let route;
  const competenceId = 'competenceId';
  let competenceEvaluationFromStore, competenceEvaluationCreated, competenceEvaluationFromAnotherCompetence;
  let storeStub;
  let peekAllStub;
  let createRecordStub;

  beforeEach(function() {
    competenceEvaluationFromStore = EmberObject.create({ id: 123, competenceId });
    competenceEvaluationCreated = EmberObject.create({ id: 456, competenceId });
    competenceEvaluationFromAnotherCompetence = EmberObject.create({ id: 789, competenceId: 'other' });

    peekAllStub = sinon.stub();
    createRecordStub = sinon.stub().returns({
      save: sinon.stub().resolves(competenceEvaluationCreated),
    });
    storeStub = Service.extend({
      peekAll: peekAllStub,
      createRecord: createRecordStub
    });

    // manage dependency injection context
    this.register('service:store', storeStub);
    this.inject.service('store', { as: 'store' });

    // instance route object
    route = this.subject();
    route.replaceWith = sinon.stub();

  });

  describe('#model', function() {

    it('should create the CompetenceEvaluation if it not exits', function() {
      // given
      peekAllStub.returns([competenceEvaluationFromAnotherCompetence]);

      const params = { competence_id: competenceId };

      // when
      const promise = route.model(params);

      // then
      promise.then((resultModel) => {
        expect(resultModel).to.equal(competenceEvaluationCreated);
      });

    });

    it('should return the CompetenceEvaluation in store if it exists', function() {
      // given
      peekAllStub.returns([competenceEvaluationFromStore]);
      const params = { competence_id: competenceId };

      // when
      const resultModel = route.model(params);

      // then
      expect(resultModel).to.equal(competenceEvaluationFromStore);
    });

  });

  describe('#afterModel', function() {

    it('should transition to assessment.resume', function() {
      // given
      route.replaceWith.resolves();
      const competenceEvaluation = EmberObject.create({ competenceId, assessment: { id: 'assessmentId' } });

      // when
      const promise = route.afterModel(competenceEvaluation);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(route.replaceWith);
        sinon.assert.calledWith(route.replaceWith, 'assessment.resume', 'assessmentId');
      });
    });
  });
});
