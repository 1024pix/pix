import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

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

    it('should return the first competence-evaluation for a given assessment', async function() {
      // Given
      const expectedCompetenceEvaluation = { id: 1 };
      findAllStub
        .withArgs('competenceEvaluation', { adapterOptions: { assessmentId } })
        .resolves({ firstObject: expectedCompetenceEvaluation });

      // When
      const model = await route.model({
        assessment_id: assessmentId,
      });

      // Then
      expect(model.id).to.equal(1);
    });
  });

});
