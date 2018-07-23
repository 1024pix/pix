import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

const SplashServiceStub = EmberObject.extend({
  hideCount: 0,
  hide() {
    this.hideCount++;
  }
});

describe('Unit | Route | application splash', function() {
  setupTest('route:application', {
    needs: ['service:current-routed-modal', 'service:session', 'service:splash']
  });

  it('initializes correctly', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  it('hides the splash when the route is activated', function() {
    // Given
    const splashStub = SplashServiceStub.create();
    const route = this.subject({ splash: splashStub });

    // When
    route.activate();

    // Then
    expect(splashStub.hideCount).to.equal(1);
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
