import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Competences | Results', function() {

  setupTest('route:competences.results', {
    needs: ['service:session', 'service:metrics']
  });

  beforeEach(function() {
    this.register('service:session', Service.extend({
      isAuthenticated: true,
    }));

    this.inject.service('session', { as: 'session' });
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

      this.register('service:store', storeStub);
      this.inject.service('store', { as: 'store' });

      route = this.subject();
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
