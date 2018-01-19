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
    needs: ['service:splash', 'service:current-routed-modal']
  });

  it('initializes correctly', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  it('hides the splash when the route is activated', function() {
    const splashStub = SplashServiceStub.create();
    const route = this.subject({ splash: splashStub });
    route.activate();
    expect(splashStub.hideCount).to.equal(1);
  });
});
