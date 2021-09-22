/* eslint ember/no-classic-classes: 0 */

import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

const SplashServiceStub = EmberObject.extend({
  hideCount: 0,
  hide() {
    this.hideCount++;
  },
});

describe('Unit | Route | application', function() {

  setupTest();

  it('hides the splash when the route is activated', function() {
    // Given
    const splashStub = SplashServiceStub.create();
    const route = this.owner.lookup('route:application');
    route.set('splash', splashStub);

    // When
    route.activate();

    // Then
    expect(splashStub.hideCount).to.equal(1);
  });

  it('should call handleUserLanguageAndLocale in session service', async function() {
    // given
    const sessionStub = Service.create({
      handleUserLanguageAndLocale: sinon.spy(),
    });
    const featureTogglesStub = Service.create({
      load: sinon.stub().resolves(),
    });
    const route = this.owner.lookup('route:application');
    route.set('session', sessionStub);
    route.set('featureToggles', featureTogglesStub);

    // when
    await route.beforeModel();

    // then
    expect(route.session.handleUserLanguageAndLocale.called).to.be.true;
  });
});
