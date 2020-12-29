import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import { A } from '@ember/array';

describe('Unit | Route | Competences | Results', function() {

  setupTest();

  describe('model', function() {

    const assessmentId = 'assessmentId';

    let route;
    let storeStub;
    let sessionStub;
    let findAllStub;

    beforeEach(function() {
      findAllStub = sinon.stub();
      storeStub = Service.create({
        findAll: findAllStub,
      });
      sessionStub = Service.create({
        isAuthenticated: true,
      });

      route = this.owner.lookup('route:competences.results');
      route.set('store', storeStub);
      route.set('session', sessionStub);
      route.transitionTo = sinon.stub();
    });

    it('should return the most recent competence-evaluation for a given assessment', async function() {
      // Given
      const competenceEvaluationsInStore = A([
        { id: 1, createdAt: new Date('2020-01-01'), assessment: { get: () => assessmentId } },
        { id: 2, createdAt: new Date('2020-02-01'), assessment: { get: () => assessmentId } },
        { id: 3, createdAt: new Date('2020-03-01'), assessment: { get: () => 456 } },
      ]);
      findAllStub
        .withArgs('competenceEvaluation', { reload: true, adapterOptions: { assessmentId } })
        .resolves(competenceEvaluationsInStore);

      // When
      const model = await route.model({
        assessment_id: assessmentId,
      });

      // Then
      expect(model.id).to.equal(2);
    });
  });

});
