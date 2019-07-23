import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Competence | Results', function() {

  setupTest();

  beforeEach(function() {
    this.owner.register('service:session', Service.extend({
      isAuthenticated: true,
    }));
  });

  describe('model', function() {

    const assessmentId = 'assessmentId';

    let route;
    let storeStub;
    let queryStub;

    beforeEach(function() {
      queryStub = sinon.stub();
      storeStub = Service.extend({
        query: queryStub
      });

      this.owner.register('service:store', storeStub);

      route = this.owner.lookup('route:competence.results');
      route.transitionTo = sinon.stub();
    });

    it('should return the first competence-evaluation for a given assessment', async function() {
      // Given
      const expectedCompetenceEvaluation = [{ id: 1 }];
      queryStub.resolves(expectedCompetenceEvaluation);

      // When
      const model = await route.model({
        assessment_id: assessmentId,
      });

      // Then
      sinon.assert.calledWith(queryStub, 'competenceEvaluation', { filter: { assessmentId } });
      expect(model.id).to.equal(1);
    });
  });

});
