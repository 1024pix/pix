import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Competence | Results', function() {

  setupTest();

  let route;

  beforeEach(function() {
    this.owner.register('service:session', Service.extend({
      isAuthenticated: true,
    }));

    route = this.owner.lookup('route:competence.results');
  });

  describe('model', function() {

    it('should return the scorecard of the model for route competence', async function() {
      // Given
      route.modelFor = sinon.stub().returns({
        get(parameter) {
          if (parameter === 'scorecard') {
            return { id: 1 };
          }
        }
      });

      // When
      const model = await route.model();

      // Then
      expect(model).to.deep.equal({ id: 1 });
    });
  });

});
