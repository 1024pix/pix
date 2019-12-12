import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | splash', function() {
  setupTest();

  describe('#localStorage', function() {

    it('exist and should be equal to localStorage', function() {
      // Given
      const windowService = this.owner.lookup('service:window');

      // Then
      expect(windowService.localStorage).to.equal(window.localStorage);
    });

  });

  describe('#reload', function() {

    it('exist', function() {
      // Given
      const windowService = this.owner.lookup('service:window');

      // Then
      expect(windowService.reload).to.be.a('function');
    });

  });
});
