import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | Certifications | Results', function() {

  setupTest();

  describe('model', function() {

    it('should find logged user details', function() {
      // Given
      const route = this.owner.lookup('route:certifications.results');

      // When
      const model = route.model({
        certification_number: 'certification_number',
      });

      // Then
      expect(model).to.equal('certification_number');
    });

  });
});
