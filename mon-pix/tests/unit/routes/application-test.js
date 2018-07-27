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
    needs: ['service:current-routed-modal', 'service:splash', 'service:session']
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

});
