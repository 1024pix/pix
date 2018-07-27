import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | error', function() {
  setupTest('route:error', {
    // Specify the other units that are required for this test.
    needs: ['service:current-routed-modal', 'service:session']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  describe('#hasUnauthorizedError', function() {
    let route;

    beforeEach(function() {
      route = this.subject();
    });

    it('finds an unauthorized code in the first error object', function() {
      // Given
      const errorEvent = { errors: [{ code: 401 }] };

      // When
      const result = route.hasUnauthorizedError(errorEvent);

      // Then
      expect(result).to.be.true;
    });

    it('returns false if there is no "errors" key', function() {
      // Given
      const errorEvent = {};

      // When
      const result = route.hasUnauthorizedError(errorEvent);

      // Then
      expect(result).to.be.false;
    });

    it('returns false if the "errors" key points to an empty array', function() {
      // Given
      const errorEvent = { errors: [] };

      // When
      const result = route.hasUnauthorizedError(errorEvent);

      // Then
      expect(result).to.be.false;
    });
  });
});
