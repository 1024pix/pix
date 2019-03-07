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
    needs: ['service:splash', 'service:session', 'service:metrics', 'service:pix-modal-dialog']
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
