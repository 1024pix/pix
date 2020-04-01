import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | error', function() {
  setupTest();

  it('exists', function() {
    const route = this.owner.lookup('route:error');
    expect(route).to.be.ok;
  });

  describe('#hasUnauthorizedError', function() {
    let route;

    beforeEach(function() {
      route = this.owner.lookup('route:error');
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
